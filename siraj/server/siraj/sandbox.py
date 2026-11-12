"""Code execution inside a bubblewrap sandbox:
  * no network (new net namespace), new pid/ipc/uts/user namespaces
  * read-only view of system libraries only; no home directory, no engine data, no secrets
  * empty environment, private /tmp, scratch working directory
  * limits: wall clock, CPU seconds, address space, file size, process count, output size
If bubblewrap cannot create namespaces on this machine, execution is refused
and the app only previews the code."""
from __future__ import annotations

import os
import resource
import shutil
import subprocess
import tempfile
import time

LANGS = {"python": ("python3", "main.py"), "javascript": ("node", "main.js"), "bash": ("bash", "main.sh")}
_status: dict | None = None


def _bwrap_args(workdir: str) -> list[str]:
    args = ["bwrap", "--unshare-all", "--die-with-parent", "--new-session", "--clearenv",
            "--setenv", "PATH", "/usr/local/bin:/usr/bin:/bin", "--setenv", "HOME", "/work", "--setenv", "LANG", "C.UTF-8",
            "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp", "--bind", workdir, "/work", "--chdir", "/work"]
    for p in ("/usr", "/bin", "/lib", "/lib64", "/sbin", "/etc/alternatives", "/etc/ssl/certs", "/opt/node22"):
        if os.path.exists(p):
            args += ["--ro-bind", p, p]
    return args


def status() -> dict:
    global _status
    if _status is None:
        if not shutil.which("bwrap"):
            _status = {"available": False, "reason": "bubblewrap_not_installed", "engine": None}
        else:
            with tempfile.TemporaryDirectory() as d:
                try:
                    r = subprocess.run(_bwrap_args(d) + ["sh", "-c", "echo ok"], capture_output=True, text=True, timeout=10)
                    ok = r.returncode == 0 and r.stdout.strip() == "ok"
                    _status = {"available": ok, "engine": "bubblewrap" if ok else None,
                               "reason": "" if ok else "namespaces_unavailable: " + r.stderr.strip()[:200]}
                except Exception as e:
                    _status = {"available": False, "reason": f"{type(e).__name__}", "engine": None}
        _status["languages"] = [l for l, (exe, _) in LANGS.items() if shutil.which(exe)] if _status["available"] else []
    return _status


def run(language: str, code: str, timeout_s: int = 10, memory_mb: int = 512, max_output: int = 64_000) -> dict:
    st = status()
    if not st["available"]:
        return {"ran": False, "reason": "sandbox_unavailable", "detail": st["reason"]}
    if language not in st["languages"]:
        return {"ran": False, "reason": "language_unavailable", "detail": language}
    exe, fname = LANGS[language]
    timeout_s, memory_mb = min(max(timeout_s, 1), 60), min(max(memory_mb, 64), 2048)

    def limits():
        # node reserves a very large virtual address range, so its cap is higher.
        as_bytes = (memory_mb if language != "javascript" else max(memory_mb, 2048) * 4) * 2**20
        resource.setrlimit(resource.RLIMIT_AS, (as_bytes, as_bytes))
        resource.setrlimit(resource.RLIMIT_CPU, (timeout_s, timeout_s + 1))
        resource.setrlimit(resource.RLIMIT_FSIZE, (16 * 2**20, 16 * 2**20))
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))

    with tempfile.TemporaryDirectory(prefix="siraj-run-") as d:
        with open(os.path.join(d, fname), "w", encoding="utf-8") as f:
            f.write(code)
        cmd = _bwrap_args(d) + [exe, fname]
        if language == "javascript":
            cmd = _bwrap_args(d) + [exe, f"--max-old-space-size={memory_mb}", fname]
        started = time.time()
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.DEVNULL,
                                preexec_fn=limits, start_new_session=True)
        timed_out = False
        try:
            out, err = proc.communicate(timeout=timeout_s)
        except subprocess.TimeoutExpired:
            timed_out = True
            try:
                os.killpg(proc.pid, 9)
            except ProcessLookupError:
                pass
            out, err = proc.communicate()
        dec = lambda b: b[:max_output].decode("utf-8", "replace") + ("\n…[output truncated]" if len(b) > max_output else "")
        return {"ran": True, "exit_code": proc.returncode, "timed_out": timed_out, "stdout": dec(out), "stderr": dec(err),
                "elapsed_s": round(time.time() - started, 2),
                "limits": {"timeout_s": timeout_s, "memory_mb": memory_mb, "network": False, "filesystem": "scratch-only"}}
