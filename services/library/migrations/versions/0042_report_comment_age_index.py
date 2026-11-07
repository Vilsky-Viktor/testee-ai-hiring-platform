"""An index on reports whose comments are still to empty, by age: the daily job finds those past
their limit (a report's comment is free text, kept a year)

Revision ID: 0042
Revises: 0041
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0042"
down_revision = "0041"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("SET lock_timeout = '5s'")

    with op.get_context().autocommit_block():
        op.create_index(
            "ix_question_reports_commented_at",
            "question_reports",
            ["created_at"],
            postgresql_where=sa.text("comment <> ''"),
            postgresql_concurrently=True,
        )


def downgrade() -> None:
    op.drop_index("ix_question_reports_commented_at", table_name="question_reports")
