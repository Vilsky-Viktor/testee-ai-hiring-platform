from billing.constants.credits import MOST_SETTLED
from billing.repositories import ledger
from tests.unit.api.v1.test_internal import fresh_auth


def test_a_batch_of_candidates_is_settled_in_one_call(client, monkeypatch):
    moved = []

    async def charge(session, key):
        moved.append(("charge", key))

    async def release(session, key):
        moved.append(("release", key))

    monkeypatch.setattr(ledger, "charge", charge)
    monkeypatch.setattr(ledger, "release", release)
    body = {"charge": ["a"], "release": ["b", "c"]}
    response = client.post("/internal/candidates/settle", json=body, headers=fresh_auth())

    assert response.status_code == 204
    assert [what for what, _ in moved] == ["charge", "release", "release"]


def test_a_batch_too_big_for_a_call_is_refused(client):
    body = {"release": ["key"] * (MOST_SETTLED + 1)}
    response = client.post("/internal/candidates/settle", json=body, headers=fresh_auth())

    assert response.status_code == 422
