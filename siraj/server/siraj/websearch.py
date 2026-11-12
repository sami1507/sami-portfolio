"""Web search. Results are real or absent: every failure is returned as an
explicit error and nothing is synthesised. Search sends the query to a third
party, so it is refused in local-only mode."""
from __future__ import annotations

import html
import re
import time
from datetime import datetime, timezone
from urllib.parse import parse_qs, unquote, urlparse

import httpx

from . import secrets_store

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
REFERENCE_SUFFIXES = (".gov", ".edu", ".int", ".ac.uk", ".gov.sa", ".edu.sa", ".gov.ae")
REFERENCE_DOMAINS = ("wikipedia.org", "who.int", "un.org", "europa.eu", "nature.com", "arxiv.org", "ietf.org", "w3.org",
                     "developer.mozilla.org", "docs.python.org", "rust-lang.org", "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk")


class SearchError(Exception):
    def __init__(self, code: str, detail: str = ""):
        super().__init__(code)
        self.code, self.detail = code, detail


def source_type(url: str) -> str:
    """A transparent heuristic label, not a guarantee of accuracy."""
    host = (urlparse(url).hostname or "").lower()
    if host.endswith(REFERENCE_SUFFIXES):
        return "official-or-academic"
    if any(host == d or host.endswith("." + d) for d in REFERENCE_DOMAINS):
        return "established-reference"
    return "unclassified"


def _strip(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def _ddg_url(href: str) -> str:
    if href.startswith("//"):
        href = "https:" + href
    q = parse_qs(urlparse(href).query)
    return unquote(q["uddg"][0]) if "uddg" in q else href


_DATE = re.compile(r"\b(\d{4}-\d{2}-\d{2})T?|\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, \d{4})")


def parse_ddg(page: str) -> list[dict]:
    out = []
    blocks = re.split(r'<div class="result results_links', page)[1:]
    for b in blocks:
        a = re.search(r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', b, re.S)
        if not a:
            continue
        url = _ddg_url(html.unescape(a.group(1)))
        if "duckduckgo.com/y.js" in url:
            continue  # advertisement
        sn = re.search(r'class="result__snippet"[^>]*>(.*?)</a>', b, re.S)
        snippet = _strip(sn.group(1)) if sn else ""
        d = _DATE.search(_strip(b))
        out.append({"title": _strip(a.group(2)), "url": url, "snippet": snippet,
                    "published": (d.group(1) or d.group(2)) if d else None})
    return out


async def search(query: str, k: int = 5) -> dict:
    started = time.time()
    searx = secrets_store.get("searxng_url")
    try:
        async with httpx.AsyncClient(timeout=12, headers={"User-Agent": UA}, follow_redirects=True) as c:
            if searx:
                provider = "searxng"
                r = await c.get(searx.rstrip("/") + "/search", params={"q": query, "format": "json"})
                r.raise_for_status()
                results = [{"title": x.get("title", ""), "url": x.get("url", ""), "snippet": x.get("content", ""),
                            "published": (x.get("publishedDate") or None)} for x in r.json().get("results", [])]
            else:
                provider = "duckduckgo-html"
                r = await c.post("https://html.duckduckgo.com/html/", data={"q": query})
                if r.status_code == 202 or "anomaly" in r.text[:5000]:
                    raise SearchError("search_provider_blocked", "The search provider asked for a human check.")
                r.raise_for_status()
                results = parse_ddg(r.text)
    except SearchError:
        raise
    except httpx.HTTPStatusError as e:
        raise SearchError("search_http_error", f"HTTP {e.response.status_code}")
    except httpx.HTTPError as e:
        raise SearchError("search_unreachable", f"{type(e).__name__}: {e}")
    results = [x for x in results if x["url"].startswith("http")][:k]
    if not results:
        raise SearchError("no_results", "The provider returned no results for this query.")
    for x in results:
        x["domain"] = urlparse(x["url"]).hostname
        x["source_type"] = source_type(x["url"])
    return {"provider": provider, "query": query, "retrieved_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "elapsed_s": round(time.time() - started, 2), "results": results}
