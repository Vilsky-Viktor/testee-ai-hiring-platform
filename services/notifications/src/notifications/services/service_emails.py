from testee_common.events.notifications import NotificationKind, Recipient

from notifications.config import settings
from notifications.constants.notifications import BILLING_KINDS, REFUND_KINDS
from notifications.helpers.member_emails import (
    price_change_email,
    refund_email,
    top_up_charged_email,
    top_up_failed_email,
    top_up_on_email,
    top_up_paused_email,
)
from notifications.integrations import accounts, companies
from notifications.services import delivery


def billing_email(data: dict, recipient: dict, company: str):
    """The email for one of BILLING_KINDS, to one owner or admin."""
    link = settings.site_url.rstrip("/") + data["link"]

    if data["kind"] == NotificationKind.AUTO_TOP_UP_PAUSED:
        return top_up_paused_email(recipient, company, link)

    if data["kind"] == NotificationKind.AUTO_TOP_UP_PRICE_CHANGE:
        return price_change_email(recipient, company, data["data"], link)

    if data["kind"] == NotificationKind.AUTO_TOP_UP_ON:
        return top_up_on_email(recipient, company, data["data"], link)

    if data["kind"] == NotificationKind.AUTO_TOP_UP_CHARGED:
        return top_up_charged_email(recipient, company, data["data"], link)

    if data["kind"] in REFUND_KINDS:
        return refund_email(data["kind"], recipient, company, data["data"], link)

    return top_up_failed_email(recipient, company, settings.site_url)


async def named(data: dict) -> dict | None:
    """A refund's notification with its company's name, which billing doesn't know: someone in
    several companies has to tell them apart. None when the company is gone, as nobody
    is left to tell. Any other notification as it is."""
    if data["kind"] not in REFUND_KINDS:
        return data

    found = await companies.members([data["recipient_id"]])

    if not found:
        return None

    return {**data, "data": {**data["data"], "name": found[0]["name"]}}


async def billing_emails(data: dict, key: str) -> None:
    """An automatic top-up turned on, charged, failed, paused or costing a new price, or a
    refund Paddle decided, emailed at once to the company's owners and admins, whatever their
    email settings: it's about the company's billing. Keyed by the notification and the user, so a retried event sends nobody
    a second email."""
    if data["kind"] not in BILLING_KINDS or data["recipient"] != Recipient.COMPANY:
        return

    found = await companies.members([data["recipient_id"]])

    if not found:
        return

    [company] = found
    editors = [member["user_id"] for member in company["members"] if member["editor"]]

    for recipient in await accounts.recipients(editors):
        email = billing_email(data, recipient, company["name"])
        await delivery.send(email, f"events/{key}/{recipient['user_id']}")
