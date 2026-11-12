"""Benchmark installed local chat models on THIS machine: speed, Arabic,
coding. Small, automatically-checked task sets; results are indicative only.

  python eval/model_bench.py qwen2.5:1.5b qwen3:4b ...
"""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))
from siraj import hardware, sandbox  # noqa: E402

URL = "http://127.0.0.1:11434"
ARABIC = [  # (question, any-of expected substrings after normalisation)
    ("ما عاصمة المملكة العربية السعودية؟ أجب بكلمة واحدة.", ["الرياض"]),
    ("كم يساوي سبعة مضروبًا في ثمانية؟ اكتب الرقم فقط.", ["56", "٥٦"]),
    ("ما جمع كلمة «كتاب»؟ أجب بكلمة واحدة.", ["كتب"]),
    ("ما عكس كلمة «طويل»؟ أجب بكلمة واحدة.", ["قصير"]),
    ("ترجم إلى العربية كلمة واحدة فقط: library", ["مكتبه", "مكتبة"]),
    ("أكمل المثل: «العقل السليم في الجسم ...». أجب بكلمة واحدة.", ["السليم"]),
    ("كم عدد أيام الأسبوع؟ اكتب الرقم فقط.", ["7", "٧", "سبعه", "سبعة"]),
    ("في أي قارة تقع مصر؟ أجب بكلمة واحدة.", ["افريقيا", "أفريقيا", "إفريقيا"]),
    ("لخّص في جملة عربية واحدة: «أعلنت البلدية إغلاق الجسر القديم للصيانة مدة أسبوعين اعتبارًا من يوم الأحد، ودعت السائقين إلى استخدام الطريق الدائري.»", ["الجسر"]),
    ("صحّح الخطأ الإملائي وأعد كتابة الجملة فقط: «ذهبت الى المدرسه مسرعن».", ["مسرعا", "مسرعًا"]),
]
CODING = [
    ("Write a Python function `is_palindrome(s: str) -> bool` that ignores case and non-alphanumeric characters. Return only code.",
     "assert is_palindrome('A man, a plan, a canal: Panama')\nassert not is_palindrome('hello')\nassert is_palindrome('')\nprint('PASS')"),
    ("Write a Python function `fib(n: int) -> int` returning the n-th Fibonacci number with fib(0)=0, fib(1)=1. Return only code.",
     "assert [fib(i) for i in range(10)]==[0,1,1,2,3,5,8,13,21,34]\nassert fib(50)==12586269025\nprint('PASS')"),
    ("اكتب دالة بايثون `count_words(text: str) -> dict` تعيد قاموسًا بعدد مرات ظهور كل كلمة (الكلمات مفصولة بمسافات، مع تحويل الأحرف إلى صغيرة). أعد الشيفرة فقط.",
     "assert count_words('a b a')=={'a':2,'b':1}\nassert count_words('Hi hi')=={'hi':2}\nassert count_words('')=={}\nprint('PASS')"),
    ("Write a Python function `merge_intervals(xs: list[tuple[int,int]]) -> list[tuple[int,int]]` that merges overlapping intervals and returns them sorted. Return only code.",
     "assert merge_intervals([(1,3),(2,6),(8,10),(15,18)])==[(1,6),(8,10),(15,18)]\nassert merge_intervals([(1,4),(4,5)])==[(1,5)]\nassert merge_intervals([])==[]\nprint('PASS')"),
    ("Write a Python function `flatten(x)` that flattens an arbitrarily nested list of ints into a flat list. Return only code.",
     "assert flatten([1,[2,[3,[4]],5]])==[1,2,3,4,5]\nassert flatten([])==[]\nprint('PASS')"),
]


def norm(t: str) -> str:
    t = re.sub(r"[ً-ٰٟـ]", "", t)
    return re.sub("[إأآ]", "ا", t).replace("ة", "ه")


def gen(model: str, prompt: str, max_tokens: int = 300) -> dict:
    r = httpx.post(f"{URL}/api/chat", timeout=600, trust_env=False, json={
        "model": model, "stream": False, "think": False, "messages": [{"role": "user", "content": prompt}],
        "options": {"temperature": 0, "num_predict": max_tokens, "seed": 1}})
    if r.status_code != 200:
        r = httpx.post(f"{URL}/api/chat", timeout=600, trust_env=False, json={
            "model": model, "stream": False, "messages": [{"role": "user", "content": prompt}],
            "options": {"temperature": 0, "num_predict": max_tokens, "seed": 1}})
    r.raise_for_status()
    return r.json()


def bench(model: str) -> dict:
    show = httpx.post(f"{URL}/api/show", json={"model": model}, trust_env=False).json()
    gen(model, "hi", 5)  # load into memory so the load time is not counted
    toks = dur = 0
    ar_ok, ar_script, ar_log = 0, 0, []
    for q, expect in ARABIC:
        j = gen(model, q, 120)
        a = re.sub(r"<think>.*?</think>", "", j["message"]["content"], flags=re.S).strip()
        toks += j.get("eval_count", 0)
        dur += j.get("eval_duration", 0)
        ok = any(norm(e) in norm(a) for e in expect)
        arabic_ratio = len(re.findall(r"[؀-ۿ]", a)) / max(1, len(re.findall(r"[^\W\d_]", a)))
        ar_ok += ok
        ar_script += arabic_ratio > 0.8 or a.strip().isdigit() or bool(re.fullmatch(r"[\d٠-٩\s.]+", a))
        ar_log.append({"q": q, "a": a[:200], "ok": ok})
    code_ok, code_log = 0, []
    for q, test in CODING:
        j = gen(model, q, 500)
        a = re.sub(r"<think>.*?</think>", "", j["message"]["content"], flags=re.S)
        toks += j.get("eval_count", 0)
        dur += j.get("eval_duration", 0)
        m = re.search(r"```(?:python)?\n(.*?)```", a, re.S)
        code = m.group(1) if m else a
        res = sandbox.run("python", code + "\n\n" + test, timeout_s=10)
        ok = res.get("ran") and res.get("exit_code") == 0 and "PASS" in res.get("stdout", "")
        code_ok += bool(ok)
        code_log.append({"q": q[:60], "ok": bool(ok), "stderr": res.get("stderr", "")[-200:]})
    lic = next((l.strip() for l in (show.get("license") or "").splitlines() if l.strip()), "unknown")
    return {"model": model, "parameters": show["details"].get("parameter_size"), "quantization": show["details"].get("quantization_level"),
            "capabilities": show.get("capabilities"), "license": lic[:70],
            "tokens_per_s": round(toks / (dur / 1e9), 1) if dur else None,
            "arabic_correct": f"{ar_ok}/{len(ARABIC)}", "arabic_script_answers": f"{ar_script}/{len(ARABIC)}",
            "coding_passed": f"{code_ok}/{len(CODING)}", "arabic_log": ar_log, "coding_log": code_log}


if __name__ == "__main__":
    out = {"hardware": hardware.probe(), "date": time.strftime("%Y-%m-%d"), "results": []}
    for m in sys.argv[1:]:
        r = bench(m)
        out["results"].append(r)
        print({k: v for k, v in r.items() if not k.endswith("_log")}, flush=True)
        Path(__file__).parent.joinpath("results", "model_bench.json").write_text(json.dumps(out, ensure_ascii=False, indent=2))
