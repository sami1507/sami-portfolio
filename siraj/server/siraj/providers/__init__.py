"""Provider layer. `local` providers keep data on the machine; `cloud`
providers are refused unless the user explicitly enabled hybrid mode AND chose
that provider for the request. Nothing here falls back from local to cloud."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import AsyncIterator, Protocol


class ProviderError(Exception):
    def __init__(self, code: str, message: str = "", status: int = 502):
        super().__init__(message or code)
        self.code, self.message, self.status = code, message or code, status


@dataclass
class ModelInfo:
    id: str
    provider: str
    location: str  # "local" | "cloud"
    capabilities: list[str] = field(default_factory=list)  # completion, vision, tools, embedding, thinking
    size_bytes: int | None = None
    parameters: str | None = None
    quantization: str | None = None
    license: str | None = None
    capabilities_source: str = "provider-reported"


@dataclass
class ChatMessage:
    role: str  # system | user | assistant
    content: str
    images: list[bytes] = field(default_factory=list)  # raw image bytes, user turns only


class Provider(Protocol):
    name: str
    location: str

    async def available(self) -> tuple[bool, str]: ...
    async def list_models(self) -> list[ModelInfo]: ...
    def stream_chat(self, model: str, messages: list[ChatMessage], **opts) -> AsyncIterator[str]: ...


def get(name: str) -> Provider:
    from .anthropic_provider import AnthropicProvider
    from .ollama import OllamaProvider
    from .openai_provider import OpenAIProvider
    table = {"ollama": OllamaProvider, "openai": OpenAIProvider, "anthropic": AnthropicProvider}
    if name not in table:
        raise ProviderError("unknown_provider", name, 400)
    return table[name]()


ALL = ("ollama", "openai", "anthropic")
