"""Stream-search API for ultravioletadao.xyz (/stream-summaries search box).

Serves full-text search over the AbraKadabra transcript corpus (SQLite FTS5
index built by scripts/build_stream_search_index.py and uploaded to
s3://ultravioletadao/stream-search/search.db).

Endpoints (Lambda Function URL, payload v2):
  GET /?q=<query>&limit=20   -> {query, results: [...]}
  GET /stats                 -> {streams, segments, built_at}

Results carry the exact quote (with <mark> highlights), the stream date and a
deep link to the Twitch VOD at the second the phrase was said. CORS is handled
by the Function URL configuration - do not add CORS headers here.
"""
import json
import os
import re
import sqlite3
import urllib.parse

import boto3

BUCKET = os.environ.get("INDEX_BUCKET", "ultravioletadao")
KEY = os.environ.get("INDEX_KEY", "stream-search/search.db")
DB_PATH = "/tmp/search.db"
MAX_LIMIT = 50

_conn = None


def _connection():
    global _conn
    if _conn is None:
        if not os.path.exists(DB_PATH):
            boto3.client("s3").download_file(BUCKET, KEY, DB_PATH)
        _conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    return _conn


def _fts_query(raw):
    """User text -> safe FTS5 query: quoted tokens, implicit AND."""
    tokens = re.findall(r"\w+", raw, re.UNICODE)[:12]
    return " ".join(f'"{t}"' for t in tokens)


def _t_param(seconds):
    s = max(0, int(seconds))
    return f"{s // 3600}h{(s % 3600) // 60}m{s % 60}s"


def _respond(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json; charset=utf-8",
                    "Cache-Control": "public, max-age=300"},
        "body": json.dumps(body, ensure_ascii=False),
    }


def handler(event, context):
    path = (event.get("rawPath") or "/").rstrip("/") or "/"
    params = event.get("queryStringParameters") or {}

    conn = _connection()

    if path == "/stats":
        meta = dict(conn.execute("SELECT key, value FROM meta"))
        return _respond(200, meta)

    raw_q = urllib.parse.unquote_plus(params.get("q", "")).strip()
    if not raw_q or len(raw_q) < 2:
        return _respond(400, {"error": "q must be at least 2 characters"})

    limit = min(MAX_LIMIT, max(1, int(params.get("limit", "20") or 20)))
    fts = _fts_query(raw_q)
    if not fts:
        return _respond(400, {"error": "no searchable terms in q"})

    rows = conn.execute(
        """
        SELECT s.vod_id, st.stream_date, st.title, s.start_time,
               snippet(seg_fts, 0, '<mark>', '</mark>', '…', 24) AS snip
        FROM seg_fts
        JOIN segments s ON s.id = seg_fts.rowid
        JOIN streams  st ON st.vod_id = s.vod_id
        WHERE seg_fts MATCH ?
        ORDER BY bm25(seg_fts)
        LIMIT ?
        """,
        (fts, limit),
    ).fetchall()

    results = []
    for vod_id, date, title, start, snip in rows:
        d = f"{date[6:8]}/{date[4:6]}/{date[0:4]}"
        results.append({
            "vod_id": vod_id,
            "date": date,
            "date_formatted": d,
            "title": title,
            "start_time": start,
            "snippet": snip,
            "t": _t_param(start),
            "url": f"https://www.twitch.tv/videos/{vod_id}?t={_t_param(start)}",
        })

    return _respond(200, {"query": raw_q, "count": len(results), "results": results})
