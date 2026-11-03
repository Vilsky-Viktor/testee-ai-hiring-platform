"""The header's search finds a member's own companies, interviews and candidates, never another
company's (services/search.py)."""

from types import SimpleNamespace
from uuid import uuid4

import access_matrix
import httpx
import pytest
from access_matrix import HOST
from sqlalchemy import update

from companies.constants.invites import MAX_SEARCH_LENGTH, InviteStatus
from companies.core.db import Session
from companies.main import app
from companies.models.invites import CandidateInvite
from companies.repositories import interviews, invites
from tests.integration import factories
from tests.integration.transactions import transaction


async def titled(company, title: str):
    found = await transaction(interviews.create, company.id, uuid4(), "en", 60)
    await transaction(interviews.set_title, found.id, title)

    return found


async def invited(interview, email: str, name: str | None = None, status=None):
    created, _ = await transaction(
        invites.upsert, interview.id, email, interview.title, "Acme", "en", name=name
    )

    if status:
        async with Session.begin() as session:
            await session.execute(
                update(CandidateInvite)
                .where(CandidateInvite.id == created.id)
                .values(status=status)
            )

    return created


async def make():
    """Mine: a company with a viewer, two interviews and candidates, one of them deleted.
    Theirs: another user's company matching the same words."""
    mine = await factories.team("search")
    name = f"Nova Labs {uuid4()}"
    await factories.renamed(mine.company.id, name)
    await transaction(interviews.set_title, mine.interview.id, "Nova platform engineer")
    platform = SimpleNamespace(id=mine.interview.id, title="Nova platform engineer")
    designer = await titled(mine.company, "Nova designer")
    # Invited in this order, so newest first is nova.new, nova.dev, Ann Nova.
    ann = await invited(platform, "ann@example.com", "Ann Nova")
    dev = await invited(designer, "nova.dev@example.com")
    new = await invited(platform, "nova.new@example.com")
    await invited(platform, "nova.gone@example.com", status=InviteStatus.DELETED)

    theirs = f"search-theirs-{uuid4().hex[:12]}"
    rival = await factories.company(f"Nova Rival {uuid4()}", theirs, f"{theirs}@example.com")
    await invited(await titled(rival, "Nova lead"), "nova.rival@example.com", "Ann Rival")

    return SimpleNamespace(
        viewer=mine.viewer,
        theirs=theirs,
        company=(mine.company.id, name),
        interviews={"platform": platform.id, "designer": designer.id},
        invites={"ann": ann.id, "dev": dev.id, "new": new.id},
    )


@pytest.fixture
def world(run, monkeypatch):
    found = run(make())
    access_matrix.sign_in(monkeypatch, SimpleNamespace(superadmin=f"nobody-{uuid4().hex}"))

    return found


async def search(user: str | None, q: str):
    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    headers = {"Authorization": f"Bearer {user}"} if user else {}

    async with httpx.AsyncClient(transport=transport, base_url=f"http://{HOST}") as client:
        response = await client.get("/search", params={"q": q}, headers=headers)

    return response.status_code, response.json()


def test_companies_then_interviews_then_candidates_at_most_five(world, run):
    company_id, name = world.company
    status, found = run(search(world.viewer, "NOVA"))

    assert status == 200
    assert found == [
        {
            "kind": "company",
            "title": name,
            "company_id": str(company_id),
            "company": name,
            "interview": None,
            "interview_id": None,
            "invite_id": None,
        },
        {
            "kind": "interview",
            "title": "Nova designer",
            "company_id": str(company_id),
            "company": name,
            "interview": None,
            "interview_id": str(world.interviews["designer"]),
            "invite_id": None,
        },
        {
            "kind": "interview",
            "title": "Nova platform engineer",
            "company_id": str(company_id),
            "company": name,
            "interview": None,
            "interview_id": str(world.interviews["platform"]),
            "invite_id": None,
        },
        {
            "kind": "candidate",
            "title": "nova.new@example.com",
            "company_id": str(company_id),
            "company": name,
            "interview": "Nova platform engineer",
            "interview_id": str(world.interviews["platform"]),
            "invite_id": str(world.invites["new"]),
        },
        {
            "kind": "candidate",
            "title": "nova.dev@example.com",
            "company_id": str(company_id),
            "company": name,
            "interview": "Nova designer",
            "interview_id": str(world.interviews["designer"]),
            "invite_id": str(world.invites["dev"]),
        },
    ]


@pytest.mark.parametrize(
    ("q", "expected"),
    [
        # By name, in any case; another company's Ann Rival isn't found.
        ("ann", [("candidate", "Ann Nova", "ann")]),
        # By email; a deleted candidate isn't found.
        ("NOVA.DEV@", [("candidate", "nova.dev@example.com", "dev")]),
        ("nova.gone", []),
        # Another user's company and interview aren't found.
        ("rival", []),
        ("nova lead", []),
        # An underscore is matched as typed, not as any character.
        ("nova_", []),
        ("   ", []),
    ],
)
def test_only_the_users_own_candidates_are_found(world, run, q, expected):
    status, found = run(search(world.viewer, q))

    assert status == 200
    assert [
        (item["kind"], item["title"], key)
        for item in found
        for key, invite_id in world.invites.items()
        if item["invite_id"] == str(invite_id)
    ] == expected
    assert len(found) == len(expected)


def test_another_user_finds_only_their_own(world, run):
    _, found = run(search(world.theirs, "nova"))

    assert [(item["kind"], item["title"]) for item in found] == [
        ("company", found[0]["company"]),
        ("interview", "Nova lead"),
        ("candidate", "Ann Rival"),
    ]
    assert found[0]["company"].startswith("Nova Rival ")
    assert str(world.company[0]) not in {item["company_id"] for item in found}


def test_a_search_needs_a_signed_in_user_and_a_short_query(world, run):
    assert run(search(None, "nova"))[0] == 401
    assert run(search(world.viewer, "n" * (MAX_SEARCH_LENGTH + 1)))[0] == 422
