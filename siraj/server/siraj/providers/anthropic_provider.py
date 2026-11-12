from __future__ import annotations

import base64
from typing import AsyncIterator

from .. import secrets_store
from . import ChatMessage, ModelInfo, ProviderError

DEFAULT_MODEL = "claude-opus-5-5"
FALLBACK_MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"]


def _media_type(b: bytes) -> str:
    if b[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if b[:4] == b"GIF8":
        return "image/gif"
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        return "image/webp"
    return "image/png"


class AnthropicProvider:
    name = "anthropic"
    location = "cloud"

    def _client(self):
        key = secrets_store.get("anthropic_api_key")
        if not key:
            raise ProviderError("missing_api_key", "anthropic", 400)
        import anthropic
        return anthropic.AsyncAnthropic(api_key=key)

    async def available(self) -> tuple[bool, str]:
        return (True, "key configured") if secrets_store.get("anthropic_api_key") else (False, "missing_api_key")

    async def list_models(self) -> list[ModelInfo]:
        """Ask the Models API; if it cannot be reached, list the documented
        ids and mark their capabilities as coming from a static table."""
        try:
            out = []
            async for m in self._client().models.list():
                caps = ["completion", "tools"]
                c = getattr(m, "capabilities", None)
                if c is not None and getattr(getattr(c, "image_input", None), "supported", False):
                    caps.append("vision")
                out.append(ModelInfo(id=m.id, provider=self.name, location=self.location, capabilities=caps))
            if out:
                return out
        except Exception:
            pass
        return [ModelInfo(id=m, provider=self.name, location=self.location,
                          capabilities=["completion", "vision", "tools"], capabilities_source="static-table")
                for m in FALLBACK_MODELS]

    async def stream_chat(self, model: str, messages: list[ChatMessage], **opts) -> AsyncIterator[str]:
        import anthropic
        system = "\n\n".join(m.content for m in messages if m.role == "system")
        msgs = []
        for m in messages:
            if m.role == "system":
                continue
            if m.images:
                content = [{"type": "image", "source": {"type": "base64", "media_type": _media_type(b),
                                                         "data": base64.b64encode(b).decode()}} for b in m.images]
                content.append({"type": "text", "text": m.content})
                msgs.append({"role": m.role, "content": content})
            else:
                msgs.append({"role": m.role, "content": m.content})
        kwargs = dict(model=model or DEFAULT_MODEL, max_tokens=opts.get("max_tokens") or 64000, messages=msgs)
        if system:
            kwargs["system"] = system
        try:
            async with self._client().messages.stream(**kwargs) as stream:
                async for text in stream.text_stream:
                    yield text
                final = await stream.get_final_message()
                if final.stop_reason == "refusal":
                    raise ProviderError("refused", "The model declined this request.", 422)
        except anthropic.AuthenticationError as e:
            raise ProviderError("invalid_api_key", str(e), 401)
        except anthropic.RateLimitError as e:
            raise ProviderError("rate_limited", str(e), 429)
        except anthropic.APIStatusError as e:
            raise ProviderError("anthropic_error", str(e), 502)
        except anthropic.APIConnectionError as e:
            raise ProviderError("cloud_unreachable", str(e), 503)
