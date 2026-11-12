"""Status, models, settings, secrets and account routes."""
from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from . import auth, config, db, files, hardware, policy, providers, sandbox, secrets_store, voice
from .auth import current_user
from .providers import ProviderError

router = APIRouter(prefix="/api")
SETTINGS = {"privacy_mode": ("local_only", "hybrid"), "cloud_providers_enabled": None, "web_search_enabled": (True, False),
            "default_model": None, "default_provider": providers.ALL, "ui_language": ("ar", "en"), "theme": ("light", "dark", "system"),
            "sync_url": None, "tts_enabled": (True, False)}


class Creds(BaseModel):
    email: str
    password: str


class SettingBody(BaseModel):
    key: str
    value: object


class SecretBody(BaseModel):
    name: str
    value: str | None = None


@router.get("/health")
def health():
    return {"ok": True, "mode": config.MODE}


@router.post("/auth/register")
def register(c: Creds):
    if config.MODE != "server":
        raise HTTPException(400, "accounts_exist_only_in_server_mode")
    if not config.ALLOW_REGISTRATION:
        raise HTTPException(403, "registration_disabled")
    return {"token": auth.register(c.email, c.password)}


@router.post("/auth/login")
def login(c: Creds):
    if config.MODE != "server":
        raise HTTPException(400, "accounts_exist_only_in_server_mode")
    return {"token": auth.login(c.email, c.password)}


@router.post("/auth/logout")
def logout(authorization: str | None = Header(default=None), user: str = Depends(current_user)):
    if config.MODE == "server":
        auth.revoke((authorization or "").removeprefix("Bearer ").strip())
    return {"ok": True}


@router.get("/settings")
def get_settings(user: str = Depends(current_user)):
    out = {k: db.get_setting(user, k) for k in SETTINGS}
    out["privacy_mode"] = policy.mode(user)
    out["cloud_providers_enabled"] = out["cloud_providers_enabled"] or []
    out["web_search_enabled"] = bool(out["web_search_enabled"])
    return out


@router.put("/settings")
def put_setting(b: SettingBody, user: str = Depends(current_user)):
    if b.key not in SETTINGS:
        raise HTTPException(400, "unknown_setting")
    allowed = SETTINGS[b.key]
    if allowed is not None and b.value not in allowed:
        raise HTTPException(400, "invalid_value")
    if b.key == "cloud_providers_enabled":
        if not isinstance(b.value, list) or any(v not in ("openai", "anthropic") for v in b.value):
            raise HTTPException(400, "invalid_value")
    db.set_setting(user, b.key, b.value)
    if b.key in ("privacy_mode", "cloud_providers_enabled", "web_search_enabled", "sync_url"):
        db.op(user, "privacy_setting_changed", {"key": b.key, "value": b.value})
    return get_settings(user)


@router.get("/secrets")
def secrets_status(user: str = Depends(current_user)):
    s = secrets_store.status()
    s["editable"] = config.MODE == "local"
    return s


@router.put("/secrets")
def put_secret(b: SecretBody, user: str = Depends(current_user)):
    if config.MODE != "local":
        # In server mode keys belong to the operator (environment), never to a tenant.
        raise HTTPException(403, "secrets_are_operator_managed_in_server_mode")
    try:
        secrets_store.set(b.name, b.value)
    except ValueError:
        raise HTTPException(400, "unknown_secret")
    db.op(user, "secret_changed", {"name": b.name, "set": bool(b.value)})
    return secrets_store.status()


@router.get("/models")
async def models(user: str = Depends(current_user)):
    out, errors = [], {}
    mode = policy.mode(user)
    enabled = db.get_setting(user, "cloud_providers_enabled", [])
    for name in providers.ALL:
        if name != "ollama" and (mode != "hybrid" or name not in enabled):
            continue
        prov = providers.get(name)
        ok, detail = await prov.available()
        if not ok:
            errors[name] = detail
            continue
        try:
            out += [asdict(m) for m in await prov.list_models()]
        except ProviderError as e:
            errors[name] = e.code
    return {"models": out, "errors": errors}


@router.get("/status")
async def status(user: str = Depends(current_user)):
    hw = hardware.probe()
    ok, detail = await providers.get("ollama").available()
    local_models = []
    if ok:
        try:
            local_models = [asdict(m) for m in await providers.get("ollama").list_models()]
        except ProviderError:
            pass
    ocr_ok, ocr_langs = files.ocr_available()
    from . import rag
    return {
        "mode": config.MODE, "privacy_mode": policy.mode(user), "hardware": hw,
        "ollama": {"reachable": ok, "detail": detail, "url": config.OLLAMA_URL},
        "recommendation": hardware.recommend(hw, local_models),
        "embedding_model": await rag.embed_model() if ok else None,
        "ocr": {"available": ocr_ok, "languages": ocr_langs, "engine": "tesseract" if ocr_ok else None},
        "sandbox": sandbox.status(),
        "voice": voice.status(),
        "secrets_backend": secrets_store.backend(),
        "image_generation": {"available": False, "reason": "not_implemented"},
    }


@router.get("/oplog")
def oplog(limit: int = 100, user: str = Depends(current_user)):
    import json
    rows = db.q("SELECT id,kind,detail,status,created FROM oplog WHERE user_id=? ORDER BY id DESC LIMIT ?", (user, min(limit, 500)))
    for r in rows:
        r["detail"] = json.loads(r["detail"])
    return rows
