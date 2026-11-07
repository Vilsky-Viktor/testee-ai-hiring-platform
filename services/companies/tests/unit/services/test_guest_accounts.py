import asyncio
import uuid
from types import SimpleNamespace

import httpx
import pytest

from companies.constants.invites import InviteStatus
from companies.integrations import rounds
from companies.repositories import accounts, invites
from companies.services import accounts as account_service
from tests.unit.services.test_accounts import calls  # noqa: F401 (fixture)


@pytest.fixture
def guest_invite(calls, monkeypatch):  # noqa: F811
    """A guest's invite found by the email they delete their account with, and the order
    its sessions and the invite go in."""
    invite = SimpleNamespace(id=uuid.uuid4(), status=InviteStatus.FINISHED, hold_key="h")
    company_id = uuid.uuid4()
    gone = []

    async def candidate_invites(session, user_id, email):
        return [(invite, company_id)]

    async def no_memberships(session, user_id):
        return []

    async def no_unfinished(session, user_id, email):
        return []

    async def remove(session, found, company):
        gone.append(("invite", found.id, company))

    monkeypatch.setattr(accounts, "candidate_invites", candidate_invites)
    monkeypatch.setattr(accounts, "memberships", no_memberships)
    monkeypatch.setattr(accounts, "unfinished_invites", no_unfinished)
    monkeypatch.setattr(invites, "remove", remove)

    return invite, company_id, gone


def test_a_guest_deleting_their_account_by_email_loses_their_sessions_too(
    guest_invite, monkeypatch
):
    """A guest's sessions are under the guest's own id: user.deleted never reaches them, and
    once the invite is gone nothing else would."""
    invite, company_id, gone = guest_invite

    async def delete_invite_sessions(invite_ids):
        gone.append(("sessions", invite_ids))

    monkeypatch.setattr(rounds, "delete_invite_sessions", delete_invite_sessions)

    asyncio.run(account_service.delete_user("ann", "ann@example.com"))

    assert gone == [("sessions", [invite.id]), ("invite", invite.id, company_id)]


def test_the_invites_stay_for_the_retry_when_rounds_fails(guest_invite, monkeypatch):
    _, _, gone = guest_invite

    async def down(invite_ids):
        raise httpx.ConnectError("rounds is down")

    monkeypatch.setattr(rounds, "delete_invite_sessions", down)

    with pytest.raises(httpx.ConnectError):
        asyncio.run(account_service.delete_user("ann", "ann@example.com"))

    assert gone == []
