from types import SimpleNamespace
from unittest import mock

import pytest
from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from testee_common.auth.auth import current_user, fresh_user, verify
from testee_common.auth.key_actor import key_actor
from testee_common.auth.service_auth import issue_token
from testee_common.config.constants import SIGN_IN_UNAVAILABLE
from testee_common.redis import memory_cache

CLAIMS = {
    "uid": "ann",
    "email": "ann@example.com",
    "email_verified": True,
    "name": "Ann",
    "iat": 1_000,
}
ACCOUNT = SimpleNamespace(disabled=False, tokens_valid_after_timestamp=500_000)


@pytest.fixture(autouse=True)
def nothing_kept():
    memory_cache._entries.clear()


def test_a_valid_token_gives_its_user():
    with mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS):
        user = verify("token")

    assert (user.uid, user.email, user.email_verified, user.name) == (
        "ann",
        "ann@example.com",
        True,
        "Ann",
    )


@pytest.mark.parametrize(
    "error", [ValueError("malformed"), firebase_auth.InvalidIdTokenError("bad", cause=None)]
)
def test_an_invalid_token_gives_no_user(error):
    with mock.patch.object(firebase_auth, "verify_id_token", side_effect=error):
        assert verify("token") is None


def test_unreachable_certificates_are_a_503_not_a_bad_token():
    error = firebase_auth.CertificateFetchError("down", cause=None)

    with (
        mock.patch.object(firebase_auth, "verify_id_token", side_effect=error),
        pytest.raises(HTTPException) as raised,
    ):
        verify("token")

    assert raised.value.status_code == 503
    assert raised.value.detail == SIGN_IN_UNAVAILABLE


def request(method: str) -> Request:
    return Request({"type": "http", "method": method, "headers": []})


CREDENTIALS = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")


def test_a_signed_in_request_names_the_user_to_sentry_by_id_only():
    with (
        mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS),
        mock.patch("sentry_sdk.set_user") as set_user,
    ):
        current_user(request("GET"), CREDENTIALS)

    set_user.assert_called_once_with({"id": "ann"})


@pytest.mark.parametrize(
    ("method", "checked"),
    [("GET", False), ("HEAD", False), ("POST", True), ("PUT", True), ("DELETE", True)],
)
def test_only_a_change_asks_firebase_whether_the_sign_in_was_revoked(method, checked):
    with (
        mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS),
        mock.patch.object(firebase_auth, "get_user", return_value=ACCOUNT) as asked,
    ):
        current_user(request(method), CREDENTIALS)

    assert asked.called is checked


def test_an_instance_asks_firebase_about_an_account_once_a_minute():
    with (
        mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS),
        mock.patch.object(firebase_auth, "get_user", return_value=ACCOUNT) as asked,
    ):
        current_user(request("POST"), CREDENTIALS)
        current_user(request("POST"), CREDENTIALS)

    assert asked.call_count == 1


@pytest.mark.parametrize(
    "account",
    [
        {"side_effect": firebase_auth.UserNotFoundError("deleted")},
        {"return_value": SimpleNamespace(disabled=True, tokens_valid_after_timestamp=0)},
        # Signed out everywhere after this token was made.
        {"return_value": SimpleNamespace(disabled=False, tokens_valid_after_timestamp=2_000_000)},
    ],
)
def test_a_deleted_or_revoked_account_cant_change_anything(account):
    with (
        mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS),
        mock.patch.object(firebase_auth, "get_user", **account),
        pytest.raises(HTTPException) as raised,
    ):
        current_user(request("POST"), CREDENTIALS)

    assert raised.value.status_code == 401


def test_firebase_unreachable_while_checking_revocation_is_a_503():
    error = firebase_auth.UnexpectedResponseError("down", cause=None, http_response=None)

    with (
        mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS),
        mock.patch.object(firebase_auth, "get_user", side_effect=error),
        pytest.raises(HTTPException) as raised,
    ):
        current_user(request("POST"), CREDENTIALS)

    assert raised.value.status_code == 503
    assert raised.value.detail == SIGN_IN_UNAVAILABLE


def test_a_read_that_hands_over_a_lot_is_refused_once_the_sign_in_was_revoked():
    """A data export, the admin zone, the bell's stream: a revoked token is refused for reads."""
    user = verify_claims()
    revoked = firebase_auth.RevokedIdTokenError("revoked")

    with (
        mock.patch.object(firebase_auth, "verify_id_token", side_effect=revoked) as verified,
        pytest.raises(HTTPException) as raised,
    ):
        fresh_user(request("GET"), user, CREDENTIALS)

    assert raised.value.status_code == 401
    assert verified.call_args.kwargs["check_revoked"] is True


def test_a_read_by_a_live_sign_in_goes_through():
    user = verify_claims()

    with mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS):
        assert fresh_user(request("GET"), user, CREDENTIALS) == user


def verify_claims():
    with mock.patch.object(firebase_auth, "verify_id_token", return_value=CLAIMS):
        return verify("token")


def test_a_signed_out_or_bad_request_is_401_but_404_in_the_admin_zone():
    def at(path):
        return Request({"type": "http", "method": "GET", "path": path, "headers": []})

    for path, code in (("/companies", 401), ("/superadmin/stats", 404)):
        with pytest.raises(HTTPException) as signed_out:
            current_user(at(path), None)

        with (
            mock.patch.object(firebase_auth, "verify_id_token", side_effect=ValueError("bad")),
            pytest.raises(HTTPException) as bad,
        ):
            current_user(at(path), CREDENTIALS)

        assert signed_out.value.status_code == bad.value.status_code == code


@pytest.mark.parametrize(
    ("path", "reached"),
    [
        ("/sessions/1/step", True),
        ("/invites/token/start", True),
        ("/candidates/1/brand", True),
        ("/me", True),
        ("/me/legal-changes", True),
        ("/practice/1", False),
        ("/chat", False),
        ("/companies", False),
        ("/members/invites/token/accept", False),
    ],
)
def test_a_guests_sign_in_reaches_only_its_interview_and_account(path, reached):
    request = Request({"type": "http", "method": "GET", "path": path, "headers": []})
    claims = {"uid": "guest-1", "email_verified": False}

    with mock.patch.object(firebase_auth, "verify_id_token", return_value=claims):
        if reached:
            assert current_user(request, CREDENTIALS).uid == "guest-1"

            return

        with pytest.raises(HTTPException) as refused:
            current_user(request, CREDENTIALS)

    assert refused.value.status_code == 404


def test_an_api_keys_token_from_the_assistant_is_the_key_for_reads_and_changes(monkeypatch):
    monkeypatch.setenv("SERVICE_SECRET", "own")
    token = issue_token("mcp", "companies", "own", {"key": "k1", "company": "c1"})
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    invalid = firebase_auth.InvalidIdTokenError("not firebase", cause=None)

    with mock.patch.object(firebase_auth, "verify_id_token", side_effect=invalid) as checked:
        changed = current_user(request("POST"), credentials)
        read = fresh_user(request("GET"), current_user(request("GET"), credentials), credentials)

    assert changed.uid == read.uid == key_actor("k1")
    # A key has no Firebase sign-in to revoke: a fresh read doesn't ask Firebase again.
    assert checked.call_count == 2
