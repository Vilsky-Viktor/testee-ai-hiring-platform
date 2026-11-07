"""Every OpenAI client generation builds has a timeout and retries from its constants; the
Batch API's isn't retried by the client, as creating a batch twice would bill it twice."""

import asyncio
from types import SimpleNamespace

from generation.constants.generation import BATCH_MAX_RETRIES, LLM_MAX_RETRIES, LLM_TIMEOUT_SECONDS
from generation.integrations import llm, openai_batch


def test_the_batch_apis_client_never_retries_on_its_own(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    openai_batch.get_client.cache_clear()
    client = openai_batch.get_client()

    assert (client.max_retries, client.timeout) == (BATCH_MAX_RETRIES, LLM_TIMEOUT_SECONDS)
    assert BATCH_MAX_RETRIES == 0
    openai_batch.get_client.cache_clear()


def test_embeddings_have_the_calls_timeout_and_retries(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    llm.get_embeddings.cache_clear()
    embeddings = llm.get_embeddings()

    assert (embeddings.max_retries, embeddings.request_timeout) == (
        LLM_MAX_RETRIES,
        LLM_TIMEOUT_SECONDS,
    )
    llm.get_embeddings.cache_clear()


def test_a_batchs_files_expire_with_openai_on_their_own(monkeypatch):
    """Job texts and answers don't stay at OpenAI past what the privacy policy says."""
    sent = {}

    async def upload(**arguments):
        sent["file"] = arguments

        return SimpleNamespace(id="file-1")

    async def create(**arguments):
        sent["batch"] = arguments

        return SimpleNamespace(id="batch-1")

    client = SimpleNamespace(
        files=SimpleNamespace(create=upload), batches=SimpleNamespace(create=create)
    )
    monkeypatch.setattr(openai_batch, "get_client", lambda: client)

    assert asyncio.run(openai_batch.submit({"one": {"model": "m"}})) == "batch-1"
    week = {"anchor": "created_at", "seconds": 604800}
    assert sent["file"]["expires_after"] == week
    assert sent["batch"]["output_expires_after"] == week
