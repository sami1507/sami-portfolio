"""Runtime configuration. Everything is driven by environment variables so the
same code runs as a desktop sidecar (mode=local) or a multi-user server."""
from __future__ import annotations

import os
import secrets
from pathlib import Path

MODE = os.environ.get("SIRAJ_MODE", "local")  # "local" | "server"
HOME = Path(os.environ.get("SIRAJ_HOME", Path.home() / ".siraj")).expanduser()
OLLAMA_URL = os.environ.get("SIRAJ_OLLAMA_URL", "http://127.0.0.1:11434")
UI_DIR = os.environ.get("SIRAJ_UI_DIR", "")
# Origins allowed to call the engine from a browser besides its own origin.
EXTRA_ORIGINS = [o for o in os.environ.get("SIRAJ_ALLOWED_ORIGINS", "").split(",") if o]
TAURI_ORIGINS = ["tauri://localhost", "http://tauri.localhost", "https://tauri.localhost"]
ALLOW_REGISTRATION = os.environ.get("SIRAJ_ALLOW_REGISTRATION", "1") == "1"
MAX_UPLOAD_BYTES = int(os.environ.get("SIRAJ_MAX_UPLOAD_MB", "50")) * 1024 * 1024
LOCAL_USER = "local"


def ensure_home() -> Path:
    HOME.mkdir(parents=True, exist_ok=True)
    try:
        HOME.chmod(0o700)
    except OSError:
        pass
    (HOME / "files").mkdir(exist_ok=True)
    return HOME


def local_token() -> str:
    """Per-installation token that protects the local engine from other
    web origins. It is injected into the UI served by the engine itself."""
    p = ensure_home() / "local_token"
    if p.exists():
        return p.read_text().strip()
    tok = secrets.token_urlsafe(32)
    p.write_text(tok)
    p.chmod(0o600)
    return tok
