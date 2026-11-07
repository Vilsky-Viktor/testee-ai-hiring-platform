import asyncio
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest

from companies.constants.invites import ORPHAN_HOLD_AGE
from companies.integrations import billing, billing_holds
from companies.repositories import credit_invites
from companies.services import orphan_holds


@pytest.fixture
def holds(monkeypatch):
    """Billing's open holds, a page at a time, and which an invite holds; what was done."""
    done = SimpleNamespace(pages=[], held=set(), asked=[], settled=[])

    async def open_holds(before, after):
        done.asked.append((before, after))

        return done.pages.pop(0)

    async def held_keys(session, keys):
        return done.held & set(keys)

    async def settle(charge, release):
        done.settled.append((charge, release))

    monkeypatch.setattr(billing_holds, "open_holds", open_holds)
    monkeypatch.setattr(credit_invites, "held_keys", held_keys)
    monkeypatch.setattr(billing, "settle_candidates", settle)

    return done


def test_only_holds_without_an_invite_come_back_page_after_page(holds):
    holds.pages = [["a", "b"], ["c"], []]
    holds.held = {"a", "c"}

    assert asyncio.run(orphan_holds.release_orphans()) == 1
    assert holds.settled == [([], ["b"]), ([], [])]
    assert [after for _, after in holds.asked] == ["", "b", "c"]


def test_a_hold_is_left_while_its_invite_may_still_be_on_its_way(holds):
    holds.pages = [[]]
    asyncio.run(orphan_holds.release_orphans())
    [(before, _)] = holds.asked

    assert before < datetime.now(UTC) - ORPHAN_HOLD_AGE + timedelta(seconds=1)


def test_a_run_out_of_time_leaves_the_rest_for_the_next_day(holds, monkeypatch):
    monkeypatch.setattr(orphan_holds, "JOB_RUN_SECONDS", 0)
    holds.pages = [["a"]]

    assert asyncio.run(orphan_holds.release_orphans()) == 0
    assert holds.settled == []
