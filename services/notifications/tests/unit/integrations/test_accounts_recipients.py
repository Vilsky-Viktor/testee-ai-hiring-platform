import asyncio

from notifications.integrations import accounts


def test_nobody_is_mailed_at_an_address_they_never_proved(monkeypatch):
    async def post_ids(url, token, field, ids, key):
        return [
            {"user_id": "ann", "email": "ann@example.com", "email_verified": True},
            {"user_id": "bob", "email": "bob@example.com", "email_verified": False},
        ]

    monkeypatch.setattr(accounts, "post_ids", post_ids)

    found = asyncio.run(accounts.recipients(["ann", "bob"]))

    assert [person["user_id"] for person in found] == ["ann"]
