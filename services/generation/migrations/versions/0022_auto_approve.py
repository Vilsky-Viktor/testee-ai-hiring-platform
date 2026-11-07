"""generations.auto_approve: a generation that goes on from its proposed topics with no review (a
paying company's, started through the public API). One column with a constant default: instant.

Revision ID: 0022
Revises: 0021
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0022"
down_revision = "0021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "generations",
        sa.Column("auto_approve", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("generations", "auto_approve")
