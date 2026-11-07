from testee_common.config.constants import GUEST_UID_PREFIX
from testee_common.events.deletions import guest_ids


def test_only_guests_are_taken_from_the_event(caplog):
    guest = f"{GUEST_UID_PREFIX}1"

    assert guest_ids("e-1", {"user_ids": [guest, "member", 7]}) == [guest]
    assert "isn't a guest" in caplog.text


def test_a_malformed_event_names_nobody(caplog):
    assert guest_ids("e-1", {"user_ids": "guest"}) == []
    assert guest_ids("e-1", {}) == []
    assert "malformed" in caplog.text
