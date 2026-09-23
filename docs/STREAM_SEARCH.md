# Stream Search ("la memoria del stream")

Full-text search over every phrase said on 428+ Ultravioleta streams (Sep 2024 →),
shown on `/stream-summaries` and exposed to agents as the WebMCP tool
`search_stream_memory` (`src/agent/tools.js`). Results quote the exact sentence and
deep-link to the Twitch VOD at that second (`?t=XhYmZs`) — segment timestamps are
relative to the VOD, so no clock calibration is needed.

## Pieces
- **Index builder**: `scripts/build_stream_search_index.py` — reads AbraKadabra
  transcripts (`transcripcion.json` AWS Transcribe + `transcripcion_whisper.json`
  Whisper, long Whisper segments re-chunked by word timings) into a SQLite FTS5 db
  (~81 MB for 428 streams / 610k segments, 2026-09-23). Always a full rebuild: it
  takes 16 s on the streamer's machine, so there is no incremental mode.
- **Corpus**: on the streamer's machine (Windows),
  `Z:/ultravioleta/ai/cursor/abracadabra/streamers/0xultravioleta/<YYYYMMDD>/<vodId>/`.
  It is not in S3: AWS Transcribe output stopped landing in a bucket in Jan 2026
  and Whisper runs locally. That is why the refresh runs on that machine.
- **Automatic refresh**: `scripts/refresh_stream_search.py`, run every hour by the
  scheduled task `uvd-stream-search-refresh` (installer:
  `scripts/install_stream_search_task.ps1`). See below.
- **Index home**: `s3://ultravioletadao/stream-search/search.db` (us-east-1).
- **API**: Lambda `uvd-stream-search` (us-east-1, python3.12) behind API Gateway
  HTTP API — deploy/update with `infra/stream-search/deploy.sh`. Endpoints:
  `GET /?q=&limit=` and `GET /stats`. CORS allows prod/dev/localhost.
- **UI**: `src/components/StreamSearch.js`, rendered on `/stream-summaries` only
  when `REACT_APP_STREAM_SEARCH_API` is set (i18n es/en/pt/fr).

## Refreshing the index (automatic)

Since 2026-09-23 the index refreshes itself (owner's decision; it replaces the
"manual for now" of 2026-07-21). The scheduled task `uvd-stream-search-refresh`
runs `refresh_stream_search.py` every hour on the streamer's machine:

1. Fingerprints every transcript the builder would read (size + mtime), plus the
   builder's own source: 0.05 s for 429 transcripts.
2. If the fingerprint matches the last publish and that publish is less than 24 h
   old, it stops. Nothing else happens on most runs.
3. Otherwise it rebuilds the whole index (~20 s) and checks it before publishing.
   It refuses (`last_result: refused`, exit 1, nothing uploaded) when:
   - it has 0 streams or 0 segments;
   - it has more than `--max-drop` (2) streams below `max_streams`, the most ever
     published. The floor never sinks, so the index cannot shrink 2 streams per run;
   - it lost more than `--max-segment-drop` (10 %) of the segments of the last
     publish (a Whisper format change or a builder regression that keeps the
     streams but empties them);
   - the db fails `PRAGMA integrity_check`, its `segments` table does not match
     `meta`, or the Lambda's own search query (`seg_fts MATCH '"de"'` joined to
     `segments` and `streams`) returns nothing. The db is opened read-only, as the
     Lambda does;
   - there is no baseline: no `state.json` and `GET /stats` unreachable. Only
     `--force` publishes then.

   The first run takes its baseline from the live `GET /stats`. Otherwise it
   uploads the db to S3, forces a Lambda cold start (`update_function_configuration`
   with the description `index <built_at> auto (<N> streams)`) and checks that
   `GET /stats` shows the new `built_at`.

A stream becomes searchable within an hour of AbraKadabra writing its transcript
(the `transcription_whisper` step in its `processing_status.json`; the transcript
file itself is what changes the fingerprint). The index is also republished once a
day without new streams, so `built_at` doubles as a heartbeat.

State on that machine, in `%LOCALAPPDATA%\uvd-stream-search\`: `state.json` (last
publish, counts, `last_result`: `published`, `unchanged`, `refused`, `error` or
`published-unverified`), `refresh.log` and `search.db` (the last published copy).
Exit codes: 0 ok, 1 error/refused, 2 published but `/stats` did not show it.

### Freshness signal: `GET /stats`

`/stats` returns the db's `meta` table as-is (the Lambda did not change):

```json
{"built_at": "2026-09-23 03:12:23", "streams": "428", "segments": "610081",
 "last_stream_date": "20260922", "failed": "1", "refresh": "auto"}
```

- `built_at` (UTC) moves at least once a day while the task is alive. **Older than
  3 days = red**: the task stopped or the machine has been off.
- `last_stream_date` against the newest `fecha_stream` of `0xultravioleta` in
  `https://ultravioletadao.s3.us-east-1.amazonaws.com/stream-summaries/index_es.json`:
  if the summaries have a newer stream for more than a couple of hours, the refresh
  is behind even if `built_at` is fresh.
- `failed`: transcripts that could not be parsed and are not searchable (1 on
  2026-09-23: `20250624/2494789870`, a truncated Whisper JSON).
- `refresh`: `auto` (the task) or `manual` (the builder run by hand).

### Install, update, remove

The installer, `refresh_stream_search.py` and `build_stream_search_index.py` go in
the same folder (`%LOCALAPPDATA%\uvd-stream-search`); the task points at that
folder, not at a checkout. From PowerShell in that folder:

```powershell
.\install_stream_search_task.ps1 -DryRun    # checks python, boto3, FTS5 and AWS credentials; registers nothing
.\install_stream_search_task.ps1 -AwsProfile uvd-stream-search   # hourly, hidden (pythonw), first run in 2 minutes
.\install_stream_search_task.ps1 -Uninstall
Get-ScheduledTaskInfo -TaskName uvd-stream-search-refresh
Get-Content "$env:LOCALAPPDATA\uvd-stream-search\refresh.log" -Tail 20
```

To update, copy the new files over. The builder is part of the fingerprint, so a
new builder republishes on the next run.

To shrink the index on purpose (streams really deleted from the corpus), run once
by hand with the limits opened and `--force`, for example
`python refresh_stream_search.py --force --max-drop 50 --max-segment-drop 0.5`.
A `--force` publish resets `max_streams` to what it published.

### Least privilege

By default the task publishes with the machine's default AWS credentials. Better:
a profile that can only do what the refresh needs. Pass it with
`-AwsProfile <name>` to the installer, which also tries it before registering
(`GetFunctionConfiguration` on the Lambda), or with `--profile` / the
`STREAM_SEARCH_AWS_PROFILE` variable to the script. Minimal policy (the account
id stays a placeholder):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::ultravioletadao/stream-search/search.db"
    },
    {
      "Effect": "Allow",
      "Action": ["lambda:UpdateFunctionConfiguration", "lambda:GetFunctionConfiguration"],
      "Resource": "arn:aws:lambda:us-east-1:<account-id>:function:uvd-stream-search"
    }
  ]
}
```

`s3:PutObject` also covers the multipart upload boto3 uses for a db this size, and
the bucket encrypts with SSE-S3 (AES256), so no KMS permission is needed.
Reading `GET /stats` for the baseline and the check needs no credentials.

## Manual refresh (backup)

On the streamer's machine, the same as the task but now:
`python refresh_stream_search.py --force` (or `--dry-run` to build and run every
check without publishing). Without the task, from WSL:

```bash
python3 scripts/build_stream_search_index.py \
  --corpus /mnt/z/ultravioleta/ai/cursor/abracadabra/streamers/0xultravioleta \
  --out /tmp/stream-search/search.db
aws s3 cp /tmp/stream-search/search.db s3://ultravioletadao/stream-search/search.db
# Lambda picks it up on next cold start; force with:
aws lambda update-function-configuration --function-name uvd-stream-search \
  --region us-east-1 --description "index $(date +%F)"
```

A manual build writes `refresh: manual` in `/stats`. The task does not notice it:
it publishes over it at the next transcript change or daily republish.

Tests: `python3 -m unittest discover -s tests/stream-search -v` (synthetic
corpus, fake publisher, and the real Lambda handler against the built db).

Caveat: old Twitch VODs expire; the quote/date remain valid even if the link 404s.
Part of plan F1-1 in karmakadabra/plans/ULTRAVIOLETA_INTELLIGENCE_ENGINE_MASTER_PLAN.md.
