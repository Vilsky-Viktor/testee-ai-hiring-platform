"""Interviews keep the questions an owner or admin left out, by topic (excluded_questions)

Revision ID: 0075
Revises: 0074
Create Date: 2026-11-04
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0075"
down_revision = "0074"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "interviews",
        sa.Column("excluded_questions", JSONB, nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("interviews", "excluded_questions")
