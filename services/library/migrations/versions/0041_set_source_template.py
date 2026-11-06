"""A company's copy of a template remembers it (sets.source_template_id), so a template's uses can
be counted: nullable, no default, instant to add; set to null when the template goes. The foreign
key is added NOT VALID and validated in its own transaction, its index built concurrently

Revision ID: 0041
Revises: 0040
Create Date: 2026-11-05
"""

import sqlalchemy as sa
from alembic import op

revision = "0041"
down_revision = "0040"
branch_labels = None
depends_on = None

FOREIGN_KEY = "fk_sets_source_template_id_sets"
INDEX = "ix_sets_source_template_id"


def upgrade() -> None:
    op.execute("SET lock_timeout = '5s'")
    op.add_column("sets", sa.Column("source_template_id", sa.Uuid(), nullable=True))
    op.execute(
        f"ALTER TABLE sets ADD CONSTRAINT {FOREIGN_KEY} FOREIGN KEY (source_template_id) "
        "REFERENCES sets (id) ON DELETE SET NULL NOT VALID"
    )

    with op.get_context().autocommit_block():
        op.create_index(INDEX, "sets", ["source_template_id"], postgresql_concurrently=True)
        op.execute(f"ALTER TABLE sets VALIDATE CONSTRAINT {FOREIGN_KEY}")


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(INDEX, table_name="sets", postgresql_concurrently=True)

    op.drop_constraint(FOREIGN_KEY, "sets", type_="foreignkey")
    op.drop_column("sets", "source_template_id")
