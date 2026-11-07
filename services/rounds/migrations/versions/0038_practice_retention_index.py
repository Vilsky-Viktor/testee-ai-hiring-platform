"""Finds practice rounds past their retention (PRACTICE_KEEP_DAYS) for the daily job, which
otherwise reads every session. Built concurrently, so nothing is locked

Revision ID: 0038
Revises: 0037
Create Date: 2026-11-08
"""

from alembic import op

revision = "0038"
down_revision = "0037"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.create_index(
            "ix_sessions_practice_started_at",
            "sessions",
            ["started_at"],
            postgresql_where="practice",
            postgresql_concurrently=True,
        )


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(
            "ix_sessions_practice_started_at",
            table_name="sessions",
            postgresql_concurrently=True,
        )
