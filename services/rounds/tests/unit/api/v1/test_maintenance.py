import asyncio
from datetime import timedelta

from testee_common.auth.service_auth import issue_token
from testee_common.http.http import bearer

from rounds.api.v1 import internal_maintenance, schedules
from rounds.config import settings


def test_a_service_reads_the_running_count(client, monkeypatch):
    async def three(session):
        return 3

    monkeypatch.setattr(internal_maintenance.running, "running_interviews", three)

    response = client.get(
        "/internal/maintenance/running",
        headers=bearer(issue_token("companies", "rounds", settings.service_secret)),
    )

    assert response.json() == {"running": 3}


def test_a_service_gives_the_time_back(client, monkeypatch):
    given = []

    async def give_time_back(session, stopped):
        given.append(stopped)

    monkeypatch.setattr(internal_maintenance.running, "give_time_back", give_time_back)
    url = "/internal/maintenance/resume"

    response = client.post(
        url,
        json={"seconds": 90},
        headers=bearer(issue_token("companies", "rounds", settings.service_secret)),
    )

    assert response.status_code == 204
    assert given == [timedelta(seconds=90)]


def test_interviews_dont_run_out_of_time_while_maintenance_mode_is_on(monkeypatch):
    finished = []
    state = {"on": True}

    async def is_on(redis):
        return state["on"]

    async def finish_expired():
        finished.append(True)

    monkeypatch.setattr(schedules, "is_on", is_on)
    monkeypatch.setattr(schedules, "get_redis", lambda: None)
    monkeypatch.setattr(schedules, "finish_expired", finish_expired)

    asyncio.run(schedules.expire_interviews())

    assert finished == []

    state["on"] = False
    asyncio.run(schedules.expire_interviews())

    assert finished == [True]
