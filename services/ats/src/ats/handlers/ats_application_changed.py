from ats.services import ats_applications


async def handle(data: dict) -> None:
    """A Teamtailor application changed, saved: it's read, and its candidate arrives if they
    reached a linked job's stage."""
    await ats_applications.read_changed(data)
