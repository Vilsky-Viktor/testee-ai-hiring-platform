"""refunds: a company's own refund of a top-up's unspent credits, from asking until Paddle decides,
at most one open per top-up. Its credits are set aside as a hold meanwhile, so holds take the
reason "refund": the CHECK is replaced by one with the new value, added NOT VALID and validated
in its own transaction

Revision ID: 0036
Revises: 0035
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0036"
down_revision = "0035"
branch_labels = None
depends_on = None

NAME = "ck_holds_reason"
OPEN = "status IN ('claimed', 'pending')"
CURRENCIES = (
    "('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'ILS', 'PLN', 'JPY', 'KRW', 'TWD', 'HKD', 'CHF', 'THB', "
    "'SGD', 'INR')"
)


def replace(reasons: str) -> None:
    op.execute(f"ALTER TABLE holds DROP CONSTRAINT {NAME}")
    op.execute(f"ALTER TABLE holds ADD CONSTRAINT {NAME} CHECK (reason IN ({reasons})) NOT VALID")

    with op.get_context().autocommit_block():
        op.execute(f"ALTER TABLE holds VALIDATE CONSTRAINT {NAME}")


def upgrade() -> None:
    op.create_table(
        "refunds",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("owner_type", sa.String(16), nullable=False),
        sa.Column("owner_id", sa.String(128), nullable=False),
        sa.Column("transaction_id", sa.String(64), nullable=False),
        sa.Column("adjustment_id", sa.String(64), nullable=True, unique=True),
        sa.Column("credits", sa.Integer(), nullable=False),
        sa.Column("amount_minor", sa.BigInteger(), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_check_constraint("ck_refunds_owner_type", "refunds", "owner_type IN ('company')")
    op.create_check_constraint(
        "ck_refunds_status",
        "refunds",
        "status IN ('claimed', 'pending', 'approved', 'rejected', 'failed')",
    )
    op.create_check_constraint("ck_refunds_currency", "refunds", f"currency IN {CURRENCIES}")
    op.create_check_constraint("ck_refunds_credits", "refunds", "credits > 0")
    op.create_check_constraint("ck_refunds_amount", "refunds", "amount_minor > 0")
    op.create_index("ix_refunds_transaction_id", "refunds", ["transaction_id"])
    op.create_index("ix_refunds_owner", "refunds", ["owner_type", "owner_id"])
    op.create_index("ix_refunds_open", "refunds", ["created_at"], postgresql_where=sa.text(OPEN))
    op.create_index(
        "uq_refunds_open_transaction",
        "refunds",
        ["transaction_id"],
        unique=True,
        postgresql_where=sa.text(OPEN),
    )
    replace("'candidate', 'refund'")


def downgrade() -> None:
    op.execute("DELETE FROM holds WHERE reason = 'refund'")
    replace("'candidate'")
    op.drop_table("refunds")
