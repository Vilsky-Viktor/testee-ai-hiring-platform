from fastapi import HTTPException, status
from testee_common.i18n.i18n import TemplateError
from testee_common.limits.pause import is_paused
from testee_common.limits.rate_limit import hit

from generation.constants.generation import (
    NOT_AWAITING_REVIEW,
    RUN_GENERATION,
    TOO_FEW_SUBTOPICS,
    TOO_MANY_CHOSEN,
    TOO_MANY_REVISIONS,
    TOO_MANY_SUBTOPICS,
)
from generation.constants.statuses import Status
from generation.core.db import Session
from generation.integrations import tasks
from generation.integrations.redis import get_redis
from generation.models.generation import Generation
from generation.repositories import generations
from generation.schemas.generation import ReviewRequest
from generation.services.run_state import save
from generation.services.topic_caps import topic_caps


async def topics_proposed(generation: Generation, topics: list[dict]) -> None:
    """A run stopped for its review (the graph's interrupt, already checkpointed). It waits for
    one, unless the generation needs none (auto_approve): then it's queued straight on, with what
    a reviewer who keeps the proposed topics sends, up to the most a review may approve. It never
    awaits review, so the expiry and the reminders don't see it; a job lost here leaves it queued,
    which the sweeper fails, and its retry comes back here. The emergency pause refuses a
    reviewer, so while it's on the topics wait for a review too. A cancelled one queues nothing."""
    if not generation.auto_approve or await is_paused(get_redis()):
        await save(generation.id, status=Status.AWAITING_REVIEW, topics=topics)

        return

    caps = await topic_caps()
    approved = ReviewRequest(selected=list(range(min(len(topics), caps["max_topics"]))))

    if await save(generation.id, status=Status.QUEUED, topics=topics):
        await tasks.enqueue(
            RUN_GENERATION, {"generation_id": str(generation.id), "resume": approved.model_dump()}
        )


async def submit_review(generation: Generation, body: ReviewRequest) -> Generation:
    """Queues the reviewed topics; only one review wins for a generation awaiting review. The
    selection must name topics of the list, the drafted ones with any the reviewer added, and a
    generation's topics are revised in words (a model call each) at most MAX_TOPIC_REVISIONS
    times."""
    drafted = len(generation.topics or [])
    listed = max(drafted, len(body.topics or []))

    if any(not 0 <= index < listed for index in body.selected):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Choose topics from the list")

    caps = await topic_caps()

    # Without instructions the review approves the selection, which caps the topics. With
    # instructions the topics are revised first, so the reviewer may ask to merge.
    if not body.instructions.strip() and len(body.selected) > caps["max_topics"]:
        raise TemplateError(
            status.HTTP_422_UNPROCESSABLE_CONTENT, TOO_MANY_CHOSEN, count=caps["max_topics"]
        )

    if any(len(topic.subtopics) > caps["max_subtopics"] for topic in body.topics or []):
        raise TemplateError(
            status.HTTP_422_UNPROCESSABLE_CONTENT, TOO_MANY_SUBTOPICS, count=caps["max_subtopics"]
        )

    added = (body.topics or [])[drafted:]

    if any(len(topic.subtopics) < caps["min_added_subtopics"] for topic in added):
        raise TemplateError(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            TOO_FEW_SUBTOPICS,
            count=caps["min_added_subtopics"],
        )

    # Refused before it counts a revision; the claim below still settles two reviews at once.
    if generation.status != Status.AWAITING_REVIEW:
        raise HTTPException(status.HTTP_409_CONFLICT, NOT_AWAITING_REVIEW)

    if body.instructions.strip():
        await hit(
            get_redis(),
            f"rate:revisions:{generation.id}",
            "MAX_TOPIC_REVISIONS",
            TOO_MANY_REVISIONS,
            company_id=generation.company_id,
            user_id=generation.owner_uid,
        )

    async with Session.begin() as session:
        claimed = await generations.claim_review(session, generation.id)

    if not claimed:
        raise HTTPException(status.HTTP_409_CONFLICT, NOT_AWAITING_REVIEW)

    await tasks.enqueue(
        RUN_GENERATION, {"generation_id": str(generation.id), "resume": body.model_dump()}
    )

    async with Session() as session:
        return await generations.get(session, generation.id)
