# WebMCP en ultravioletadao.xyz — tools, pruebas y findings

> Verificado en producción el 2026-08-28 con Chrome estable (sin flags, vía el origin trial)
> ejecutando cada tool con `document.modelContext.executeTool(...)`. Metodología: Playwright
> con `channel: 'chrome'`, dos pasadas (inputs por defecto + inputs corregidos según el error).

## Estado

- **Origin trial WebMCP activo** (Chrome 149–156): token de 228 chars en `public/index.html`
  (`<meta http-equiv="origin-trial">`, match subdomains). Cualquier visitante con Chrome/Edge
  estable expone `document.modelContext` con las tools del sitio — sin flags.
  **Vence 2026-11-16 (Chrome 156)** — renovar en developer.chrome.com/origintrials (avisa por email).
- **24 tools imperativas** registradas en todas las páginas + **2 forms declarativos**
  (`stream_search_form` en `/stream-summaries`, `apply_dao_membership_form` en `/aplicar`, paso 3).
- Fuente de las tools: `src/agent/tools.js` + `src/agent/ecosystemTools.js` (única fábrica,
  compartida con la ventana "agent@uvd" de `/ecosystem`).

## Tools de contenido (2026-09-09)

El directorio de webmcp.com escaneó el sitio el 2026-09-09 y lo calificó **B "Solid"** con las 19
tools de entonces. Su rúbrica pesa 60% usabilidad juzgada por un agente ("comprehensive coverage"
del recorrido), 20% páginas con tools y 20% higiene de nombres y schemas. El 40% mecánico ya estaba;
el gap era que páginas enteras del sitio no tenían ninguna tool. Estas cinco cierran las que
muestran datos reales:

| Tool | Página | Fuente de datos (única, la misma que renderiza) |
|---|---|---|
| `list_blog_posts` | `/blog` | `src/posts/posts.js` |
| `get_blog_post` | `/blog/:slug` | `src/posts/posts.js` |
| `list_courses` | `/courses` | `services/courses/Courses.js` → `/db/courses.json` |
| `list_contributors` | `/contributors` | `src/data/topContributors.json` |
| `get_nft_collections` | `/nfts` | `src/data/nftCollections.js` (nuevo, compartido con NFTPage) |

`navigate_to` suma la sección `blog`.

**Qué se dejó afuera a propósito**, porque exponer una tool sin datos vivos detrás es peor que no
tenerla (la lección de `list_open_bounties`): `/status`, `/purge` y `/wheel` por decisión de
producto; `/bounties` porque su backend no existe (404) y la página está gateada por
`REACT_APP_BOUNTIES_ENABLED`; `/events` porque es el recap del ultraevento 2025, sin nada accionable
hoy; `/delegations`, `/about`, `/experiments` y `/links` porque son informativas y ya las cubren
`get_dao_info` y `list_ecosystem_products`.

Verificación: `tests/webmcp-content-tools.playwright.js` levanta el build, inyecta el shim de
`document.modelContext`, ejecuta cada tool y exige datos reales, error estructurado en slug
inválido y salida ≤ 1500 chars. **19/19 PASS el 2026-09-09** contra `build/` servido en :3311, con
la suite `tests/ecosystem/agent-routing.playwright.js` también en verde (24 tools únicas).

Presupuesto medido por tool: `list_blog_posts` 455 · `get_blog_post` 1175 · `list_courses` 686 ·
`list_contributors` 687 · `get_nft_collections` 587 chars.

## Resultados por tool (producción, 2026-08-28)

| Tool | Input probado | ms | Respuesta (resumen) |
|---|---|---|---|
| `get_dao_info` | `{}` | 1 | Ficha del DAO, contrato UVD, red, links (789 chars) |
| `get_token_metrics` | `{}` | 75 | Precio en vivo $7.8e-7, mcap $6.6k (DexScreener directo) |
| `get_treasury` | `{}` | 461 | Multisig 30 owners / threshold 15, tokens con USD |
| `get_facilitator_networks` | `{}` | 55 | 21 redes del facilitator |
| `list_governance_proposals` | `{limit:2}` | 183 | 0 activas (correcto: no hay abiertas) |
| `list_stream_summaries` | `{limit:2}` | 1 | 351 streams; título/fecha/links |
| `get_stream_summary` | `{video_id}` | 433 | Resumen completo del stream (1.413 chars) |
| `search_stream_memory` | `{query,limit}` | 102 | Momentos exactos con deep-link `?t=` al VOD |
| `get_ecosystem_map` | `{}` | 3 | Grafo **live** de S3; barrido de c0der de hacía 8 min |
| `list_ecosystem_products` | `{}` | 3 | 9 productos con capa/URL/status |
| `get_ecosystem_pulse` | `{}` | 2184 | Facilitator healthy · MeshRelay 22 users / 10 canales |
| `get_ecosystem_messages` | `{channel:'agents'}` | 87 | Chat IRC **real** de #agents (mensajes de hacía minutos) |
| `apply_dao_membership` | email inválido | 2135 | `400` controlado con mensaje claro; sin side effects |
| `navigate_to` | `{section}` | 8 | La SPA navegó de verdad |
| `set_language` | `{lang:'en'}` | 13 | `<html lang>` y UI cambiaron |
| `focus_ecosystem_node` | `{node_id}` | 7 | Ficha del nodo + aristas in/out; selecciona en el grafo |
| `open_terminal` | `{kind:'kk_kpi'}` | 8 | Abrió la ventana en el escritorio correcto y la enfocó |
| `set_desk_mode` | `{mode:'expose'}` | 18 | Modo exposé del escritorio |
| `run_ecosystem_command` | `{command:'help'}` | 6 | Ayuda del prompt; `command_not_allowed` para lo no listado |

Todas las salidas por defecto ≤ 1.500 chars (presupuesto para agentes).

## Manejo de errores (patrón verificado)

Input incompleto o valor desconocido → la tool **no revienta**: devuelve
`{"error":"unknown_*","allowed":[...]}` con las opciones válidas. Un agente se autocorrige en
una iteración (así se resolvieron `node_id` y `kind` durante la prueba, sin leer código).

## Forms declarativos — finding y fix

- **Bug encontrado probando en prod**: `stream_search_form` estaba registrado pero era
  **ininvocable por agentes** — Chrome exige un submit button *habilitado* al ejecutar un form
  declarativo, y el botón de búsqueda tenía `disabled` con query < 2 chars →
  `UnknownError: No submit button was found`.
- **Fix** (PR #105): `disabled` solo durante la búsqueda; la validación vive en `runSearch`
  (`{"error":"invalid_query"}`) y el hint visual se conserva con `aria-disabled` + opacidad.
- **Flujo verificado**: el agente invoca la tool → Chrome pre-llena el input (dispara el
  `onChange` de React) → el humano da submit → `respondWith()` resuelve la promesa del agente
  con los resultados reales y la UI queda mostrándolos.
- **Resultado en producción (2026-08-28, tras PR #106, build 94)**: el agente invocó
  `stream_search_form` con `{q:"karmakadabra"}` → Chrome pre-llenó el input → submit humano →
  `respondWith()` entregó al agente 3 resultados reales con deep-link al VOD y la UI quedó
  mostrando los 3 momentos resaltados. **Funciona end-to-end.**
- `apply_dao_membership_form`: registrado en `/aplicar` (paso 3 del formulario, donde existe el
  submit); no se prueba end-to-end en prod para no crear aplicaciones basura — el equivalente
  imperativo (`apply_dao_membership`) valida con `400` limpio.

## Cómo usa esto un LLM en la vida real (las 3 puertas del sitio)

1. **WebMCP — el agente vive en el navegador.** ChatGPT desktop/Codex ("Site tools", GPT-5.6
   Sol/Terra): abrir ultravioletadao.xyz en su navegador y pedir p.ej. "busca en la memoria del
   stream cuándo hablé de execution market" — el modelo descubre y llama `search_stream_memory`
   y la página muestra los resultados. En Chrome/Edge estable la API queda expuesta para
   cualquier agente que corra en la página (extensiones, Gemini-in-Chrome cuando conecte,
   automatización). Prueba manual: DevTools → `await document.modelContext.getTools()`.
2. **Discovery/markdown — cualquier LLM con acceso web, sin navegador.** `llms.txt`,
   `/ecosystem/graph.json`, `index.md`, `auth.md`, `.well-known/*`: el LLM lee, no opera.
3. **MCP remoto — desde Claude Desktop o cualquier cliente MCP.** Hoy: el de KarmaKadabra
   (`karmakadabra.ultravioletadao.xyz/mcp`, tools `kk_*`). Un MCP remoto del sitio propio está
   en el backlog (habilitaría además MCP Apps: UI dentro del chat).

En corto: **WebMCP = opera tu página con la UI a la vista · MCP remoto = llama tu API desde
cualquier lado · llms.txt = lee**.

## Mantenimiento

- Renovar el origin trial antes de Chrome 156 (2026-11-16) — ítem en `docs/planning/BACKLOG.md`.
- Tool nueva → agregarla en `src/agent/tools.js`/`ecosystemTools.js` y actualizar
  `public/llms-full.txt`; salida por defecto ≤ 1.500 chars y errores con `allowed`.
