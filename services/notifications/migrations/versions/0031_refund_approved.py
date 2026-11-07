"""refund_approved joins ck_notifications_kind (NOT VALID, then validated in its own transaction),
and every connected Slack channel gets both refund notices, on by default

Revision ID: 0031
Revises: 0030
Create Date: 2026-11-07
"""

from alembic import op

revision = "0031"
down_revision = "0030"
branch_labels = None
depends_on = None

NAME = "ck_notifications_kind"
BEFORE = "kind IN ('question_flagged', 'question_fixed', 'referral_rewarded', 'auto_top_up_on', 'auto_top_up_charged', 'auto_top_up_failed', 'auto_top_up_paused', 'auto_top_up_price_change', 'refund_rejected', 'candidate_finished', 'invite_undelivered', 'interview_ready', 'interview_cancelled', 'ats_not_invited', 'ats_cannot_write', 'connection_broken', 'note_added', 'member_joined', 'ownership_received', 'verification_approved', 'verification_declined', 'news', 'legal_terms', 'legal_privacy', 'legal_dpa')"
NOW = "kind IN ('question_flagged', 'question_fixed', 'referral_rewarded', 'auto_top_up_on', 'auto_top_up_charged', 'auto_top_up_failed', 'auto_top_up_paused', 'auto_top_up_price_change', 'refund_approved', 'refund_rejected', 'candidate_finished', 'invite_undelivered', 'interview_ready', 'interview_cancelled', 'ats_not_invited', 'ats_cannot_write', 'connection_broken', 'note_added', 'member_joined', 'ownership_received', 'verification_approved', 'verification_declined', 'news', 'legal_terms', 'legal_privacy', 'legal_dpa')"


def swap(condition: str) -> None:
    op.execute(f"ALTER TABLE notifications DROP CONSTRAINT {NAME}")
    op.execute(f"ALTER TABLE notifications ADD CONSTRAINT {NAME} CHECK ({condition}) NOT VALID")


def upgrade() -> None:
    op.execute("SET lock_timeout = '5s'")
    swap(NOW)

    with op.get_context().autocommit_block():
        op.execute(f"ALTER TABLE notifications VALIDATE CONSTRAINT {NAME}")

    for kind in ("refund_approved", "refund_rejected"):
        # migration-check: slack_connections has one row per company with Slack, a few rows.
        op.execute(
            f"UPDATE slack_connections SET kinds = kinds || '[\"{kind}\"]'::jsonb "
            f"WHERE NOT kinds ? '{kind}'"
        )


def downgrade() -> None:
    op.execute("UPDATE slack_connections SET kinds = kinds - 'refund_approved' - 'refund_rejected'")
    op.execute("DELETE FROM notifications WHERE kind = 'refund_approved'")
    swap(BEFORE)
