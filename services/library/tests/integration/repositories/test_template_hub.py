import uuid

from library.constants.templates import MIN_INDEXABLE_TOPICS
from library.services import templates as template_service
from tests.integration.factories import direction, interview

TOPICS = [direction(index + 1) for index in range(MIN_INDEXABLE_TOPICS)]


def test_a_hub_lists_only_indexable_templates_of_its_languages_by_title(run):
    word = uuid.uuid4().hex[:8]

    async def scenario():
        await interview(f"banana {word}", template=True, topic_embeddings=TOPICS)
        await interview(f"Apple {word}", template=True, topic_embeddings=TOPICS)
        # A near-duplicate of the Apple above, a template too thin, a company's own test and
        # another language's template stay out.
        await interview(f"APPLE {word}", template=True, topic_embeddings=TOPICS)
        await interview(f"Cherry {word}", template=True)
        await interview(f"Date {word}", topic_embeddings=TOPICS)
        await interview(f"Elder {word}", template=True, language="de", topic_embeddings=TOPICS)

        return (
            await template_service.hub(["en"], 0, 10),
            await template_service.hub(["en", "de"], 0, 10),
            await template_service.hub_count(["en"]),
            await template_service.hub_count(["en", "de"]),
        )

    english, both, english_count, both_count = run(scenario())

    assert [row.title for row in english] == [f"Apple {word}", f"banana {word}"]
    assert all(row.indexable for row in english)
    assert [row.title for row in both] == [f"Apple {word}", f"banana {word}", f"Elder {word}"]
    assert (english_count, both_count) == (2, 3)


def test_a_hubs_pages_follow_each_other_without_a_gap(run):
    word = uuid.uuid4().hex[:8]

    async def scenario():
        for letter in "cab":
            await interview(f"{letter} {word}", template=True, topic_embeddings=TOPICS)

        return (
            await template_service.hub(["en"], 0, 2),
            await template_service.hub(["en"], 2, 2),
        )

    first, second = run(scenario())

    assert [row.title for row in first] == [f"a {word}", f"b {word}"]
    assert [row.title for row in second] == [f"c {word}"]
