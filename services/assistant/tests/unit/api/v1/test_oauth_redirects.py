import pytest
from mcp.shared.auth import OAuthClientInformationFull

from assistant.config import settings
from assistant.services import oauth_limits, oauth_provider


@pytest.mark.parametrize(
    "address", ["javascript://app.example.com/%0aalert(1)", "https://testee.test/connect?request=r"]
)
def test_an_app_cant_return_to_a_script_or_to_the_site_itself(client, monkeypatch, address):
    monkeypatch.setattr(settings, "site_url", "https://testee.test")

    async def hit(redis, key, name):
        return None

    monkeypatch.setattr(oauth_limits, "hit_or_skip", hit)
    body = {"redirect_uris": [address], "token_endpoint_auth_method": "none"}

    response = client.post("/register", json=body)

    assert response.status_code == 400
    assert response.json()["error"] == "invalid_redirect_uri"


def test_a_plain_challenge_to_an_address_like_the_consent_page_is_a_page_without_a_mark(
    client, monkeypatch
):
    """The SDK sends this error to the app's address: https://attacker.example/connect?request=R
    must neither be followed nor mark the victim's browser for R."""
    address = "https://attacker.example/connect?request=r1"
    app_client = OAuthClientInformationFull(
        client_id="c1", redirect_uris=[address], token_endpoint_auth_method="none"
    )

    async def get_client(self, client_id):
        return app_client

    async def hit(redis, key, name):
        return None

    monkeypatch.setattr(oauth_provider.Provider, "get_client", get_client)
    monkeypatch.setattr(oauth_limits, "hit_or_skip", hit)

    response = client.get(
        "/authorize",
        params={
            "client_id": "c1",
            "redirect_uri": address,
            "response_type": "code",
            "code_challenge": "c" * 43,
            "code_challenge_method": "plain",
        },
        follow_redirects=False,
    )

    assert response.status_code == 400
    assert "location" not in response.headers and "set-cookie" not in response.headers
