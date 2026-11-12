"""Side-panel documents and code with version history and diffs."""
from __future__ import annotations

import difflib

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from . import db
from .auth import current_user

router = APIRouter(prefix="/api")


class ArtifactBody(BaseModel):
    title: str | None = None
    kind: str = "document"  # document | code
    language: str | None = None
    content: str | None = None
    note: str | None = None
    project_id: str | None = None
    conversation_id: str | None = None


def _get(user: str, aid: str) -> dict:
    a = db.one("SELECT * FROM artifacts WHERE id=? AND user_id=?", (aid, user))
    if not a:
        raise HTTPException(404, "artifact_not_found")
    return a


def _versions(user: str, aid: str) -> list[dict]:
    return db.q("SELECT id,version,note,created,length(content) AS size FROM artifact_versions WHERE artifact_id=? AND user_id=? ORDER BY version",
                (aid, user))


def _add_version(user: str, aid: str, content: str, note: str | None) -> int:
    last = db.one("SELECT max(version) AS v FROM artifact_versions WHERE artifact_id=? AND user_id=?", (aid, user))["v"] or 0
    db.run("INSERT INTO artifact_versions(id,artifact_id,user_id,version,content,note,created) VALUES(?,?,?,?,?,?,?)",
           (db.new_id(), aid, user, last + 1, content, note or "", db.now()))
    db.run("UPDATE artifacts SET updated=? WHERE id=? AND user_id=?", (db.now(), aid, user))
    return last + 1


@router.get("/artifacts")
def list_artifacts(project_id: str | None = None, conversation_id: str | None = None, user: str = Depends(current_user)):
    if project_id:
        return db.q("SELECT * FROM artifacts WHERE user_id=? AND project_id=? ORDER BY updated DESC", (user, project_id))
    if conversation_id:
        return db.q("SELECT * FROM artifacts WHERE user_id=? AND conversation_id=? ORDER BY updated DESC", (user, conversation_id))
    return db.q("SELECT * FROM artifacts WHERE user_id=? ORDER BY updated DESC LIMIT 200", (user,))


@router.post("/artifacts")
def create(b: ArtifactBody, user: str = Depends(current_user)):
    if b.project_id and not db.one("SELECT id FROM projects WHERE id=? AND user_id=?", (b.project_id, user)):
        raise HTTPException(404, "project_not_found")
    if b.conversation_id and not db.one("SELECT id FROM conversations WHERE id=? AND user_id=?", (b.conversation_id, user)):
        raise HTTPException(404, "conversation_not_found")
    aid = db.new_id()
    db.run("INSERT INTO artifacts(id,user_id,project_id,conversation_id,title,kind,language,created,updated) VALUES(?,?,?,?,?,?,?,?,?)",
           (aid, user, b.project_id, b.conversation_id, b.title or "Untitled", b.kind, b.language or "", db.now(), db.now()))
    _add_version(user, aid, b.content or "", b.note or "created")
    if b.project_id:
        db.event(user, b.project_id, "artifact_created", {"artifact_id": aid, "title": b.title or "Untitled", "kind": b.kind})
    return read(aid, user=user)


@router.get("/artifacts/{aid}")
def read(aid: str, version: int | None = None, user: str = Depends(current_user)):
    a = _get(user, aid)
    a["versions"] = _versions(user, aid)
    v = version or a["versions"][-1]["version"]
    row = db.one("SELECT content FROM artifact_versions WHERE artifact_id=? AND user_id=? AND version=?", (aid, user, v))
    if not row:
        raise HTTPException(404, "version_not_found")
    a["version"], a["content"] = v, row["content"]
    return a


@router.put("/artifacts/{aid}")
def save(aid: str, b: ArtifactBody, user: str = Depends(current_user)):
    a = _get(user, aid)
    if b.title:
        db.run("UPDATE artifacts SET title=? WHERE id=? AND user_id=?", (b.title, aid, user))
    if b.content is not None:
        cur = read(aid, user=user)
        if cur["content"] != b.content:
            v = _add_version(user, aid, b.content, b.note)
            if a["project_id"]:
                db.event(user, a["project_id"], "artifact_version_saved", {"artifact_id": aid, "title": a["title"], "version": v, "note": b.note or ""})
    return read(aid, user=user)


@router.get("/artifacts/{aid}/diff")
def diff(aid: str, a: int, b: int, user: str = Depends(current_user)):
    _get(user, aid)
    rows = {r["version"]: r["content"] for r in db.q(
        "SELECT version,content FROM artifact_versions WHERE artifact_id=? AND user_id=? AND version IN (?,?)", (aid, user, a, b))}
    if a not in rows or b not in rows:
        raise HTTPException(404, "version_not_found")
    d = difflib.unified_diff(rows[a].splitlines(), rows[b].splitlines(), f"v{a}", f"v{b}", lineterm="")
    return {"a": a, "b": b, "diff": "\n".join(d)}


@router.delete("/artifacts/{aid}")
def delete(aid: str, user: str = Depends(current_user)):
    _get(user, aid)
    db.run("DELETE FROM artifact_versions WHERE artifact_id=? AND user_id=?", (aid, user))
    db.run("DELETE FROM artifacts WHERE id=? AND user_id=?", (aid, user))
    return {"ok": True}
