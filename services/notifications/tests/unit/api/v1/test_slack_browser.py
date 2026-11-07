from urllib.parse import parse_qs, urlparse

import pytest

from notifications.constants.slack import SLACK_COOKIE
from notifications.integrations import slack as slack_api
from tests.unit.api.v1.test_slack_routes import (  # noqa: F401 (fixtures)
    C1,
    callback,
    configured,
    nonces,
    saved,
    state,
)


@pytest.mark.parametrize("cookie", ["", "another-trip"], ids=["no cookie", "another trip"])
def test_a_trip_handed_to_another_browser_saves_nothing(
    client,
    monkeypatch,
    saved,  # noqa: F811
    cookie,
):
    async def exchange(code):
        raise AssertionError("Slack isn't asked")

    monkeypatch.setattr(slack_api, "exchange", exchange)
    started = state()

    assert callback(client, f"code=ok&state={started}", cookie).status_code == 422
    assert saved["saved"] is None


def test_the_browser_that_starts_a_trip_gets_a_private_cookie_cleared_at_the_end(
    client,
    monkeypatch,
    saved,  # noqa: F811
):
    async def exchange(code):
        return {"team": "Acme", "channel": "#hiring", "url": "https://hooks/x", "token": "t"}

    monkeypatch.setattr(slack_api, "exchange", exchange)
    started = client.get(f"/slack/start?company_id={C1}")
    query = f"code=ok&state={parse_qs(urlparse(started.json()['url']).query)['state'][0]}"
    set_cookie = started.headers["set-cookie"]
    back = callback(client, query, set_cookie.split(";")[0].split("=", 1)[1])

    assert "Path=/api/notifications/slack/callback" in set_cookie
    assert "HttpOnly" in set_cookie and "SameSite=lax" in set_cookie
    assert "Max-Age=900" in set_cookie
    assert back.status_code == 303
    assert back.headers["set-cookie"].startswith(f'{SLACK_COOKIE}="";')
