from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field

from rounds.constants.rounds import OPTIONS_PER_QUESTION
from rounds.constants.voice import Intent


class VoiceMatch(BaseModel):
    """What the model heard in a spoken answer (prompts/voice_match.py)."""

    intent: Literal[Intent.CHOOSE, Intent.CONFIRM, Intent.REJECT, Intent.UNCLEAR] = Field(
        description="choose, confirm, reject or unclear, as the instructions define them"
    )
    letters: list[Literal["A", "B", "C", "D"]] = Field(
        description="The options chosen, for choose; empty for any other intent"
    )


class VoiceAnswerOut(BaseModel):
    """A spoken answer, understood: what was heard (the candidate's own words, shown back to
    them and kept nowhere), what it meant, and the options it picks (indices, as a click sends
    them) for `choose` and `confirm`. `noise` (no words: a cough, a knock) is ignored. `clear`: a
    choice of one option on a single-answer question, saved at once without asking to confirm
    it; any other choice is confirmed first. `doubted`: the reply questions, negates or doubts
    what it names ("A? no", "maybe A"), so it's never saved unconfirmed, also as the time runs
    out."""

    heard: str
    intent: Intent
    picks: list[int]
    clear: bool
    doubted: bool


class StreamSignIn(BaseModel):
    """A live answer's first message: the candidate's Firebase ID token (a browser can't set a
    WebSocket's headers, and a token in its address would be logged)."""

    token: str = Field(max_length=4_096)


class StreamStep(BaseModel):
    """A live answer's step: `start` once the browser hears the candidate speaking (counted as an
    answer; audio is taken only after it), `end` once they stop, with `waiting`, the choice
    (option indices) waiting for their yes or no, and `question_id`, the question they answered:
    one no longer on screen is refused."""

    type: Literal["start", "end"]
    waiting: list[Annotated[int, Field(ge=0, lt=OPTIONS_PER_QUESTION)]] = Field(
        default=[], max_length=OPTIONS_PER_QUESTION
    )
    question_id: UUID | None = None
