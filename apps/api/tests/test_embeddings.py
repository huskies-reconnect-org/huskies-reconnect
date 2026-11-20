import json
import math

import httpx
import pytest

from app.embeddings import (EMBED_DIM, EmbeddingError, GeminiEmbedder, _extract_values,
                            normalize, profile_text, to_pgvector)


def test_profile_text_skips_empty_parts():
    assert profile_text("CS", None, " climbing ") == "Major: CS\nGoals: climbing"


def test_normalize_unit_length():
    v = normalize([3.0, 4.0])
    assert v == pytest.approx([0.6, 0.8])
    with pytest.raises(EmbeddingError):
        normalize([0.0, 0.0])


def test_extract_values_accepts_both_shapes():
    assert _extract_values({"embedding": {"values": [1, 2]}}) == [1, 2]
    assert _extract_values({"embeddings": [{"values": [3]}]}) == [3]
    assert _extract_values({}) == []


def test_to_pgvector_format():
    assert to_pgvector([0.5, -0.25]) == "[0.5000000,-0.2500000]"


def _embedder(handler):
    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return GeminiEmbedder("test-key", "gemini-embedding-2", client=client)


def _ok(values=None):
    return httpx.Response(200, json={"embedding": {"values": values or [2.0] * EMBED_DIM}})


@pytest.mark.anyio
async def test_request_shape_and_normalized_result():
    seen = {}

    def handler(req: httpx.Request):
        seen["url"], seen["key"] = str(req.url), req.headers["x-goog-api-key"]
        seen["body"] = json.loads(req.content)
        return _ok()

    v = await _embedder(handler).embed("Major: CS")
    assert seen["url"].endswith("/v1beta/models/gemini-embedding-2:embedContent")
    assert seen["key"] == "test-key"
    assert seen["body"]["output_dimensionality"] == EMBED_DIM
    assert seen["body"]["content"]["parts"][0]["text"] == "task: sentence similarity | query: Major: CS"
    assert len(v) == EMBED_DIM and math.isclose(sum(x * x for x in v), 1.0, rel_tol=1e-9)


@pytest.mark.anyio
async def test_retries_once_on_429():
    calls = []

    def handler(req):
        calls.append(1)
        return httpx.Response(429) if len(calls) == 1 else _ok()

    assert len(await _embedder(handler).embed("x")) == EMBED_DIM
    assert len(calls) == 2


@pytest.mark.anyio
@pytest.mark.parametrize("response", [
    httpx.Response(400, json={"error": {"message": "bad"}}),
    httpx.Response(200, json={"embedding": {"values": [1.0] * 10}}),   # wrong dims
    httpx.Response(200, json={}),
])
async def test_bad_responses_raise(response):
    with pytest.raises(EmbeddingError):
        await _embedder(lambda req: response).embed("x")


@pytest.mark.anyio
async def test_missing_key_raises():
    with pytest.raises(EmbeddingError, match="not configured"):
        await GeminiEmbedder("", "gemini-embedding-2").embed("x")


@pytest.fixture
def anyio_backend():
    return "asyncio"
