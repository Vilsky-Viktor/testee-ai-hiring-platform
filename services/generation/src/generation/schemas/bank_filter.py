from uuid import UUID

from pydantic import BaseModel, Field


class BankVerdict(BaseModel):
    identifies: bool = Field(
        description="True when the question, its topic or an option names or reveals anything "
        "about a specific organisation that is not widely known public knowledge (its name, "
        "clients, staff, internal tools, projects, policies, figures or sites) or about a "
        "private person; false when anyone could have written it for any employer."
    )


class BankCandidate(BaseModel):
    """A company's question library offers to the bank, with the topic it's in."""

    question_id: UUID
    topic: str
    text: str
    options: list[str]
    # The options marked correct, by index; empty from a library not sending them yet, whose
    # questions then wait for the next run.
    correct: list[int] = []
    level: str = ""
    # Flagged: only a verdict for the evals' traps, never joins, so its key isn't checked.
    flagged: bool = False


class BankCheck(BaseModel):
    """The filter's verdict on a question as it read it: library keeps it by the text, so a
    question changed since is checked again."""

    question_id: UUID
    text: str
    passed: bool
