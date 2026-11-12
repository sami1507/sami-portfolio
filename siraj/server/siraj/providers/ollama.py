from __future__ import annotations

import base64
import json
from typing import AsyncIterator

import httpx

from .. import config
from . import ChatMessage, ModelInfo, ProviderError


def _license_name(text: str | None) -> str | None:
    if not text:
        return None
    for line in text.splitlines():
        if line.strip():
            return line.strip()[:80]
    return None


class OllamaProvider:
    name = "ollama"
    location = "local"

    def __init__(self, url: str | None = None):
        self.url = (url or config.OLLAMA_URL).rstrip("/")

    def _client(self, timeout: float = 600) -> httpx.AsyncClient:
        # trust_env=False: never route local model traffic through a proxy.
        return httpx.AsyncClient(base_url=self.url, timeout=httpx.Timeout(timeout, connect=3), trust_env=False)

    async def available(self) -> tuple[bool, str]:
        try:
            async with self._client(5) as c:
                r = await c.get("/api/version")
                r.raise_for_status()
                return True, r.json().get("version", "")
        except Exception as e:
            return False, f"{type(e).__name__}: {e}"

    async def show(self, model: str) -> dict:
        async with self._client(15) as c:
            r = await c.post("/api/show", json={"model": model})
            if r.status_code != 200:
                raise ProviderError("model_not_found", model, 404)
            return r.json()

    async def list_models(self) -> list[ModelInfo]:
        try:
            async with self._client(10) as c:
                tags = (await c.get("/api/tags")).json().get("models", [])
        except Exception as e:
            raise ProviderError("ollama_unreachable", str(e), 503)
        out = []
        for t in tags:
            try:
                s = await self.show(t["name"])
            except ProviderError:
                continue
            d = s.get("details", {})
            out.append(ModelInfo(id=t["name"], provider=self.name, location=self.location,
                                 capabilities=s.get("capabilities") or [], size_bytes=t.get("size"),
                                 parameters=d.get("parameter_size"), quantization=d.get("quantization_level"),
                                 license=_license_name(s.get("license"))))
        return out

    async def capabilities(self, model: str) -> list[str]:
        return (await self.show(model)).get("capabilities") or []

    async def stream_chat(self, model: str, messages: list[ChatMessage], **opts) -> AsyncIterator[str]:
        msgs = []
        for m in messages:
            d = {"role": m.role, "content": m.content}
            if m.images:
                d["images"] = [base64.b64encode(b).decode() for b in m.images]
            msgs.append(d)
        body = {"model": model, "messages": msgs, "stream": True, "think": False,
                "options": {"temperature": opts.get("temperature", 0.4), "num_ctx": opts.get("num_ctx", 8192)}}
        if opts.get("max_tokens"):
            body["options"]["num_predict"] = opts["max_tokens"]
        if opts.get("seed") is not None:
            body["options"]["seed"] = opts["seed"]
        try:
            async with self._client() as c:
                async with c.stream("POST", "/api/chat", json=body) as r:
                    if r.status_code != 200:
                        text = (await r.aread()).decode(errors="replace")
                        if "think" in text and "does not support" in text:
                            raise _Rethink()
                        raise ProviderError("ollama_error", text[:300], 502)
                    async for line in r.aiter_lines():
                        if not line:
                            continue
                        j = json.loads(line)
                        if j.get("error"):
                            raise ProviderError("ollama_error", j["error"], 502)
                        t = j.get("message", {}).get("content")
                        if t:
                            yield t
        except _Rethink:
            async for t in self._stream_plain(body):
                yield t
        except httpx.ConnectError as e:
            raise ProviderError("ollama_unreachable", str(e), 503)
        except httpx.TimeoutException as e:
            raise ProviderError("ollama_timeout", str(e), 504)

    async def _stream_plain(self, body: dict) -> AsyncIterator[str]:
        body = {k: v for k, v in body.items() if k != "think"}
        async with self._client() as c:
            async with c.stream("POST", "/api/chat", json=body) as r:
                if r.status_code != 200:
                    raise ProviderError("ollama_error", (await r.aread()).decode(errors="replace")[:300], 502)
                async for line in r.aiter_lines():
                    if line:
                        j = json.loads(line)
                        if j.get("error"):
                            raise ProviderError("ollama_error", j["error"], 502)
                        t = j.get("message", {}).get("content")
                        if t:
                            yield t

    async def complete(self, model: str, messages: list[ChatMessage], **opts) -> str:
        return "".join([t async for t in self.stream_chat(model, messages, **opts)])

    async def embed(self, model: str, texts: list[str]) -> list[list[float]]:
        try:
            async with self._client(300) as c:
                r = await c.post("/api/embed", json={"model": model, "input": texts})
        except httpx.HTTPError as e:
            raise ProviderError("ollama_unreachable", str(e), 503)
        if r.status_code != 200:
            raise ProviderError("embed_failed", r.text[:300], 502)
        return r.json()["embeddings"]


class _Rethink(Exception):
    pass
