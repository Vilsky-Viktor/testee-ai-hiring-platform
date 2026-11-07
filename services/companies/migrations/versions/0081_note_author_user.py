"""A note keeps its writer's account id after they leave the company, so their data download
still has it; it goes when they delete their account. Notes whose writer already left can't be
matched any more. One nullable column, then an index built without locking

Revision ID: 0081
Revises: 0080
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0081"
down_revision = "0080"
branch_labels = None
depends_on = None

INDEX = "ix_interview_notes_author_user_id"


def upgrade() -> None:
    op.add_column("interview_notes", sa.Column("author_user_id", sa.String(128), nullable=True))
    # migration-check: before launch the table holds a few rows.
    op.execute(
        "UPDATE interview_notes n SET author_user_id = m.user_id FROM members m "
        "WHERE m.id = n.author_member_id"
    )

    with op.get_context().autocommit_block():
        op.create_index(INDEX, "interview_notes", ["author_user_id"], postgresql_concurrently=True)


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(INDEX, table_name="interview_notes", postgresql_concurrently=True)

    op.drop_column("interview_notes", "author_user_id")
