# The sign-in a company's own platform gives its candidate with the invite link (no email, no
# account of their own): companies signs it in, library counts it as no sign-up.
GUEST_UID_PREFIX = "guest-"
# How long an instance trusts what Firebase last said of an account before a write: a revoked
# sign-in is refused within this; what must see it at once (exports, the admin zone) asks live.
REVOCATION_CACHE_SECONDS = 60
# All a guest's sign-in reaches, in any service: the interview it came for and its own account.
# Anyone with the invite link can get one, so everything else (practice, the assistant, making a
# company) acts as if it weren't there.
GUEST_PATHS = ("/invites/", "/sessions/", "/candidates/", "/me/")
