"""The sign-in accounts' daily backup: every account goes to a new file in the bucket, and only
where a bucket is set (services/sign_in_backup.py). Reading them back: the integration test."""

import asyncio
import json
from datetime import UTC, datetime
from types import SimpleNamespace

import pytest

from accounts.config import settings
from accounts.integrations import backup_bucket
from accounts.services import sign_in_backup

ACCOUNT = SimpleNamespace(
    uid="ann",
    email="ann@example.com",
    email_verified=True,
    display_name="Ann",
    photo_url=None,
    disabled=False,
    custom_claims={"language": "de"},
    user_metadata=SimpleNamespace(creation_timestamp=1000, last_sign_in_timestamp=2000),
    provider_data=[
        SimpleNamespace(
            uid="g-1",
            provider_id="google.com",
            email="ann@example.com",
            display_name="Ann",
            photo_url=None,
        )
    ],
)


@pytest.fixture
def files(monkeypatch):
    saved = []
    monkeypatch.setattr(
        sign_in_backup.firebase_auth,
        "list_users",
        lambda: SimpleNamespace(iterate_all=lambda: [ACCOUNT]),
    )
    monkeypatch.setattr(backup_bucket, "save", lambda *call: saved.append(call))

    return saved


def test_every_account_goes_to_a_new_file_in_the_bucket(files, monkeypatch):
    monkeypatch.setattr(settings, "sign_in_backup_bucket", "the-bucket")

    asyncio.run(sign_in_backup.back_up(datetime(2026, 11, 7, 5, 10, 3, tzinfo=UTC)))

    [(bucket, name, text)] = files
    assert (bucket, name) == ("the-bucket", "sign-ins-2026-11-07T05-10-03.json")
    assert json.loads(text) == [
        {
            "uid": "ann",
            "email": "ann@example.com",
            "email_verified": True,
            "display_name": "Ann",
            "photo_url": None,
            "disabled": False,
            "custom_claims": {"language": "de"},
            "created": 1000,
            "last_sign_in": 2000,
            "providers": [
                {
                    "uid": "g-1",
                    "provider_id": "google.com",
                    "email": "ann@example.com",
                    "display_name": "Ann",
                    "photo_url": None,
                }
            ],
        }
    ]


def test_nothing_is_written_where_no_bucket_is_set(files, monkeypatch):
    monkeypatch.setattr(settings, "sign_in_backup_bucket", "")

    asyncio.run(sign_in_backup.back_up())

    assert files == []
