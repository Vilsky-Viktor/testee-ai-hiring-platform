"""The public API lists a company's removed candidates, by time

Revision ID: 0080
Revises: 0079
Create Date: 2026-11-07
"""

from alembic import op

revision = "0080"
down_revision = "0079"
branch_labels = None
depends_on = None

INDEX = "ix_removed_invites_company_id"


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.create_index(
            INDEX, "removed_invites", ["company_id", "removed_at"], postgresql_concurrently=True
        )


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(INDEX, table_name="removed_invites", postgresql_concurrently=True)
