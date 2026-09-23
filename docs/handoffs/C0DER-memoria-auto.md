# Handoff — la memoria de los streams se reindexa sola

**Fecha:** 2026-09-23 · **Rama:** `c0der/memoria-auto` → PR #138 a `main` · **Encargo:** c0der,
decisión del dueño del 2026-09-23T02:44:14Z ("Automático (Recomendado)"), que deroga el "manual por
ahora" del 2026-07-21 (`f8e2df0`). Ronda 2: guardas de publicación, validación del db y privilegio
mínimo.

## Qué quedó

- `scripts/refresh_stream_search.py`: el refresh automático. Cada corrida saca la huella de las
  transcripciones (tamaño + mtime de cada una, más el código del builder). Si nada cambió y la última
  publicación tiene menos de 24 h, termina ahí. Si no, reconstruye el índice completo y lo revisa
  antes de publicar; si pasa, lo sube a `s3://ultravioletadao/stream-search/search.db`, fuerza el cold
  start de la Lambda y comprueba que `GET /stats` muestre el `built_at` nuevo. Deja estado y log en
  `%LOCALAPPDATA%\uvd-stream-search`.
- **Guardas (ronda 2).** Se niega a publicar (`refused`, exit 1) en estos casos:
  - el índice nuevo tiene 0 streams o 0 segmentos;
  - quedó más de 2 streams por debajo de `max_streams`, el máximo publicado alguna vez (el piso no
    baja de a 2 por corrida);
  - perdió más del 10 % de los segmentos de la última publicación (`--max-segment-drop`);
  - el db no pasa `validate_db`: `integrity_check`, el conteo de `segments` contra `meta`, y la
    consulta de búsqueda de la propia Lambda (`MATCH '"de"'` con los JOIN) devuelve cero filas;
  - no hay línea base (ni `state.json` ni `/stats`) y no se pasó `--force`.

  Un `--force` publica sin línea base y deja lo publicado como piso nuevo.
- **Privilegio mínimo (ronda 2).** El script acepta `--profile` y el instalador `-AwsProfile`, que usa
  ese perfil también en el preflight. La política mínima está en `docs/STREAM_SEARCH.md`, sin número de
  cuenta.
- `scripts/install_stream_search_task.ps1`: registra la tarea `uvd-stream-search-refresh`, que corre
  cada 60 min con pythonw, oculta, con `StartWhenAvailable` e `IgnoreNew`. Antes de registrar comprueba
  python, boto3, FTS5 y que las credenciales lleguen a la Lambda. Tiene `-DryRun` y `-Uninstall`.
- `scripts/build_stream_search_index.py`: `build()` se puede importar. Mismo esquema: la Lambda no
  cambió. `meta` suma `last_stream_date`, `failed` y `refresh` (`auto`/`manual`), que `/stats` devuelve
  solas.
- `tests/stream-search/test_refresh_stream_search.py`: **28 tests**, con corpus sintético y publicador
  falso. Cubren los casos de la ronda 2: segmentos que colapsan, caída de segmentos por encima y por
  debajo del umbral, trinquete de streams, primera corrida sin línea base con y sin `--force`, db
  corrupto, db que no coincide con `meta`, FTS vacío y perfil. Además corren el handler real de la
  Lambda contra el db construido, y un test mantiene la consulta de `validate_db` idéntica a la de la
  Lambda. Verdes en la Mac (Python 3.14) y en la máquina del streamer (Python 3.11 / sqlite 3.42).

## Lo medido (solo lectura; horas en UTC)

| Hora | Qué | Resultado |
|---|---|---|
| 03:00Z | `GET /stats` vivo | `{"built_at": "2026-08-26 23:24:42", "streams": "402", "segments": "543774"}` |
| 03:00Z | `s3://ultravioletadao/stream-search/search.db` | 74.719.232 B, 2026-08-26 23:27Z (versionado del bucket activo, medido 03:14Z) |
| 03:01Z | Corpus | 388 carpetas de fecha (20240903 → 20260922), 429 VODs, todos con transcripción y `processing_status.json` |
| 03:01Z | Señal de fin de AbraKadabra | `processing_status.json` por VOD. `transcription_whisper.done` + timestamp cuando escribe la transcripción, unas 2 h después de bajar el audio. No hay un paso de "pipeline terminado" |
| 03:01–03:02Z | Cómo corre AbraKadabra | En tandas, a mano. El 18-sep procesó en un día 13 VODs, los del 07 al 18-sep |
| 03:01–03:02Z | ¿Transcripciones en la nube? | No desde ene-2026: Whisper transcribe en local y no sube nada. Los resúmenes sí se suben, pero no traen frases con timestamp |
| 03:03Z | VODs del corpus que no están en el índice vivo | 27: **26 streams del 20260826 al 20260922** y uno corrupto de 2025 que nunca estuvo |
| 03:03Z | Build completo en memoria, en la máquina del streamer | 428 streams, 610.081 segmentos, 1 fallido, 1.069 MB de JSON: **16 s** (14 s de lectura y parseo, 1 s de FTS) |
| 03:04–03:07Z | Credenciales de publicación de esa máquina | Alcanzan para subir el índice y reiniciar la Lambda (verificado sin escribir) |
| 03:12Z | Dry-run del refresh con el corpus real, en una carpeta temporal borrada al terminar | 20 s. 428 / 610.081 / 1 fallido / 80,8 MB. La frase de control aparece |
| 03:35Z | Ídem con las guardas de la ronda 2 | 19 s. Línea base de `/stats` 402 / 543.774. `validate_db` OK en 0,3 s |

## Qué mecanismo y por qué

- **En la nube: descartada.** El corpus no está en ningún bucket. Para correr en la nube, AbraKadabra
  tendría que empezar a subir las transcripciones, y eso es otro repo y otra decisión.
- **Paso al final del pipeline de AbraKadabra: descartado.** Obliga a tocar otro repo. El pipeline
  corre en tandas y puede fallar después de transcribir, lo que dejaría el índice atrás en silencio.
- **Elegida: tarea horaria en la máquina del streamer, con detección de cambios.** Un stream entra al
  índice como mucho una hora después de que aparece su transcripción. Una vez al día se republica igual,
  así que `built_at` sirve de latido.
- **Incremental: no.** El build completo tarda 16 s; subirlo y el cold start tardan más que eso.
- **Frescura:** `/stats` ya daba `built_at` y `streams`, así que la Lambda no se tocó.

## Para c0der

c0der lo instala en la máquina del streamer. El paso a paso exacto, con comandos, está en su copia
privada (sin commitear). El procedimiento:

1. **Copiar** `build_stream_search_index.py`, `refresh_stream_search.py` e
   `install_stream_search_task.ps1` a `%LOCALAPPDATA%\uvd-stream-search` y correr el instalador con
   `-DryRun`. Esperado: `python, boto3, FTS5 y credenciales AWS: OK`. Opcional (decide el dueño): crear
   el perfil de privilegio mínimo de `docs/STREAM_SEARCH.md` y pasarlo con `-AwsProfile`.
2. **Primera corrida (pone al día los 26 atrasados)**: `refresh_stream_search.py --dry-run` (esperado:
   `428 streams (baseline: 402), 610081 segments (baseline: 543774)`) y después sin `--dry-run`.
   Esperado: `uploaded`, `lambda uvd-stream-search reloaded` y `verified: /stats built_at=… streams=428`.
3. **Registrar la tarea** y comprobarla: trigger con repetición `PT1H`, principal Interactive/Limited,
   `LastTaskResult 0`, y una línea `unchanged` en el log. La tarea corre con la sesión de escritorio
   del usuario iniciada.
4. **Sonda de cierre** (API pública):

```zsh
curl -s https://pbs5xr8wye.execute-api.us-east-1.amazonaws.com/stats
# esperado: built_at de hoy (UTC), "streams": "428" o mas, "last_stream_date": "20260922" o posterior, "refresh": "auto"
# antes (2026-09-23 03:00Z): {"built_at": "2026-08-26 23:24:42", "streams": "402", "segments": "543774"}

curl -s -G https://pbs5xr8wye.execute-api.us-east-1.amazonaws.com/ \
  --data-urlencode 'q=Swarm a toda velocidad en modo Super Demo' --data-urlencode limit=3
# esperado: "count": 1, date 20260910, vod 2870548351, "t": "0h15m11s", title "AGENTIC COMMERCE IS REAL"
# antes (03:00Z, indice vivo): "count": 0. Contra el indice nuevo en el dry-run (03:12Z): count 1, 0h15m11s.
```

### Vigilancia

- **Rojo:** `built_at` de `/stats` con más de 3 días. Con la tarea viva nunca pasa de ~25 h.
- **Atraso** aunque `built_at` esté fresco: el `fecha_stream` más nuevo de `0xultravioleta` en el
  índice público de resúmenes es mayor que `last_stream_date` en dos chequeos seguidos separados por
  2 h o más.
- `failed` hoy es 1 (el stream corrupto). Si sube, hay transcripciones nuevas que no se pudieron leer.

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

### Stream corrupto (opcional, decide el dueño)

`20250624/2494789870` tiene la transcripción Whisper truncada y nunca estuvo en el índice. Existe una
transcripción de AWS Transcribe de ese stream que el builder lee (680 segmentos, medido). Poniéndola
como `transcripcion.json` en la carpeta del VOD, la próxima corrida la indexa y `failed` baja a 0.

### Rollback

Quitar la tarea con `install_stream_search_task.ps1 -Uninstall`. El bucket del índice tiene versionado:
se restaura la versión del 2026-08-26 de `stream-search/search.db` y se fuerza el cold start. Después,
`/stats` vuelve a decir `built_at 2026-08-26 23:24:42`.

## Supuestos (todos reversibles)

- Cada 60 min (`-IntervalMinutes`) y republicación diaria (`--max-age-hours 24`).
- Umbrales: `--max-drop 2` contra `max_streams`, y `--max-segment-drop 0.10` contra los segmentos de la
  última publicación. La primera corrida compara contra el `/stats` vivo.
- Los archivos viven en `%LOCALAPPDATA%\uvd-stream-search`, no en un checkout, así que no dependen de la
  rama que tenga uno. Un builder nuevo republica solo en la próxima corrida.

## Qué no hice

- No instalé nada en la máquina del streamer, no escribí en S3 y no toqué la Lambda. Allá hice solo
  lecturas y corridas de verificación en carpetas temporales. Todas quedaron borradas: la de la ronda 2
  quedó bloqueada por una conexión sqlite de mi script de prueba y la borré después.
- No toqué AbraKadabra.
