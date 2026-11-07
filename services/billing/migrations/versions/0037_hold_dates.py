"""holds.created_at and released_at: credits set aside before a top-up's 14 days ended and given
back after stay refundable for 7 days from then. Holds already given back have no date, so they
don't count

Revision ID: 0037
Revises: 0036
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0037"
down_revision = "0036"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "holds",
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.add_column("holds", sa.Column("released_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("holds", "released_at")
    op.drop_column("holds", "created_at")
