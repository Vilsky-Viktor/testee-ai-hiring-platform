# accounts

Users' accounts: the account settings (the interface language, kept on the Firebase sign-in),
users' email settings with their consent log, the terms each accepted at sign-up, deleting and
downloading an account across every service, the erasures replayed after a restore, the admin
zone's account lookups, email settings and sign-up stats, and what other services ask about an
account (its address, language and email settings, account ids, when it was made, and the names
and pictures companies shows as notes' authors, `POST /internal/accounts/profiles`). It keeps the
email settings, the consent log, the accepted terms, the recent erasures and its outbox in its own database;
the sign-ins are Firebase's. What it does: [notifications](../../docs/features/notifications.md#email-preferences-and-consent)
(email settings), [the public site](../../docs/features/site.md) (accepted terms) and
[support](../../docs/features/admin-support.md).

Its public routes are under `/api/accounts/` (`/api/accounts/me`, the admin zone's
`/api/accounts/superadmin/emails/...` and `/api/accounts/superadmin/stats`).

## Deleting and downloading an account

`DELETE /me` asks companies first, by a call (`DELETE /internal/users/{id}`, the verified email in
the body): it refuses, 409, while the user owns a company others joined, before anything is
deleted. Then, in one save, it deletes its own rows with a note in `erasures` and saves the
`user.deleted` event (the user's id and verified email) in its outbox, which every other holder
(rounds, generation, billing, notifications, ats, api, assistant, library, site) consumes to delete
its part, safe to repeat; that save is tried three times, as companies has already deleted its part
by then; then the sign-in last, so a failed step leaves the user able to retry.
The event is published at once, or by the outbox's flush (`/internal/schedules/outbox`, every
minute), which also deletes events published a week ago. `GET /me/export` asks every service
(`POST /internal/users/{id}/export`) and adds its own part. The daily `erasures` job
(`/internal/schedules/erasures`; by hand after a restore) runs the last 14 days' deletions again:
companies' call, the event and the sign-in. The daily `sign-in-backup` job
(`/internal/schedules/sign-in-backup`) copies every sign-in to a bucket, 14 days, since they live
only in Firebase; `jobs/restore_sign_ins.py` puts them back under their ids
([runbook](../../docs/runbooks/platform.md#sign-in-accounts-lost)).

## Layout

```
src/accounts/
├── main.py, config.py      # App wiring; settings
├── api/v1/                 # Routes (the folder name only: URLs have no extra /v1)
├── api/dependencies.py     # Calls from other services
├── core/                   # db.py (engine, Session), security.py (service tokens)
├── handlers/               # Pub/Sub events (deleted guests); dispatch.py picks one
├── services/               # Sign-ins and language, email settings, recipients, stats,
│                           # deletion and export, erasures, deleted guests, the outbox; each
│                           # opens its transaction
├── repositories/           # Database queries: email settings and consents, terms, erasures,
│                           # the outbox, an account's data; take the session, never commit
├── models/, schemas/       # SQLAlchemy tables; request and response models
├── helpers/, constants/    # Pure functions (consent changes); fixed values
├── integrations/           # Companies' deletion and every service's export, billing (a
│                           # new account's currency), Redis
├── integrations/backup_bucket.py   # the sign-ins' backup bucket
└── jobs/                   # by hand: restore_sign_ins.py
tests/unit/, tests/integration/   # Mirror src/
migrations/                       # Alembic
```

Routes and handlers call services; services open the transaction (`async with
Session.begin() as session:`) and pass it to the repositories, so an action's steps are saved
together, and call Firebase and the other services outside it (`tests/unit/test_layers.py` checks the
imports and that no repository commits).

`src/` is on the path (`PYTHONPATH` in the Dockerfile, `pythonpath` for pytest,
`prepend_sys_path` for Alembic), so the package imports as `accounts` (`accounts.api.v1.me`).

## Commands

```bash
docker compose up -d --build accounts            # the service and its migrations
cd services/accounts && uv run pytest            # unit tests
scripts/integration.sh accounts                  # integration tests (real Postgres and Redis)
scripts/assistant-openapi.sh                     # refresh the assistant's snapshot of these routes
```
