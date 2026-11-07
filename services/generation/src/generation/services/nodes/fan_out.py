from langgraph.types import Send
from testee_common.ai.examples import example_count
from testee_common.ai.multi_answer import multi_count

from generation.helpers.questions import (
    count_examples,
    count_multi,
    question_tasks,
    reused_questions,
    topic_size,
)
from generation.models.state import State


def fan_out_questions(state: State):
    """Conditional edge: one branch per call of each (topic, subtopic), for what reuse left; the
    multi-answer questions the topic still lacks, and the examples it would have on material in
    a formal notation, are spread over its calls. Reuse lowers the calls' size, not their number."""
    sends = []

    for ti, topic in enumerate(state["topics"]):
        reused = reused_questions(state, ti)
        size = topic_size(state)
        missing = max(size - len(reused), 0)
        multi = min(missing, max(multi_count(size, state["multi_share"]) - count_multi(reused), 0))
        examples = min(missing, max(example_count(size) - count_examples(reused), 0))
        context = {
            "level": state["level"],
            "existing": [question["text"] for question in reused],
            "language": state.get("language"),
        }
        tasks = question_tasks(
            ti, topic["main_topic"], topic["subtopics"], missing, size, multi, examples, context
        )
        sends += [Send("generate_questions", task) for task in tasks]

    return sends or "collect_results"
