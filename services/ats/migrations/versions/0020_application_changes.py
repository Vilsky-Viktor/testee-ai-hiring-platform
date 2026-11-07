"""Teamtailor's web hook says only that an application changed: this keeps that until the
application is read, so a read that fails loses nothing and the web hook is answered at once.
A new table, so nothing is locked

Revision ID: 0020
Revises: 0019
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0020"
down_revision = "0019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ats_application_changes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "connection_id",
            sa.Uuid(),
            sa.ForeignKey("ats_connections.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("company_id", sa.Uuid(), nullable=False, index=True),
        sa.Column("application_id", sa.Text(), nullable=False),
        sa.Column(
            "changed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("connection_id", "application_id"),
    )


def downgrade() -> None:
    op.drop_table("ats_application_changes")
