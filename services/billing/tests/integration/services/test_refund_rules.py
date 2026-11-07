"""What a company can refund, against the real ledger: 14 days, free credits spent first, the
newest top-up first, reserved credits held back and the 7-day late rule."""

from datetime import UTC, datetime, timedelta

from billing.constants.credits import WELCOME_COMPANY
from billing.services import holds
from tests.integration.factories import welcomed
from tests.integration.services.refund_world import (
    bought,
    company,
    held_between,
    offers,
    set_aside,
    spent,
)


def amounts(found: dict, txn: str) -> tuple[int, str]:
    offer = found[txn].offer

    return offer.credits, offer.amount


def test_an_unspent_top_up_is_offered_whole_without_the_free_credits(run):
    acme = company()

    async def scenario():
        await welcomed(acme, f"{acme}@example.com")
        txn = await bought(acme)

        return txn, await offers(acme)

    txn, found = run(scenario())

    assert amounts(found, txn) == (5_000, "5000")
    assert found[txn].offer.currency == "USD"


def test_the_14th_day_counts_and_the_next_moment_doesnt(run):
    acme = company()

    async def scenario():
        txn = await bought(acme, days_ago=13)
        now = datetime.now(UTC)

        return (
            txn,
            await offers(acme, now + timedelta(days=0.9)),
            await offers(acme, now + timedelta(days=1.1)),
        )

    txn, last_day, past = run(scenario())

    assert amounts(last_day, txn) == (5_000, "5000")
    assert past == {}


def test_free_credits_count_as_spent_first(run):
    acme = company()

    async def scenario():
        await welcomed(acme, f"{acme}@example.com")
        txn = await bought(acme)
        await spent(acme, WELCOME_COMPANY)
        whole = await offers(acme)
        await spent(acme, 1_000)

        return txn, whole, await offers(acme)

    txn, free_gone, some_paid_gone = run(scenario())

    assert amounts(free_gone, txn) == (5_000, "5000")
    assert amounts(some_paid_gone, txn) == (4_000, "4000")


def test_what_is_unspent_falls_on_the_newest_top_up_first(run):
    acme = company()

    async def scenario():
        older = await bought(acme, days_ago=10)
        newer = await bought(acme, days_ago=1)
        await spent(acme, 4_000)

        return older, newer, await offers(acme)

    older, newer, found = run(scenario())

    assert amounts(found, newer) == (5_000, "5000")
    assert amounts(found, older) == (1_000, "1000")


def test_all_spent_is_no_offer(run):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        await spent(acme, 5_000)

        return txn, await offers(acme)

    txn, found = run(scenario())

    assert found[txn].offer is None


def test_reserved_credits_are_held_back_until_their_invite_is_revoked(run):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        first = await set_aside(acme)
        await set_aside(acme)
        held = await offers(acme)
        await holds.release(first)

        return txn, held, await offers(acme)

    txn, held, revoked = run(scenario())

    assert amounts(held, txn) == (4_000, "4000")
    assert (held[txn].held_back_credits, held[txn].held_back_candidates) == (1_000, 2)
    assert amounts(revoked, txn) == (4_500, "4500")
    assert (revoked[txn].held_back_credits, revoked[txn].held_back_candidates) == (500, 1)


def test_all_reserved_says_why_with_no_offer(run):
    acme = company()

    async def scenario():
        txn = await bought(acme, credits=500, paid=500)
        await set_aside(acme)

        return txn, await offers(acme)

    txn, found = run(scenario())

    assert found[txn].offer is None
    assert found[txn].held_back_candidates == 1


def test_credits_back_after_the_14_days_stay_refundable_for_7_days(run):
    acme = company()

    async def scenario():
        txn = await bought(acme, days_ago=20)
        recent = await set_aside(acme)
        await held_between(recent, 10, 3)

        return txn, await offers(acme)

    txn, found = run(scenario())

    assert amounts(found, txn) == (500, "500")


def test_the_7_days_end(run):
    acme = company()

    async def scenario():
        await bought(acme, days_ago=20)
        recent = await set_aside(acme)
        await held_between(recent, 10, 8)

        return await offers(acme)

    assert run(scenario()) == {}


def test_a_top_up_past_its_14_days_gets_nothing_from_an_invite_sent_after_them(run):
    acme = company()

    async def scenario():
        await bought(acme, days_ago=20)
        recent = await set_aside(acme)
        await held_between(recent, 5, 3)

        return await offers(acme)

    assert run(scenario()) == {}
