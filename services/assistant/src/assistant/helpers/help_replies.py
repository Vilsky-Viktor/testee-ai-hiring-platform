import hashlib
import hmac
from uuid import UUID

from testee_common.auth.tokens import purpose_key, same_secret

from assistant.constants.help_chat import HELP_REPLY_SECONDS, HELP_SIGNING_PURPOSE, HelpRole
from assistant.schemas.help_chat import HelpMessage


def help_signing_key(service_secret: str) -> str:
    """Signs the help chat's replies and votes: a key of its own, made from the service's, so a
    service holding the assistant's key to call it can't sign them."""
    return purpose_key(service_secret, HELP_SIGNING_PURPOSE)


def reply_signature(content: str, issued_at: int, secret: str) -> str:
    """The signature the help chat gives a reply it wrote, with its time: the page sends it back
    with the reply, so a reply the page made up can't steer the next answer, and one reply can't
    pass as proof of a person for good. Not bound to the chat: a reload starts a new id with the
    same conversation, and a script would simply send the old id."""
    signed = f"help-reply:{issued_at}:{content}".encode()
    digest = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()

    return f"{issued_at}.{digest}"


def signed_lately(message: HelpMessage, now: float, secret: str) -> bool:
    """Whether the help chat signed this reply within HELP_REPLY_SECONDS."""
    issued_at = (message.signature or "").partition(".")[0]

    if not issued_at.isdecimal() or now - int(issued_at) > HELP_REPLY_SECONDS:
        return False

    signature = reply_signature(message.content, int(issued_at), secret)

    return same_secret(message.signature or "", signature)


def trusted(messages: list[HelpMessage], now: float, secret: str) -> list[HelpMessage]:
    """The conversation as the model may read it: every question, and only the replies the help
    chat signed itself."""
    return [
        message
        for message in messages
        if message.role == HelpRole.USER or signed_lately(message, now, secret)
    ]


def vote_signature(answer_id: UUID, trace_id: str | None, secret: str) -> str:
    """The signature the help chat gives an answer with its id and Langfuse trace: a vote on it
    must send it back, so only the page that got the answer can vote on it, on its own run."""
    signed = f"help-vote:{answer_id}:{trace_id or ''}".encode()

    return hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
