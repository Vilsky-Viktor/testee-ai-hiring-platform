"""webhook_deliveries.delivered_at gets an index, for the retry schedule's batched retention.
Built concurrently, so deliveries go on meanwhile

Revision ID: 0014
Revises: 0013
Create Date: 2026-11-07
"""

from alembic import op

revision = "0014"
down_revision = "0013"
branch_labels = None
depends_on = None

NAME = "ix_webhook_deliveries_delivered_at"


def upgrade() -> None:
    with op.get_context().autocommit_block():
        # A build cut off earlier leaves an invalid index of this name: built again.
        op.execute(f"DROP INDEX CONCURRENTLY IF EXISTS {NAME}")
        op.execute(f"CREATE INDEX CONCURRENTLY {NAME} ON webhook_deliveries (delivered_at)")


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute(f"DROP INDEX CONCURRENTLY IF EXISTS {NAME}")
