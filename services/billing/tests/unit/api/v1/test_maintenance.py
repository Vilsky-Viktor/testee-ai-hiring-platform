import uuid

import pytest
from testee_common.limits import maintenance


@pytest.fixture
def down(monkeypatch):
    async def on(redis):
        return True

    monkeypatch.setattr(maintenance, "is_on", on)


def test_payments_stop_during_maintenance(client, down):
    response = client.post(f"/companies/{uuid.uuid4()}/billing/checkout", json={})

    assert response.status_code == 503
    assert response.json()["code"] == "maintenance"


def test_paddles_web_hook_still_arrives_during_maintenance(client, down):
    response = client.post("/webhooks/paddle", content=b"{}")

    assert response.status_code != 503
