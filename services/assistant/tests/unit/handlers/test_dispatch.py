import asyncio
import uuid

import pytest
from event_pushes import push
from fastapi.testclient import TestClient

from assistant.handlers import candidate_removed, company_deleted, dispatch, user_deleted
from assistant.main import app

COMPANY = uuid.UUID("8c1d2b8e-1a2b-4c3d-8e9f-0a1b2c3d4e5f")


def deletions(monkeypatch):
    deleted = []

    async def delete_company(company_id, member_ids):
        deleted.append(company_id)

        return 0

    monkeypatch.setattr(company_deleted.conversations, "delete_company", delete_company)

    return deleted


def test_only_company_deleted_is_handled(monkeypatch):
    deleted = deletions(monkeypatch)
    asyncio.run(dispatch.handle("interview.deleted", {"interview_id": str(COMPANY)}))
    asyncio.run(dispatch.handle("company.deleted", {"company_id": str(COMPANY)}))

    assert deleted == [COMPANY]


def test_an_event_with_a_malformed_company_is_acknowledged_and_deletes_nothing(monkeypatch):
    deleted = deletions(monkeypatch)
    data = {"company_id": "not-a-uuid"}

    assert (
        TestClient(app).post("/internal/events", json=push("company.deleted", data)).status_code
        == 204
    )
    assert deleted == []


def test_a_deleted_account_takes_its_conversations_and_apps_and_a_malformed_one_is_dropped(
    monkeypatch,
):
    deleted = []

    async def delete_user(user_id):
        deleted.append(user_id)

    monkeypatch.setattr(user_deleted.accounts, "delete_user", delete_user)
    client = TestClient(app)
    gone = push("user.deleted", {"user_id": "ann", "email": "ann@example.com"})

    assert client.post("/internal/events", json=gone).status_code == 204
    assert client.post("/internal/events", json=push("user.deleted", {})).status_code == 204
    assert deleted == ["ann"]


@pytest.mark.parametrize(
    "name, needles",
    [
        ("Ann Lee", ["ann@example.com", "invite", "Ann Lee"]),
        ("Al", ["ann@example.com", "invite"]),
        (None, ["ann@example.com", "invite"]),
    ],
)
def test_an_erased_candidates_name_is_looked_for_unless_too_short_to_tell(
    monkeypatch, name, needles
):
    looked_for = []

    async def delete_mentioning(company_id, member_ids, words):
        looked_for.append(words)

        return 0

    monkeypatch.setattr(candidate_removed.conversations, "delete_mentioning", delete_mentioning)
    data = {"email": "ann@example.com", "candidate_invite_id": "invite", "name": name}

    asyncio.run(candidate_removed.handle(uuid.uuid4(), data))

    assert looked_for == [needles]
