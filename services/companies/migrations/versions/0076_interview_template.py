"""An interview copied from a template remembers it (interviews.template_id), so a company sees
which templates it has used: nullable, no default, instant to add; its index built concurrently

Revision ID: 0076
Revises: 0075
Create Date: 2026-11-05
"""

import sqlalchemy as sa
from alembic import op

revision = "0076"
down_revision = "0075"
branch_labels = None
depends_on = None

INDEX = "ix_interviews_company_template"


def upgrade() -> None:
    op.execute("SET lock_timeout = '5s'")
    op.add_column("interviews", sa.Column("template_id", sa.Uuid(), nullable=True))

    with op.get_context().autocommit_block():
        op.create_index(
            INDEX, "interviews", ["company_id", "template_id"], postgresql_concurrently=True
        )


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(INDEX, table_name="interviews", postgresql_concurrently=True)

    op.drop_column("interviews", "template_id")
