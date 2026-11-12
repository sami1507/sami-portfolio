"""Siraj engine entry point: `python -m siraj.main` (or uvicorn siraj.main:app)."""
from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse

from . import __version__, artifacts, chat, config, memory, projects, state, sync, system, voice, workspace

app = FastAPI(title="Siraj engine", version=__version__, docs_url=None, redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=config.TAURI_ORIGINS + config.EXTRA_ORIGINS,
                   allow_methods=["*"], allow_headers=["Authorization", "Content-Type"])
for mod in (system, chat, projects, artifacts, memory, state, workspace, voice, sync):
    app.include_router(mod.router)


@app.middleware("http")
async def host_guard(request: Request, call_next):
    """DNS-rebinding guard for the local engine: only loopback Host headers."""
    if config.MODE == "local":
        host = (request.headers.get("host") or "").split(":")[0]
        if host not in ("127.0.0.1", "localhost", "[::1]", "tauri.localhost", "testserver"):
            return JSONResponse({"detail": "bad_host"}, status_code=400)
    resp = await call_next(request)
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["Referrer-Policy"] = "no-referrer"
    return resp


def _ui_dir() -> Path | None:
    for cand in (config.UI_DIR, Path(__file__).resolve().parents[2] / "app" / "dist"):
        if cand and Path(cand).joinpath("index.html").exists():
            return Path(cand)
    return None


@app.get("/{full_path:path}", include_in_schema=False)
def ui(full_path: str):
    root = _ui_dir()
    if full_path.startswith("api/"):
        return JSONResponse({"detail": "not_found"}, status_code=404)
    if not root:
        return HTMLResponse("<h1>Siraj engine</h1><p>UI build not found. Run <code>npm run build</code> in siraj/app.</p>")
    target = (root / full_path).resolve()
    if full_path and target.is_file() and root.resolve() in target.parents:
        return FileResponse(target)
    html = (root / "index.html").read_text(encoding="utf-8")
    # The local token is handed only to pages served from this origin.
    boot = {"mode": config.MODE, "token": config.local_token() if config.MODE == "local" else None}
    import json
    html = html.replace("<head>", "<head><script>window.__SIRAJ__=" + json.dumps(boot) + "</script>", 1)
    return HTMLResponse(html, headers={"Cache-Control": "no-store"})


def main() -> None:
    import uvicorn
    host = os.environ.get("SIRAJ_HOST", "127.0.0.1")
    port = int(os.environ.get("SIRAJ_PORT", "8787"))
    config.ensure_home()
    if config.MODE == "local":
        config.local_token()
    uvicorn.run(app, host=host, port=port, log_level=os.environ.get("SIRAJ_LOG", "warning"))


if __name__ == "__main__":
    main()
