"""An interview's generation as the generation service returns it."""

from uuid import UUID

from pydantic import BaseModel


class DraftTopic(BaseModel):
    main_topic: str
    subtopics: list[str]


class TopicState(BaseModel):
    name: str
    ready: bool


class GenerationProgress(BaseModel):
    done: int
    total: int
    # Missing on generations started before per-topic progress existed.
    topics: int | None = None
    topics_ready: int | None = None
    # Each approved topic, in order; missing on generations started before the page listed them.
    topic_states: list[TopicState] | None = None


class GenerationOut(BaseModel):
    id: UUID
    kind: str
    company_id: UUID | None
    # queued, running, awaiting_review, done, failed or cancelled.
    status: str
    # The drafted topics, for the review.
    topics: list[DraftTopic] | None
    progress: GenerationProgress | None
    preparation_id: UUID | None
    error: str | None
    # What it's generated in.
    language: str
    # How many topics the review may approve without instructions, and subtopics a topic may
    # have when edited by hand.
    max_topics: int
    max_subtopics: int
    # The subtopics a topic added by hand in the review needs at least.
    min_added_subtopics: int
