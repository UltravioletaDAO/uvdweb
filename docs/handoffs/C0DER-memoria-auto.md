# Handoff — la memoria de los streams se reindexa sola

**Fecha:** 2026-09-23 · **Rama:** `c0der/memoria-auto` → PR a `main` · **Encargo:** c0der, decisión del
dueño del 2026-09-23T02:44:14Z ("Automático (Recomendado)"), que deroga el "manual por ahora" del
2026-07-21 (`f8e2df0`).

## Qué quedó

- `scripts/refresh_stream_search.py`: el refresh automático. Cada corrida saca la huella de las
  transcripciones (tamaño + mtime de cada una, más el código del builder). Si nada cambió y la última
  publicación tiene menos de 24 h, termina ahí. Si no, reconstruye el índice completo, se niega a
  publicar si faltan más de 2 streams respecto de lo publicado, lo sube a
  `s3://ultravioletadao/stream-search/search.db`, fuerza el cold start de la Lambda y comprueba que
  `GET /stats` muestre el `built_at` nuevo. Deja estado y log en `%LOCALAPPDATA%\uvd-stream-search`.
- `scripts/install_stream_search_task.ps1`: registra la tarea `uvd-stream-search-refresh`. Corre cada
  60 min con pythonw, oculta, con `StartWhenAvailable` e `IgnoreNew`, el mismo patrón que la
  `c0der-drift-refresh` que ya anda en esa máquina. Antes de registrar comprueba python, boto3, FTS5 y las
  credenciales AWS. Tiene `-DryRun` y `-Uninstall`.
- `scripts/build_stream_search_index.py`: `main()` pasa a ser `build()`, que se puede importar. Mismo
  esquema: la Lambda no cambió. Suma tres filas a `meta`, que `/stats` devuelve tal cual:
  `last_stream_date`, `failed` y `refresh` (`auto`/`manual`).
- `tests/stream-search/test_refresh_stream_search.py`: 16 tests con corpus sintético y publicador falso.
  Uno corre el handler real de la Lambda contra el db construido (`/stats`, búsqueda con deep link y
  columnas del esquema). Verdes en la Mac (Python 3.14) y en Windows (Python 3.11.4).
- `docs/STREAM_SEARCH.md`: la sección de refresh describe el mecanismo automático y el manual queda
  como respaldo. También `todo.md` (el ítem 2 del cron queda hecho) y `README.md`.

## Lo medido (solo lectura; horas en UTC)

| Hora | Qué | Resultado |
|---|---|---|
| 03:00Z | `GET /stats` vivo | `{"built_at": "2026-08-26 23:24:42", "streams": "402", "segments": "543774"}` |
| 03:00Z | `s3://ultravioletadao/stream-search/search.db` | 74.719.232 B, 2026-08-26 23:27Z (versionado del bucket activo, medido 03:14Z) |
| 03:01Z | Corpus por `ssh win` | 388 carpetas de fecha (20240903 → 20260922), 429 VODs, todos con transcripción y `processing_status.json` |
| 03:01Z | Señal de fin de AbraKadabra | `processing_status.json` por VOD. `transcription_whisper.done` + timestamp cuando escribe `transcripcion_whisper.json`, unas 2 h después de bajar el audio. No hay un paso de "pipeline terminado"; el último es `vault_rendered`. El `.lock` queda aunque termine, así que no sirve de señal |
| 03:01–03:02Z | Cómo corre AbraKadabra | En tandas, a mano: no tiene tarea programada. El 18-sep procesó en un día 13 VODs, los del 07 al 18-sep |
| 03:01–03:02Z | ¿Transcripciones en S3? | **No.** `s3://0xultravioleta/0xultravioleta/<vod>/` tiene 440 mp3 (el audio que se manda a transcribir) y 280 JSON de AWS Transcribe, el último del 2026-01-14. Desde ahí transcribe Whisper en local. Los resúmenes sí se suben (`stream-summaries/`), pero no traen frases con timestamp |
| 03:02Z | Qué hay en Windows | `C:\Python311` (3.11.4, sqlite 3.42 con FTS5, boto3 1.34.0) con `pythonw.exe` al lado, AWS CLI v2, WSL, pwsh 7.5.5 |
| 03:02–03:03Z | Checkout de uvdweb en Windows | En `develop`, 5 commits atrás y con archivos sin trackear. Por eso la tarea no apunta ahí |
| 03:03Z | VODs del corpus que no están en el índice vivo | 27: **26 streams del 20260826 al 20260922** y uno corrupto de 2025 que nunca estuvo |
| 03:03Z | Build completo en memoria, Python 3.11 de Windows | 428 streams, 610.081 segmentos, 1 fallido, 1.069 MB de JSON: **16 s** (14 s de lectura y parseo, 1 s de FTS) |
| 03:04–03:07Z | Lambda `uvd-stream-search` | description `index 2026-08-26`, 1024 MB, `/tmp` de 512 MB |
| 03:04–03:07Z | Permisos del usuario IAM de Windows (`iam simulate-principal-policy`) | `s3:PutObject`/`GetObject` en `ultravioletadao/stream-search/search.db`: allowed. `lambda:UpdateFunctionConfiguration`/`GetFunctionConfiguration` en `uvd-stream-search`: allowed |
| 03:12Z | Dry-run del refresh con el corpus real, en `%TEMP%`, borrado al terminar | 20 s. 428 streams / 610.081 segmentos / 1 fallido / 80,8 MB. La frase de control aparece (abajo) |

## Qué mecanismo y por qué

- **(a) en la nube: descartada.** El corpus no está en S3 (ver la fila de S3). Para que corriera en la nube,
  AbraKadabra tendría que empezar a subir las transcripciones, y eso es otro repo y otra decisión.
- **Paso al final del pipeline de AbraKadabra: descartado.** Obliga a tocar otro repo. Además el
  pipeline corre en tandas y puede fallar después de transcribir (vault, telegram), lo que dejaría el
  índice atrás sin que nadie se entere.
- **Elegida: tarea horaria en Windows con detección de cambios.** Sin tocar AbraKadabra, un stream entra
  al índice como mucho una hora después de que su transcripción aparece. Una vez al día se republica
  aunque no haya nada nuevo, para que `built_at` sirva de latido.
- **Incremental: no.** El build completo tarda 16 s (20 s con la escritura a disco y el VACUUM), y la
  subida y el cold start tardan más que eso. Incremental agregaría estado sin ahorrar nada que se note.
- **Frescura: `/stats` ya daba `built_at` y `streams`,** así que la Lambda no se tocó. Las tres filas
  nuevas de `meta` salen solas por `/stats`.

## Para c0der

Todo desde la Mac, en una copia de uvdweb en esta rama (o en `main` después del merge). Las rutas
relativas de `ssh win` y `scp win:` salen del home del usuario en Windows, y `AppData/Local` es
`%LOCALAPPDATA%`.

### 1. Copiar e instalar en modo prueba

```zsh
ssh win 'New-Item -ItemType Directory -Force AppData/Local/uvd-stream-search | Out-Null'
scp scripts/build_stream_search_index.py scripts/refresh_stream_search.py scripts/install_stream_search_task.ps1 win:AppData/Local/uvd-stream-search/
ssh win 'pwsh -NoProfile -ExecutionPolicy Bypass -File AppData/Local/uvd-stream-search/install_stream_search_task.ps1 -DryRun'
# esperado: "python, boto3, FTS5 y credenciales AWS: OK", el resumen de la tarea y "DryRun: no se registro nada."
```

### 2. Primera corrida: pone al día los 26 streams atrasados

```zsh
ssh win 'C:\Python311\python.exe AppData/Local/uvd-stream-search/refresh_stream_search.py --dry-run'
# esperado (~20 s): "dry run, not published: 428 streams (published: 402), 610081 segments, last stream 20260922, 1 failed"
ssh win 'C:\Python311\python.exe AppData/Local/uvd-stream-search/refresh_stream_search.py'
# esperado: "rebuilding: first run" -> "OK: 428 streams, 610081 segments, 1 failed, 80.8 MB"
#           -> "uploaded s3://ultravioletadao/stream-search/search.db"
#           -> "lambda uvd-stream-search reloaded: index <built_at> auto (428 streams)"
#           -> "verified: /stats built_at=<built_at> streams=428"   (exit 0)
```

Si en esos minutos AbraKadabra termina otro stream, los números suben en uno. El umbral de "faltan
streams" solo mira hacia abajo.

### 3. Registrar la tarea y comprobar que corre sola

```zsh
ssh win 'pwsh -NoProfile -ExecutionPolicy Bypass -File AppData/Local/uvd-stream-search/install_stream_search_task.ps1'
ssh win 'Start-ScheduledTask -TaskName uvd-stream-search-refresh'
# ~30 s despues:
ssh win 'Get-ScheduledTaskInfo -TaskName uvd-stream-search-refresh | Format-List LastRunTime, LastTaskResult, NextRunTime'
# esperado: LastTaskResult 0
ssh win 'Get-Content AppData/Local/uvd-stream-search/refresh.log -Tail 3'
# esperado, ultima linea: "unchanged: 429 transcripts, published 2026-09-23T..Z"
ssh win 'Get-Content AppData/Local/uvd-stream-search/state.json'
# esperado: "last_result": "published" o "unchanged", "streams": 428, "verified": true
```

La tarea corre con la sesión del usuario iniciada (InteractiveToken), igual que `c0der-drift-refresh`.

### 4. Sonda de cierre

```zsh
curl -s https://pbs5xr8wye.execute-api.us-east-1.amazonaws.com/stats
# esperado: built_at de hoy (UTC), "streams": "428" o mas, "last_stream_date": "20260922" o posterior, "refresh": "auto"
# antes (2026-09-23 03:00Z): {"built_at": "2026-08-26 23:24:42", "streams": "402", "segments": "543774"}

curl -s -G https://pbs5xr8wye.execute-api.us-east-1.amazonaws.com/ \
  --data-urlencode 'q=Swarm a toda velocidad en modo Super Demo' --data-urlencode limit=3
# esperado: "count": 1, date 20260910, vod 2870548351, "t": "0h15m11s", title "AGENTIC COMMERCE IS REAL"
# antes (03:00Z, indice vivo): "count": 0. Contra el indice nuevo en el dry-run (03:12Z): count 1, 0h15m11s.
```

### 5. Vigilancia

- **Rojo:** `built_at` de `/stats` con más de 3 días (72 h). Con la tarea viva nunca pasa de ~25 h,
  porque republica cada día aunque no haya streams nuevos.
- **Atraso** aunque `built_at` esté fresco: el `fecha_stream` más nuevo de `0xultravioleta` en
  `https://ultravioletadao.s3.us-east-1.amazonaws.com/stream-summaries/index_es.json` es mayor que
  `last_stream_date` en dos chequeos seguidos separados por 2 h o más. Hay una ventana normal de hasta
  una hora entre el resumen y el índice.
- `failed` hoy es 1 (el stream corrupto del punto 6). Si sube, hay transcripciones nuevas que no se
  pudieron leer, y el log dice cuáles.

```python
import datetime as dt, json, urllib.request
s = json.load(urllib.request.urlopen("https://pbs5xr8wye.execute-api.us-east-1.amazonaws.com/stats", timeout=30))
built = dt.datetime.strptime(s["built_at"], "%Y-%m-%d %H:%M:%S").replace(tzinfo=dt.timezone.utc)
age_h = (dt.datetime.now(dt.timezone.utc) - built).total_seconds() / 3600
idx = json.load(urllib.request.urlopen("https://ultravioletadao.s3.us-east-1.amazonaws.com/stream-summaries/index_es.json", timeout=30))
newest = max(x["fecha_stream"] for x in idx["streams"] if x.get("streamer") == "0xultravioleta")
print("rojo" if age_h > 72 else "verde", f"built_at hace {age_h:.0f} h", s["streams"], "streams",
      "| buscador", s.get("last_stream_date"), "resumenes", newest, "| failed", s.get("failed"))
```

### 6. Opcional: recuperar el stream corrupto (decide el dueño: escribe en el corpus de AbraKadabra)

`20250624/2494789870` tiene un `transcripcion_whisper.json` truncado (`Expecting value: line 4 column 5
(char 85428)`) y nunca estuvo en el índice. Su transcripción de AWS está entera en S3: 777
`audio_segments`, que dan 680 segmentos con el parser del builder (medido). El usuario de Windows
tiene `s3:GetObject` sobre ella. Como el builder prefiere `transcripcion.json`, basta con copiarla con
ese nombre para que la próxima corrida la indexe (cambia la huella) y `failed` baje a 0:

```zsh
ssh win 'aws s3 cp s3://0xultravioleta/0xultravioleta/2494789870/Transcripcion_0xultravioleta_audio_2494789870.json Z:/ultravioleta/ai/cursor/abracadabra/streamers/0xultravioleta/20250624/2494789870/transcripcion.json'
```

### Rollback

```zsh
ssh win 'pwsh -NoProfile -ExecutionPolicy Bypass -File AppData/Local/uvd-stream-search/install_stream_search_task.ps1 -Uninstall'
# indice anterior (bucket versionado): version del 2026-08-26 = ll5QakSVl1yFU__SIRNP_muzGusoPIiZ
aws s3api copy-object --bucket ultravioletadao --key stream-search/search.db \
  --copy-source 'ultravioletadao/stream-search/search.db?versionId=ll5QakSVl1yFU__SIRNP_muzGusoPIiZ'
aws lambda update-function-configuration --region us-east-1 --function-name uvd-stream-search --description "index rollback $(date +%F)"
```

## Supuestos (todos reversibles)

- Cada 60 min: `-IntervalMinutes` del instalador.
- Republicación diaria: `--max-age-hours 24` del script. Para cambiarla, agregarlo a los argumentos de la
  tarea.
- Se niega a publicar si faltan más de 2 streams: `--max-drop 2`. En la primera corrida compara contra
  los 402 del `/stats` vivo.
- Los archivos viven en `%LOCALAPPDATA%\uvd-stream-search` y no en el checkout de Windows, que está en
  `develop` y atrasado. Para actualizar, se vuelven a copiar con el `scp` del punto 1. Un builder nuevo
  republica solo en la próxima corrida.

## Qué no hice

- No instalé nada en Windows, no escribí en S3 y no toqué la Lambda. En Windows hice solo lecturas por
  ssh y una corrida de verificación (tests + `--dry-run`) en una carpeta de `%TEMP%` que se borró al
  terminar.
- No toqué AbraKadabra.
