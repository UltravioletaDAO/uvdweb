"""Tests for the automatic stream-search refresh (scripts/refresh_stream_search.py).

Run from the repo root (no dependencies beyond the standard library):
  python3 -m unittest discover -s tests/stream-search -v

A synthetic AbraKadabra corpus stands in for the real one; S3 and the Lambda are
replaced by a fake publisher, and the real Lambda handler is run against the
built db to prove the schema it reads did not change.
"""
import datetime as dt
import importlib.util
import json
import logging
import os
import shutil
import sqlite3
import sys
import tempfile
import types
import unittest

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO, "scripts"))

import build_stream_search_index as builder  # noqa: E402
import refresh_stream_search as refresh  # noqa: E402

T0 = dt.datetime(2026, 9, 23, 4, 0, tzinfo=dt.timezone.utc)


def make_stream(corpus, date, vod, kind="whisper", n=3):
    vod_dir = os.path.join(corpus, date, vod)
    os.makedirs(vod_dir, exist_ok=True)
    if kind == "whisper":
        name = "transcripcion_whisper.json"
        data = {"segments": [{"start": i * 10.0, "end": i * 10.0 + 5,
                              "text": f"frase numero {i} del stream {vod}"} for i in range(n)]}
    else:
        name = "transcripcion.json"
        data = {"results": {"audio_segments": [
            {"start_time": str(i * 10.0), "end_time": str(i * 10.0 + 5),
             "transcript": f"segmento aws {i} de {vod}"} for i in range(n)]}}
    with open(os.path.join(vod_dir, name), "w", encoding="utf-8") as fh:
        json.dump(data, fh)
    with open(os.path.join(vod_dir, "titulo_stream.txt"), "w", encoding="utf-8") as fh:
        fh.write(f"Stream {vod}")


class FakePublisher:
    def __init__(self, fail=False):
        self.calls = []
        self.fail = fail

    def publish(self, db_path, meta):
        if self.fail:
            raise RuntimeError("S3 down")
        self.calls.append((db_path, dict(meta)))


class RefreshTest(unittest.TestCase):
    def setUp(self):
        logging.getLogger("stream-search-refresh").setLevel(logging.CRITICAL)
        self.tmp = tempfile.mkdtemp()
        self.corpus = os.path.join(self.tmp, "0xultravioleta")
        self.state_dir = os.path.join(self.tmp, "state")
        make_stream(self.corpus, "20260825", "2856217000", kind="aws")
        make_stream(self.corpus, "20260910", "2870548351")
        make_stream(self.corpus, "20260922", "2881205107")
        self.publisher = FakePublisher()
        self.live = {}  # what GET /stats answers

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def args(self, *extra):
        return refresh.parse_args(["--corpus", self.corpus, "--state-dir", self.state_dir,
                                   "--stats-url", "https://search.invalid/stats", *extra])

    def fetch(self, url):
        return dict(self.live) if self.live else None

    def run_refresh(self, *extra, now=T0, publisher=None, lambda_serves_new=True):
        publisher = publisher or self.publisher

        def factory():
            return publisher

        def fetch(url):
            if lambda_serves_new and publisher.calls:
                meta = publisher.calls[-1][1]
                self.live = {k: meta[k] for k in ("built_at", "streams", "segments")}
            return self.fetch(url)

        return refresh.run(self.args(*extra), factory, fetch=fetch,
                           now=lambda: now, sleep=lambda s: None)

    def state(self):
        with open(os.path.join(self.state_dir, "state.json"), encoding="utf-8") as fh:
            return json.load(fh)

    def test_first_run_publishes_and_records_state(self):
        self.assertEqual(self.run_refresh(), 0)
        self.assertEqual(len(self.publisher.calls), 1)
        meta = self.publisher.calls[0][1]
        self.assertEqual(meta["streams"], "3")
        self.assertEqual(meta["last_stream_date"], "20260922")
        self.assertEqual(meta["refresh"], "auto")
        state = self.state()
        self.assertEqual(state["last_result"], "published")
        self.assertEqual(state["streams"], 3)
        self.assertTrue(state["verified"])
        self.assertTrue(os.path.isfile(os.path.join(self.state_dir, "search.db")))
        self.assertFalse(os.path.exists(os.path.join(self.state_dir, "search.db.new")))

    def test_unchanged_corpus_does_nothing(self):
        self.run_refresh()
        self.assertEqual(self.run_refresh(now=T0 + dt.timedelta(hours=1)), 0)
        self.assertEqual(len(self.publisher.calls), 1)
        self.assertEqual(self.state()["last_result"], "unchanged")

    def test_new_stream_is_published_on_next_run(self):
        self.run_refresh()
        make_stream(self.corpus, "20260923", "2882000000")
        self.assertEqual(self.run_refresh(now=T0 + dt.timedelta(hours=1)), 0)
        self.assertEqual(len(self.publisher.calls), 2)
        self.assertEqual(self.publisher.calls[1][1]["streams"], "4")
        self.assertEqual(self.state()["last_stream_date"], "20260923")

    def test_rewritten_transcript_is_published(self):
        self.run_refresh()
        make_stream(self.corpus, "20260922", "2881205107", n=7)  # re-transcribed
        self.run_refresh(now=T0 + dt.timedelta(hours=1))
        self.assertEqual(len(self.publisher.calls), 2)

    def test_republishes_daily_without_changes(self):
        self.run_refresh()
        self.run_refresh(now=T0 + dt.timedelta(hours=23))
        self.assertEqual(len(self.publisher.calls), 1)
        self.run_refresh(now=T0 + dt.timedelta(hours=25))
        self.assertEqual(len(self.publisher.calls), 2)
        self.assertEqual(self.state()["published_at"], "2026-09-24T05:00:00Z")

    def test_refuses_to_publish_when_streams_disappear(self):
        make_stream(self.corpus, "20260901", "2862614552")
        make_stream(self.corpus, "20260902", "2863463201")
        self.run_refresh()
        for date in ("20260901", "20260902", "20260910"):
            shutil.rmtree(os.path.join(self.corpus, date))
        self.assertEqual(self.run_refresh(now=T0 + dt.timedelta(hours=1)), 1)
        self.assertEqual(len(self.publisher.calls), 1)
        state = self.state()
        self.assertEqual(state["last_result"], "refused")
        self.assertEqual(state["streams"], 5)  # still describes what is published

    def test_first_run_uses_live_stats_as_baseline(self):
        self.live = {"built_at": "2026-08-26 23:24:42", "streams": "402", "segments": "1"}
        self.assertEqual(self.run_refresh(lambda_serves_new=False), 1)
        self.assertEqual(self.publisher.calls, [])
        self.assertIn("402", self.state()["last_error"])

    def test_missing_corpus_is_an_error(self):
        shutil.rmtree(self.corpus)
        self.assertEqual(self.run_refresh(), 1)
        self.assertEqual(self.state()["last_result"], "error")

    def test_dry_run_touches_nothing(self):
        self.assertEqual(self.run_refresh("--dry-run"), 0)
        self.assertEqual(self.publisher.calls, [])
        self.assertFalse(os.path.exists(os.path.join(self.state_dir, "state.json")))

    def test_failed_publish_is_retried_on_next_run(self):
        self.assertEqual(self.run_refresh(publisher=FakePublisher(fail=True)), 1)
        self.assertEqual(self.state()["last_result"], "error")
        self.assertNotIn("fingerprint", self.state())
        self.assertEqual(self.run_refresh(now=T0 + dt.timedelta(hours=1)), 0)
        self.assertEqual(len(self.publisher.calls), 1)

    def test_publish_not_seen_by_stats_exits_2(self):
        self.live = {"built_at": "2026-08-26 23:24:42", "streams": "3", "segments": "9"}
        self.assertEqual(self.run_refresh(lambda_serves_new=False), 2)
        self.assertEqual(self.state()["last_result"], "published-unverified")
        # The publish itself counts: the next run does not rebuild.
        self.run_refresh(now=T0 + dt.timedelta(hours=1), lambda_serves_new=False)
        self.assertEqual(len(self.publisher.calls), 1)

    def test_unreadable_transcript_is_counted_not_fatal(self):
        bad = os.path.join(self.corpus, "20250624", "2494789870")
        os.makedirs(bad)
        with open(os.path.join(bad, "transcripcion_whisper.json"), "w") as fh:
            fh.write('{"segments": [{"start": 0,')  # cut mid-write
        self.assertEqual(self.run_refresh(), 0)
        meta = self.publisher.calls[0][1]
        self.assertEqual((meta["streams"], meta["failed"]), ("3", "1"))

    def test_lock_blocks_overlap_and_expires(self):
        lock = os.path.join(self.tmp, "refresh.lock")
        self.assertTrue(refresh.acquire_lock(lock))
        self.assertFalse(refresh.acquire_lock(lock))
        old = os.path.getmtime(lock) - refresh.LOCK_STALE_S - 1
        os.utime(lock, (old, old))
        self.assertTrue(refresh.acquire_lock(lock))


class LambdaCompatTest(unittest.TestCase):
    """The Lambda in infra/stream-search reads the new db unchanged."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        corpus = os.path.join(self.tmp, "0xultravioleta")
        make_stream(corpus, "20260910", "2870548351", n=100)
        self.db = os.path.join(self.tmp, "search.db")
        builder.build(corpus, self.db, refresh="auto", log=lambda msg: None)

        sys.modules.setdefault("boto3", types.ModuleType("boto3"))  # not used: db is local
        spec = importlib.util.spec_from_file_location(
            "stream_search_lambda", os.path.join(REPO, "infra", "stream-search", "lambda_function.py"))
        self.fn = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.fn)
        self.fn.DB_PATH = self.db

    def tearDown(self):
        if self.fn._conn is not None:
            self.fn._conn.close()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def call(self, path, **params):
        res = self.fn.handler({"rawPath": path, "queryStringParameters": params}, None)
        return res["statusCode"], json.loads(res["body"])

    def test_stats_carries_freshness(self):
        status, body = self.call("/stats")
        self.assertEqual(status, 200)
        self.assertEqual(body["streams"], "1")
        self.assertEqual(body["last_stream_date"], "20260910")
        self.assertEqual(body["refresh"], "auto")
        self.assertRegex(body["built_at"], r"^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$")

    def test_search_deep_links(self):
        status, body = self.call("/", q="frase numero 42")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(body["count"], 1)
        hit = next(r for r in body["results"] if r["start_time"] == 420.0)
        self.assertEqual(hit["url"], "https://www.twitch.tv/videos/2870548351?t=0h7m0s")

    def test_schema_the_lambda_reads_is_unchanged(self):
        conn = sqlite3.connect(self.db)
        cols = {t: [r[1] for r in conn.execute(f"PRAGMA table_info({t})")]
                for t in ("meta", "streams", "segments")}
        conn.close()
        self.assertEqual(cols, {
            "meta": ["key", "value"],
            "streams": ["vod_id", "streamer", "stream_date", "title", "seg_count"],
            "segments": ["id", "vod_id", "start_time", "end_time", "text"],
        })


if __name__ == "__main__":
    unittest.main()
