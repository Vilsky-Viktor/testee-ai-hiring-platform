"""A backup's file restores into the Auth emulator: the account comes back under its id, with its
provider, which is what keeps its companies and data (jobs/restore_sign_ins.py)."""

import json
import os
import uuid

import firebase_admin
import pytest
from firebase_admin import auth as firebase_auth
from testee_common.auth.auth import start_firebase

from accounts.jobs.restore_sign_ins import restore
from accounts.services.accounts import delete_sign_in
from accounts.services.sign_in_backup import export


@pytest.fixture
def uid():
    if not firebase_admin._apps:
        start_firebase(os.environ["FIREBASE_PROJECT_ID"])

    made = f"backup-{uuid.uuid4().hex}"
    account = firebase_auth.ImportUserRecord(
        uid=made,
        email=f"{made}@example.com",
        email_verified=True,
        display_name="Ann",
        custom_claims={"language": "de"},
        provider_data=[
            firebase_auth.UserProvider(
                uid=f"g-{made}", provider_id="google.com", email=f"{made}@example.com"
            )
        ],
    )
    assert firebase_auth.import_users([account]).failure_count == 0

    yield made

    delete_sign_in(made)


def test_a_deleted_account_comes_back_under_its_id(uid):
    [saved] = json.loads(json.dumps([row for row in export() if row["uid"] == uid]))
    delete_sign_in(uid)

    assert restore([saved]) == 0

    account = firebase_auth.get_user(uid)
    assert account.email == f"{uid}@example.com"
    assert account.custom_claims == {"language": "de"}
    assert [provider.provider_id for provider in account.provider_data] == ["google.com"]
