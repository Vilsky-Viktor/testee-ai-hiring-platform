"""When a member joined (members.joined_at), for the team page; a nullable column without a
default, instant to add; empty for those who joined before it was kept

Revision ID: 0077
Revises: 0076
Create Date: 2026-11-05
"""

import sqlalchemy as sa
from alembic import op

revision = "0077"
down_revision = "0076"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("SET lock_timeout = '5s'")
    op.add_column("members", sa.Column("joined_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("members", "joined_at")
