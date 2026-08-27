# Stream Search ("la memoria del stream")

Full-text search over every phrase said on 402+ Ultravioleta streams (Sep 2024 →),
shown on `/stream-summaries`. Results quote the exact sentence and deep-link to the
Twitch VOD at that second (`?t=XhYmZs`) — segment timestamps are relative to the VOD,
so no clock calibration is needed.

## Pieces
- **Index builder**: `scripts/build_stream_search_index.py` — reads AbraKadabra
  transcripts (`transcripcion.json` AWS Transcribe + `transcripcion_whisper.json`
  Whisper, long Whisper segments re-chunked by word timings) into a SQLite FTS5 db
  (~75 MB for 402 streams / 544k segments, last refresh 2026-08-26). Corpus lives on the streamer's machine:
  `Z:/ultravioleta/ai/cursor/abracadabra/streamers/0xultravioleta/`.
- **Index home**: `s3://ultravioletadao/stream-search/search.db` (us-east-1).
- **API**: Lambda `uvd-stream-search` (us-east-1, python3.12) behind API Gateway
  HTTP API — deploy/update with `infra/stream-search/deploy.sh`. Endpoints:
  `GET /?q=&limit=` and `GET /stats`. CORS allows prod/dev/localhost.
- **UI**: `src/components/StreamSearch.js`, rendered on `/stream-summaries` only
  when `REACT_APP_STREAM_SEARCH_API` is set (i18n es/en/pt/fr).

## Refreshing the index (after new streams)
```bash
python3 scripts/build_stream_search_index.py \
  --corpus /mnt/z/ultravioleta/ai/cursor/abracadabra/streamers/0xultravioleta \
  --out /tmp/stream-search/search.db
aws s3 cp /tmp/stream-search/search.db s3://ultravioletadao/stream-search/search.db
# Lambda picks it up on next cold start; force with:
aws lambda update-function-configuration --function-name uvd-stream-search \
  --region us-east-1 --description "index $(date +%F)"
```

Caveat: old Twitch VODs expire; the quote/date remain valid even if the link 404s.
Part of plan F1-1 in karmakadabra/plans/ULTRAVIOLETA_INTELLIGENCE_ENGINE_MASTER_PLAN.md.
