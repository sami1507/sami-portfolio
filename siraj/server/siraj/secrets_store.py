"""API keys live in the OS keychain (Keychain / Credential Manager / Secret
Service) through `keyring`. When no keychain backend exists (headless Linux)
we fall back to a 0600 file and report that weaker backend honestly.
Secrets are never returned by any API route and never placed in a prompt."""
from __future__ import annotations

import json
import os

from . import config

SERVICE = "siraj"
KNOWN = ("openai_api_key", "anthropic_api_key", "sync_token", "searxng_url")


def _keyring():
    try:
        import keyring
        from keyring.backends import fail
        kr = keyring.get_keyring()
        if isinstance(kr, fail.Keyring):
            return None
        return keyring
    except Exception:
        return None


def backend() -> str:
    return "os-keychain" if _keyring() else "file-0600"


def _file():
    return config.ensure_home() / "secrets.json"


def _load() -> dict:
    try:
        return json.loads(_file().read_text())
    except Exception:
        return {}


def get(name: str) -> str | None:
    env = os.environ.get("SIRAJ_" + name.upper()) or (os.environ.get(name.upper()) if config.MODE == "server" else None)
    if env:
        return env
    kr = _keyring()
    if kr:
        try:
            return kr.get_password(SERVICE, name)
        except Exception:
            return None
    return _load().get(name)


def set(name: str, value: str | None) -> None:
    if name not in KNOWN:
        raise ValueError("unknown secret")
    kr = _keyring()
    if kr:
        if value:
            kr.set_password(SERVICE, name, value)
        else:
            try:
                kr.delete_password(SERVICE, name)
            except Exception:
                pass
        return
    d = _load()
    if value:
        d[name] = value
    else:
        d.pop(name, None)
    f = _file()
    f.write_text(json.dumps(d))
    f.chmod(0o600)


def status() -> dict:
    return {"backend": backend(), "configured": {k: bool(get(k)) for k in KNOWN}}
