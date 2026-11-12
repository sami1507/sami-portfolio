"""File ingestion: turn a file into text units that each carry a locator
(page, line range, or paragraph range) so answers can cite exact places."""
from __future__ import annotations

import csv
import io
import shutil
from pathlib import Path

TEXT_EXT = {".txt", ".md", ".markdown", ".csv", ".tsv", ".json", ".yaml", ".yml", ".toml", ".ini", ".xml", ".html", ".css",
            ".py", ".js", ".jsx", ".ts", ".tsx", ".rs", ".go", ".java", ".kt", ".c", ".h", ".cpp", ".hpp", ".cs", ".rb",
            ".php", ".swift", ".sh", ".sql", ".r", ".lua", ".dart", ".vue", ".svelte", ".tex", ".log", ".env.example"}
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff", ".gif"}


class ExtractError(Exception):
    pass


def ocr_available() -> tuple[bool, list[str]]:
    if not shutil.which("tesseract"):
        return False, []
    try:
        import pytesseract
        return True, sorted(l for l in pytesseract.get_languages(config="") if l != "osd")
    except Exception:
        return False, []


def kind_of(name: str) -> str:
    ext = Path(name).suffix.lower()
    if ext == ".pdf":
        return "pdf"
    if ext == ".docx":
        return "docx"
    if ext in IMAGE_EXT:
        return "image"
    if ext in TEXT_EXT or not ext:
        return "text"
    return "unknown"


def _decode(data: bytes) -> str:
    for enc in ("utf-8-sig", "utf-16", "cp1256", "latin-1"):
        try:
            return data.decode(enc)
        except UnicodeError:
            continue
    raise ExtractError("cannot_decode_text")


def ocr_image(data: bytes) -> str:
    ok, langs = ocr_available()
    if not ok:
        raise ExtractError("ocr_unavailable")
    import pytesseract
    from PIL import Image
    lang = "+".join(l for l in ("ara", "eng") if l in langs) or langs[0]
    return pytesseract.image_to_string(Image.open(io.BytesIO(data)), lang=lang)


def extract(name: str, data: bytes) -> tuple[list[dict], str]:
    """Return (units, note). Each unit: {"text", "locator"}."""
    kind = kind_of(name)
    if kind == "pdf":
        from pypdf import PdfReader
        try:
            reader = PdfReader(io.BytesIO(data))
        except Exception as e:
            raise ExtractError(f"bad_pdf: {e}")
        units, empty = [], 0
        for i, page in enumerate(reader.pages, 1):
            text = (page.extract_text() or "").strip()
            if text:
                units.append({"text": text, "locator": {"page": i}})
            else:
                empty += 1
        note = ""
        if empty:
            note = f"{empty} page(s) had no text layer (scanned?); they were not indexed. OCR of PDF pages is not implemented."
        if not units:
            raise ExtractError("pdf_has_no_text_layer")
        return units, note
    if kind == "docx":
        import docx
        try:
            d = docx.Document(io.BytesIO(data))
        except Exception as e:
            raise ExtractError(f"bad_docx: {e}")
        units = [{"text": p.text.strip(), "locator": {"paragraph": i}} for i, p in enumerate(d.paragraphs, 1) if p.text.strip()]
        for ti, t in enumerate(d.tables, 1):
            for ri, row in enumerate(t.rows, 1):
                cells = " | ".join(c.text.strip() for c in row.cells)
                if cells.strip(" |"):
                    units.append({"text": cells, "locator": {"table": ti, "row": ri}})
        if not units:
            raise ExtractError("docx_is_empty")
        return units, ""
    if kind == "image":
        text = ocr_image(data).strip()
        if not text:
            raise ExtractError("ocr_found_no_text")
        return [{"text": text, "locator": {"ocr": True}}], "Text obtained by OCR (Tesseract); recognition errors are possible."
    if kind == "text":
        text = _decode(data)
        if Path(name).suffix.lower() in (".csv", ".tsv"):
            try:
                csv.Sniffer().sniff(text[:2000])
            except csv.Error:
                pass
        units = [{"text": line, "locator": {"line": i}} for i, line in enumerate(text.splitlines(), 1)]
        if not any(u["text"].strip() for u in units):
            raise ExtractError("file_is_empty")
        return units, ""
    raise ExtractError("unsupported_file_type")


def chunk(units: list[dict], target: int = 900, overlap_lines: int = 2) -> list[dict]:
    """Group units into retrieval chunks while keeping locators exact."""
    chunks: list[dict] = []
    if not units:
        return chunks
    first = units[0]["locator"]
    if "page" in first or "ocr" in first:
        for u in units:
            text, loc = u["text"], u["locator"]
            paras, buf = [p for p in text.split("\n") if p.strip()], ""
            for p in paras:
                if buf and len(buf) + len(p) > target:
                    chunks.append({"text": buf.strip(), "locator": dict(loc)})
                    buf = buf[-150:] if len(buf) > 150 else ""
                while len(p) > target * 1.5:
                    chunks.append({"text": (buf + " " + p[:target]).strip(), "locator": dict(loc)})
                    buf, p = "", p[target - 100:]
                buf += "\n" + p
            if buf.strip():
                chunks.append({"text": buf.strip(), "locator": dict(loc)})
        return chunks
    key = "line" if "line" in first else None
    i = 0
    while i < len(units):
        buf, j = [], i
        size = 0
        while j < len(units) and (size < target or not buf):
            buf.append(units[j])
            size += len(units[j]["text"]) + 1
            j += 1
        text = "\n".join(u["text"] for u in buf)
        if text.strip():
            if key:
                loc = {"line_start": buf[0]["locator"]["line"], "line_end": buf[-1]["locator"]["line"]}
            else:
                loc = {"start": buf[0]["locator"], "end": buf[-1]["locator"]}
            chunks.append({"text": text, "locator": loc})
        if j >= len(units):
            break
        i = max(j - (overlap_lines if key else 0), i + 1)
    return chunks


def locator_label(loc: dict, lang: str = "ar") -> str:
    ar = lang == "ar"
    if "page" in loc:
        return f"ص {loc['page']}" if ar else f"p. {loc['page']}"
    if "line_start" in loc:
        a, b = loc["line_start"], loc["line_end"]
        return (f"الأسطر {a}–{b}" if ar else f"lines {a}–{b}") if a != b else (f"السطر {a}" if ar else f"line {a}")
    if "start" in loc:
        s, e = loc["start"], loc["end"]
        if "paragraph" in s and "paragraph" in e:
            return f"الفقرات {s['paragraph']}–{e['paragraph']}" if ar else f"paragraphs {s['paragraph']}–{e['paragraph']}"
        return "جدول" if ar else "table"
    if loc.get("ocr"):
        return "نص مستخرج بالتعرف الضوئي" if ar else "OCR text"
    return ""
