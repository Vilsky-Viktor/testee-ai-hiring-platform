from datetime import UTC, datetime

import pytest
from testee_common.auth.auth import current_user
from testee_common.auth.user import User
from testee_common.events.audit_actions import AuditAction, TargetKind

from companies.constants.invites import InviteStatus
from companies.main import app
from companies.models.companies import Company, Member
from tests.unit.api.v1.test_candidates import COMPANY_ID, INVITE_ID, revoke
from tests.unit.api.v1.test_report_email import PDF, URL, queued  # noqa: F401 (the fixture)


@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides.clear()


def sign_in(uid):
    app.dependency_overrides[current_user] = lambda: User(
        uid=uid, email=f"{uid}@example.com", email_verified=True
    )


def company_of(role):
    company = Company(id=COMPANY_ID, name="Arcolabs", created_at=datetime.now(UTC))
    company.members = [
        Member(company_id=COMPANY_ID, user_id="bob", invited_email="bob@example.com", role=role)
    ]

    return company


@pytest.mark.parametrize(
    ("status", "action"),
    [
        (InviteStatus.INVITED, AuditAction.INVITE_REVOKED),
        (InviteStatus.FINISHED, AuditAction.CANDIDATE_DELETED),
    ],
)
def test_revoking_or_deleting_a_candidate_is_recorded(client, monkeypatch, audited, status, action):
    revoke(client, monkeypatch, status)

    assert audited == [(COMPANY_ID, "bob", action, INVITE_ID, TargetKind.CANDIDATE)]


def test_emailing_a_report_is_recorded(client, queued, audited):  # noqa: F811
    assert client.post(URL, json={"email": "boss@example.com", "pdf": PDF}).status_code == 202
    assert [event[2] for event in audited] == [AuditAction.REPORT_EMAILED]
