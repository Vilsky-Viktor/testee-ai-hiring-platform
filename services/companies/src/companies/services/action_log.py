from datetime import datetime
from uuid import UUID

from testee_common.config.constants import MAX_PAGE_SIZE
from testee_common.events.audit_actions import TargetKind
from testee_common.limits.rate_limit import hit_or_skip

from companies.core.db import Session
from companies.helpers.action_csv import action_csv
from companies.helpers.audit import audit_event_out
from companies.integrations import api_keys
from companies.integrations.redis import get_redis
from companies.repositories import action_names, audit
from companies.schemas.audit import ActionOut


def interview_of(event, targets: dict, candidates: dict) -> UUID | None:
    """The interview an action opens: its candidate's, or the one it was about, still there."""
    if event.target_kind == TargetKind.CANDIDATE:
        return candidates.get(event.target_id)

    if event.target_kind == TargetKind.INTERVIEW and event.target_id in targets:
        return event.target_id

    return None


async def page(
    company_id,
    offset: int,
    limit: int,
    user_id: str | None = None,
    group: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    key_id: UUID | None = None,
) -> list[ActionOut]:
    """A page of the log, newest first, each action with who took it (a member, or an API key by
    its name now) and what it was about, found in one query each; only one member's, one API
    key's, one group's, or those from `start` and before `end`."""
    async with Session() as session:
        events = await audit.list_for_company(
            session, company_id, offset, limit, user_id, group, start, end, key_id
        )
        emails = await action_names.member_emails(
            session, company_id, [event.user_id for event in events]
        )
        targets = await action_names.target_names(
            session, company_id, [event.target_id for event in events if event.target_id]
        )
        candidates = await action_names.candidate_interviews(
            session,
            company_id,
            [
                event.target_id
                for event in events
                if event.target_kind == TargetKind.CANDIDATE and event.target_id
            ],
        )

    keys = await api_keys.names(company_id, [event.key_id for event in events if event.key_id])

    return [
        ActionOut(
            **audit_event_out(event).model_dump(),
            id=event.id,
            group=event.group,
            user_email=emails.get(event.user_id),
            target_kind=event.target_kind,
            target=targets.get(event.target_id) or event.target_label,
            removed=event.removed,
            key_name=keys.get(str(event.key_id)) if event.key_id else None,
            interview_id=interview_of(event, targets, candidates),
        )
        for event in events
    ]


async def export(company_id, user_id: str, start: datetime | None, end: datetime | None) -> str:
    """The CSV of the log from `start` and before `end`, a batch at a time; counted against the
    company's daily exports."""
    await hit_or_skip(
        get_redis(),
        f"rate:action-log:{company_id}",
        "ACTION_LOG_EXPORTS_PER_DAY",
        company_id=company_id,
        user_id=user_id,
    )
    actions: list[ActionOut] = []

    while True:
        batch = await page(company_id, len(actions), MAX_PAGE_SIZE, start=start, end=end)
        actions += batch

        if len(batch) < MAX_PAGE_SIZE:
            return action_csv(actions)
