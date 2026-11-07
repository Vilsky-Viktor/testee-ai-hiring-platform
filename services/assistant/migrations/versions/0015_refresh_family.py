"""mcp_grants refresh_family in place of previous_refresh_hash: a refresh token replaced any number
of refreshes ago revokes the connection, not only the last one. A connection made before this has
its refresh hash as a family until its next refresh sets the real one

Revision ID: 0015
Revises: 0014
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0015"
down_revision = "0014"
branch_labels = None
depends_on = None

INDEX = "ix_mcp_grants_previous_refresh_hash"
UNIQUE = "ix_mcp_grants_refresh_family"


def upgrade() -> None:
    op.execute("SET lock_timeout = '5s'")
    op.add_column("mcp_grants", sa.Column("refresh_family", sa.String(64)))
    op.execute("UPDATE mcp_grants SET refresh_family = refresh_hash")
    op.alter_column("mcp_grants", "refresh_family", nullable=False)
    op.drop_index(INDEX, "mcp_grants")
    op.drop_column("mcp_grants", "previous_refresh_hash")

    with op.get_context().autocommit_block():
        op.create_index(
            UNIQUE, "mcp_grants", ["refresh_family"], unique=True, postgresql_concurrently=True
        )


def downgrade() -> None:
    op.drop_index(UNIQUE, "mcp_grants")
    op.drop_column("mcp_grants", "refresh_family")
    op.add_column("mcp_grants", sa.Column("previous_refresh_hash", sa.String(64)))
    op.create_index(INDEX, "mcp_grants", ["previous_refresh_hash"])
