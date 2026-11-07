"""Question feedback goes anonymous: no link to a person, however it's kept. Ratings become a
question's likes and dislikes (counts, so no row stands for a vote), reports lose their user id,
and question_reporters, which held only who reported, goes. The ids are meant to go, so they
aren't copied anywhere, and this is the one step that stops using them: the old code can't run
on this schema, a choice made so the data goes at once, not a release later

Revision ID: 0042
Revises: 0041
Create Date: 2026-11-07
"""

import sqlalchemy as sa
from alembic import op

revision = "0042"
down_revision = "0041"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("SET lock_timeout = '5s'")

    with op.get_context().autocommit_block():
        op.create_index(
            "ix_question_reports_question_id_created_at",
            "question_reports",
            ["question_id", "created_at"],
            postgresql_concurrently=True,
        )
        op.create_index(
            "ix_question_reports_comments",
            "question_reports",
            ["created_at"],
            postgresql_where=sa.text("comment <> ''"),
            postgresql_concurrently=True,
        )

    op.execute(
        """
        CREATE TEMPORARY TABLE rating_counts ON COMMIT DROP AS
        SELECT question_id, count(*) FILTER (WHERE value = 1) AS likes,
            count(*) FILTER (WHERE value = -1) AS dislikes
        FROM question_ratings GROUP BY question_id
        """
    )
    op.execute("DELETE FROM question_ratings")
    op.drop_constraint("question_ratings_pkey", "question_ratings", type_="primary")
    op.drop_column("question_ratings", "user_id")
    op.drop_column("question_ratings", "value")
    op.execute(
        "ALTER TABLE question_ratings ADD COLUMN likes integer NOT NULL DEFAULT 0, "
        "ADD COLUMN dislikes integer NOT NULL DEFAULT 0"
    )
    op.create_primary_key("question_ratings_pkey", "question_ratings", ["question_id"])
    # migration-check: the table was emptied above, so there's nothing to validate.
    op.execute(
        "ALTER TABLE question_ratings ADD CONSTRAINT ck_question_ratings_likes CHECK (likes >= 0)"
    )
    # migration-check: the table was emptied above, so there's nothing to validate.
    op.execute(
        "ALTER TABLE question_ratings "
        "ADD CONSTRAINT ck_question_ratings_dislikes CHECK (dislikes >= 0)"
    )
    # The database's trigger fills each row's company from its question.
    op.execute(
        "INSERT INTO question_ratings (question_id, likes, dislikes) "
        "SELECT question_id, likes, dislikes FROM rating_counts"
    )

    op.drop_constraint("uq_question_reports_question_user", "question_reports", type_="unique")
    op.drop_column("question_reports", "user_id")
    op.drop_table("question_reporters")


def downgrade() -> None:
    # The ids are gone for good, so the rows that need them go too: only the shape comes back.
    op.execute("DELETE FROM question_ratings")
    op.execute("DELETE FROM question_reports")
    op.create_table(
        "question_reporters",
        sa.Column(
            "question_id",
            sa.Uuid(),
            sa.ForeignKey("questions.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("user_id", sa.String(128), primary_key=True),
        sa.Column("company_id", sa.Uuid()),
    )
    op.create_index("ix_question_reporters_user_id", "question_reporters", ["user_id"])
    op.create_index("ix_question_reporters_company_id", "question_reporters", ["company_id"])
    op.execute(
        "CREATE TRIGGER company_from_parent BEFORE INSERT ON question_reporters FOR EACH ROW "
        "EXECUTE FUNCTION company_from_parent('questions', 'question_id')"
    )

    op.drop_index("ix_question_reports_comments", table_name="question_reports")
    op.drop_index("ix_question_reports_question_id_created_at", table_name="question_reports")
    op.add_column("question_reports", sa.Column("user_id", sa.String(128), nullable=False))
    op.create_unique_constraint(
        "uq_question_reports_question_user", "question_reports", ["question_id", "user_id"]
    )
    op.create_index("ix_question_reports_user_id", "question_reports", ["user_id"])

    op.drop_constraint("question_ratings_pkey", "question_ratings", type_="primary")
    op.drop_column("question_ratings", "likes")
    op.drop_column("question_ratings", "dislikes")
    op.add_column("question_ratings", sa.Column("user_id", sa.String(128), nullable=False))
    op.add_column("question_ratings", sa.Column("value", sa.SmallInteger(), nullable=False))
    op.create_primary_key("question_ratings_pkey", "question_ratings", ["question_id", "user_id"])
    op.create_check_constraint("ck_question_ratings_value", "question_ratings", "value IN (-1, 1)")
    op.create_index("ix_question_ratings_user_id", "question_ratings", ["user_id"])
