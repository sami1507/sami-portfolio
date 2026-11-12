"""Retrieval. Two signals fused with reciprocal-rank fusion:
  * dense: embeddings from a local Ollama embedding model, cosine in numpy
  * lexical: SQLite FTS5 (BM25) over Arabic-normalised text
`mode="vector"` keeps the dense-only baseline available so the benefit of the
hybrid can be measured (see eval/retrieval_eval.py)."""
from __future__ import annotations

import json
import re

import numpy as np

from . import db, files
from .providers import ProviderError
from .providers.ollama import OllamaProvider

EMBED_PREFERENCE = ("bge-m3", "nomic-embed-text", "mxbai-embed-large", "all-minilm")
_AR_DIAC = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭـ]")
_TOKEN = re.compile(r"[\w]+", re.UNICODE)
AR_STOP = set("في من على إلى الى عن مع هذا هذه ذلك التي الذي ما هل كم كيف هو هي ان أن إن او أو ثم قد لا لم لن كان كانت و يا".split())
EN_STOP = set("the a an of to in on for and or is are was were be what which who how does do did it this that with as at by from".split())


def normalize(text: str) -> str:
    """Arabic-aware normalisation for the lexical index: strip diacritics and
    tatweel, unify alef/yaa/taa-marbuta variants, lowercase Latin."""
    t = _AR_DIAC.sub("", text)
    t = re.sub("[إأآٱ]", "ا", t).replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي")
    return t.lower()


def _terms(query: str) -> list[str]:
    out = []
    for tok in _TOKEN.findall(normalize(query)):
        if len(tok) < 2 or tok in AR_STOP or tok in EN_STOP:
            continue
        out.append(tok)
        # Arabic clitics: also search the word without a leading "ال"/"و"/"ب"/"ل".
        for pre in ("وال", "بال", "لل", "ال", "و", "ب", "ل"):
            if tok.startswith(pre) and len(tok) - len(pre) >= 3:
                out.append(tok[len(pre):])
                break
    return list(dict.fromkeys(out))


async def embed_model() -> str | None:
    try:
        models = await OllamaProvider().list_models()
    except ProviderError:
        return None
    names = [m.id for m in models if "embedding" in m.capabilities]
    for pref in EMBED_PREFERENCE:
        for n in names:
            if n.split(":")[0] == pref:
                return n
    return names[0] if names else None


async def index_file(user_id: str, file_id: str, project_id: str | None, units: list[dict]) -> dict:
    chunks = files.chunk(units)
    model = await embed_model()
    vectors: list[list[float]] | None = None
    if model and chunks:
        vectors = []
        for i in range(0, len(chunks), 16):
            vectors += await OllamaProvider().embed(model, [c["text"] for c in chunks[i:i + 16]])
    c = db.conn()
    for i, ch in enumerate(chunks):
        emb = np.asarray(vectors[i], dtype=np.float32).tobytes() if vectors else None
        cur = c.execute("INSERT INTO chunks(file_id,user_id,project_id,ord,text,locator,embedding,embed_model) VALUES(?,?,?,?,?,?,?,?)",
                        (file_id, user_id, project_id, i, ch["text"], json.dumps(ch["locator"]), emb, model))
        c.execute("INSERT INTO chunks_fts(norm,chunk_id,user_id) VALUES(?,?,?)", (normalize(ch["text"]), cur.lastrowid, user_id))
    c.commit()
    return {"chunks": len(chunks), "embed_model": model}


def delete_file_index(user_id: str, file_id: str) -> None:
    ids = [r["id"] for r in db.q("SELECT id FROM chunks WHERE file_id=? AND user_id=?", (file_id, user_id))]
    c = db.conn()
    for i in ids:
        c.execute("DELETE FROM chunks_fts WHERE chunk_id=?", (i,))
    c.execute("DELETE FROM chunks WHERE file_id=? AND user_id=?", (file_id, user_id))
    c.commit()


def _scope_rows(user_id: str, file_ids: list[str]) -> list[dict]:
    if not file_ids:
        return []
    marks = ",".join("?" * len(file_ids))
    return db.q(f"SELECT c.id,c.file_id,c.text,c.locator,c.embedding,c.embed_model,f.name FROM chunks c JOIN files f ON f.id=c.file_id "
                f"WHERE c.user_id=? AND f.user_id=? AND c.file_id IN ({marks})", (user_id, user_id, *file_ids))


async def retrieve(user_id: str, query: str, file_ids: list[str], k: int = 5, mode: str = "hybrid",
                   min_score: float = 0.0) -> list[dict]:
    rows = _scope_rows(user_id, file_ids)
    if not rows:
        return []
    by_id = {r["id"]: r for r in rows}
    dense_rank: list[int] = []
    sims: dict[int, float] = {}
    model = next((r["embed_model"] for r in rows if r["embedding"]), None)
    if model:
        try:
            qv = np.asarray((await OllamaProvider().embed(model, [query]))[0], dtype=np.float32)
            emb_rows = [r for r in rows if r["embedding"] and r["embed_model"] == model]
            mat = np.vstack([np.frombuffer(r["embedding"], dtype=np.float32) for r in emb_rows])
            s = (mat @ qv) / (np.linalg.norm(mat, axis=1) * np.linalg.norm(qv) + 1e-9)
            order = np.argsort(-s)
            dense_rank = [emb_rows[i]["id"] for i in order]
            sims = {emb_rows[i]["id"]: float(s[i]) for i in range(len(emb_rows))}
        except ProviderError:
            dense_rank = []
    lex_rank: list[int] = []
    terms = _terms(query)
    if terms and mode != "vector":
        match = " OR ".join('"' + t.replace('"', "") + '"' for t in terms)
        try:
            hits = db.q("SELECT chunk_id FROM chunks_fts WHERE chunks_fts MATCH ? AND user_id=? ORDER BY bm25(chunks_fts) LIMIT 200",
                        (match, user_id))
            lex_rank = [int(h["chunk_id"]) for h in hits if int(h["chunk_id"]) in by_id]
        except Exception:
            lex_rank = []
    if mode == "vector" or not lex_rank:
        ranked = dense_rank
        fused = {cid: 1.0 / (60 + i) for i, cid in enumerate(ranked)}
    elif not dense_rank:
        ranked = lex_rank
        fused = {cid: 1.0 / (60 + i) for i, cid in enumerate(ranked)}
    else:
        fused: dict[int, float] = {}
        for rank in (dense_rank, lex_rank):
            for i, cid in enumerate(rank):
                fused[cid] = fused.get(cid, 0.0) + 1.0 / (60 + i)
        ranked = sorted(fused, key=lambda c: -fused[c])
    out = []
    lex_set = set(lex_rank)
    for cid in ranked:
        sim = sims.get(cid)
        # Relevance gate: keep a passage only if it is semantically close
        # enough or shares query terms. Otherwise we would cite noise.
        if sim is not None and sim < min_score and cid not in lex_set:
            continue
        r = by_id[cid]
        out.append({"chunk_id": cid, "file_id": r["file_id"], "file": r["name"], "locator": json.loads(r["locator"]),
                    "text": r["text"], "similarity": round(sim, 4) if sim is not None else None,
                    "lexical_match": cid in lex_set, "score": round(fused[cid], 5)})
        if len(out) >= k:
            break
    return out
