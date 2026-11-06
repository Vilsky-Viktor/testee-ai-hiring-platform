"""The templates as a company chooses from them."""

import math
from uuid import UUID

from testee_common.limits.limits import question_seconds

from companies.core.db import Session
from companies.helpers.interviews import topic_limits
from companies.integrations import library
from companies.integrations.redis import get_redis
from companies.repositories import template_interviews
from companies.schemas.company_templates import CompanyTemplate


async def _out(template: dict, used: int, redis) -> CompanyTemplate:
    """A template with what an interview from it gives each candidate, as a new one would."""
    topics = template["topics"]
    limits = topic_limits([(str(at), topic["size"]) for at, topic in enumerate(topics)], {})
    questions = sum(limits.values())
    seconds = await question_seconds(redis, template["level"])

    return CompanyTemplate(
        **template,
        topic_titles=[topic["title"] for topic in topics],
        question_count=questions,
        minutes=math.ceil(questions * seconds / 60),
        used_count=used,
    )


async def listed(
    company_id: UUID, q: str, level: str | None, languages: list[str], offset: int, limit: int
) -> list[CompanyTemplate]:
    """A page of the templates the company can copy, the most copied first."""
    params: list[tuple[str, str | int]] = [("q", q), ("offset", offset), ("limit", limit)]
    params += [("level", level)] if level else []
    params += [("language", language) for language in languages]
    templates = await library.copyable_templates(params)

    async with Session() as session:
        uses = await template_interviews.template_uses(
            session, company_id, [UUID(item["id"]) for item in templates]
        )

    redis = get_redis()

    return [await _out(item, uses.get(UUID(item["id"]), 0), redis) for item in templates]
