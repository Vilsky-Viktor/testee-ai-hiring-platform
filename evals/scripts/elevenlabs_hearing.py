"""A recorded answer heard by ElevenLabs' Scribe (batch speech-to-text), to compare with the
OpenAI hearing voice mode uses: the same recording, language and recognition hints
(hearing_keywords, trimmed to Scribe's limits). Evals only; ELEVENLABS_API_KEY from the host's
.env, passed in by run.sh. Gives the text and its list price."""

import os
import re

import httpx

URL = "https://api.elevenlabs.io/v1/speech-to-text"
MODEL = "scribe_v2"
# List prices per hour of audio (elevenlabs.io/pricing/api, 2026-11-04): Scribe v2 and its
# keyterm surcharge.
PRICE_PER_HOUR = 0.22
KEYTERMS_PER_HOUR = 0.05
# Scribe's limits on a keyterm: characters, words, and characters it refuses.
MAX_TERM_CHARACTERS = 50
MAX_TERM_WORDS = 5
REFUSED = re.compile(r"[<>{}\[\]\\]")
TIMEOUT_SECONDS = 30


def keyterms(hints: list[str]) -> list[str]:
    """The hints Scribe accepts: options' letters and short option texts."""
    return [
        hint
        for hint in hints
        if len(hint) <= MAX_TERM_CHARACTERS
        and len(hint.split()) <= MAX_TERM_WORDS
        and not REFUSED.search(hint)
    ]


async def hear_elevenlabs(audio: bytes, language: str, hints: list[str]) -> tuple[str, float]:
    """(text, cost) of the Ogg Opus recording `audio` in `language`."""
    terms = keyterms(hints)
    fields = {"model_id": MODEL, "language_code": language, "tag_audio_events": "false"}

    if terms:
        fields["keyterms"] = terms

    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        response = await client.post(
            URL,
            headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"]},
            data=fields,
            files={"file": ("audio.ogg", audio, "audio/ogg")},
        )

    response.raise_for_status()
    found = response.json()
    hours = (found.get("audio_duration_secs") or 0) / 3600
    price = PRICE_PER_HOUR + (KEYTERMS_PER_HOUR if terms else 0)

    return found["text"].strip(), hours * price
