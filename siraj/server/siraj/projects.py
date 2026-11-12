"""Projects (instructions + files + conversations) and file upload/indexing."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from . import config, db, files, rag
from .auth import current_user
from .providers import ProviderError

router = APIRouter(prefix="/api")


class ProjectBody(BaseModel):
    name: str | None = None
    instructions: str | None = None


def get_project(user: str, pid: str) -> dict:
    p = db.one("SELECT * FROM projects WHERE id=? AND user_id=?", (pid, user))
    if not p:
        raise HTTPException(404, "project_not_found")
    return p


@router.get("/projects")
def list_projects(user: str = Depends(current_user)):
    return db.q("SELECT * FROM projects WHERE user_id=? ORDER BY updated DESC", (user,))


@router.post("/projects")
def create_project(b: ProjectBody, user: str = Depends(current_user)):
    if not (b.name or "").strip():
        raise HTTPException(400, "name_required")
    pid = db.new_id()
    db.run("INSERT INTO projects(id,user_id,name,instructions,created,updated) VALUES(?,?,?,?,?,?)",
           (pid, user, b.name.strip(), b.instructions or "", db.now(), db.now()))
    db.event(user, pid, "project_created", {"name": b.name.strip()})
    return get_project(user, pid)


@router.get("/projects/{pid}")
def read_project(pid: str, user: str = Depends(current_user)):
    return get_project(user, pid)


@router.patch("/projects/{pid}")
def patch_project(pid: str, b: ProjectBody, user: str = Depends(current_user)):
    p = get_project(user, pid)
    if b.name is not None and b.name.strip():
        db.run("UPDATE projects SET name=?,updated=? WHERE id=? AND user_id=?", (b.name.strip(), db.now(), pid, user))
    if b.instructions is not None and b.instructions != p["instructions"]:
        db.run("UPDATE projects SET instructions=?,updated=? WHERE id=? AND user_id=?", (b.instructions, db.now(), pid, user))
        db.event(user, pid, "instructions_changed", {"instructions": b.instructions[:500]})
    return get_project(user, pid)


@router.delete("/projects/{pid}")
def delete_project(pid: str, user: str = Depends(current_user)):
    get_project(user, pid)
    for f in db.q("SELECT id FROM files WHERE project_id=? AND user_id=?", (pid, user)):
        _delete_file(user, f["id"])
    for c in db.q("SELECT id FROM conversations WHERE project_id=? AND user_id=?", (pid, user)):
        for m in db.q("SELECT id FROM messages WHERE conversation_id=? AND user_id=?", (c["id"], user)):
            db.run("DELETE FROM messages_fts WHERE message_id=?", (m["id"],))
        db.run("DELETE FROM messages WHERE conversation_id=? AND user_id=?", (c["id"], user))
        db.run("UPDATE conversations SET deleted=1,title='',updated=? WHERE id=? AND user_id=?", (db.now(), c["id"], user))
    for t in ("memories", "events", "project_state", "artifacts"):
        db.run(f"DELETE FROM {t} WHERE project_id=? AND user_id=?", (pid, user))
    db.run("DELETE FROM projects WHERE id=? AND user_id=?", (pid, user))
    return {"ok": True}


def _public(f: dict) -> dict:
    return {k: f[k] for k in ("id", "name", "mime", "size", "status", "detail", "project_id", "conversation_id", "created")}


@router.get("/files")
def list_files(project_id: str | None = None, conversation_id: str | None = None, user: str = Depends(current_user)):
    if project_id:
        rows = db.q("SELECT * FROM files WHERE user_id=? AND project_id=? ORDER BY created", (user, project_id))
    elif conversation_id:
        rows = db.q("SELECT * FROM files WHERE user_id=? AND conversation_id=? ORDER BY created", (user, conversation_id))
    else:
        rows = db.q("SELECT * FROM files WHERE user_id=? ORDER BY created DESC LIMIT 200", (user,))
    return [_public(r) for r in rows]


@router.post("/files")
async def upload(file: UploadFile = File(...), project_id: str | None = Form(default=None), user: str = Depends(current_user)):
    if project_id:
        get_project(user, project_id)
    data = await file.read()
    if len(data) > config.MAX_UPLOAD_BYTES:
        raise HTTPException(413, "file_too_large")
    name = Path(file.filename or "file").name
    fid = db.new_id()
    udir = config.ensure_home() / "files" / hashlib.sha256(user.encode()).hexdigest()[:16]
    udir.mkdir(parents=True, exist_ok=True)
    path = udir / (fid + Path(name).suffix.lower())
    path.write_bytes(data)
    status, detail = "indexed", ""
    kind = files.kind_of(name)
    try:
        units, note = files.extract(name, data)
        info = await rag.index_file(user, fid, project_id, units)
        detail = json.dumps({"chunks": info["chunks"], "embed_model": info["embed_model"], "note": note,
                             "retrieval": "hybrid" if info["embed_model"] else "lexical-only"}, ensure_ascii=False)
    except files.ExtractError as e:
        # An image without OCR text is still usable by a vision model.
        status = "stored" if kind == "image" else "failed"
        detail = json.dumps({"error": str(e)})
    except ProviderError as e:
        status, detail = "failed", json.dumps({"error": e.code})
    db.run("INSERT INTO files(id,user_id,project_id,name,mime,size,sha256,path,status,detail,created) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
           (fid, user, project_id, name, file.content_type or "", len(data), hashlib.sha256(data).hexdigest(), str(path),
            status, detail, db.now()))
    if project_id and status != "failed":
        db.event(user, project_id, "file_added", {"file_id": fid, "name": name, "status": status})
    return _public(db.one("SELECT * FROM files WHERE id=? AND user_id=?", (fid, user)))


def _delete_file(user: str, fid: str) -> None:
    f = db.one("SELECT * FROM files WHERE id=? AND user_id=?", (fid, user))
    if not f:
        raise HTTPException(404, "file_not_found")
    rag.delete_file_index(user, fid)
    try:
        Path(f["path"]).unlink(missing_ok=True)
    except OSError:
        pass
    db.run("DELETE FROM files WHERE id=? AND user_id=?", (fid, user))
    if f["project_id"]:
        db.event(user, f["project_id"], "file_removed", {"file_id": fid, "name": f["name"]})


@router.delete("/files/{fid}")
def delete_file(fid: str, user: str = Depends(current_user)):
    _delete_file(user, fid)
    return {"ok": True}


@router.get("/files/{fid}/passage")
def passage(fid: str, chunk: int, user: str = Depends(current_user)):
    r = db.one("SELECT c.text,c.locator,f.name FROM chunks c JOIN files f ON f.id=c.file_id WHERE c.file_id=? AND c.ord=? AND c.user_id=? AND f.user_id=?",
               (fid, chunk, user, user))
    if not r:
        raise HTTPException(404, "passage_not_found")
    r["locator"] = json.loads(r["locator"])
    return r
