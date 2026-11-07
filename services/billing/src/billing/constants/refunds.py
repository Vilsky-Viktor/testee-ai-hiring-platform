from datetime import timedelta

# The terms' refund rule: credits bought in the last 14 days and not spent.
REFUND_WINDOW = timedelta(days=14)
# Credits set aside for a candidate before those 14 days ended and given back after them stay
# refundable this long from then: an invite can hold them past day 14 through no choice of the
# buyer's, as it expires only after 30 days.
REFUND_GRACE = timedelta(days=7)
# What the credits of a refund on its way are set aside under (a hold), by the refund's id.
REFUND_HOLD_PREFIX = "refund:"
# Why the money went back, in Paddle's dashboard.
REFUND_REASON = "Unspent credits refunded by the company within 14 days"
# How long a refund's read of its transaction waits for Paddle.
REFUND_READ_TIMEOUT_SECONDS = 4
# A refund still open after this is looked up in Paddle by the daily reconciliation: long past any
# request still on its way, so what it finds is final. At most this many a run.
REFUND_OVERDUE = timedelta(hours=1)
RECONCILE_MAX_REFUNDS = 50
# Paddle's clock and ours can differ this much when telling a refund's adjustment from older ones.
REFUND_CLOCK_SKEW = timedelta(minutes=5)

# Paddle's adjustment of a refund, and the states its approval moves it through.
ADJUSTMENT_REFUND = "refund"
ADJUSTMENT_PENDING = "pending_approval"
ADJUSTMENT_REJECTED = "rejected"

REFUND_NOT_AVAILABLE = "This top-up can't be refunded now."
REFUND_REFUSED = "Paddle couldn't refund this top-up. Its credits are back in your balance."


class RefundStatus:
    # Credits set aside, Paddle not answered yet.
    CLAIMED = "claimed"
    # Paddle has it, awaiting its approval.
    PENDING = "pending"
    APPROVED = "approved"
    # Paddle's approval turned it down.
    REJECTED = "rejected"
    # Never reached Paddle, or Paddle refused to make it.
    FAILED = "failed"


REFUND_STATUSES = (
    RefundStatus.CLAIMED,
    RefundStatus.PENDING,
    RefundStatus.APPROVED,
    RefundStatus.REJECTED,
    RefundStatus.FAILED,
)
# A top-up has at most one of these at a time: Paddle allows no new adjustment while a refund
# awaits approval.
REFUND_OPEN = (RefundStatus.CLAIMED, RefundStatus.PENDING)


class RefundState:
    """A refund as the history shows it."""

    PROCESSING = "processing"
    REFUNDED = "refunded"
    DECLINED = "declined"


# What the history shows for each status; one that never reached Paddle shows nothing.
REFUND_STATES = {
    RefundStatus.CLAIMED: RefundState.PROCESSING,
    RefundStatus.PENDING: RefundState.PROCESSING,
    RefundStatus.APPROVED: RefundState.REFUNDED,
    RefundStatus.REJECTED: RefundState.DECLINED,
}
