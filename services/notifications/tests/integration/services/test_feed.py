import asyncio
import uuid

import pytest
from testee_common.events.notifications import (
    BILLING_KINDS,
    NOTIFICATION_REQUESTED,
    NotificationKind,
    Recipient,
    notification,
)

from notifications.constants.notifications import DROPDOWN_LIMIT
from notifications.handlers import dispatch
from notifications.integrations import accounts, companies, subscription
from notifications.repositories import notifications
from notifications.services import feed, notices
from tests.integration.factories import company, finished
from tests.integration.transactions import transaction


@pytest.fixture
def member_of(monkeypatch):
    """The companies a user belongs to, as the companies service would answer."""
    joined = {}

    async def memberships(user_id):
        return joined.get(user_id, []), joined.get(f"viewer:{user_id}", [])

    async def account_created(user_id):
        """Unknown to library: only the user's own and their companies' notifications."""

    monkeypatch.setattr(companies, "memberships", memberships)
    monkeypatch.setattr(accounts, "account_created", account_created)

    return joined


def own(user_id: str, title: str) -> dict:
    return notification(
        Recipient.USER, user_id, NotificationKind.REFERRAL_REWARDED, "/billing", title=title
    )


@pytest.mark.parametrize("kind", sorted(BILLING_KINDS))
def test_a_companys_billing_reaches_its_editors_bell_and_not_a_viewers(run, member_of, kind):
    editor, viewer, acme = f"u-{uuid.uuid4()}", f"u-{uuid.uuid4()}", company()
    member_of[editor] = [acme]
    member_of[viewer] = [acme]
    member_of[f"viewer:{viewer}"] = [acme]

    async def scenario():
        await notices.store(
            str(uuid.uuid4()),
            notification(Recipient.COMPANY, acme, kind, f"/companies/{acme}/billing"),
        )
        await notices.store(str(uuid.uuid4()), finished(acme))

        return await feed.feed(editor, "en"), await feed.feed(viewer, "en")

    seen, kept_out = run(scenario())

    assert {item.kind for item in seen.items} == {kind, NotificationKind.CANDIDATE_FINISHED}
    assert seen.unread == 2
    # The viewer's list and count leave it out; the company's other notices stay.
    assert [item.kind for item in kept_out.items] == [NotificationKind.CANDIDATE_FINISHED]
    assert kept_out.unread == 1


def test_a_refused_link_reaches_everyone_in_the_company(run, member_of):
    editor, viewer, acme = f"u-{uuid.uuid4()}", f"u-{uuid.uuid4()}", company()
    member_of[editor] = [acme]
    member_of[viewer] = [acme]
    member_of[f"viewer:{viewer}"] = [acme]

    async def scenario():
        await notices.store(
            str(uuid.uuid4()),
            notification(
                Recipient.COMPANY, acme, NotificationKind.LINK_REFUSED, f"/companies/{acme}"
            ),
        )

        return await feed.feed(editor, "en"), await feed.feed(viewer, "en")

    for bell in run(scenario()):
        assert [item.kind for item in bell.items] == [NotificationKind.LINK_REFUSED]


def test_a_viewer_keeps_billing_they_own_as_a_person_and_of_a_company_they_edit(run, member_of):
    viewer, watched, edited = f"u-{uuid.uuid4()}", company(), company()
    member_of[viewer] = [watched, edited]
    member_of[f"viewer:{viewer}"] = [watched]
    kind = NotificationKind.AUTO_TOP_UP_FAILED

    async def scenario():
        for recipient, id_ in (
            (Recipient.COMPANY, watched),
            (Recipient.COMPANY, edited),
            (Recipient.USER, viewer),
        ):
            await notices.store(str(uuid.uuid4()), notification(recipient, id_, kind, "/x"))

        return await feed.feed(viewer, "en")

    found = run(scenario())

    assert found.unread == 2


def test_the_feed_holds_the_users_and_their_companies_notifications(run, member_of):
    user, mine, other = f"u-{uuid.uuid4()}", company(), company()
    member_of[user] = [mine]

    async def scenario():
        await notices.store(str(uuid.uuid4()), own(user, "credits"))
        await notices.store(str(uuid.uuid4()), finished(mine))
        await notices.store(str(uuid.uuid4()), finished(other))

        return await feed.feed(user, "en")

    result = run(scenario())

    assert [(item.kind, item.link) for item in result.items] == [
        ("candidate_finished", f"/companies/{mine}"),
        ("referral_rewarded", "/billing"),
    ]
    assert result.unread == 2


def test_the_dropdown_shows_the_latest_few(run, member_of):
    user = f"u-{uuid.uuid4()}"

    async def scenario():
        for number in range(DROPDOWN_LIMIT + 2):
            await notices.store(str(uuid.uuid4()), own(user, str(number)))

        return await feed.feed(user, "en")

    result = run(scenario())

    assert [item.data["title"] for item in result.items] == [
        str(number) for number in range(DROPDOWN_LIMIT + 1, 1, -1)
    ]
    assert result.unread == DROPDOWN_LIMIT + 2


def test_opening_the_bell_reads_everything_so_far_for_that_user_only(run, member_of):
    ann, bob, shared = f"u-{uuid.uuid4()}", f"u-{uuid.uuid4()}", company()
    member_of.update({ann: [shared], bob: [shared]})

    async def scenario():
        await notices.store(str(uuid.uuid4()), finished(shared, "Backend"))
        await notices.mark_seen(ann)
        after_seen = (await feed.feed(ann, "en")).unread
        await notices.store(str(uuid.uuid4()), finished(shared, "Frontend"))

        return after_seen, (await feed.feed(ann, "en")).unread, (await feed.feed(bob, "en")).unread

    assert run(scenario()) == (0, 1, 2)


def test_a_deleted_account_takes_only_its_own_notifications(run, member_of):
    user, mine = f"u-{uuid.uuid4()}", company()

    async def scenario():
        await notices.store(str(uuid.uuid4()), own(user, "credits"))
        await notices.store(str(uuid.uuid4()), finished(mine))
        exported = await transaction(notifications.latest, [(Recipient.USER, user)], limit=None)
        await transaction(notifications.remove_user, user)
        left = await transaction(
            notifications.latest, [(Recipient.USER, user), (Recipient.COMPANY, mine)], limit=None
        )

        return [row.kind for row in exported], [row.kind for row in left]

    assert run(scenario()) == (["referral_rewarded"], ["candidate_finished"])


def test_an_open_tab_hears_of_a_new_notification_through_redis(run, member_of):
    user, mine = f"u-{uuid.uuid4()}", company()
    member_of[user] = [mine]

    async def scenario():
        stream = feed.changes(user)

        try:
            connected = await anext(stream)
            # The tab subscribed on the first step; now a notification comes for its company.
            await dispatch.handle(NOTIFICATION_REQUESTED, finished(mine), str(uuid.uuid4()))
            # Heartbeat comments may come first (the subscriptions' own confirmations).
            heard = await asyncio.wait_for(anext(stream), 5)

            while heard.startswith(":"):
                heard = await asyncio.wait_for(anext(stream), 5)
        finally:
            await stream.aclose()

        return connected, heard

    assert run(scenario()) == (": connected\n\n", 'data: {"new": true}\n\n')


async def heard(stream) -> str:
    """The stream's next event, past heartbeat comments."""
    line = await asyncio.wait_for(anext(stream), 5)

    while line.startswith(":"):
        line = await asyncio.wait_for(anext(stream), 5)

    return line


def test_an_instances_open_tabs_share_one_redis_subscription(run, member_of, monkeypatch):
    ann, bob, shared = f"u-{uuid.uuid4()}", f"u-{uuid.uuid4()}", company()
    member_of.update({ann: [shared], bob: [shared]})
    made = []
    real = subscription.get_redis

    class CountingRedis:
        def pubsub(self):
            made.append(1)

            return real().pubsub()

    monkeypatch.setattr(subscription, "get_redis", CountingRedis)

    async def scenario():
        tabs = [feed.changes(ann), feed.changes(ann), feed.changes(bob)]

        try:
            for tab in tabs:
                await anext(tab)

            await dispatch.handle(NOTIFICATION_REQUESTED, finished(shared), str(uuid.uuid4()))

            return [await heard(tab) for tab in tabs]
        finally:
            for tab in tabs:
                await tab.aclose()

    assert run(scenario()) == ['data: {"new": true}\n\n'] * 3
    assert len(made) == 1
