"""Privacy policy enforcement in one place.

local_only (default): no request may leave the machine. Cloud providers, web
search and remote sync are refused with 403. hybrid: the user may *explicitly*
pick a cloud provider per request; nothing is rerouted automatically."""
from __future__ import annotations

from fastapi import HTTPException

from . import db, providers

MIN_SIMILARITY = 0.42  # cosine gate for dense-only matches (bge-m3); see eval/retrieval_eval.py


def mode(user: str) -> str:
    return db.get_setting(user, "privacy_mode", "local_only")


def check_provider(user: str, provider: str) -> None:
    if provider not in providers.ALL:
        raise HTTPException(400, "unknown_provider")
    if provider != "ollama":
        if mode(user) != "hybrid":
            raise HTTPException(403, "local_only_mode_blocks_cloud")
        if provider not in db.get_setting(user, "cloud_providers_enabled", []):
            raise HTTPException(403, "cloud_provider_not_enabled")


def check_web(user: str) -> None:
    if mode(user) != "hybrid":
        raise HTTPException(403, "local_only_mode_blocks_web")
    if not db.get_setting(user, "web_search_enabled", False):
        raise HTTPException(403, "web_search_not_enabled")


def check_sync(user: str) -> None:
    if mode(user) != "hybrid":
        raise HTTPException(403, "local_only_mode_blocks_sync")


async def model_capabilities(prov, model: str) -> list[str]:
    if hasattr(prov, "capabilities"):
        return await prov.capabilities(model)
    for m in await prov.list_models():
        if m.id == model:
            return m.capabilities
    return ["completion"]
