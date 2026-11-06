from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CompanyTemplate(BaseModel):
    """A template as a company chooses from them: what an interview from it adds up to, and how
    many of its interviews came from it."""

    id: UUID
    slug: str | None
    title: str
    level: str
    language: str
    topic_count: int
    created_at: datetime
    updated_at: datetime
    indexable: bool = False
    topic_titles: list[str]
    question_count: int
    minutes: int
    used_count: int
