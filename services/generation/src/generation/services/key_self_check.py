import logging
import random
from collections import Counter

from testee_common.ai.multi_answer import is_multi
from testee_common.http.capped import gather_capped
from testee_common.limits.limits import limit

from generation.helpers.prompts import checker_messages
from generation.integrations import llm
from generation.integrations.redis import get_redis
from generation.prompts.checker import MULTI_ANSWER_KEY
from generation.prompts.self_check import SELF_CHECK_PROMPT
from generation.schemas.regenerate import RegeneratedOption
from generation.schemas.verify import KeyCheck, SelfCheck
from generation.services.key_blind import checked_key, confirm_prompt

logger = logging.getLogger(__name__)

# Why a new question was dropped.
WRONG_KEY = "key"
OPEN_CONDITION = "condition"
NOT_CHECKED = "not checked"


def self_check_prompt(text: str, options: list, topic: str, level: str, order: list[int]) -> str:
    return SELF_CHECK_PROMPT.format(
        kind=MULTI_ANSWER_KEY,
        level=level,
        topic=topic,
        question=text,
        options="\n".join(f"{number}. {options[i].answer}" for number, i in enumerate(order)),
    )


async def self_check(question: dict, topic: str, level: str) -> str | None:
    """Why a new multi-answer question ({"text", "options"}) can't be kept, or None: one call
    answers it blind (no option marked, a new order) and names any condition it leaves open that
    decides an option. Its key must match and nothing may be left open. A single-answer one isn't
    checked (its keys already reach the target, evals/README.md)."""
    if not is_multi(question["options"]):
        return None

    options = [RegeneratedOption.model_validate(option) for option in question["options"]]
    order = random.sample(range(len(options)), len(options))
    prompt = self_check_prompt(question["text"], options, topic, level, order)

    try:
        result: SelfCheck = (
            await llm.get_verifier_llm()
            .with_structured_output(SelfCheck)
            .ainvoke(checker_messages(prompt))
        )
    except Exception:
        logger.warning("Couldn't check a new question's key; it's dropped", exc_info=True)

        return NOT_CHECKED

    if result.open_condition:
        return OPEN_CONDITION

    marked = {index for index, option in enumerate(options) if option.correct}

    return None if checked_key(options, result, order) == marked else WRONG_KEY


def key_gate(
    text: str, options: list, topic: str, level: str, order: list[int]
) -> tuple[str, type[KeyCheck]]:
    """The check of a replacement's key, the one a new question of its kind gets: its prompt and
    what the reply is. A multi-answer question gets the self-check, a single-answer one the blind
    confirmation; nothing marked, options in `order`."""
    if is_multi(options):
        return self_check_prompt(text, options, topic, level, order), SelfCheck

    return confirm_prompt(text, options, level, topic, order), KeyCheck


def key_held(result: KeyCheck, options: list, order: list[int]) -> bool:
    """Whether a check's reply names the marked options and leaves no condition open."""
    if isinstance(result, SelfCheck) and result.open_condition:
        return False

    marked = {index for index, option in enumerate(options) if option.correct}

    return checked_key(options, result, order) == marked


async def key_holds(text: str, written: list[dict], topic: str, level: str) -> bool:
    """Whether a replacement's key stands up to key_gate; one that couldn't be checked doesn't."""
    options = [RegeneratedOption.model_validate(option) for option in written]
    order = random.sample(range(len(options)), len(options))
    prompt, schema = key_gate(text, options, topic, level, order)

    try:
        result = await (
            llm.get_verifier_llm().with_structured_output(schema).ainvoke(checker_messages(prompt))
        )
    except Exception:
        logger.warning("Couldn't check a replacement's key; it's dropped", exc_info=True)

        return False

    return key_held(result, options, order)


async def keys_that_hold(questions: list[dict], topic: str, level: str) -> list[dict]:
    """New questions ({"text", "options"}) without the multi-answer ones the self-check drops:
    each of their options must be clearly right or wrong under the conditions the question
    states. Fill-ups make up for the ones dropped."""
    reasons = await gather_capped(
        await limit(get_redis(), "GENERATION_CALLS_AT_ONCE"),
        (self_check(question, topic, level) for question in questions),
    )
    dropped = Counter(reason for reason in reasons if reason)

    if dropped:
        logger.info("Dropped new multi-answer questions on %r: %s", topic, dict(dropped))

    return [question for question, reason in zip(questions, reasons) if reason is None]
