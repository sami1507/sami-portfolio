"""Ask the local model for JSON and parse it defensively."""
from __future__ import annotations

import json
import re

from . import db
from .providers import ChatMessage, ProviderError
from .providers.ollama import OllamaProvider


async def local_model(user: str) -> str:
    m = db.get_setting(user, "default_model")
    prov = OllamaProvider()
    names = [x.id for x in await prov.list_models() if "completion" in x.capabilities]
    if m in names:
        return m
    if not names:
        raise ProviderError("no_local_model", "No local chat model is installed.", 503)
    return names[0]


def parse(text: str):
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S)
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if m:
        text = m.group(1)
    start = min([i for i in (text.find("{"), text.find("[")) if i >= 0], default=-1)
    if start < 0:
        raise ValueError("no_json")
    return json.JSONDecoder().raw_decode(text[start:])[0]


async def ask(user: str, system: str, prompt: str, max_tokens: int = 700):
    """Background analysis always runs on the local model, whatever the
    privacy mode: memory and project state never leave the machine."""
    model = await local_model(user)
    out = await OllamaProvider().complete(model, [ChatMessage("system", system), ChatMessage("user", prompt)],
                                          temperature=0.1, max_tokens=max_tokens)
    return parse(out), model
