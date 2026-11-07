"""Batch work's new step: the key check of a replacement question. The closed set grows by
`check`, so its CHECK is replaced; added NOT VALID, which takes the table's lock only for a
moment, then validated in its own transaction

Revision ID: 0023
Revises: 0022
Create Date: 2026-11-07
"""

from alembic import op

revision = "0023"
down_revision = "0022"
branch_labels = None
depends_on = None

NAME = "ck_batch_work_step"
BEFORE = "step IN ('translate', 'question', 'options')"
AFTER = "step IN ('translate', 'question', 'options', 'check')"


def upgrade() -> None:
    op.execute(f"ALTER TABLE batch_work DROP CONSTRAINT {NAME}")
    op.execute(f"ALTER TABLE batch_work ADD CONSTRAINT {NAME} CHECK ({AFTER}) NOT VALID")

    with op.get_context().autocommit_block():
        op.execute(f"ALTER TABLE batch_work VALIDATE CONSTRAINT {NAME}")


def downgrade() -> None:
    op.execute(f"ALTER TABLE batch_work DROP CONSTRAINT {NAME}")
    op.execute(f"ALTER TABLE batch_work ADD CONSTRAINT {NAME} CHECK ({BEFORE}) NOT VALID")
