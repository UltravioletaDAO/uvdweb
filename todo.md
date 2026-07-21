## 🖼️ PENDIENTE — Embeber el observatorio KarmaKadabra (plan listo, decisión Saul: después)

Iframe del observatorio 3D (`karmakadabra.ultravioletadao.xyz`) en la página `/agents`
con facade click-to-load (sin costo WebGL/WS para el visitante que no lo abre).
Factibilidad VERIFICADA (2026-07-21): el dashboard no manda X-Frame-Options ni CSP →
iframeable hoy sin tocar KK. Plan completo: `docs/KARMAKADABRA_EMBED_PLAN.md`
(~medio día de trabajo). Relación: backlog de karmakadabra.

---

## 🔄 PENDIENTE INFRA — Cron del conocimiento del DAO (decisión Saul 2026-07-21: manual por ahora)

Automatizar el refresh de las dos fuentes vivas que hoy se corren A MANO:
1. **uv-watch + briefings de gobernanza** (`/snapshot`): `karmakadabra/scripts/kk/uv_watch.py`
   actualiza `vault/knowledge/uvd/` por hash; los briefings en español se regeneran cuando hay
   proposal nueva y se suben a `s3://ultravioletadao/governance/briefings.json`.
2. **Índice de búsqueda del stream** (`/stream-summaries`): `scripts/build_stream_search_index.py`
   + upload a `s3://ultravioletadao/stream-search/search.db` (ver `docs/STREAM_SEARCH.md`).

Diseño del cron cuando se decida: EventBridge → ecs:RunTask one-shot clonando
`karmakadabra/terraform/selfimprove/` (stack propio `terraform/uv-knowledge/`, IAM mínimo).
Relación: fila "Ultravioleta Intelligence Engine" en `karmakadabra/docs/planning/BACKLOG.md`
y plan `karmakadabra/plans/ULTRAVIOLETA_INTELLIGENCE_ENGINE_MASTER_PLAN.md` (Pilar A, gate A1).

---

- ~~en metricas donde dice ultima propuesta, debería de decir Ultimas Propuestas e ir mostrando las ultimas propuestas en pop up o un carrusel, que vayan mostrandose y escondiendose, y va saliendo la otra propuesta, y top votantes podría hacer un scroll , si alguna multisig es menos a 1 dolar que no se muestre en las metricas~~ ✅ IMPLEMENTADO

seria bueno que coloques una badge de top contributors y meterlos como en una lista aparte ahi mismo en los miembros, que tengan una badge de un diamante o una estrella, y que solo esten personas que han aportado al dao en temas de artes, programación, dinero, algo asi, 

- Que salgan como: Artista, Contribuyente monetario, Conector, Manejador de Proyectos... y que luego la persona como que clickee en las que quiere (que tenga un tope de roles... no falta el colega que se ponga que hace todo) y luego que salga una sección para filtrar por roles

- 0xSoulAvax: Yo creo que es mejor que los roles de cada uno aparezcan con un diseño en el fondo, y que también se puedan filtrar los roles, puede ser algo animado como algunos token que hay en la pagina de ID

Ultra sabes que sería bueno para la pagina, tener una línea del tiempo donde resalte algunos streams, o los agrupe según el invitado, título, actividad o algo así, o que quede como una playlist

4:05


0xSoulAvax: Seria bueno un footer en la pagina que muestre los echoes minteados con el @ del usuario que lo tiene o con los 4 digitos de la wallet


Score/meritocracia: sistema de puntos por contribuciones (tiempo, UVD holdeado, invitar invitados, logística, engagement en X/Twitter, etc.), con ranking público.

Web/Producto (DAO site)
Directorio de miembros con perfiles editables, login por wallet, badges por roles/habilidades y por NFTs.
Filtros por roles/aptitudes y “marketplace” interno: buscar diseñador, moderador, marketing, etc.
Top contributors: sublista destacada con badge (diamante/estrella) además del listado completo.
Métricas en vivo y dashboards: Snapshot, holders, precios, multifirma, propuestas, votos.
Página del evento (Ultravioleta) con logos de sponsors, sección de entrevistas/artículos (incluye Cointelegraph), y media.
Línea de tiempo/playlist de streams; agrupación por invitados/actividades; clips destacados.
Internacionalización: selector de idiomas; streams semanales en inglés (resumen) para comunidad global.
Badges programáticos por NFTs: verificación automática on-chain (sin listas manuales).


Educación/Certificación
Diplomados/cursos certificados (on-chain): certificar “Diplomado Web3” y emitir credenciales verificables.
Continuar educación abierta y práctica (validadores, testnet/mainnet, agentes AI para comunidades).