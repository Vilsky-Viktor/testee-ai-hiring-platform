from types import SimpleNamespace

from testee_common.events.notifications import NotificationKind, Recipient

from companies.helpers.notifications import candidate_finished, link_refused


def test_a_finished_candidate_carries_their_results_page():
    """Slack's "candidate finished" opens the candidate's results; the bell keeps the interview."""
    interview = SimpleNamespace(id="i1", company_id="c1", title="Backend")
    event = candidate_finished(interview, "v1", "a@b.c", 80)

    assert event["link"] == "/companies/c1/interviews/i1"
    assert event["data"]["candidate_link"] == "/companies/c1/interviews/i1/candidates/v1"


def test_a_refused_link_tells_the_company_and_opens_its_interview():
    event = link_refused(SimpleNamespace(id="i1", company_id="c1", title="Backend"))

    assert event["recipient"] == Recipient.COMPANY
    assert event["recipient_id"] == "c1"
    assert event["kind"] == NotificationKind.LINK_REFUSED
    assert event["link"] == "/companies/c1/interviews/i1"
    assert event["data"] == {"title": "Backend"}


def test_a_refused_link_of_an_interview_without_a_title_names_none():
    event = link_refused(SimpleNamespace(id="i1", company_id="c1", title=None))

    assert event["data"] == {}
