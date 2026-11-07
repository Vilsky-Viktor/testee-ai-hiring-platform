from uuid import UUID

import httpx
from testee_common.auth.service_auth import callee_secret, issue_token
from testee_common.http import http
from testee_common.http.http import bearer

LIBRARY = "library"


class QuestionFeedback:
    """Library's ratings and reports of a question, for one user, called by a service that has
    already checked the user may see the question: rounds for a candidate's session, companies
    for a member's interview. Answers are library's own (409 for a repeat report, 429 for its
    limits), for the caller to pass on."""

    def __init__(self, library_url: str, caller: str):
        self.library_url = library_url
        self.caller = caller

    async def _request(self, method: str, path: str, **kwargs) -> httpx.Response:
        token = issue_token(self.caller, LIBRARY, callee_secret(LIBRARY))

        return await http.get_client().request(
            method,
            f"{self.library_url}/internal/questions{path}",
            headers=bearer(token),
            **kwargs,
        )

    async def get_rating(self, question_id: UUID, user_id: str) -> httpx.Response:
        return await self._request("GET", f"/{question_id}/rating", params={"user_id": user_id})

    async def rate(self, question_id: UUID, user_id: str, value: int) -> httpx.Response:
        return await self._request(
            "PUT", f"/{question_id}/rating", json={"user_id": user_id, "value": value}
        )

    async def unrate(self, question_id: UUID, user_id: str) -> httpx.Response:
        return await self._request("DELETE", f"/{question_id}/rating", params={"user_id": user_id})

    async def my_report(self, question_id: UUID, user_id: str) -> httpx.Response:
        return await self._request(
            "GET", f"/{question_id}/reports/mine", params={"user_id": user_id}
        )

    async def report(
        self, question_id: UUID, user_id: str, reason: str, comment: str
    ) -> httpx.Response:
        return await self._request(
            "POST",
            f"/{question_id}/reports",
            json={"user_id": user_id, "reason": reason, "comment": comment},
        )
