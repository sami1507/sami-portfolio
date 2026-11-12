from __future__ import annotations

import base64
from typing import AsyncIterator

from .. import secrets_store
from . import ChatMessage, ModelInfo, ProviderError

# Capabilities are declared per model here because the OpenAI models endpoint
# does not report them. Unknown models get "completion" only.
KNOWN = {"gpt-4o": ["completion", "vision", "tools"], "gpt-4o-mini": ["completion", "vision", "tools"],
         "gpt-4.1": ["completion", "vision", "tools"], "gpt-4.1-mini": ["completion", "vision", "tools"]}


class OpenAIProvider:
    name = "openai"
    location = "cloud"

    def _client(self):
        key = secrets_store.get("openai_api_key")
        if not key:
            raise ProviderError("missing_api_key", "openai", 400)
        from openai import AsyncOpenAI
        return AsyncOpenAI(api_key=key)

    async def available(self) -> tuple[bool, str]:
        return (True, "key configured") if secrets_store.get("openai_api_key") else (False, "missing_api_key")

    async def list_models(self) -> list[ModelInfo]:
        return [ModelInfo(id=m, provider=self.name, location=self.location, capabilities=c,
                          capabilities_source="static-table") for m, c in KNOWN.items()]

    async def stream_chat(self, model: str, messages: list[ChatMessage], **opts) -> AsyncIterator[str]:
        import openai
        msgs = []
        for m in messages:
            if m.images:
                parts = [{"type": "text", "text": m.content}]
                for b in m.images:
                    parts.append({"type": "image_url",
                                  "image_url": {"url": "data:image/png;base64," + base64.b64encode(b).decode()}})
                msgs.append({"role": m.role, "content": parts})
            else:
                msgs.append({"role": m.role, "content": m.content})
        try:
            stream = await self._client().chat.completions.create(model=model, messages=msgs, stream=True)
            async for ev in stream:
                if ev.choices and ev.choices[0].delta.content:
                    yield ev.choices[0].delta.content
        except openai.AuthenticationError as e:
            raise ProviderError("invalid_api_key", str(e), 401)
        except openai.RateLimitError as e:
            raise ProviderError("rate_limited", str(e), 429)
        except openai.APIStatusError as e:
            raise ProviderError("openai_error", str(e), 502)
        except openai.APIConnectionError as e:
            raise ProviderError("cloud_unreachable", str(e), 503)
