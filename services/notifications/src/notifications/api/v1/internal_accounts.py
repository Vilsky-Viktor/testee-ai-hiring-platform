from fastapi import APIRouter
from testee_common.auth.user import UserEmailIn

from notifications.api.dependencies import ServiceCaller
from notifications.services import accounts

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/users/{user_id}/export")
async def export_user(user_id: str, body: UserEmailIn, caller: ServiceCaller) -> dict:
    """Accounts, for "Download my data": the user's own notifications, the Slack channels they
    connected, and what's kept about their address."""
    return await accounts.export(user_id, body.email)
