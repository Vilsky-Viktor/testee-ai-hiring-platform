class OverLimit(Exception):
    """A count taken again under its lock reached its limit: another request took the last place
    meanwhile. `count` is what that count found."""

    def __init__(self, count: int):
        super().__init__(count)
        self.count = count


class AlreadyFinished(Exception):
    """The candidate finished after the invite was read: their results stay, and no email goes."""
