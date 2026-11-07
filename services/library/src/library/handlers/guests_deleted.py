from library.services.guest_events import delete_guests


async def handle(event_id: str, data: dict) -> None:
    """Deleted guest invites' guests: what library kept under their sign-ins loses its link."""
    await delete_guests(event_id, data)
