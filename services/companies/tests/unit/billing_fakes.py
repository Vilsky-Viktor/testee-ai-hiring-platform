from companies.integrations import billing


def settle_with(monkeypatch, charge=None, release=None) -> None:
    """billing.settle_candidates as a call for each key, for a test's own `charge` and `release`."""

    async def settle(to_charge, to_release):
        for key in to_charge:
            await charge(key)

        for key in to_release:
            await release(key)

    monkeypatch.setattr(billing, "settle_candidates", settle)
