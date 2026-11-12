"""Hardware probe and model recommendation. Numbers are measured, not assumed:
RAM from the OS, GPU/VRAM from nvidia-smi when it exists."""
from __future__ import annotations

import platform
import shutil
import subprocess

import psutil


def probe() -> dict:
    vm = psutil.virtual_memory()
    gpus = []
    if shutil.which("nvidia-smi"):
        try:
            out = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total,memory.free", "--format=csv,noheader,nounits"],
                                 capture_output=True, text=True, timeout=5).stdout
            for line in out.strip().splitlines():
                name, total, free = [x.strip() for x in line.split(",")]
                gpus.append({"name": name, "vram_mb": int(total), "vram_free_mb": int(free)})
        except Exception:
            pass
    apple = platform.system() == "Darwin" and platform.machine() == "arm64"
    return {"os": platform.system(), "arch": platform.machine(), "cpu_cores": psutil.cpu_count(logical=False) or psutil.cpu_count(),
            "cpu_threads": psutil.cpu_count(), "ram_gb": round(vm.total / 2**30, 1), "ram_available_gb": round(vm.available / 2**30, 1),
            "gpus": gpus, "apple_silicon_unified_memory": apple}


def budget_gb(hw: dict) -> tuple[float, str]:
    """Memory a model may use: VRAM when a GPU exists, otherwise half of RAM
    (CPU inference must leave room for the OS, the app and the context)."""
    if hw["gpus"]:
        return max(g["vram_mb"] for g in hw["gpus"]) / 1024, "gpu"
    if hw["apple_silicon_unified_memory"]:
        return hw["ram_gb"] * 0.6, "apple-gpu"
    return hw["ram_gb"] * 0.5, "cpu"


def recommend(hw: dict, models: list[dict]) -> dict:
    """Pick the largest installed chat model that fits; on CPU also cap the
    size, because a model that fits but answers at 2 tokens/s is not usable."""
    budget, device = budget_gb(hw)
    cap = budget if device != "cpu" else min(budget, 3.5)
    chat = [m for m in models if "completion" in m["capabilities"] and m.get("size_bytes")]
    fit = [m for m in chat if m["size_bytes"] / 2**30 * 1.25 <= cap]
    best = max(fit, key=lambda m: m["size_bytes"], default=None)
    return {"device": device, "memory_budget_gb": round(budget, 1), "size_cap_gb": round(cap, 1),
            "recommended": best["id"] if best else None,
            "fits": [m["id"] for m in fit], "too_large": [m["id"] for m in chat if m not in fit]}
