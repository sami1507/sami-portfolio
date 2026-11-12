"""Optional sync of conversations between a local engine and a Siraj server.

Server side (any mode): /api/sync/push and /api/sync/pull, scoped to the
authenticated user. Client side (local mode): /api/sync/login and
/api/sync/run talk to the configured server. Messages are immutable rows keyed
by id, so merging is a union; conversation metadata is last-writer-wins."""
from __future__ import annotations

import json

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from . import config, db, policy, secrets_store
from .auth import current_user

router = APIRouter(prefix="/api")


class Bundle(BaseModel):
    conversations: list[dict] = []
    messages: list[dict] = []


class SyncLogin(BaseModel):
    url: str
    email: str
    password: str
    create_account: bool = False


def export_since(user: str, since: float) -> dict:
    convs = db.q("SELECT id,title,active_leaf,created,updated,deleted FROM conversations WHERE user_id=? AND updated>?", (user, since))
    msgs = []
    for c in convs:
        msgs += db.q("SELECT id,conversation_id,parent_id,role,content,meta,status,created FROM messages WHERE conversation_id=? AND user_id=? AND status!='streaming'",
                     (c["id"], user))
    return {"conversations": convs, "messages": msgs, "now": db.now()}


def import_bundle(user: str, b: Bundle) -> dict:
    """Rows are always written under `user`; ids owned by another user are
    rejected rather than overwritten."""
    from .chat import _index_msg
    nc = nm = rejected = 0
    for c in b.conversations:
        cur = db.one("SELECT user_id,updated FROM conversations WHERE id=?", (c["id"],))
        if cur and cur["user_id"] != user:
            rejected += 1
            continue
        if not cur:
            db.run("INSERT INTO conversations(id,user_id,title,active_leaf,created,updated,deleted) VALUES(?,?,?,?,?,?,?)",
                   (c["id"], user, c.get("title", ""), c.get("active_leaf"), c.get("created", db.now()), c.get("updated", db.now()),
                    int(c.get("deleted", 0))))
            nc += 1
        elif c.get("updated", 0) > cur["updated"]:
            db.run("UPDATE conversations SET title=?,active_leaf=?,updated=?,deleted=? WHERE id=? AND user_id=?",
                   (c.get("title", ""), c.get("active_leaf"), c["updated"], int(c.get("deleted", 0)), c["id"], user))
            nc += 1
    for m in b.messages:
        owner = db.one("SELECT user_id FROM conversations WHERE id=?", (m["conversation_id"],))
        if not owner or owner["user_id"] != user:
            rejected += 1
            continue
        if db.one("SELECT id FROM messages WHERE id=?", (m["id"],)):
            continue
        meta = m.get("meta") if isinstance(m.get("meta"), str) else json.dumps(m.get("meta") or {}, ensure_ascii=False)
        db.run("INSERT INTO messages(id,conversation_id,user_id,parent_id,role,content,meta,status,created) VALUES(?,?,?,?,?,?,?,?,?)",
               (m["id"], m["conversation_id"], user, m.get("parent_id"), m["role"], m.get("content", ""), meta,
                m.get("status", "complete"), m.get("created", db.now())))
        _index_msg(user, m["id"], m.get("content", ""))
        nm += 1
    return {"conversations": nc, "messages": nm, "rejected": rejected}


@router.post("/sync/push")
def push(b: Bundle, user: str = Depends(current_user)):
    return import_bundle(user, b)


@router.get("/sync/pull")
def pull(since: float = 0, user: str = Depends(current_user)):
    return export_since(user, since)


@router.post("/sync/login")
async def sync_login(b: SyncLogin, user: str = Depends(current_user)):
    if config.MODE != "local":
        raise HTTPException(400, "sync_client_runs_in_local_mode")
    policy.check_sync(user)
    url = b.url.rstrip("/")
    if not (url.startswith("https://") or url.startswith("http://127.0.0.1") or url.startswith("http://localhost")):
        raise HTTPException(400, "sync_server_must_use_https")
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(f"{url}/api/auth/{'register' if b.create_account else 'login'}", json={"email": b.email, "password": b.password})
    except httpx.HTTPError as e:
        raise HTTPException(502, f"sync_server_unreachable: {type(e).__name__}")
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.json().get("detail", "sync_login_failed") if r.headers.get("content-type", "").startswith("application/json") else "sync_login_failed")
    secrets_store.set("sync_token", r.json()["token"])
    db.set_setting(user, "sync_url", url)
    db.op(user, "sync_login", {"url": url, "email": b.email})
    return {"ok": True, "url": url}


@router.post("/sync/run")
async def sync_run(user: str = Depends(current_user)):
    if config.MODE != "local":
        raise HTTPException(400, "sync_client_runs_in_local_mode")
    policy.check_sync(user)
    url, token = db.get_setting(user, "sync_url"), secrets_store.get("sync_token")
    if not url or not token:
        raise HTTPException(400, "sync_not_configured")
    since = db.get_setting(user, "sync_cursor", 0)
    h = {"Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient(timeout=60, headers=h) as c:
            out = export_since(user, since)
            r = await c.post(f"{url}/api/sync/push", json={"conversations": out["conversations"], "messages": out["messages"]})
            r.raise_for_status()
            pushed = r.json()
            r = await c.get(f"{url}/api/sync/pull", params={"since": since})
            r.raise_for_status()
            remote = r.json()
    except httpx.HTTPStatusError as e:
        db.op(user, "sync", {"error": f"HTTP {e.response.status_code}"}, status="failed")
        raise HTTPException(502, f"sync_failed: HTTP {e.response.status_code}")
    except httpx.HTTPError as e:
        db.op(user, "sync", {"error": type(e).__name__}, status="failed")
        raise HTTPException(502, f"sync_server_unreachable: {type(e).__name__}")
    pulled = import_bundle(user, Bundle(conversations=remote["conversations"], messages=remote["messages"]))
    db.set_setting(user, "sync_cursor", min(out["now"], remote["now"]) - 5)
    db.op(user, "sync", {"pushed": pushed, "pulled": pulled})
    return {"pushed": pushed, "pulled": pulled}
