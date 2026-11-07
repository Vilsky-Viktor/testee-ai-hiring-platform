import pytest
from testee_common.i18n import error_codes

from companies.config import settings
from companies.constants.invites import FIRST_COMPANY_ON_SITE
from companies.main import app
from companies.repositories import audit
from companies.services import company_creation, generation_steps, link_start
from tests.unit.api.v1.test_links import linked  # noqa: F401 (fixture)


@pytest.fixture
def checks(monkeypatch):
    """The "I'm not a robot" check, on, recording which requests were asked for it."""
    asked = []

    async def require_human(request, secret):
        asked.append(request.url.path)

    monkeypatch.setattr(settings, "turnstile_secret_key", "s3cret")

    for module in (company_creation, generation_steps, link_start):
        monkeypatch.setattr(module, "require_human", require_human)

    return asked


def test_a_new_candidate_through_a_job_ads_link_is_asked_one_coming_back_isnt(
    client,
    checks,
    linked,  # noqa: F811
):
    client.post("/links/abc/start", json={"pledged": True})
    linked["status"] = "in_process"
    client.post("/links/abc/start", json={"pledged": True})

    assert checks == ["/links/abc/start"]


@pytest.fixture
def first_company(monkeypatch):
    """Creating a company as a signed-in user who owns `owned` and is in `member_of` companies, of
    which `paid` topped up, through `via`: the answer, a taken name standing for a saved company."""
    from companies.api.dependencies import request_via
    from companies.integrations import billing
    from companies.repositories import companies
    from tests.unit.api.v1.test_companies import sign_in

    def create(client, owned=0, via=None, member_of=(), paid=()):
        sign_in()

        async def owned_count(session, user_id):
            return owned

        async def ids_for_user(session, user_id):
            return list(member_of)

        async def company_paid(company_id):
            return company_id in paid

        async def name_taken(session, name, user_id, email, most=None):
            return None

        monkeypatch.setattr(companies, "owned_count", owned_count)
        monkeypatch.setattr(companies, "ids_for_user", ids_for_user)
        monkeypatch.setattr(billing, "company_paid", company_paid)
        monkeypatch.setattr(companies, "create", name_taken)
        app.dependency_overrides[request_via] = lambda: via

        return client.post("/companies", json={"name": "Acme"})

    yield create
    app.dependency_overrides.pop(request_via, None)


@pytest.mark.parametrize(
    ("owned", "via", "asked"),
    [(0, None, True), (1, None, False), (1, "assistant", False)],
)
def test_only_a_persons_first_company_on_the_site_is_asked(
    client, checks, first_company, owned, via, asked
):
    first_company(client, owned, via)

    assert checks == (["/companies"] if asked else [])


@pytest.mark.parametrize("via", ["assistant", "mcp"])
def test_a_first_company_through_the_assistant_or_an_ai_app_is_sent_to_the_site(
    client, checks, first_company, via
):
    response = first_company(client, via=via, member_of=["unpaid"])

    assert response.status_code == 403
    assert response.json() == {
        "detail": FIRST_COMPANY_ON_SITE,
        "code": error_codes.FIRST_COMPANY_ON_SITE,
    }
    assert checks == []


def test_a_member_of_a_paid_company_may_still_make_their_first_there(client, checks, first_company):
    response = first_company(client, via="assistant", member_of=["unpaid", "paid"], paid=["paid"])

    # Past the refusal: the fake save says the name is taken.
    assert response.status_code == 409
    assert checks == []


@pytest.mark.parametrize(("paid", "asked"), [(False, True), (True, False)])
def test_only_a_company_that_never_paid_is_asked_before_its_questions_are_made(
    client, checks, monkeypatch, paid, asked
):
    import httpx

    from companies.integrations import billing, generation
    from tests.unit.api.v1 import test_interview_generation as review

    review.setup(monkeypatch, "admin")
    review.sign_in("bob")

    async def fake_review(generation_id, company_id, body):
        return httpx.Response(
            200, json={"status": "queued"}, request=httpx.Request("POST", "http://generation")
        )

    async def company_paid(company_id):
        return paid

    async def record(*args, **kwargs):
        pass

    monkeypatch.setattr(generation, "review", fake_review)
    monkeypatch.setattr(billing, "company_paid", company_paid)
    monkeypatch.setattr(audit, "record", record)
    client.post(f"/interviews/{review.INTERVIEW_ID}/generation/review", json={"selected": [0]})
    app.dependency_overrides.clear()

    assert checks == ([f"/interviews/{review.INTERVIEW_ID}/generation/review"] if asked else [])
