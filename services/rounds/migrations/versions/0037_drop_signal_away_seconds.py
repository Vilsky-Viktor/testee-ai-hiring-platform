"""A page leave's length is no longer kept: leaves under 2 seconds (never counted) go, and the
column with every length goes with them. A short leave is now dropped when the candidate comes
back

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
    op.execute("DELETE FROM signals WHERE away_seconds < 2")
    op.drop_column("signals", "away_seconds")


def downgrade() -> None:
    op.add_column("signals", sa.Column("away_seconds", sa.Float(), nullable=True))
