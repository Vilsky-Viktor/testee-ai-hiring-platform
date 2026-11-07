"""auto_top_ups.unconfirmed_at: a charge Paddle's records leave unknown for a day stops being
looked up, and its company is told once

Revision ID: 0039
Revises: 0038
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0039"
down_revision = "0038"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "auto_top_ups", sa.Column("unconfirmed_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("auto_top_ups", "unconfirmed_at")
