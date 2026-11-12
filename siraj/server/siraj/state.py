"""Project state: goal, decisions, achievements, blockers, next step.

Every item must point at real rows of the event log. The model only
*summarises* events; an item whose event ids do not exist is dropped, so the
state cannot contain something that did not happen in the project."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from . import db, llm_json
from .auth import current_user
from .projects import get_project
from .providers import ProviderError

router = APIRouter(prefix="/api")

SYSTEM = """You maintain a factual status board for a project from its event log. Output ONLY JSON:
{"goal": {"text": str, "events": [int]} or null,
 "decisions": [{"text": str, "events": [int]}],
 "achievements": [{"text": str, "events": [int]}],
 "blockers": [{"text": str, "events": [int]}],
 "next_step": {"text": str, "events": [int]} or null}
Rules: every item must cite the ids of the events (the numbers after #) that support it. Use only what the events say.
Write in the language used in the events. If the log does not show a goal, a blocker or a next step, use null or [].
Keep each text to one sentence. At most 5 items per list."""


class GoalBody(BaseModel):
    goal: str


def _events(user: str, pid: str, limit: int = 60) -> list[dict]:
    rows = db.q("SELECT id,type,payload,created FROM events WHERE user_id=? AND project_id=? ORDER BY id DESC LIMIT ?", (user, pid, limit))[::-1]
    for r in rows:
        r["payload"] = json.loads(r["payload"])
    return rows


def _line(e: dict) -> str:
    p, t = e["payload"], e["type"]
    if t == "exchange":
        return f"#{e['id']} conversation: user asked «{p['question'][:200]}» ; assistant answered «{p['answer'][:250]}»"
    if t == "goal_set":
        return f"#{e['id']} user set the project goal: «{p['goal']}»"
    return f"#{e['id']} {t}: {json.dumps(p, ensure_ascii=False)[:300]}"


def facts(user: str, pid: str) -> dict:
    """Deterministic part of the state, computed with SQL only."""
    c = lambda sql: db.one(sql, (user, pid))["n"]
    return {
        "files": c("SELECT count(*) n FROM files WHERE user_id=? AND project_id=?"),
        "conversations": c("SELECT count(*) n FROM conversations WHERE user_id=? AND project_id=? AND deleted=0"),
        "artifacts": c("SELECT count(*) n FROM artifacts WHERE user_id=? AND project_id=?"),
        "edits_applied": c("SELECT count(*) n FROM edit_backups WHERE user_id=? AND project_id=? AND undone=0"),
        "events": c("SELECT count(*) n FROM events WHERE user_id=? AND project_id=?"),
    }


@router.get("/projects/{pid}/state")
def get_state(pid: str, user: str = Depends(current_user)):
    get_project(user, pid)
    row = db.one("SELECT state,updated FROM project_state WHERE project_id=? AND user_id=?", (pid, user))
    last = db.one("SELECT max(id) m FROM events WHERE user_id=? AND project_id=?", (user, pid))["m"] or 0
    state = json.loads(row["state"]) if row else None
    return {"state": state, "updated": row["updated"] if row else None, "facts": facts(user, pid),
            "stale": bool(state is None or state.get("through_event", 0) < last), "events": _events(user, pid, 30)}


@router.put("/projects/{pid}/goal")
def set_goal(pid: str, b: GoalBody, user: str = Depends(current_user)):
    get_project(user, pid)
    if not b.goal.strip():
        raise HTTPException(400, "goal_required")
    db.event(user, pid, "goal_set", {"goal": b.goal.strip()})
    return {"ok": True}


def _valid(item, ids: set[int]) -> dict | None:
    if not isinstance(item, dict) or not str(item.get("text", "")).strip():
        return None
    ev = []
    for x in item.get("events") or []:
        try:
            ev.append(int(x))
        except (TypeError, ValueError):
            pass
    ev = [x for x in ev if x in ids]
    return {"text": str(item["text"]).strip(), "events": ev} if ev else None


@router.post("/projects/{pid}/state/refresh")
async def refresh(pid: str, user: str = Depends(current_user)):
    get_project(user, pid)
    events = _events(user, pid)
    if not events:
        raise HTTPException(400, "no_events_yet")
    ids = {e["id"] for e in events}
    try:
        raw, model = await llm_json.ask(user, SYSTEM, "Event log:\n" + "\n".join(_line(e) for e in events), max_tokens=900)
    except (ProviderError, ValueError) as e:
        raise HTTPException(502, f"state_refresh_failed: {e}")
    if not isinstance(raw, dict):
        raise HTTPException(502, "state_refresh_failed: not_an_object")
    state, dropped = {}, 0
    for key in ("goal", "next_step"):
        v = _valid(raw.get(key), ids)
        dropped += 1 if raw.get(key) and not v else 0
        state[key] = v
    for key in ("decisions", "achievements", "blockers"):
        items = raw.get(key) if isinstance(raw.get(key), list) else []
        good = [v for v in (_valid(i, ids) for i in items) if v]
        dropped += len(items) - len(good)
        state[key] = good[:5]
    # A goal the user typed explicitly always wins over a model summary.
    explicit = [e for e in events if e["type"] == "goal_set"]
    if explicit:
        state["goal"] = {"text": explicit[-1]["payload"]["goal"], "events": [explicit[-1]["id"]], "explicit": True}
    state.update({"through_event": max(ids), "model": model, "dropped_unsupported": dropped})
    db.run("INSERT INTO project_state(project_id,user_id,state,updated) VALUES(?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET state=excluded.state,updated=excluded.updated",
           (pid, user, json.dumps(state, ensure_ascii=False), db.now()))
    return get_state(pid, user)
