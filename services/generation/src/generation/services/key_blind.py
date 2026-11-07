import random

from testee_common.ai.multi_answer import is_multi

from generation.constants.generation import MAX_MULTI_CORRECT
from generation.helpers.prompts import checker_messages
from generation.integrations import llm
from generation.prompts.checker import MULTI_ANSWER_KEY, SINGLE_ANSWER_KEY
from generation.prompts.confirm import CONFIRM_PROMPT
from generation.schemas.verify import KeyCheck


def checked_key(options: list, result: KeyCheck, order: list[int]) -> set[int] | None:
    """The options the check names as correct, as indexes into `options`; None when it named
    none, an option that isn't there, or a key of the other kind (one option for a multi-answer
    question, several for a single-answer one, or every option): the question can't keep its
    kind."""
    indexes = result.correct_indexes

    if not indexes or any(not 0 <= index < len(order) for index in indexes):
        return None

    correct = {order[index] for index in indexes}

    if (len(correct) > 1) != is_multi(options) or len(correct) > MAX_MULTI_CORRECT:
        return None

    return correct


def confirm_prompt(text: str, options: list, level: str, topic: str, order: list[int]) -> str:
    """The blind confirmation's prompt: no option marked, the options in `order`."""
    return CONFIRM_PROMPT.format(
        kind=MULTI_ANSWER_KEY if is_multi(options) else SINGLE_ANSWER_KEY,
        level=level,
        topic=topic,
        question=text,
        options="\n".join(f"{number}. {options[i].answer}" for number, i in enumerate(order)),
    )


async def blind_key(text: str, options: list, level: str, topic: str) -> set[int] | None:
    """The options a check that sees no mark, in a new order, names as correct (checked_key)."""
    order = random.sample(range(len(options)), len(options))
    prompt = confirm_prompt(text, options, level, topic, order)
    result: KeyCheck = (
        await llm.get_verifier_llm()
        .with_structured_output(KeyCheck)
        .ainvoke(checker_messages(prompt))
    )

    return checked_key(options, result, order)
