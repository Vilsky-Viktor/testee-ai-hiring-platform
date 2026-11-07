import asyncio
from types import SimpleNamespace
from uuid import uuid4

from api.services import idempotency


def test_a_key_replayed_in_another_company_makes_its_own_and_gets_nothing_of_the_first():
    made = []

    async def make():
        row = SimpleNamespace(id=uuid4())
        made.append(row)

        return row

    async def find(row_id):
        return next(row for row in made if row.id == row_id)

    def once(company_id):
        return asyncio.run(
            idempotency.once_per_key("key", "u1", company_id, "try-1", {"name": "Site"}, make, find)
        )

    first_company, second_company = uuid4(), uuid4()
    first = once(first_company)
    replayed = once(first_company)
    elsewhere = once(second_company)

    assert replayed.id == first.id
    assert elsewhere.id != first.id
    assert len(made) == 2
