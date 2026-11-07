import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column
from testee_common.db.db import one_of

from library.constants.feedback import ReportReason, ReportStatus
from library.models.base import Base


class QuestionRating(Base):
    """A thumbs up (1) or down (-1) per user and question; a deleted person's has a random
    value in place of their id (repositories/user_data.py)."""

    __tablename__ = "question_ratings"
    # A person's votes (the link's removal with them, and their export).
    __table_args__ = (
        Index("ix_question_ratings_user_id", "user_id"),
        CheckConstraint("value IN (-1, 1)", name="ck_question_ratings_value"),
    )

    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True
    )
    # Its company, filled by the database from questions (a trigger; templates have none).
    company_id: Mapped[uuid.UUID | None] = mapped_column(index=True)
    user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    value: Mapped[int] = mapped_column(SmallInteger)


class QuestionReporter(Base):
    """Who has reported a question, kept when it's replaced: one report per user and question,
    whatever its revision, so the same users can't send it to the verifier again and again. Goes
    with the person, as it has no other use."""

    __tablename__ = "question_reporters"

    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True
    )
    # Its company, filled by the database from questions (a trigger; templates have none).
    company_id: Mapped[uuid.UUID | None] = mapped_column(index=True)
    user_id: Mapped[str] = mapped_column(String(128), primary_key=True, index=True)


class QuestionReport(Base):
    """At most one report per user and question; a deleted person's has a random value in place
    of their id and no comment (repositories/user_data.py). Any comment goes after a year."""

    __tablename__ = "question_reports"
    __table_args__ = (
        # Also a question's reports, by its first column.
        UniqueConstraint("question_id", "user_id", name="uq_question_reports_question_user"),
        # A person's reports (the link's removal with them, and their export).
        Index("ix_question_reports_user_id", "user_id"),
        # Comments still to empty, by age (the daily job, migration 0042).
        Index(
            "ix_question_reports_commented_at",
            "created_at",
            postgresql_where=text("comment <> ''"),
        ),
        CheckConstraint(one_of("reason", ReportReason), name="ck_question_reports_reason"),
        CheckConstraint(one_of("status", ReportStatus), name="ck_question_reports_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    # Its company, filled by the database from questions (a trigger; templates have none).
    company_id: Mapped[uuid.UUID | None] = mapped_column(index=True)
    user_id: Mapped[str] = mapped_column(String(128))
    reason: Mapped[str] = mapped_column(String(32))
    comment: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default=ReportStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), server_default=func.now()
    )
