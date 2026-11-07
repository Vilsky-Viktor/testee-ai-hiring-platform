from fake_redis import FakeRedis
from testee_common.auth.auth import current_user
from testee_common.auth.user import User

from accounts.api.v1 import me as me_routes
from accounts.integrations import services as account_services
from accounts.main import app
from accounts.repositories import user_data

USER = User(uid="ann", email="Ann@Example.com", email_verified=True, name="Ann")


def test_the_export_holds_every_service_and_downloads_as_a_file(client, monkeypatch):
    async def export_from(service, user_id, email):
        return {"from": service}

    async def own_export(session, user_id):
        return {"terms_accepted": []}

    monkeypatch.setattr(account_services, "export_user", export_from)
    monkeypatch.setattr(user_data, "export", own_export)
    monkeypatch.setattr(me_routes, "get_redis", lambda: FakeRedis())
    app.dependency_overrides[current_user] = lambda: USER

    try:
        response = client.get("/me/export")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.headers["content-disposition"] == 'attachment; filename="testee-data.json"'
    assert response.json() == {
        "account": {
            "id": "ann",
            "email": "Ann@Example.com",
            "name": "Ann",
            "language": "en",
        },
        "accounts": {"terms_accepted": []},
        "companies": {"from": "companies"},
        "rounds": {"from": "rounds"},
        "generation": {"from": "generation"},
        "billing": {"from": "billing"},
        "notifications": {"from": "notifications"},
        "ats": {"from": "ats"},
        "api": {"from": "api"},
        "assistant": {"from": "assistant"},
        "library": {"from": "library"},
        "site": {"from": "site"},
    }


def test_data_downloads_past_the_hourly_limit_are_refused_before_asking_anyone(client, monkeypatch):
    asked = []

    async def export_from(service, user_id, email):
        asked.append(service)

        return {}

    async def own_export(session, user_id):
        return {}

    monkeypatch.setattr(account_services, "export_user", export_from)
    monkeypatch.setattr(user_data, "export", own_export)
    redis = FakeRedis({"DATA_EXPORTS_PER_HOUR": 1})
    monkeypatch.setattr(me_routes, "get_redis", lambda: redis)
    app.dependency_overrides[current_user] = lambda: USER

    try:
        first = client.get("/me/export")
        asked_once = len(asked)
        second = client.get("/me/export")
    finally:
        app.dependency_overrides.clear()

    assert (first.status_code, second.status_code) == (200, 429)
    assert len(asked) == asked_once
