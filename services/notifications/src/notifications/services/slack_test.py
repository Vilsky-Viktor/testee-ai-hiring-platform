"""A test message, to see the company's Slack channel works."""

from fastapi import HTTPException, status
from testee_common.auth.encryption import decrypt
from testee_common.limits.rate_limit import hit

from notifications.config import settings
from notifications.constants.slack import (
    SLACK_NOT_CONNECTED,
    SLACK_TEST_FAILED,
    SLACK_TEST_MESSAGE,
)
from notifications.core.db import Session
from notifications.integrations import slack
from notifications.integrations.redis import get_redis
from notifications.repositories import slack as storage
from notifications.services.slack import stop


async def send_test(company_id: str) -> None:
    """Posts a test message to the company's working channel. A gone web hook marks the channel
    for reconnecting, as a real notification would; a refusal or Slack being busy is said, and
    nothing is retried: the user can press it again."""
    async with Session() as session:
        found = await storage.connected(session, company_id)

    if found is None:
        raise HTTPException(status.HTTP_409_CONFLICT, SLACK_NOT_CONNECTED)

    await hit(
        get_redis(),
        f"rate:slack-tests:{company_id}",
        "SLACK_TESTS_PER_COMPANY_HOUR",
        company_id=company_id,
    )
    webhook = decrypt(settings.slack_encryption_key, found.webhook)

    if webhook is None:
        await stop(company_id)

        raise HTTPException(status.HTTP_409_CONFLICT, SLACK_NOT_CONNECTED)

    try:
        await slack.post(webhook, {"text": SLACK_TEST_MESSAGE})
    except slack.WebhookGone:
        await stop(company_id)

        raise HTTPException(status.HTTP_409_CONFLICT, SLACK_NOT_CONNECTED) from None
    except (slack.SlackBusy, slack.SlackRefused):
        raise HTTPException(status.HTTP_409_CONFLICT, SLACK_TEST_FAILED) from None
