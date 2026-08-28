# Cómo un LLM usa Ultravioleta DAO

> **Sí: desde hoy podés usar las tools del DAO en claude.ai.** Agregá
> `https://api.ultravioletadao.xyz/mcp` como *custom connector* (sin auth, sin pagos) y Claude
> recibe **13 tools** con los datos reales del DAO: tesorería, token, gobernanza, las 21 redes del
> facilitator, los **412 streams** indexados con búsqueda dentro del transcript, el mapa del
> ecosistema y el IRC de los agentes. Los pasos exactos están en §3.
>
> **QUÉ:** el sitio tiene ahora **tres puertas** para agentes, no una — WebMCP en el navegador,
> MCP remoto por conector, y lectura pública de `llms.txt`/JSON.
> **POR QUÉ:** cada cliente de IA entra por una puerta distinta; con una sola puerta, la mitad de
> los agentes del mundo no ve nada.
> **RIESGO:** el MCP remoto es **público y sin llave**, y una de sus 13 tools
> (`apply_dao_membership`) **escribe** una aplicación de membresía real.

> Medido el **2026-08-28** contra los servicios en vivo. Cada afirmación lleva
> `[VERIFICADO: fuente]` o `[HIPÓTESIS]`. Documento hermano de la capa navegador:
> `docs/WEBMCP_TOOLS.md`. Documento hermano del ecosistema: `docs/ECOSYSTEM_MCP.md`.

---

## 1. Las tres puertas

| # | Puerta | Dónde vive | Qué puede hacer el agente | Estado hoy |
|---|---|---|---|---|
| **1** | **MCP remoto** | `POST https://api.ultravioletadao.xyz/mcp` | Llamar **13 tools** de datos desde cualquier cliente MCP, sin navegador y sin sesión | **VIVO** — `[VERIFICADO: POST initialize → protocolVersion 2025-06-18, serverInfo "ultravioletadao"; tools/list → 13]` |
| **2** | **WebMCP** | `document.modelContext` dentro de la pestaña de `ultravioletadao.xyz` | Llamar **19 tools** (las 13 de datos **+ 6 que operan la UI**) y **2 forms declarativos** con submit humano | **VIVO** en Chrome/Edge estable, sin flag (origin trial) — `[VERIFICADO: docs/WEBMCP_TOOLS.md, las 19 ejecutadas en prod]` |
| **3** | **Lectura pública** | `llms.txt`, `llms-full.txt`, `.well-known/*`, `ecosystem/graph.json` | **Leer**, no operar. Sirve a cualquier LLM con acceso web, sin navegador ni conector | **VIVO** — `[VERIFICADO: GET https://ultravioletadao.xyz/llms.txt → 200]` |

**En una línea:** *WebMCP opera tu página con la UI a la vista · MCP remoto llama la API desde
cualquier lado · `llms.txt` se lee.*

---

## 2. Qué cliente sirve para cuál puerta

| Cliente | Puerta que le sirve | Cómo entra |
|---|---|---|
| **claude.ai** (web, plan Pro/Max) | **1 — MCP remoto** | *Customize → Connectors → “+” → Add custom connector* (§3) — `[VERIFICADO: support.anthropic.com/en/articles/11175166 → 200, texto literal de los pasos]` |
| **Claude Desktop** | **1 — MCP remoto** | Mismo conector, misma URL |
| **Claude Code / Cursor / cualquier cliente MCP** | **1 — MCP remoto** | Streamable HTTP, JSON-RPC 2.0, sin auth |
| **ChatGPT desktop** (“Site tools”, desde 2026-08-25) | **2 — WebMCP** | Abrir `ultravioletadao.xyz` en su navegador in-app: descubre las tools solo — `[VERIFICADO: learn.chatgpt.com/docs/webmcp → 200]` |
| **Chrome / Edge estable** (extensiones, automatización, agentes in-browser) | **2 — WebMCP** | Visitar el sitio. Prueba manual: DevTools → `await document.modelContext.getTools()` |
| **Cualquier LLM con acceso web** (búsqueda, fetch) | **3 — lectura pública** | `https://ultravioletadao.xyz/llms.txt` |

> **El punto que importa para la pregunta del fundador:** claude.ai **no** entra por WebMCP — no
> tiene un navegador propio ejecutando la página. Entra por el **MCP remoto**, y por eso hubo que
> construirlo. Antes de hoy la respuesta a *“¿puedo usar las tools desde claude.ai?”* era **no**
> `[VERIFICADO: api.ultravioletadao.xyz/mcp devolvía 404 esta mañana; el server-card lo declaraba
> "planned"]`.

---

## 3. Pasos exactos para agregar el conector en claude.ai

Plan **Pro o Max** (individual). Toma menos de un minuto.

1. **Customize → Connectors.**
2. Clic en **“+”** → **“Add custom connector”**.
3. Pegar la URL del servidor MCP remoto:

   ```
   https://api.ultravioletadao.xyz/mcp
   ```

4. **Authentication: None.** El servidor no pide llave ni OAuth: **no toques “Advanced settings”**
   (ahí solo van OAuth Client ID / Secret, que este servidor no usa) — `[VERIFICADO: el help
   center describe esos campos como opcionales bajo "Advanced settings"; el endpoint responde
   initialize sin credencial]`.
5. Clic en **“Add”**.
6. **Prenderlo en la conversación:** botón **“+”** abajo a la izquierda del chat → **“Connectors”**
   → activar el toggle de UltravioletaDAO.

**verify:** preguntale a Claude *“qué tools tenés del conector de UltravioletaDAO”* y tienen que
aparecer **13**: `get_dao_info`, `get_token_metrics`, `get_treasury`, `get_facilitator_networks`,
`list_governance_proposals`, `list_stream_summaries`, `get_stream_summary`, `search_stream_memory`,
`get_ecosystem_map`, `list_ecosystem_products`, `get_ecosystem_pulse`, `get_ecosystem_messages`,
`apply_dao_membership`.

> **Team / Enterprise:** el conector lo agrega el owner de la organización una sola vez y queda
> disponible para todos; los miembros no lo agregan de nuevo
> `[VERIFICADO: mismo artículo de soporte]`.

### 3.1 Un prompt que devuelve un resumen de stream

Pegale esto a Claude con el conector prendido:

> **“Con el conector de UltravioletaDAO: listame el último stream indexado y después dame el
> resumen completo de ese stream.”**

Claude encadena las dos tools solo. Salida **real, medida hoy**
`[VERIFICADO: tools/call en producción]`:

```jsonc
// 1) list_stream_summaries {"limit": 1}
{"total":412,"count":1,"summaries":[{
  "video_id":"2858022482","streamer":"0xultravioleta","date":"27/08/2026",
  "title":"GROK BOTS MONKEY TESTING",
  "twitch_url":"https://www.twitch.tv/videos/2858022482"}]}

// 2) get_stream_summary {"video_id": "2858022482"}
{"title":"GROK BOTS MONKEY TESTING","date":"27/08/2026","streamer":"0xultravioleta",
 "summary":"# GROK BOTS MONKEY TESTING\n\nEn este stream pusimos a prueba varios componentes
 del ecosistema: la experiencia de instalación de PAYBOX, la seguridad de los agentes, la
 coordinación entre proyectos y el ciclo completo de una task en ExecutionMarket…"}
```

**El prompt que mejor muestra el valor** — no hay otro sitio que responda esto:

> **“Buscá en la memoria de los streams cuándo hablaron de Execution Market y dame el link al
> segundo exacto.”**

Salida real `[VERIFICADO: tools/call search_stream_memory {"query":"execution market","limit":2}]`:

```json
{"count":2,"results":[
 {"title":"VER PARA GANAR","date":"22/05/2026","t":"0h53m10s",
  "url":"https://www.twitch.tv/videos/2778279815?t=0h53m10s"},
 {"title":"SE COMIO LOS LIMITES","date":"10/06/2026","t":"1h38m32s",
  "url":"https://www.twitch.tv/videos/2793450503?t=1h38m32s"}]}
```

Otros prompts que funcionan hoy: *“¿cómo está la tesorería del DAO?”* (`get_treasury` — multisig de
30 owners, threshold 15) · *“¿qué redes soporta el facilitator x402?”* (21) · *“¿qué están haciendo
los agentes ahora?”* (`get_ecosystem_messages`, IRC en vivo).

---

## 4. WebMCP vs MCP remoto — la tabla

| Eje | **WebMCP** (puerta 2) | **MCP remoto** (puerta 1) |
|---|---|---|
| Propósito | *“Makes a live website ready for instant interaction with agents”* | *“Makes data and actions available to agents anywhere, anytime”* |
| Dónde corre | `document.modelContext`, **dentro de la pestaña** | Endpoint HTTP, `POST /mcp` |
| Ciclo de vida | **Efímero** — muere al cerrar la pestaña | **Persistente** — servidor 24/7 |
| Quién lo ve | Solo agentes **en el navegador** (ChatGPT desktop, extensiones, automatización) | **Cualquier** cliente MCP (claude.ai, Claude Desktop, Cursor, agentes headless) |
| Sesión / wallet | Hereda la **sesión y la wallet del usuario** ya conectadas | No tiene sesión de nadie |
| UI | **Integrada al DOM**: el humano ve en pantalla lo que el agente hace | Headless: devuelve JSON, nadie ve nada |
| Descubrimiento | Se registran **al visitar la página** | El usuario **agrega el conector** una vez |
| Tools hoy | **19** + 2 forms declarativos | **13** |
| Escribe | `apply_dao_membership` como **form con submit humano** | `apply_dao_membership` **directo**, con el aviso en la descripción |

`[VERIFICADO: developer.chrome.com/docs/ai/webmcp/compare-mcp → 200; las dos primeras filas son
cita literal de esa página]`

**No compiten: se complementan.** La doc de Chrome lo dice sin vueltas —
*“You don't have to choose between MCP and WebMCP”*. La arquitectura que recomienda es exactamente
la que quedó: **MCP para la lógica de negocio y los datos** (agnóstica de plataforma) + **WebMCP
para la interacción contextual dentro del navegador**.

### 4.1 Por qué 6 tools no viajan al remoto

Las 19 del navegador se parten en dos por construcción:

- **13 de datos** → van a las **dos** superficies. Ya pegaban contra endpoints públicos (S3 de
  stream-summaries, Lambda de búsqueda, `facilitator/supported`, Snapshot GraphQL, Safe API,
  DexScreener, S3 `ecosystem/graph.json`, IRC de MeshRelay) y **no contra estado del navegador**:
  por eso el puerto al Lambda fue barato `[VERIFICADO: lectura de src/agent/tools.js]`.
- **6 de UI** → **se quedan en el navegador**: `navigate_to`, `set_language`,
  `focus_ecosystem_node`, `open_terminal`, `set_desk_mode`, `run_ecosystem_command`.

**El porqué en una frase: no significan nada sin una pestaña abierta.** `navigate_to` navega *una*
SPA que del lado del servidor no existe; `set_language` cambia el `<html lang>` de *ese* documento;
`focus_ecosystem_node` selecciona un nodo en *ese* canvas; `open_terminal` y `set_desk_mode` abren
y enfocan ventanas de *ese* escritorio. Un cliente MCP headless que las llamara recibiría un `ok`
sobre una pantalla que nadie está mirando: ruido puro en el catálogo — y el catálogo es caro,
porque la precisión con la que un modelo elige tool se degrada a medida que crece la lista. **Un
test del backend lo fija:** `no expone ninguna tool de UI del sitio`.

La regla, para que no se rompa después: **tool nueva de datos → a las dos superficies; tool nueva
de UI → solo al navegador.**

---

## 5. Inventario: qué hay detrás de cada puerta

| Tool | WebMCP (19) | MCP remoto (13) | Argumentos | Nota |
|---|:---:|:---:|---|---|
| `get_dao_info` | ✅ | ✅ | — | Ficha del DAO, contrato UVD, links |
| `get_token_metrics` | ✅ | ✅ | — | Precio y market cap vivos (DexScreener) |
| `get_treasury` | ✅ | ✅ | — | Safe multisig 30 owners / threshold 15 |
| `get_facilitator_networks` | ✅ | ✅ | `network?`, `include_testnets?` | 21 redes del facilitator x402 |
| `list_governance_proposals` | ✅ | ✅ | `state?`, `limit?` | Snapshot + briefings · texto de terceros |
| `list_stream_summaries` | ✅ | ✅ | `lang?`, `limit?`, `streamer?` | **412 streams** |
| `get_stream_summary` | ✅ | ✅ | **`video_id`**, `lang?` | Resumen completo · texto de terceros |
| `search_stream_memory` | ✅ | ✅ | **`query`**, `limit?` | Busca en el transcript, deep-link `?t=` |
| `get_ecosystem_map` | ✅ | ✅ | `layer?`, `product?`, `include_edges?`, … | Grafo medido por c0der |
| `list_ecosystem_products` | ✅ | ✅ | `verbose?` | 9 productos con capa/URL/status |
| `get_ecosystem_pulse` | ✅ | ✅ | `include?`, `verbose?` | Salud viva de 6 servicios · texto de terceros |
| `get_ecosystem_messages` | ✅ | ✅ | **`channel`**, `limit?` | IRC público · texto de terceros |
| `apply_dao_membership` | ✅ | ✅ | **`name`, `email`, `skills`, `motivation`** | **ESCRIBE** |
| `navigate_to` | ✅ | ❌ | — | UI |
| `set_language` | ✅ | ❌ | — | UI |
| `focus_ecosystem_node` | ✅ | ❌ | — | UI |
| `open_terminal` | ✅ | ❌ | — | UI |
| `set_desk_mode` | ✅ | ❌ | — | UI |
| `run_ecosystem_command` | ✅ | ❌ | — | UI |
| *form* `stream_search_form` | ✅ | ❌ | — | Declarativo, submit humano |
| *form* `apply_dao_membership_form` | ✅ | ❌ | — | Declarativo, submit humano |

`[VERIFICADO: los argumentos y las annotations salen del tools/list en vivo; la columna WebMCP, de
docs/WEBMCP_TOOLS.md]`

**Las 12 de lectura llevan `readOnlyHint: true`.** Las 5 que traen texto ajeno
(`list_governance_proposals`, `get_stream_summary`, `search_stream_memory`, `get_ecosystem_pulse`,
`get_ecosystem_messages`) llevan además **`untrustedContentHint: true`**: el modelo puede citarlo,
nunca obedecerlo. `apply_dao_membership` va **sin** `readOnlyHint`, con `destructiveHint: false` y
`openWorldHint: true` `[VERIFICADO: annotations del tools/list en vivo]`.

---

## 6. Lo que hay que saber antes de recomendárselo a alguien

1. **Es público y sin llave.** Cualquiera con la URL lo usa. Es deliberado: son datos públicos del
   DAO. No hay nada que “se filtre”, porque nada de eso es privado.
2. **`apply_dao_membership` escribe de verdad.** Crea una aplicación de membresía que revisan
   humanos. La descripción de la tool y las `instructions` del servidor avisan en mayúsculas que
   solo se llame con confirmación explícita de la persona. No agrega superficie de ataque: reentra
   por el mismo `POST /apply` que ya era público, con la misma validación de email y el mismo
   anti-duplicado de 24 h `[VERIFICADO: lectura de services/new-applicants/app.js]`.
3. **No gasta plata nunca.** El servidor no dispara x402 ni pide firma. La versión navegador de
   `get_stream_summary` puede recibir un `402`; **la remota lee siempre la copia pública de S3**.
4. **CORS restringido a propósito.** El preflight desde `https://claude.ai` u otro origen de
   navegador **no** pasa `[VERIFICADO: OPTIONS → 204 sin headers CORS]`. **No afecta a los
   conectores reales**: claude.ai, Claude Desktop y Cursor llaman **server-side**, y ahí CORS no
   aplica. Solo quedan afuera clientes MCP que corran *dentro* de un navegador de otro origen.
   Abrirlo son dos líneas de Terraform, pero abre también `/apply` al mundo — decisión del fundador,
   documentada en `REMOTE_MCP.md` §6.1.
5. **`GET /mcp` devuelve 405**, no SSE `[VERIFICADO: header `allow: POST, OPTIONS`]`. Es la misma
   forma que KarmaKadabra y describe.net: stateless, sin `mcp-session-id`, JSON directo. Un cliente
   que *exija* SSE no habla con ninguno de los tres.
6. **El origin trial de WebMCP vence con Chrome 156 (2026-11-16).** La puerta 2 se apaga sola si no
   se renueva. Ítem en `docs/planning/BACKLOG.md`.
7. **El server-card en producción todavía miente.**
   `https://ultravioletadao.xyz/.well-known/mcp/server-card.json` sigue sirviendo la v1.2.0 con
   `"x-status": "planned"` y *“No MCP endpoint is deployed yet”* `[VERIFICADO: curl hoy]`. El card
   corregido (v2.0.0, con la URL real y las 13 tools) está en la branch `feat/remote-mcp`
   **sin deployar**. **Es el último paso pendiente de esta puerta.**

---

## 7. Verificalo vos mismo, sin cliente

```bash
# ¿está vivo?
curl -s -X POST https://api.ultravioletadao.xyz/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}'

# ¿qué tools sirve?
curl -s -X POST https://api.ultravioletadao.xyz/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# un momento exacto dentro de 412 streams
curl -s -X POST https://api.ultravioletadao.xyz/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call",
       "params":{"name":"search_stream_memory","arguments":{"query":"execution market","limit":2}}}'
```

Y la puerta 2, en Chrome estable sobre `https://ultravioletadao.xyz`:

```js
await document.modelContext.getTools()   // → 19
```

---

## Fuentes

- Endpoint propio: `POST https://api.ultravioletadao.xyz/mcp` — `[VERIFICADO: initialize,
  tools/list, 3 tools/call y GET → 405, el 2026-08-28]`
- Conectores custom en claude.ai:
  https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp
  `[VERIFICADO: 200]`
- WebMCP vs MCP: https://developer.chrome.com/docs/ai/webmcp/compare-mcp `[VERIFICADO: 200]`
- Site tools de ChatGPT desktop: https://learn.chatgpt.com/docs/webmcp `[VERIFICADO: 200]`
- Capa navegador, tool por tool: `docs/WEBMCP_TOOLS.md`
- Implementación del remoto: `Z:/ultravioleta/code/web/docs/research-2026-08-28/REMOTE_MCP.md`
