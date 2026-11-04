import math

from testee_common.ai.multi_answer import draw

from companies.constants.interviews import (
    DEFAULT_TOPIC_QUESTIONS,
    MAX_INTERVIEW_QUESTIONS,
    InterviewStatus,
)
from companies.models.interviews import Interview
from companies.schemas.interviews import TopicOut


def interview_status(hired: bool, candidate_count: int) -> InterviewStatus:
    if hired:
        return InterviewStatus.HIRED

    return InterviewStatus.IN_PROCESS if candidate_count else InterviewStatus.NEW


def even_share(topic_count: int) -> int:
    """Questions each topic of a new interview gives a candidate: an even share of
    MAX_INTERVIEW_QUESTIONS, DEFAULT_TOPIC_QUESTIONS at most."""
    return min(DEFAULT_TOPIC_QUESTIONS, MAX_INTERVIEW_QUESTIONS // max(topic_count, 1))


def topic_limits(sizes: list[tuple[str, int]], stored: dict[str, int]) -> dict[str, int]:
    """Questions a candidate gets from each topic, by id, from each topic's id and number of
    questions in order, never more than it has: the company's number where one is stored. While
    none is (a new interview), each topic gets its even_share. A topic without one beside topics
    that have one (added later) gets DEFAULT_TOPIC_QUESTIONS or the room left under
    MAX_INTERVIEW_QUESTIONS, whichever is smaller; 0 when there's none."""
    if not any(key in stored for key, _ in sizes):
        share = even_share(len(sizes))

        return {key: min(share, size) for key, size in sizes}

    counts = {key: min(stored[key], size) for key, size in sizes if key in stored}
    room = MAX_INTERVIEW_QUESTIONS - sum(counts.values())

    for key, size in sizes:
        if key not in counts:
            counts[key] = max(0, min(DEFAULT_TOPIC_QUESTIONS, room, size))
            room -= counts[key]

    return {key: counts[key] for key, _ in sizes}


def set_sizes(found: dict, excluded: dict[str, list[str]]) -> list[tuple[str, int]]:
    """Each topic's id and number of questions candidates may get, from library's set: the ones
    left out (`excluded`, by topic id) don't count."""
    return [
        (str(topic["id"]), topic["question_count"] - len(excluded.get(str(topic["id"]), [])))
        for topic in found.get("topics", [])
    ]


def topics_out(found: dict, interview: Interview) -> list[TopicOut]:
    excluded = interview.excluded_questions
    counts = topic_limits(set_sizes(found, excluded), interview.topic_limits)

    return [
        TopicOut(
            id=topic["id"],
            title=topic["title"],
            subtopics=topic.get("subtopics", []),
            question_count=topic["question_count"] - len(excluded.get(str(topic["id"]), [])),
            excluded_count=len(excluded.get(str(topic["id"]), [])),
            question_limit=counts[str(topic["id"])],
        )
        for topic in found.get("topics", [])
    ]


def interview_questions(found: dict | None, interview: Interview) -> int | None:
    """Every question a candidate gets, over all topics. None while the interview's questions
    aren't known."""
    if not found:
        return None

    return sum(topic.question_limit for topic in topics_out(found, interview))


def interview_minutes(found: dict | None, interview: Interview, seconds: int) -> int | None:
    """The whole interview's time, in minutes rounded up: every question a candidate gets at
    `seconds` each, in click and voice mode alike (a question's reading aloud counts in its
    time). None while the interview's questions aren't known."""
    questions = interview_questions(found, interview)

    if questions is None:
        return None

    return math.ceil(questions * seconds / 60)


def pick_questions(questions: list, limit: int, share: float) -> list:
    """Each candidate gets a fresh random subset with `share` of multi-answer questions
    (testee_common.ai.multi_answer.draw), or every question when the topic has no more."""
    if limit >= len(questions):
        return questions

    return draw(questions, limit, share)


def session_topics(interview: Interview, content: dict, share: float) -> list[dict]:
    """Each topic with a fresh random subset of its questions, as rounds starts sessions. A topic
    set to 0 questions is left out: the candidate never sees it, and it never counts; so are the
    questions an owner or admin left out."""
    # The questions an owner or admin left out never reach a candidate.
    kept = {
        str(topic["id"]): [
            question
            for question in topic["questions"]
            if str(question["id"]) not in interview.excluded_questions.get(str(topic["id"]), [])
        ]
        for topic in content["topics"]
    }
    sizes = [(key, len(questions)) for key, questions in kept.items()]
    counts = topic_limits(sizes, interview.topic_limits)

    return [
        {
            "id": topic["id"],
            "preparation_id": content["id"],
            "title": topic["title"],
            "questions": pick_questions(kept[str(topic["id"])], counts[str(topic["id"])], share),
        }
        for topic in content["topics"]
        if counts[str(topic["id"])] > 0
    ]
