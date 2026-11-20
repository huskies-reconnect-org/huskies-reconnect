"""Profile embeddings via the Gemini API (plain REST over httpx).

gemini-embedding-2 takes the task as a text prefix (no task_type field). We use
the symmetric "sentence similarity" task because we compare profile to profile.
Vectors are re-normalized here so cosine distance is right regardless of model.
"""
import math
from typing import Protocol

import httpx

from app.config import get_settings

EMBED_DIM = 768
_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class EmbeddingError(Exception):
    pass


class Embedder(Protocol):
    model: str

    async def embed(self, text: str) -> list[float]: ...


def profile_text(major: str | None, interests: str | None, goals: str | None) -> str:
    parts = [
        f"Major: {major.strip()}" if major else "",
        f"Interests: {interests.strip()}" if interests else "",
        f"Goals: {goals.strip()}" if goals else "",
    ]
    return "\n".join(p for p in parts if p)


def normalize(values: list[float]) -> list[float]:
    norm = math.sqrt(sum(v * v for v in values))
    if norm == 0:
        raise EmbeddingError("Embedding is all zeros")
    return [v / norm for v in values]


def _extract_values(body: dict) -> list[float]:
    # REST embedContent returns {"embedding": {"values": [...]}}; the SDKs expose
    # {"embeddings": [{"values": [...]}]}. Accept either.
    if isinstance(body.get("embedding"), dict):
        return body["embedding"].get("values") or []
    if body.get("embeddings"):
        return body["embeddings"][0].get("values") or []
    return []


class GeminiEmbedder:
    def __init__(self, api_key: str, model: str, client: httpx.AsyncClient | None = None):
        self.api_key = api_key
        self.model = model
        self._client = client

    async def embed(self, text: str) -> list[float]:
        if not self.api_key:
            raise EmbeddingError("GEMINI_API_KEY not configured")
        payload = {
            "model": f"models/{self.model}",
            "content": {"parts": [{"text": f"task: sentence similarity | query: {text}"}]},
            "output_dimensionality": EMBED_DIM,
        }
        url = f"{_BASE}/{self.model}:embedContent"
        headers = {"x-goog-api-key": self.api_key}

        client = self._client or httpx.AsyncClient(timeout=15)
        try:
            for attempt in range(2):  # one retry on rate limit / server error
                try:
                    r = await client.post(url, json=payload, headers=headers)
                except httpx.HTTPError as e:
                    if attempt == 0:
                        continue
                    raise EmbeddingError(f"Gemini request failed: {type(e).__name__}") from e
                if r.status_code in (429, 500, 502, 503, 504) and attempt == 0:
                    continue
                if r.status_code != 200:
                    raise EmbeddingError(f"Gemini returned {r.status_code}")
                values = _extract_values(r.json())
                if len(values) != EMBED_DIM:
                    raise EmbeddingError(f"Expected {EMBED_DIM} dims, got {len(values)}")
                return normalize([float(v) for v in values])
            raise EmbeddingError("Gemini unavailable")
        finally:
            if self._client is None:
                await client.aclose()


def get_embedder() -> Embedder:
    s = get_settings()
    return GeminiEmbedder(s.gemini_api_key, s.gemini_embed_model)


def to_pgvector(values: list[float]) -> str:
    return "[" + ",".join(f"{v:.7f}" for v in values) + "]"
