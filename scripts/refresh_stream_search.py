#!/usr/bin/env python3
"""Keep the stream-search index ("la memoria del stream") fresh on its own.

Runs every hour from a Windows scheduled task (scripts/install_stream_search_task.ps1)
on the machine where AbraKadabra writes the transcripts. The corpus is not in S3:
AWS Transcribe output stopped landing in a bucket in Jan 2026 and Whisper runs
locally, so the refresh has to run next to the corpus. Each run:

  1. Fingerprints the transcripts the builder would index (path, size, mtime)
     plus the builder's own source. Takes under a second for ~430 streams.
  2. If the fingerprint matches the last publish and that publish is younger
     than --max-age-hours (24), stops: nothing to do.
  3. Otherwise rebuilds the whole index (16 s for 428 streams, measured
     2026-09-23, so no incremental mode) and checks it before publishing:
     no more than --max-drop streams below the most ever published, no more
     than --max-segment-drop (10%) of the segments lost, and the db must pass
     integrity_check and answer the Lambda's own search query. Without a
     baseline (no state.json and no GET /stats) it refuses unless --force.
     Then it uploads it to s3://ultravioletadao/stream-search/search.db, forces
     a cold start of the uvd-stream-search Lambda and checks that GET /stats
     shows the new built_at.

The daily republish keeps built_at in /stats moving when there are no new
streams, so "built_at older than 3 days" means this job stopped, not that the
streamer took a break.

State and log live in --state-dir (default %LOCALAPPDATA%/uvd-stream-search):
state.json (last publish, counts, last result), refresh.log and search.db (the
last published copy).

Usage:
  python refresh_stream_search.py --dry-run   # build + checks, no S3, no Lambda
  python refresh_stream_search.py             # what the scheduled task runs
  python refresh_stream_search.py --force     # rebuild and publish now; its counts
                                              # become the new baseline
  python refresh_stream_search.py --profile uvd-stream-search   # least-privilege AWS profile

Exit codes: 0 published, unchanged or dry run; 1 error or refused to publish;
2 published but /stats did not show the new built_at.
"""
import argparse
import datetime as dt
import hashlib
import json
import logging
import logging.handlers
import os
import sqlite3
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_stream_search_index as builder  # noqa: E402

DEFAULT_CORPUS = "Z:/ultravioleta/ai/cursor/abracadabra/streamers/0xultravioleta"
DEFAULT_STATS_URL = "https://pbs5xr8wye.execute-api.us-east-1.amazonaws.com/stats"
LOCK_STALE_S = 30 * 60
# The search Lambda's query (infra/stream-search/lambda_function.py), run against
# the new db before publishing; a test keeps both copies identical.
LAMBDA_SEARCH_SQL = """
        SELECT s.vod_id, st.stream_date, st.title, s.start_time,
               snippet(seg_fts, 0, '<mark>', '</mark>', '…', 24) AS snip
        FROM seg_fts
        JOIN segments s ON s.id = seg_fts.rowid
        JOIN streams  st ON st.vod_id = s.vod_id
        WHERE seg_fts MATCH ?
        ORDER BY bm25(seg_fts)
        LIMIT ?
        """
VALIDATE_PROBE = '"de"'  # the most common word in Spanish: any real index has it

log = logging.getLogger("stream-search-refresh")


def default_state_dir():
    base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~/.cache")
    return os.path.join(base, "uvd-stream-search")


def utcnow():
    return dt.datetime.now(dt.timezone.utc)


def iso(ts):
    return ts.strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(text):
    return dt.datetime.strptime(text, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=dt.timezone.utc)


def load_state(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def save_state(path, state):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def corpus_fingerprint(corpus):
    """(sha256, transcript count) over what build() would read, plus the builder
    source, so installing a new builder republishes on the next run."""
    h = hashlib.sha256()
    src = getattr(builder, "__file__", None)
    if src and os.path.isfile(src):
        with open(src, "rb") as fh:
            h.update(fh.read())
    count = 0
    for date_dir, vod_id, _vod_dir, path, kind in builder.iter_transcripts(corpus):
        st = os.stat(path)
        h.update(f"{date_dir}/{vod_id}/{kind}:{st.st_size}:{st.st_mtime_ns}\n".encode())
        count += 1
    return h.hexdigest(), count


def decide(state, fingerprint, transcripts, now, max_age_hours, force):
    """Reason to rebuild, or None when the published index is current."""
    if force:
        return "forced"
    if not state.get("published_at") or not state.get("fingerprint"):
        return "first run"
    if fingerprint != state["fingerprint"]:
        return f"transcripts changed ({state.get('transcripts', '?')} -> {transcripts})"
    age_h = (now - parse_iso(state["published_at"])).total_seconds() / 3600
    if age_h >= max_age_hours:
        return f"daily republish ({age_h:.0f} h since the last one)"
    return None


def as_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def baselines(state, stats_url, fetch):
    """(streams, segments) the new index is compared against. Streams is the
    most ever published (max_streams), so the floor cannot sink --max-drop
    streams per run; segments is the last publish. First run: live GET /stats."""
    streams = as_int(state.get("max_streams") or state.get("streams"))
    segments = as_int(state.get("segments"))
    if (not streams or not segments) and stats_url:
        live = fetch(stats_url) or {}
        streams = streams or as_int(live.get("streams"))
        segments = segments or as_int(live.get("segments"))
    return streams, segments


def check_counts(meta, baseline_streams, baseline_segments, max_drop, max_segment_drop):
    """Why the new index must not replace the published one, or None."""
    streams = as_int(meta.get("streams"))
    segments = as_int(meta.get("segments"))
    if streams == 0:
        return "the new index has 0 streams"
    if segments == 0:
        return "the new index has 0 segments"
    if baseline_streams and streams < baseline_streams - max_drop:
        return (f"the new index has {streams} streams and the baseline {baseline_streams} "
                f"(more than {max_drop} missing)")
    if baseline_segments and segments < baseline_segments * (1 - max_segment_drop):
        return (f"the new index has {segments} segments and the baseline {baseline_segments} "
                f"(more than {max_segment_drop:.0%} lost)")
    return None


def validate_db(path, meta):
    """Why the built db must not be published, or None. Read-only, the way the
    Lambda opens it."""
    uri = "file:" + urllib.request.pathname2url(os.path.abspath(path)) + "?mode=ro"
    try:
        conn = sqlite3.connect(uri, uri=True)
        try:
            integrity = [row[0] for row in conn.execute("PRAGMA integrity_check")]
            if integrity != ["ok"]:
                return f"integrity_check: {'; '.join(integrity[:3])}"
            segments = conn.execute("SELECT count(*) FROM segments").fetchone()[0]
            if segments != as_int(meta.get("segments")):
                return f"segments table has {segments} rows, meta says {meta.get('segments')}"
            hits = conn.execute(LAMBDA_SEARCH_SQL, (VALIDATE_PROBE, 1)).fetchall()
            if not hits:
                return f"the Lambda's search query finds nothing for {VALIDATE_PROBE}"
        finally:
            conn.close()
    except sqlite3.Error as exc:
        return f"db unreadable: {exc}"
    return None


def fetch_stats(url, timeout=30):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "uvd-stream-search-refresh"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:  # network, HTTP or JSON: the caller decides what it means
        log.warning("GET %s failed: %s", url, exc)
        return None


class AwsPublisher:
    """Uploads the db and makes the Lambda load it. Any configuration update
    sends the next invocations to new execution environments, which download
    search.db again at cold start."""

    def __init__(self, bucket, key, function, region, profile=None):
        import boto3  # only needed when publishing

        session = boto3.Session(profile_name=profile or None, region_name=region)
        self.bucket, self.key, self.function = bucket, key, function
        self.s3 = session.client("s3")
        self.lam = session.client("lambda")

    def publish(self, db_path, meta):
        self.s3.upload_file(db_path, self.bucket, self.key)
        log.info("uploaded s3://%s/%s", self.bucket, self.key)
        # built_at makes every description unique, so every publish is an update.
        desc = f"index {meta['built_at']} auto ({meta['streams']} streams)"
        for _ in range(6):
            try:
                self.lam.update_function_configuration(FunctionName=self.function,
                                                       Description=desc)
                break
            except self.lam.exceptions.ResourceConflictException:
                time.sleep(10)  # a previous update is still in progress
        else:
            raise RuntimeError(f"{self.function}: update still in progress after 60 s")
        self.lam.get_waiter("function_updated").wait(FunctionName=self.function)
        log.info("lambda %s reloaded: %s", self.function, desc)


def verify(url, built_at, fetch, sleep, attempts=6, wait_s=10):
    for attempt in range(attempts):
        live = fetch(url)
        if live and live.get("built_at") == built_at:
            log.info("verified: /stats built_at=%s streams=%s", live.get("built_at"),
                     live.get("streams"))
            return True
        if attempt < attempts - 1:
            sleep(wait_s)
    log.warning("/stats still says built_at=%s, expected %s",
                (live or {}).get("built_at"), built_at)
    return False


def run(args, publisher_factory, fetch=fetch_stats, now=utcnow, sleep=time.sleep):
    os.makedirs(args.state_dir, exist_ok=True)
    state_path = os.path.join(args.state_dir, "state.json")
    state = load_state(state_path)
    started = now()

    def finish(result, code, error=""):
        if not args.dry_run:
            state.update(last_run_at=iso(started), last_result=result, last_error=error)
            save_state(state_path, state)
        return code

    if not os.path.isdir(args.corpus):
        log.error("corpus not found: %s", args.corpus)
        return finish("error", 1, f"corpus not found: {args.corpus}")

    fingerprint, transcripts = corpus_fingerprint(args.corpus)
    reason = decide(state, fingerprint, transcripts, started, args.max_age_hours, args.force)
    if reason is None:
        log.info("unchanged: %d transcripts, published %s", transcripts, state["published_at"])
        return finish("unchanged", 0)
    log.info("rebuilding: %s", reason)

    def build_log(msg):  # the builder prefixes unreadable transcripts with "!"
        (log.warning if msg.lstrip().startswith("!") else log.info)(msg.strip())

    new_db = os.path.join(args.state_dir, "search.db.new")
    try:
        meta = builder.build(args.corpus, new_db, args.min_chars, refresh="auto", log=build_log)
    except Exception as exc:  # disk full, corpus unmounted mid-run...
        log.exception("build failed")
        return finish("error", 1, f"build failed: {exc}")

    base_streams, base_segments = baselines(state, args.stats_url, fetch)
    if not base_streams and not args.force:
        problem = ("no baseline (nothing published from here yet and GET /stats failed): "
                   "run once with --force")
    else:
        problem = (check_counts(meta, base_streams, base_segments, args.max_drop,
                                args.max_segment_drop)
                   or validate_db(new_db, meta))
    if problem:
        log.error("not publishing: %s", problem)
        return finish("refused", 1, problem)

    if args.dry_run:
        log.info("dry run, not published: %s streams (baseline: %s), %s segments "
                 "(baseline: %s), last stream %s, %s failed -> %s", meta["streams"],
                 base_streams or "?", meta["segments"], base_segments or "?",
                 meta["last_stream_date"], meta["failed"], new_db)
        return 0

    try:
        publisher_factory().publish(new_db, meta)
    except Exception as exc:  # retried whole on the next run: state still says the old publish
        log.exception("publish failed")
        return finish("error", 1, f"publish failed: {exc}")

    os.replace(new_db, os.path.join(args.state_dir, "search.db"))
    state.update(
        published_at=iso(now()), fingerprint=fingerprint, transcripts=transcripts,
        built_at=meta["built_at"], streams=int(meta["streams"]),
        segments=int(meta["segments"]), last_stream_date=meta["last_stream_date"],
        failed=int(meta["failed"]),
        # --force is the operator saying this index is right: it resets the floor.
        max_streams=int(meta["streams"]) if args.force
        else max(base_streams, int(meta["streams"])),
    )
    if not args.stats_url:
        return finish("published", 0)
    state["verified"] = verify(args.stats_url, meta["built_at"], fetch, sleep)
    if not state["verified"]:
        return finish("published-unverified", 2, "/stats did not show the new built_at")
    return finish("published", 0)


def acquire_lock(path):
    """Keeps a manual run and the scheduled one from overlapping."""
    try:
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        if time.time() - os.path.getmtime(path) < LOCK_STALE_S:
            return False
        os.remove(path)
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    os.write(fd, str(os.getpid()).encode())
    os.close(fd)
    return True


def setup_logging(state_dir):
    os.makedirs(state_dir, exist_ok=True)
    fmt = logging.Formatter("%(asctime)sZ %(levelname)s %(message)s", "%Y-%m-%dT%H:%M:%S")
    fmt.converter = time.gmtime
    handlers = [logging.handlers.RotatingFileHandler(
        os.path.join(state_dir, "refresh.log"), maxBytes=1_000_000, backupCount=2,
        encoding="utf-8")]
    if sys.stderr is not None:  # pythonw.exe (the scheduled task) has no console
        handlers.append(logging.StreamHandler(sys.stderr))
    for handler in handlers:
        handler.setFormatter(fmt)
        log.addHandler(handler)
    log.setLevel(logging.INFO)


def parse_args(argv=None):
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--corpus", default=os.environ.get("STREAM_SEARCH_CORPUS", DEFAULT_CORPUS),
                    help="streamers/<streamer> root with YYYYMMDD/<vodId>/ dirs")
    ap.add_argument("--state-dir", default=default_state_dir())
    ap.add_argument("--bucket", default="ultravioletadao")
    ap.add_argument("--key", default="stream-search/search.db")
    ap.add_argument("--function", default="uvd-stream-search")
    ap.add_argument("--region", default="us-east-1")
    ap.add_argument("--stats-url", default=DEFAULT_STATS_URL,
                    help="GET /stats of the search API; empty string skips the check")
    ap.add_argument("--max-age-hours", type=float, default=24,
                    help="republish even without changes after this many hours")
    ap.add_argument("--max-drop", type=int, default=2,
                    help="refuse to publish with more than this many streams below the "
                         "most ever published")
    ap.add_argument("--max-segment-drop", type=float, default=0.10,
                    help="refuse to publish when this fraction of the segments of the last "
                         "publish went missing")
    ap.add_argument("--profile", default=os.environ.get("STREAM_SEARCH_AWS_PROFILE"),
                    help="AWS profile to publish with (least privilege: see "
                         "docs/STREAM_SEARCH.md); default credential chain if unset")
    ap.add_argument("--min-chars", type=int, default=8)
    ap.add_argument("--dry-run", action="store_true",
                    help="build and check, but do not touch S3, the Lambda or state.json")
    ap.add_argument("--force", action="store_true",
                    help="rebuild and publish now, even without a baseline; the published "
                         "counts become the new baseline")
    return ap.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    setup_logging(args.state_dir)
    lock = os.path.join(args.state_dir, "refresh.lock")
    if not acquire_lock(lock):
        log.info("another refresh is running (%s), skipping", lock)
        return 0
    try:
        return run(args, lambda: AwsPublisher(args.bucket, args.key, args.function,
                                              args.region, args.profile))
    except Exception:
        log.exception("refresh failed")
        return 1
    finally:
        try:
            os.remove(lock)
        except OSError:
            pass  # already taken over as stale by another run


if __name__ == "__main__":
    sys.exit(main())
