"""An erased candidate's ATS id, kept 30 days, so a repeated or replayed web hook can't save and
invite them again. A new table, so nothing is locked

Revision ID: 0021
Revises: 0020
Create Date: 2026-11-08
"""

import sqlalchemy as sa
from alembic import op

revision = "0021"
down_revision = "0020"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ats_erased_candidates",
        sa.Column(
            "connection_id",
            sa.Uuid(),
            sa.ForeignKey("ats_connections.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("candidate_id", sa.Text(), primary_key=True),
        sa.Column("interview_id", sa.Uuid(), primary_key=True),
        sa.Column("company_id", sa.Uuid(), nullable=False, index=True),
        sa.Column(
            "erased_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
            index=True,
        ),
    )


def downgrade() -> None:
    op.drop_table("ats_erased_candidates")
