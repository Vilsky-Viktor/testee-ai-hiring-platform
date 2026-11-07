"""auto_top_ups.awaiting_answer: a charge Paddle didn't answer is looked up in Paddle soon after,
rather than holding off the next charge for a day

Revision ID: 0038
Revises: 0037
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0038"
down_revision = "0037"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "auto_top_ups",
        sa.Column("awaiting_answer", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("auto_top_ups", "awaiting_answer")
