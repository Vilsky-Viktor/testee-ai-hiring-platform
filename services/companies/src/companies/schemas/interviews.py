from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field
from testee_common.auth.user import Language
from testee_common.config.constants import MAX_GOAL_LENGTH
from testee_common.i18n.titles import Title

from companies.constants.interviews import (
    MAX_PASS_MARK,
    MAX_QUESTION_SECONDS,
    MIN_PASS_MARK,
    MIN_QUESTION_SECONDS,
)


class InterviewCreate(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_GOAL_LENGTH)
    # The language to generate the interview in; none means the job description's own.
    generate_in: Language | None = None


class InterviewFromTemplate(BaseModel):
    template_id: UUID


class PreviewOut(BaseModel):
    """The first session of a member's preview, to open in the player."""

    session_id: UUID


InterviewRowStatus = Literal["failed", "generating", "undelivered", "finished", "ready"]


class InterviewOut(BaseModel):
    id: UUID
    # None for a test made from a template.
    generation_id: UUID | None
    set_id: UUID | None
    # Without a set: its generation failed and waits for a retry; otherwise it's generating.
    generation_failed: bool
    title: str | None
    question_seconds: int
    candidate_count: int
    hired: bool
    pass_mark: int
    # The shareable link's code while it's on.
    link_token: str | None
    # New, in process or hired (constants/interviews.py).
    status: str
    created_at: datetime
    # When it last changed; the API syncs lists by it (updated_since).
    updated_at: datetime | None = None
    # Its team's notes: how many, and the pinned one's text (None without one).
    note_count: int = 0
    pinned_note: str | None = None
    # Taken in voice mode (read aloud, answered by voice); click mode otherwise, the default.
    voice: bool = False
    # On the company's list only: how its candidates are doing, those who finished lately, and
    # the one thing to know about it now (helpers/interview_row.py).
    finished_count: int = 0
    passed_count: int = 0
    undelivered_count: int = 0
    recent_count: int = 0
    row_status: InterviewRowStatus | None = None


class InterviewStatusCounts(BaseModel):
    """How many of a company's interviews are in each status, and in all."""

    all: int
    new: int
    in_process: int
    hired: int


class QuestionOption(BaseModel):
    answer: str
    correct: bool


class QuestionText(BaseModel):
    """A question as the company manages it: text, answer options and feedback counts."""

    id: UUID
    text: str
    options: list[QuestionOption]
    # Multi-answer ("select all that apply"): more than one option is right.
    multi: bool = False
    likes: int
    dislikes: int
    reports: int
    # The member's own vote (1 or -1), and whether they've reported it (once each).
    my_rating: Literal[-1, 1] | None = None
    reported: bool = False
    # Left out by an owner or admin: no candidate gets it.
    excluded: bool = False


class ReportOut(BaseModel):
    id: UUID
    reason: str
    comment: str
    created_at: datetime


class TopicOut(BaseModel):
    id: UUID
    title: str
    subtopics: list[str] = []
    # The questions candidates may get: those an owner or admin left out aren't counted.
    question_count: int
    # The questions an owner or admin left out.
    excluded_count: int = 0
    # Questions each candidate gets from the topic.
    question_limit: int


class InterviewDetail(InterviewOut):
    # The company it belongs to, so a link to it can be built from the interview alone.
    company_id: UUID
    # The language its topics and questions are written in, which can differ from the page's.
    language: str
    topics: list[TopicOut]
    # The whole interview at its time per question, in minutes, as a candidate sees it before
    # starting; None while its questions aren't known.
    total_minutes: int | None = None
    # Every question a candidate gets, over all topics; None while its questions aren't known.
    total_questions: int | None = None
    # The most questions a candidate may get over all topics (the topics tab shows the total
    # against it).
    max_questions: int
    # Whether the user may change the test and its candidates: owners and admins, not viewers.
    can_edit: bool = False
    # Its questions are kept out of testee's shared question bank (the terms' opt-out).
    keep_private: bool = False
    # Whether the company may use the Discover tab: it has topped up at least once.
    discover: bool = False


class ReviewIn(BaseModel):
    """Topic indices to keep, and optional free-text changes, as the generation service takes them."""

    selected: list[int] = Field(min_length=1)
    instructions: str = ""
    # Every drafted topic with the reviewer's own edits; generation validates it.
    topics: list[dict] | None = None


class QuestionExcludedIn(BaseModel):
    # True leaves the question out of the interview; false brings it back.
    excluded: bool


class TopicLimitIn(BaseModel):
    # The topic's whole size gives every candidate every question; 0 leaves the topic out.
    limit: int = Field(ge=0)


class InterviewSettings(BaseModel):
    """A change to a test's settings: only the ones sent change; the others stay as they are."""

    question_seconds: int | None = Field(
        default=None, ge=MIN_QUESTION_SECONDS, le=MAX_QUESTION_SECONDS
    )
    hired: bool | None = None
    pass_mark: int | None = Field(default=None, ge=MIN_PASS_MARK, le=MAX_PASS_MARK)
    keep_private: bool | None = None
    voice: bool | None = None


class TitleIn(BaseModel):
    title: Title
