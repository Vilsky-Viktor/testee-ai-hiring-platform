"""Every route checks who's asking (testee_common.auth.route_guards), unless it's public on purpose:
a new route without a guard fails here until it gets one or is listed below with its reason."""

import internal_matrix
from testee_common.auth.route_guards import not_from_a_service, unguarded

from accounts.config import settings
from accounts.constants.internal_callers import INTERNAL_CALLERS
from accounts.core.security import SERVICE_NAME
from accounts.main import app

PUBLIC = {
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
