"""Every route checks who's asking (testee_common.auth.route_guards), unless it's public on purpose:
a new route without a guard fails here until it gets one or is listed below with its reason."""

import internal_matrix
from testee_common.auth.route_guards import api_routes, guards_run, not_from_a_service, unguarded

from companies.config import settings
from companies.constants.internal_callers import INTERNAL_CALLERS
from companies.core.security import SERVICE_NAME
from companies.main import app

PUBLIC = {
    # Fixed lists and testee's own brand, the same for everyone.
    "GET /interviews/candidates/filters",
    "GET /brand/testee",
    # A guest's link is all the guest has: the token is checked, and counted per address.
    "POST /invites/{token}/guest",
    # A logo shows in emails and on candidates' pages: served by its company's id.
    "GET /companies/{company_id}/logo",
    # Whether the emergency pause is on, for the banner.
    "GET /pause",
    "GET /health",
    "GET /ready",
}


def test_every_route_checks_who_is_asking_unless_public_on_purpose():
    assert unguarded(app, PUBLIC, set()) == []


def test_internal_routes_take_only_a_services_token_or_googles_signature():
    assert not_from_a_service(app) == []


def test_every_internal_route_lists_who_may_call_it_and_they_hold_its_key():
    assert internal_matrix.unlisted_callers(app, INTERNAL_CALLERS) == []
    assert internal_matrix.keyless_callers(INTERNAL_CALLERS, SERVICE_NAME) == []


def test_a_service_not_listed_for_an_internal_route_is_refused():
    key = (settings.service_secret, SERVICE_NAME, INTERNAL_CALLERS)

    assert internal_matrix.outsiders_let_in(app, key) == []


def test_what_hands_over_many_candidates_at_once_sees_a_revoked_sign_in_at_once():
    bulk = {
        "/companies/{company_id}/bias-audit",
        "/companies/{company_id}/actions",
        "/companies/{company_id}/actions/export",
        "/interviews/{interview_id}/report",
        "/interviews/{interview_id}/report/email",
    }
    found = {route.path: guards_run(route) for route in api_routes(app.routes)}

    assert [path for path in sorted(bulk) if "fresh_user" not in found[path]] == []
