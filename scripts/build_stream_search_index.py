#!/usr/bin/env python3
"""Build the stream-search SQLite FTS5 index from AbraKadabra transcripts.

Reads every streamers/<streamer>/<YYYYMMDD>/<vodId>/transcripcion.json
(AWS Transcribe output) and indexes its `results.audio_segments` (sentence-level
segments with relative start/end times). Segment start_time maps 1:1 to the
Twitch VOD timeline, so search results can deep-link to
https://www.twitch.tv/videos/<vodId>?t=XhYmZs without any clock calibration.

Always a full rebuild: 428 streams / 610k segments / 1.07 GB of JSON take 16 s
on the streamer's machine (measured 2026-09-23), so incremental isn't worth it.

The automatic refresh (scripts/refresh_stream_search.py, hourly scheduled task)
imports build() from here. Manual usage (backup path, docs/STREAM_SEARCH.md):
  python3 scripts/build_stream_search_index.py \
      --corpus /mnt/z/ultravioleta/ai/cursor/abracadabra/streamers/0xultravioleta \
      --out /tmp/stream-search/search.db

Upload the result to S3 (the search Lambda downloads it at cold start):
  aws s3 cp /tmp/stream-search/search.db s3://ultravioletadao/stream-search/search.db

GET /stats on the search API returns the `meta` table as-is: built_at (UTC),
streams, segments, last_stream_date, failed and refresh (auto|manual).
"""
import argparse
import json
import os
import sqlite3
import sys
import time

SCHEMA = """
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE streams (
  vod_id      TEXT PRIMARY KEY,
  streamer    TEXT NOT NULL,
  stream_date TEXT NOT NULL,   -- YYYYMMDD
  title       TEXT,
  seg_count   INTEGER NOT NULL
);
CREATE TABLE segments (
  id          INTEGER PRIMARY KEY,
  vod_id      TEXT NOT NULL REFERENCES streams(vod_id),
  start_time  REAL NOT NULL,   -- seconds from VOD start
  end_time    REAL NOT NULL,
  text        TEXT NOT NULL
);
CREATE VIRTUAL TABLE seg_fts USING fts5(
  text,
  content='segments',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);
"""


def read_title(vod_dir):
    path = os.path.join(vod_dir, "titulo_stream.txt")
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read().strip()[:200] or None
    except OSError:
        return None


def iter_transcripts(corpus_root):
    """Yield (date, vod_id, vod_dir, path, kind) for AWS Transcribe or Whisper files."""
    for date_dir in sorted(os.listdir(corpus_root)):
        if not (len(date_dir) == 8 and date_dir.isdigit()):
            continue
        date_path = os.path.join(corpus_root, date_dir)
        if not os.path.isdir(date_path):
            continue
        for vod_id in sorted(os.listdir(date_path)):
            vod_dir = os.path.join(date_path, vod_id)
            aws_tj = os.path.join(vod_dir, "transcripcion.json")
            whisper_tj = os.path.join(vod_dir, "transcripcion_whisper.json")
            if os.path.isfile(aws_tj):
                yield date_dir, vod_id, vod_dir, aws_tj, "aws"
            elif os.path.isfile(whisper_tj):
                yield date_dir, vod_id, vod_dir, whisper_tj, "whisper"


def parse_aws(data, min_chars):
    """AWS Transcribe: results.audio_segments -> (start, end, text)."""
    for seg in data.get("results", {}).get("audio_segments", []):
        text = (seg.get("transcript") or "").strip()
        if len(text) < min_chars:
            continue
        try:
            start = float(seg.get("start_time", 0.0))
            end = float(seg.get("end_time", start))
        except (TypeError, ValueError):
            continue
        yield start, end, text


def parse_whisper(data, min_chars, max_span=25.0, max_chars=240):
    """Whisper: segments[] with start/end/text/words. Long segments (silence-merged)
    are re-chunked using word timings so deep-link timestamps stay precise."""
    for seg in data.get("segments", []):
        try:
            start = float(seg.get("start", 0.0))
            end = float(seg.get("end", start))
        except (TypeError, ValueError):
            continue
        text = (seg.get("text") or "").strip()
        words = seg.get("words") or []
        if end - start <= max_span or not words:
            if len(text) >= min_chars:
                yield start, end, text
            continue
        chunk, c_start, c_end = [], None, None
        for w in words:
            token = (w.get("word") or "").strip()
            if not token:
                continue
            w_start = float(w.get("start", c_end or start))
            w_end = float(w.get("end", w_start))
            if c_start is None:
                c_start = w_start
            spans = (w_end - c_start) > max_span
            longs = sum(len(t) + 1 for t in chunk) > max_chars
            if chunk and (spans or longs):
                joined = " ".join(chunk)
                if len(joined) >= min_chars:
                    yield c_start, c_end, joined
                chunk, c_start = [], w_start
            chunk.append(token)
            c_end = w_end
        if chunk:
            joined = " ".join(chunk)
            if len(joined) >= min_chars:
                yield c_start, c_end, joined


def build(corpus, out, min_chars=8, refresh="manual", log=print):
    """Full rebuild of `out` from `corpus`. Returns the meta written to the db."""
    streamer = os.path.basename(os.path.normpath(corpus))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    if os.path.exists(out):
        os.remove(out)

    db = sqlite3.connect(out)
    db.executescript(SCHEMA)

    total_streams = total_segs = failed = 0
    last_stream_date = ""
    t0 = time.time()
    for date_dir, vod_id, vod_dir, tj, kind in iter_transcripts(corpus):
        try:
            with open(tj, encoding="utf-8", errors="replace") as fh:
                data = json.load(fh)
        except (json.JSONDecodeError, OSError) as exc:
            log(f"  ! {date_dir}/{vod_id}: unreadable ({exc})")
            failed += 1
            continue

        parser = parse_aws if kind == "aws" else parse_whisper
        rows = [(vod_id, start, end, text)
                for start, end, text in parser(data, min_chars)]

        db.execute(
            "INSERT OR REPLACE INTO streams VALUES (?,?,?,?,?)",
            (vod_id, streamer, date_dir, read_title(vod_dir), len(rows)),
        )
        db.executemany(
            "INSERT INTO segments (vod_id, start_time, end_time, text) VALUES (?,?,?,?)",
            rows,
        )
        total_streams += 1
        total_segs += len(rows)
        last_stream_date = max(last_stream_date, date_dir)
        if total_streams % 25 == 0:
            log(f"  {total_streams} streams, {total_segs} segments...")

    log("Building FTS index...")
    db.execute("INSERT INTO seg_fts(seg_fts) VALUES('rebuild')")
    # Extra meta rows are safe: the Lambda's /stats returns the whole table and
    # search only reads streams/segments/seg_fts.
    db.execute("INSERT INTO meta VALUES ('built_at', datetime('now'))")
    db.executemany("INSERT INTO meta VALUES (?, ?)", [
        ("streams", str(total_streams)),
        ("segments", str(total_segs)),
        ("last_stream_date", last_stream_date),
        ("failed", str(failed)),
        ("refresh", refresh),
    ])
    db.commit()
    meta = dict(db.execute("SELECT key, value FROM meta"))
    db.execute("VACUUM")
    db.close()

    size_mb = os.path.getsize(out) / 1e6
    log(f"OK: {total_streams} streams, {total_segs} segments, {failed} failed, "
        f"{size_mb:.1f} MB, {time.time() - t0:.0f}s -> {out}")
    return meta


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--corpus", required=True,
                    help="streamers/<streamer> root with YYYYMMDD/<vodId>/ dirs")
    ap.add_argument("--out", required=True, help="output .db path")
    ap.add_argument("--min-chars", type=int, default=8,
                    help="skip segments shorter than this many characters")
    args = ap.parse_args()

    def log(msg):
        print(msg, file=sys.stderr if msg.startswith("  !") else sys.stdout)

    build(args.corpus, args.out, args.min_chars, refresh="manual", log=log)


if __name__ == "__main__":
    main()
