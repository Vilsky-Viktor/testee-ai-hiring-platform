"""Restores sign-in accounts from a daily backup's file, with the account ids they had, replacing
any that exist. By hand, as the runbook says (Sign-in accounts lost), signed in with Application
Default Credentials; then run the erasures job, so nobody deleted since stays back:

    uv run --no-sync python -m accounts.jobs.restore_sign_ins testee-prod sign-ins-<time>.json
"""

import json
import sys
from itertools import batched
from pathlib import Path

from firebase_admin import auth as firebase_auth
from testee_common.auth.auth import start_firebase

from accounts.constants.sign_in_backup import IMPORT_BATCH
from accounts.helpers.sign_in_backup import imported


def restore(accounts: list[dict]) -> int:
    """Returns how many accounts Firebase refused."""
    failed = 0

    for batch in batched(accounts, IMPORT_BATCH):
        result = firebase_auth.import_users([imported(saved) for saved in batch])
        failed += result.failure_count

    return failed


def main() -> None:
    project, path = sys.argv[1:]
    accounts = json.loads(Path(path).read_text())
    start_firebase(project)
    failed = restore(accounts)
    print(f"Restored {len(accounts) - failed} accounts, {failed} refused")

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
