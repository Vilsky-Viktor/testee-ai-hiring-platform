from fastapi import APIRouter
from testee_common.config.constants import LANGUAGES, VOICE_LANGUAGES

router = APIRouter(tags=["languages"])


@router.get("/languages")
async def list_languages() -> list[str]:
    """The languages tests can be generated in, for the "generate in" choice."""
    return list(LANGUAGES)


@router.get("/languages/voice")
async def list_voice_languages() -> list[str]:
    """The languages voice mode takes interviews in, marked in the "generate in" choice and named
    on the landing page."""
    return list(VOICE_LANGUAGES)
