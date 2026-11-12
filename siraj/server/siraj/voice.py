"""Speech. Both directions run on this machine:
  speech -> text : faster-whisper (CTranslate2) on CPU/GPU
  text -> speech : espeak-ng (robotic but offline; Arabic and English voices)
Each capability is reported as available only when its engine is present."""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import threading

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from . import config
from .auth import current_user

router = APIRouter(prefix="/api")
STT_MODEL = os.environ.get("SIRAJ_STT_MODEL", "small")
_model = None
_lock = threading.Lock()


class SpeakBody(BaseModel):
    text: str
    lang: str = "ar"


def _stt_installed() -> bool:
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


def _stt_dir() -> str:
    return str(config.ensure_home() / "models" / "whisper")


def _stt_cached() -> bool:
    d = _stt_dir()
    return os.path.isdir(d) and any("model.bin" in fs for _, _, fs in os.walk(d))


def status() -> dict:
    stt = _stt_installed()
    return {
        "stt": {"available": stt and _stt_cached(), "engine": "faster-whisper" if stt else None, "model": STT_MODEL,
                "processing": "local", "model_downloaded": _stt_cached(),
                "reason": "" if stt and _stt_cached() else ("model_not_downloaded" if stt else "faster_whisper_not_installed")},
        "tts": {"available": bool(shutil.which("espeak-ng")), "engine": "espeak-ng" if shutil.which("espeak-ng") else None,
                "processing": "local", "languages": ["ar", "en"] if shutil.which("espeak-ng") else []},
    }


def load_model(allow_download: bool = False):
    global _model
    with _lock:
        if _model is None:
            from faster_whisper import WhisperModel
            _model = WhisperModel(STT_MODEL, device="auto", compute_type="int8", download_root=_stt_dir(),
                                  local_files_only=not allow_download)
        return _model


def transcribe_file(path: str, language: str | None = None) -> dict:
    model = load_model()
    segments, info = model.transcribe(path, language=language, vad_filter=True, beam_size=5)
    text = " ".join(s.text.strip() for s in segments).strip()
    return {"text": text, "language": info.language, "language_probability": round(info.language_probability, 3),
            "duration_s": round(info.duration, 2), "engine": "faster-whisper", "model": STT_MODEL, "processing": "local"}


@router.post("/voice/download-model")
def download_model(user: str = Depends(current_user)):
    """Explicit, user-triggered one-time download of the speech model."""
    if config.MODE != "local":
        raise HTTPException(403, "local_mode_only")
    if not _stt_installed():
        raise HTTPException(501, "faster_whisper_not_installed")
    try:
        load_model(allow_download=True)
    except Exception as e:
        raise HTTPException(502, f"download_failed: {type(e).__name__}: {e}")
    return status()["stt"]


@router.post("/voice/transcribe")
def transcribe(file: UploadFile = File(...), language: str | None = None, user: str = Depends(current_user)):
    st = status()["stt"]
    if not st["available"]:
        raise HTTPException(501, st["reason"])
    data = file.file.read()
    if len(data) > 25 * 2**20:
        raise HTTPException(413, "audio_too_large")
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix) as f:
        f.write(data)
        f.flush()
        try:
            return transcribe_file(f.name, language if language in ("ar", "en") else None)
        except Exception as e:
            raise HTTPException(422, f"transcription_failed: {type(e).__name__}")


def synthesize(text: str, lang: str) -> bytes:
    with tempfile.NamedTemporaryFile(suffix=".wav") as f:
        subprocess.run(["espeak-ng", "-v", "ar" if lang == "ar" else "en-us", "-s", "150", "-w", f.name, text[:4000]],
                       check=True, capture_output=True, timeout=60)
        return open(f.name, "rb").read()


@router.post("/voice/speak")
def speak(b: SpeakBody, user: str = Depends(current_user)):
    if not shutil.which("espeak-ng"):
        raise HTTPException(501, "tts_unavailable")
    if not b.text.strip():
        raise HTTPException(400, "text_required")
    return Response(synthesize(b.text, b.lang), media_type="audio/wav")
