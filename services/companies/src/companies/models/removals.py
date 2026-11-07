import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column

from companies.models.base import Base


class RemovedInvite(Base):
    """A candidate a company erased in the last REMOVAL_KEEP_DAYS, the backups' life: a database
    restored from a backup would bring them back, so the removal is run again
    (services/removal_replay.py). Ids only. The company's API reads them too, to catch up with
    `candidate.removed` events it missed; nothing else does."""

    __tablename__ = "removed_invites"
    __table_args__ = (Index("ix_removed_invites_company_id", "company_id", "removed_at"),)

    invite_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    company_id: Mapped[uuid.UUID]
    removed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), index=True
    )
