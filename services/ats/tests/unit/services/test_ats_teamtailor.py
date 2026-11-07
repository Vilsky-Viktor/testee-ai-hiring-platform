import asyncio
import json
import uuid

import pytest
from fastapi import HTTPException

from ats.integrations import teamtailor
from ats.models.ats import AtsApplicationChange, AtsCandidate, AtsConnection, AtsJobLink
from ats.repositories import ats, ats_applications, ats_candidates, ats_links
from ats.services import ats as integrations
from ats.services import ats_applications as applications
from ats.services import ats_candidates as flow
from ats.services import ats_webhooks as hooks
from tests.unit.arrivals import deliver_arrivals
from tests.unit.conftest import interview
from tests.unit.helpers.test_teamtailor_signatures import signature

SECRET = "signature-key"
CONNECTION_ID = uuid.uuid4()
INTERVIEW_ID = uuid.uuid4()


def event(name="job_application.update", application_id=55, wrapped=False) -> bytes:
    found = {"event_name": name, "data": {"id": application_id}}

    return json.dumps({"payload": found} if wrapped else found).encode()


@pytest.fixture
def world(monkeypatch, companies_api):
    """A Teamtailor connection with job 101 linked at stage 7, Teamtailor's application 55 as
    `state["application"]`, the candidate rows in memory, and invites recorded, not sent."""
    connection = AtsConnection(
        id=CONNECTION_ID,
        company_id=uuid.uuid4(),
        provider="teamtailor",
        status="connected",
        created_by="ann",
    )
    companies_api["interviews"][INTERVIEW_ID] = interview(
        connection.company_id, interview_id=INTERVIEW_ID
    )
    state = {
        "connection": connection,
        "key": {"host": "https://api.teamtailor.com", "key": "k", "webhook_secret": SECRET},
        "application": {
            "job_id": "101",
            "stage_id": "7",
            "candidate_id": "44",
            "email": "ann@example.com",
        },
        "read": [],
        "rows": {},
        "changes": {},
        "linked": True,
        "sent": companies_api["sent"],
    }

    async def connection_by_id(session, connection_id):
        return state["connection"] if connection_id == CONNECTION_ID else None

    async def link_for_job(session, connection_id, job_id):
        if job_id != "101":
            return None

        return AtsJobLink(
            id=uuid.uuid4(),
            connection_id=connection_id,
            interview_id=INTERVIEW_ID,
            job_id=job_id,
            stage_id="7",
        )

    async def has_links(session, connection_id):
        return state["linked"]

    async def key(found):
        return state["key"]

    async def application(host, key, application_id):
        state["read"].append((host, key, application_id))

        return state["application"]

    async def add(session, connection_id, link_id, interview_id, candidate_id, email, name=None):
        return state["rows"].setdefault(
            candidate_id,
            AtsCandidate(
                id=uuid.uuid4(),
                connection_id=connection_id,
                interview_id=interview_id,
                candidate_id=candidate_id,
                email=email,
                name=name,
            ),
        )

    async def claim(session, row_id, statuses):
        return True

    async def nothing(*args, **kwargs):
        return None

    async def changed(session, connection_id, application_id):
        state["changes"].setdefault(
            application_id,
            AtsApplicationChange(
                id=uuid.uuid4(), connection_id=connection_id, application_id=application_id
            ),
        )

    async def change(session, row_id):
        return next((row for row in state["changes"].values() if row.id == row_id), None)

    async def done(session, row):
        del state["changes"][row.application_id]

    delivered = set()

    async def deliver_changes():
        for row in list(state["changes"].values()):
            if row.id not in delivered:
                delivered.add(row.id)
                await applications.read_changed({"ats_application_change_id": str(row.id)})

    monkeypatch.setattr(ats, "connection_by_id", connection_by_id)
    monkeypatch.setattr(ats_applications, "add", changed)
    monkeypatch.setattr(ats_applications, "get", change)
    monkeypatch.setattr(ats_applications, "done", done)
    monkeypatch.setattr(ats_links, "link_for_job", link_for_job)
    monkeypatch.setattr(ats_links, "has_links", has_links)
    monkeypatch.setattr(integrations, "credentials", key)
    monkeypatch.setattr(teamtailor, "application", application)
    monkeypatch.setattr(ats_candidates, "add", add)
    monkeypatch.setattr(ats_candidates, "claim", claim)
    monkeypatch.setattr(ats_candidates, "settle", nothing)
    monkeypatch.setattr(flow.outbox_service, "flush_quietly", nothing)
    deliver_arrivals(monkeypatch, state["rows"], then=deliver_changes)

    return state


def receive(body, given=None, connection_id=CONNECTION_ID):
    given = signature(SECRET, body) if given is None else given
    asyncio.run(hooks.receive_teamtailor(connection_id, body, given))


@pytest.mark.parametrize("wrapped", [False, True])
def test_a_candidate_whose_application_is_in_the_linked_stage_is_invited(world, wrapped):
    receive(event(wrapped=wrapped))

    # The application is read from Teamtailor with the key alone, not the web hook's.
    assert world["read"] == [("https://api.teamtailor.com", "k", "55")]
    assert world["sent"] == [("ann@example.com", "ann")]
    # Kept as Teamtailor's candidate id, for the note later.
    assert list(world["rows"]) == ["44"]


def test_a_new_application_made_in_the_linked_stage_counts_too(world):
    receive(event(name="job_application.create"))

    assert world["sent"] == [("ann@example.com", "ann")]


def test_events_before_a_signature_key_is_saved_are_refused(world):
    del world["key"]["webhook_secret"]

    with pytest.raises(HTTPException) as refused:
        receive(event())

    assert refused.value.status_code == 401
    assert world["read"] == [] and world["sent"] == []


def test_an_event_signed_with_another_key_is_refused(world):
    body = event()

    with pytest.raises(HTTPException) as refused:
        receive(body, given=signature("other", body))

    assert refused.value.status_code == 401
    assert world["read"] == [] and world["sent"] == []


def test_other_events_and_events_without_an_application_arent_read(world):
    receive(event(name="candidate.update"))
    receive(event(application_id=None))
    receive(b'{"payload": {"event_name": "job_application.update"}}')

    assert world["read"] == [] and world["sent"] == []


@pytest.mark.parametrize(
    "changed",
    [{"stage_id": "8"}, {"job_id": "202"}, {"job_id": None}, {"email": None}],
)
def test_another_stage_or_job_or_a_candidate_without_email_isnt_invited(world, changed):
    world["application"].update(changed)
    receive(event())

    assert world["sent"] == [] and world["rows"] == {}


def test_without_a_linked_job_teamtailor_isnt_asked(world):
    world["linked"] = False
    receive(event())

    assert world["read"] == [] and world["sent"] == []


def test_an_event_is_answered_and_kept_before_teamtailor_is_read(world, monkeypatch):
    async def undelivered():
        pass

    monkeypatch.setattr(flow.outbox_service, "flush_quietly", undelivered)
    receive(event())

    assert world["read"] == []
    assert list(world["changes"]) == ["55"]


@pytest.mark.parametrize("code", [429, 502])
def test_teamtailor_failing_keeps_the_event_and_fails_it_for_pub_sub_to_retry(
    world, monkeypatch, code
):
    async def failing(host, key, application_id):
        raise HTTPException(code, "Teamtailor didn't answer")

    world["changes"]["55"] = row = AtsApplicationChange(
        id=uuid.uuid4(), connection_id=CONNECTION_ID, application_id="55"
    )
    monkeypatch.setattr(teamtailor, "application", failing)

    with pytest.raises(HTTPException) as failed:
        asyncio.run(applications.read_changed({"ats_application_change_id": str(row.id)}))

    assert failed.value.status_code == code
    assert list(world["changes"]) == ["55"]


def test_an_application_deleted_in_teamtailor_is_given_up(world, monkeypatch):
    async def gone(host, key, application_id):
        raise HTTPException(404, "Not found")

    monkeypatch.setattr(teamtailor, "application", gone)
    receive(event())

    assert world["changes"] == {} and world["rows"] == {}


def test_a_broken_connection_keeps_the_event_without_reading_it(world):
    world["connection"].status = "broken"
    receive(event())

    assert world["read"] == []
    assert list(world["changes"]) == ["55"]


def test_an_unknown_or_non_teamtailor_connection_is_ignored_even_unsigned(world):
    receive(event(), given="", connection_id=uuid.uuid4())
    world["connection"].provider = "greenhouse"
    receive(event(), given="")

    assert world["read"] == [] and world["sent"] == []


def test_a_broken_connection_still_refuses_a_forged_event(world):
    world["connection"].status = "broken"

    with pytest.raises(HTTPException) as refused:
        receive(event(), given="forged")

    assert refused.value.status_code == 401
    assert world["changes"] == {}


def test_the_name_teamtailor_has_goes_with_the_invite(world, companies_api):
    world["application"]["name"] = "Ann Lee"
    receive(event())

    assert companies_api["names"] == {"ann@example.com": "Ann Lee"}
