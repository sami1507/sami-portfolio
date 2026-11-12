"""Authentication. Local mode: a single implicit user guarded by the
installation token. Server mode: email + password accounts with bearer tokens."""
from __future__ import annotations

import hashlib
import hmac
import secrets

from fastapi import Header, HTTPException

from . import config, db


def _hash_pw(pw: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    h = hashlib.scrypt(pw.encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)
    return salt.hex() + "$" + h.hex()


def _check_pw(pw: str, stored: str) -> bool:
    salt, _ = stored.split("$")
    return hmac.compare_digest(_hash_pw(pw, bytes.fromhex(salt)), stored)


def _th(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def register(email: str, password: str) -> str:
    email = email.strip().lower()
    if "@" not in email or len(password) < 8:
        raise HTTPException(400, "invalid_email_or_short_password")
    if db.one("SELECT id FROM users WHERE email=?", (email,)):
        raise HTTPException(409, "email_exists")
    uid = db.new_id()
    db.run("INSERT INTO users(id,email,pw_hash,created) VALUES(?,?,?,?)", (uid, email, _hash_pw(password), db.now()))
    return issue(uid)


def login(email: str, password: str) -> str:
    u = db.one("SELECT * FROM users WHERE email=?", (email.strip().lower(),))
    if not u or not _check_pw(password, u["pw_hash"]):
        raise HTTPException(401, "bad_credentials")
    return issue(u["id"])


def issue(user_id: str) -> str:
    tok = secrets.token_urlsafe(32)
    db.run("INSERT INTO tokens(token_hash,user_id,created) VALUES(?,?,?)", (_th(tok), user_id, db.now()))
    return tok


def revoke(token: str) -> None:
    db.run("DELETE FROM tokens WHERE token_hash=?", (_th(token),))


def current_user(authorization: str | None = Header(default=None)) -> str:
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(401, "missing_token")
    if config.MODE == "local":
        if hmac.compare_digest(token, config.local_token()):
            return config.LOCAL_USER
        raise HTTPException(401, "bad_token")
    r = db.one("SELECT user_id FROM tokens WHERE token_hash=?", (_th(token),))
    if not r:
        raise HTTPException(401, "bad_token")
    return r["user_id"]
