# Voice mode's live listening: what the stream refuses before it matches anything
# (test_voice_stream.py has the rest).
from uuid import uuid4

import pytest

from tests.unit.api.v1 import test_voice, test_voice_stream

section = test_voice.section
voice = test_voice.voice
live = test_voice_stream.live
close_code = test_voice_stream.close_code
signed_in = test_voice_stream.signed_in
url = test_voice_stream.url
FRAME = test_voice_stream.FRAME


@pytest.mark.parametrize(
    "steps",
    [
        # Audio before the answer is counted.
        [FRAME],
        # A frame larger than any the detector makes.
        [{"type": "start"}, bytes(16_386)],
        # Half a sample.
        [{"type": "start"}, b"\x00"],
        [{"type": "end"}],
        [{"type": "start"}, {"type": "start"}],
        [{"type": "listen"}],
        [{"type": "end", "waiting": [4]}],
    ],
)
def test_anything_out_of_turn_closes_the_stream(client, voice, live, published, steps):
    with client.websocket_connect(url(voice)) as socket:
        signed_in(socket)

        for step in steps:
            if isinstance(step, bytes):
                socket.send_bytes(step)
            else:
                socket.send_json(step)

        assert close_code(socket) == 4400

    assert voice.matched == []


@pytest.mark.parametrize("question_id", [str(uuid4()), None])
def test_an_answer_to_a_question_left_behind_is_refused_unmatched(client, voice, live, question_id):
    """The candidate spoke to a question that has since been left: refused as the upload is, so
    its words are never read against the next question's options."""
    with client.websocket_connect(url(voice)) as socket:
        signed_in(socket)
        socket.send_json({"type": "start"})
        socket.send_bytes(FRAME)
        socket.send_json({"type": "end", "question_id": question_id})

        assert close_code(socket) == 4409

    assert voice.matched == []
