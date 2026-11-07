import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column
from testee_common.db.db import one_of

from library.constants.feedback import ReportReason, ReportStatus
from library.models.base import Base


class QuestionRating(Base):
    """A question's thumbs up and down, as counts: feedback is anonymous, so no vote keeps any
    trace of who gave it."""

    __tablename__ = "question_ratings"
    __table_args__ = (
        CheckConstraint("likes >= 0", name="ck_question_ratings_likes"),
        CheckConstraint("dislikes >= 0", name="ck_question_ratings_dislikes"),
    )

    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True
    )
    # Its company, filled by the database from questions (a trigger; templates have none).
    company_id: Mapped[uuid.UUID | None] = mapped_column(index=True)
    likes: Mapped[int] = mapped_column(default=0, server_default=text("0"))
    dislikes: Mapped[int] = mapped_column(default=0, server_default=text("0"))


class QuestionReport(Base):
    """A report of a question, anonymous like a vote; its comment goes REPORT_COMMENT_KEEP_DAYS
    after it was written, as free text can name someone."""

    __tablename__ = "question_reports"
    __table_args__ = (
        # A question's reports, newest first.
        Index("ix_question_reports_question_id_created_at", "question_id", "created_at"),
        # The comments old enough to go.
        Index(
            "ix_question_reports_comments",
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
    reason: Mapped[str] = mapped_column(String(32))
    comment: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default=ReportStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), server_default=func.now()
    )
