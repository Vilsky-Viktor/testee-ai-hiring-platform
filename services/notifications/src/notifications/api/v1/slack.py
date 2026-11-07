from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Cookie, Response, status
from fastapi.responses import RedirectResponse
from testee_common.auth.auth import CurrentUser

from notifications.config import settings
from notifications.constants.slack import SLACK_CALLBACK_PATH, SLACK_COOKIE, SLACK_STATE_SECONDS
from notifications.integrations import companies
from notifications.schemas.slack import SlackKindsIn, SlackOut, SlackStartOut
from notifications.services import slack, slack_test

router = APIRouter(prefix="/slack", tags=["slack"])


@router.get("")
async def get_slack(company_id: UUID, user: CurrentUser) -> SlackOut:
    """The company's Slack channel and the notifications it gets; every member sees it."""
    await companies.require(str(company_id), user.uid)

    return await slack.overview(str(company_id))


@router.get("/start")
async def start(company_id: UUID, user: CurrentUser, response: Response) -> SlackStartOut:
    """Where "Add to Slack" goes: Slack's page to approve testee and pick a channel. The cookie
    marks this browser: only it can finish the trip."""
    await companies.require(str(company_id), user.uid, editor=True)
    url, nonce = await slack.start(str(company_id), user.uid)
    response.set_cookie(
        SLACK_COOKIE,
        nonce,
        max_age=SLACK_STATE_SECONDS,
        path=SLACK_CALLBACK_PATH,
        secure=settings.site_url.startswith("https://"),
        httponly=True,
        samesite="lax",
    )

    return SlackStartOut(url=url)


@router.get("/callback")
async def callback(
    state: str,
    nonce: Annotated[str | None, Cookie(alias=SLACK_COOKIE)] = None,
    code: str | None = None,
    error: str | None = None,
):
    """Slack sends the browser back here; the signed, one-time state says whose company it is,
    and the cookie that this browser started the trip. Then on to the company's Slack page."""
    page = await slack.finish(code, state, error, nonce)
    response = RedirectResponse(page, status.HTTP_303_SEE_OTHER)
    response.delete_cookie(SLACK_COOKIE, path=SLACK_CALLBACK_PATH)

    return response


@router.put("/kinds", status_code=status.HTTP_204_NO_CONTENT)
async def set_kinds(company_id: UUID, body: SlackKindsIn, user: CurrentUser) -> None:
    await companies.require(str(company_id), user.uid, editor=True)
    await slack.set_kinds(str(company_id), body.kinds, user.uid)


@router.post("/test", status_code=status.HTTP_204_NO_CONTENT)
async def send_test(company_id: UUID, user: CurrentUser) -> None:
    """Posts a test message to the channel, to see it works."""
    await companies.require(str(company_id), user.uid, editor=True)
    await slack_test.send_test(str(company_id))


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect(company_id: UUID, user: CurrentUser) -> None:
    await companies.require(str(company_id), user.uid, editor=True)
    await slack.disconnect(str(company_id), user.uid)
