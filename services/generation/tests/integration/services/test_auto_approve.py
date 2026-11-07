"""A generation started through the public API by a paying company goes on from its proposed
topics with no review, against the real database and Redis and a real graph that stops at the
real review step (no model is called): each delivery, failure and race around that step."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from sqlalchemy import select
from testee_common.limits import pause
from testee_common.redis import memory_cache

from generation.constants.events import GENERATION_COMPLETED
from generation.constants.generation import GENERATION_FAILED, RUN_GENERATION
from generation.constants.statuses import Status
from generation.core.db import Session
from generation.integrations import library, tasks
from generation.integrations.redis import get_redis
from generation.models.outbox import OutboxEvent
from generation.models.state import State
from generation.repositories import generations
from generation.schemas.generation import ReviewRequest
from generation.services import jobs, pipeline, review, schedules
from generation.services import outbox as outbox_service
from generation.services.nodes.review import human_review, review_router
from tests.integration.transactions import transaction

TOPICS = [
    {"main_topic": "Python", "subtopics": ["Typing"]},
    {"main_topic": "SQL", "subtopics": ["Joins"]},
]


@pytest.fixture(autouse=True)
def fresh_redis():
    """Its client belongs to one test's event loop, and the limits it read to that test."""
    memory_cache._entries.clear()
    get_redis.cache_clear()
    yield
    memory_cache._entries.clear()
    get_redis.cache_clear()


def small_graph(draft=None):
    """Drafts TOPICS, stops at the real review step and, approved, ends as a full run would."""

    async def topics(state):
        return {"topics": TOPICS, "title": "Backend", "level": "basic", "requirements": []}

    async def results(state):
        return {"final": []}

    graph = StateGraph(State)
    graph.add_node("generate_topics", draft or topics)
    graph.add_node("human_review", human_review)
    graph.add_node("join_topics", results)
    graph.add_edge(START, "generate_topics")
    graph.add_edge("generate_topics", "human_review")
    graph.add_conditional_edges(
        "human_review", review_router, {"revise_topics": END, "find_reused": "join_topics"}
    )
    graph.add_edge("join_topics", END)

    return graph.compile(checkpointer=MemorySaver())


@pytest.fixture
def queue(monkeypatch):
    """The jobs queued; saving the set is library's and publishing the outbox's job."""
    queued = []

    async def enqueue(path, payload):
        queued.append((path, payload))

    async def create_interview(payload):
        return uuid.uuid4()

    async def nothing(*args):
        return None

    monkeypatch.setattr(tasks, "enqueue", enqueue)
    monkeypatch.setattr(library, "create_interview", create_interview)
    monkeypatch.setattr(pipeline, "check_sample", nothing)
    monkeypatch.setattr(outbox_service, "flush_quietly", nothing)

    return queued


async def started(auto_approve=True):
    return await transaction(
        generations.create,
        f"key:{uuid.uuid4()}",
        "Backend developer",
        uuid.uuid4(),
        auto_approve=auto_approve,
    )


async def events(generation_id, kind):
    async with Session() as session:
        found = await session.scalars(select(OutboxEvent).where(OutboxEvent.event_type == kind))

        return [row for row in found if row.data.get("generation_id") == str(generation_id)]


async def deliver(graph, payload):
    await jobs.run_generation(graph, uuid.UUID(payload["generation_id"]), payload.get("resume"))


def test_the_proposed_topics_go_on_unreviewed_and_the_interview_is_finished_once(run, queue):
    async def scenario():
        graph = small_graph()
        generation = await started()
        await jobs.run_generation(graph, generation.id, None)
        after_topics = await transaction(generations.get, generation.id)
        path, payload = queue[0]
        # The job delivered twice: the second finds the first's claim, or its end.
        await deliver(graph, payload)
        await deliver(graph, payload)
        finished = await transaction(generations.get, generation.id)

        return (
            after_topics,
            path,
            payload,
            finished,
            await events(generation.id, GENERATION_COMPLETED),
        )

    after_topics, path, payload, finished, completed = run(scenario())

    assert (after_topics.status, after_topics.topics) == (Status.QUEUED, TOPICS)
    assert path == RUN_GENERATION
    assert payload["resume"] == ReviewRequest(selected=[0, 1]).model_dump()
    assert len(queue) == 1
    assert finished.status == Status.DONE
    assert len(completed) == 1


def test_the_first_job_delivered_again_after_its_topics_runs_the_generation_once(run, queue):
    async def scenario():
        graph = small_graph()
        generation = await started()
        await jobs.run_generation(graph, generation.id, None)
        await jobs.run_generation(graph, generation.id, None)
        # That delivery took the queued row, so the job it replaced finds nothing to claim.
        for _, payload in list(queue):
            await deliver(graph, payload)

        return (
            await transaction(generations.get, generation.id),
            await events(generation.id, GENERATION_COMPLETED),
        )

    finished, completed = run(scenario())

    assert finished.status == Status.DONE
    assert len(completed) == 1


def test_a_generation_that_needs_a_review_waits_for_it_and_the_expiry_takes_only_it(run, queue):
    async def scenario():
        graph = small_graph()
        reviewed = await started(auto_approve=False)
        going_on = await started()
        await jobs.run_generation(graph, reviewed.id, None)
        await jobs.run_generation(graph, going_on.id, None)
        expired = await schedules.cancel_reviews(datetime.now(UTC) + timedelta(days=1))

        return (
            reviewed.id,
            [row.id for row in expired],
            await transaction(generations.get, going_on.id),
        )

    reviewed, expired, going_on = run(scenario())

    assert expired == [reviewed]
    assert going_on.status == Status.QUEUED
    assert [payload["generation_id"] for _, payload in queue] == [str(going_on.id)]


def test_during_the_emergency_pause_the_topics_wait_for_a_review(run, queue):
    async def scenario():
        await pause.set_paused(get_redis(), True, "superadmin")
        generation = await started()

        try:
            await jobs.run_generation(small_graph(), generation.id, None)
        finally:
            await pause.set_paused(get_redis(), False, "superadmin")

        return await transaction(generations.get, generation.id)

    found = run(scenario())

    assert (found.status, found.topics) == (Status.AWAITING_REVIEW, TOPICS)
    assert queue == []


def test_a_generation_cancelled_as_its_topics_arrive_stays_cancelled_with_nothing_queued(
    run, queue
):
    async def scenario():
        generation = await started()
        await transaction(generations.cancel, generation.id)
        await review.topics_proposed(generation, TOPICS)

        return await transaction(generations.get, generation.id)

    assert run(scenario()).status == Status.CANCELLED
    assert queue == []


def test_a_failed_topic_proposal_fails_the_generation_as_any_run_and_queues_nothing(run, queue):
    async def broken(state):
        raise RuntimeError("model down")

    async def scenario():
        generation = await started()
        await jobs.run_generation(small_graph(broken), generation.id, None)

        return (
            await transaction(generations.get, generation.id),
            await events(generation.id, "generation.failed"),
        )

    found, failed = run(scenario())

    assert (found.status, found.error) == (Status.FAILED, GENERATION_FAILED)
    assert len(failed) == 1
    assert queue == []


def test_a_queue_failing_fails_the_generation_and_its_retry_goes_on_from_the_topics(
    run, queue, monkeypatch
):
    enqueue = tasks.enqueue

    async def down(path, payload):
        raise RuntimeError("queue down")

    async def scenario():
        graph = small_graph()
        generation = await started()
        monkeypatch.setattr(tasks, "enqueue", down)
        await jobs.run_generation(graph, generation.id, None)
        failed = await transaction(generations.get, generation.id)
        monkeypatch.setattr(tasks, "enqueue", enqueue)
        await transaction(generations.claim_retry, generation.id)
        await jobs.run_generation(graph, generation.id, None)
        await deliver(graph, queue[0][1])

        return failed, await transaction(generations.get, generation.id)

    failed, retried = run(scenario())

    assert failed.status == Status.FAILED
    assert retried.status == Status.DONE


def test_a_job_lost_after_the_topics_is_failed_by_the_sweep(run, queue):
    """The row is queued with no job: the sweep's stuck queued one, which a person can retry."""

    async def scenario():
        generation = await started()
        await jobs.run_generation(small_graph(), generation.id, None)
        now = datetime.now(UTC) + timedelta(seconds=1)
        failed = await schedules.fail_stuck(now, now)

        return generation.id, [row.id for row in failed]

    generation_id, failed = run(scenario())

    assert failed == [generation_id]
