"""SQLite storage. Every user-owned row carries user_id and every query in the
codebase filters on it; `tests/test_isolation.py` exercises that boundary."""
from __future__ import annotations

import json
import sqlite3
import threading
import time
import uuid
from typing import Any, Iterable

from . import config

SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, email TEXT UNIQUE, pw_hash TEXT, created REAL);
CREATE TABLE IF NOT EXISTS tokens(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, created REAL);
CREATE TABLE IF NOT EXISTS settings(user_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT, PRIMARY KEY(user_id,key));
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT, instructions TEXT DEFAULT '',
  workspace TEXT DEFAULT '', created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS conversations(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT, title TEXT,
  active_leaf TEXT, created REAL, updated REAL, deleted INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, user_id TEXT NOT NULL,
  parent_id TEXT, role TEXT, content TEXT, meta TEXT DEFAULT '{}', status TEXT DEFAULT 'complete', created REAL);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id);
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(content, message_id UNINDEXED, user_id UNINDEXED, tokenize='unicode61 remove_diacritics 2');
CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT, conversation_id TEXT,
  name TEXT, mime TEXT, size INTEGER, sha256 TEXT, path TEXT, status TEXT, detail TEXT DEFAULT '', created REAL);
CREATE TABLE IF NOT EXISTS chunks(id INTEGER PRIMARY KEY AUTOINCREMENT, file_id TEXT NOT NULL, user_id TEXT NOT NULL,
  project_id TEXT, ord INTEGER, text TEXT, locator TEXT, embedding BLOB, embed_model TEXT);
CREATE INDEX IF NOT EXISTS idx_chunk_file ON chunks(file_id);
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(norm, chunk_id UNINDEXED, user_id UNINDEXED, tokenize='unicode61 remove_diacritics 2');
CREATE TABLE IF NOT EXISTS artifacts(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT, conversation_id TEXT,
  title TEXT, kind TEXT, language TEXT, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS artifact_versions(id TEXT PRIMARY KEY, artifact_id TEXT NOT NULL, user_id TEXT NOT NULL,
  version INTEGER, content TEXT, note TEXT, created REAL);
CREATE TABLE IF NOT EXISTS memories(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, scope TEXT, project_id TEXT, text TEXT,
  source TEXT DEFAULT '{}', status TEXT DEFAULT 'active', created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, project_id TEXT,
  type TEXT, payload TEXT, created REAL);
CREATE TABLE IF NOT EXISTS project_state(project_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, state TEXT, updated REAL);
CREATE TABLE IF NOT EXISTS oplog(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, kind TEXT, detail TEXT,
  status TEXT, created REAL);
CREATE TABLE IF NOT EXISTS edit_backups(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT, root TEXT, rel_path TEXT,
  existed INTEGER, before BLOB, after_sha TEXT, undone INTEGER DEFAULT 0, created REAL);
"""

_local = threading.local()
_db_path: str | None = None


def path() -> str:
    return _db_path or str(config.ensure_home() / "siraj.db")


def set_path(p: str | None) -> None:
    global _db_path
    _db_path = p
    if getattr(_local, "conn", None) is not None:
        _local.conn.close()
        _local.conn = None


def conn() -> sqlite3.Connection:
    c = getattr(_local, "conn", None)
    if c is None or getattr(_local, "path", None) != path():
        c = sqlite3.connect(path(), check_same_thread=False, timeout=30)
        c.row_factory = sqlite3.Row
        c.executescript(SCHEMA)
        _local.conn, _local.path = c, path()
    return c


def q(sql: str, args: Iterable[Any] = ()) -> list[dict]:
    return [dict(r) for r in conn().execute(sql, tuple(args)).fetchall()]


def one(sql: str, args: Iterable[Any] = ()) -> dict | None:
    r = conn().execute(sql, tuple(args)).fetchone()
    return dict(r) if r else None


def run(sql: str, args: Iterable[Any] = ()) -> sqlite3.Cursor:
    c = conn()
    cur = c.execute(sql, tuple(args))
    c.commit()
    return cur


def new_id() -> str:
    return uuid.uuid4().hex


def now() -> float:
    return time.time()


def event(user_id: str, project_id: str | None, type_: str, payload: dict) -> int:
    """Append to the factual event log that project state is derived from."""
    return run("INSERT INTO events(user_id,project_id,type,payload,created) VALUES(?,?,?,?,?)",
               (user_id, project_id, type_, json.dumps(payload, ensure_ascii=False), now())).lastrowid


def op(user_id: str, kind: str, detail: dict, status: str = "ok") -> int:
    """Append to the user-visible operations log (tools, edits, runs, network)."""
    return run("INSERT INTO oplog(user_id,kind,detail,status,created) VALUES(?,?,?,?,?)",
               (user_id, kind, json.dumps(detail, ensure_ascii=False), status, now())).lastrowid


def get_setting(user_id: str, key: str, default: Any = None) -> Any:
    r = one("SELECT value FROM settings WHERE user_id=? AND key=?", (user_id, key))
    return json.loads(r["value"]) if r else default


def set_setting(user_id: str, key: str, value: Any) -> None:
    run("INSERT INTO settings(user_id,key,value) VALUES(?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value",
        (user_id, key, json.dumps(value, ensure_ascii=False)))
