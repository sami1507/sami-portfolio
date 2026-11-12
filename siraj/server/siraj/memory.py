"""User-controlled memory. Two separate scopes:
  preference - how the user wants the assistant to behave (global)
  project    - facts about one project, with where each fact came from
Nothing is stored silently: model suggestions are saved as `pending` and are
not used in prompts until the user approves them."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from . import chat, db, llm_json
from .auth import current_user
from .providers import ProviderError

router = APIRouter(prefix="/api")


class MemoryBody(BaseModel):
    scope: str | None = None
    project_id: str | None = None
    text: str | None = None
    status: str | None = None


class SuggestBody(BaseModel):
    conversation_id: str


def _row(r: dict) -> dict:
    r["source"] = json.loads(r["source"] or "{}")
    return r


@router.get("/memory")
def list_memory(scope: str | None = None, project_id: str | None = None, user: str = Depends(current_user)):
    sql, args = "SELECT * FROM memories WHERE user_id=?", [user]
    if scope:
        sql += " AND scope=?"
        args.append(scope)
    if project_id:
        sql += " AND project_id=?"
        args.append(project_id)
    return [_row(r) for r in db.q(sql + " ORDER BY created DESC", args)]


def _add(user, scope, project_id, text, source, status="active") -> dict:
    if scope not in ("preference", "project"):
        raise HTTPException(400, "invalid_scope")
    if scope == "project":
        if not project_id or not db.one("SELECT id FROM projects WHERE id=? AND user_id=?", (project_id, user)):
            raise HTTPException(404, "project_not_found")
    else:
        project_id = None
    if not (text or "").strip():
        raise HTTPException(400, "text_required")
    mid = db.new_id()
    db.run("INSERT INTO memories(id,user_id,scope,project_id,text,source,status,created,updated) VALUES(?,?,?,?,?,?,?,?,?)",
           (mid, user, scope, project_id, text.strip(), json.dumps(source, ensure_ascii=False), status, db.now(), db.now()))
    return _row(db.one("SELECT * FROM memories WHERE id=? AND user_id=?", (mid, user)))


@router.post("/memory")
def add_memory(b: MemoryBody, user: str = Depends(current_user)):
    m = _add(user, b.scope, b.project_id, b.text, {"type": "user"})
    if m["project_id"]:
        db.event(user, m["project_id"], "memory_added", {"memory_id": m["id"], "text": m["text"][:300]})
    return m


@router.patch("/memory/{mid}")
def edit_memory(mid: str, b: MemoryBody, user: str = Depends(current_user)):
    m = db.one("SELECT * FROM memories WHERE id=? AND user_id=?", (mid, user))
    if not m:
        raise HTTPException(404, "memory_not_found")
    if b.text is not None and b.text.strip():
        db.run("UPDATE memories SET text=?,updated=? WHERE id=? AND user_id=?", (b.text.strip(), db.now(), mid, user))
    if b.status in ("active", "pending"):
        db.run("UPDATE memories SET status=?,updated=? WHERE id=? AND user_id=?", (b.status, db.now(), mid, user))
        if b.status == "active" and m["status"] == "pending" and m["project_id"]:
            db.event(user, m["project_id"], "memory_added", {"memory_id": mid, "text": (b.text or m["text"])[:300]})
    return _row(db.one("SELECT * FROM memories WHERE id=? AND user_id=?", (mid, user)))


@router.delete("/memory/{mid}")
def delete_memory(mid: str, user: str = Depends(current_user)):
    if not db.run("DELETE FROM memories WHERE id=? AND user_id=?", (mid, user)).rowcount:
        raise HTTPException(404, "memory_not_found")
    return {"ok": True}


SUGGEST_SYSTEM = """You extract durable facts worth remembering from a conversation. Output ONLY a JSON array (max 4 items).
Each item: {"scope": "preference" or "project", "text": "<one short sentence in the user's language>", "quote": "<exact words copied from a USER message that support it>"}.
"preference" = how the user wants answers (language, style, tools they use). "project" = a fact or decision about the work itself.
Only use what the USER stated explicitly. If nothing is worth remembering output []."""


@router.post("/memory/suggest")
async def suggest(b: SuggestBody, user: str = Depends(current_user)):
    conv = chat._conv(user, b.conversation_id)
    path = chat.path_to(chat._msgs(user, conv["id"]), conv["active_leaf"])
    user_msgs = [m for m in path if m["role"] == "user"]
    if not user_msgs:
        return []
    transcript = "\n".join(f"{m['role'].upper()}: {m['content'][:1500]}" for m in path[-12:])
    try:
        items, model = await llm_json.ask(user, SUGGEST_SYSTEM, transcript)
    except (ProviderError, ValueError) as e:
        raise HTTPException(502, f"suggestion_failed: {e}")
    out = []
    for it in items if isinstance(items, list) else []:
        if not isinstance(it, dict):
            continue
        quote, text = str(it.get("quote", "")).strip(), str(it.get("text", "")).strip()
        # Evidence check: the quote must literally appear in a user message.
        src = next((m for m in user_msgs if quote and quote in m["content"]), None)
        if not src or not text:
            continue
        scope = "project" if it.get("scope") == "project" and conv["project_id"] else "preference"
        if db.one("SELECT id FROM memories WHERE user_id=? AND text=?", (user, text)):
            continue
        out.append(_add(user, scope, conv["project_id"], text,
                        {"type": "conversation", "conversation_id": conv["id"], "message_id": src["id"], "quote": quote, "model": model},
                        status="pending"))
    return out
