# WebMCP Challenge (OpenAI) — dossier, candidatura de ultravioletadao.xyz y plan al cierre

> **El cierre NO pasó: faltan 6 días.** Deadline duro **jueves 2026-09-03, 13:00 PT (PDT) = 15:00
> hora Colombia = 20:00 UTC**. Las reglas aceptan proyectos preexistentes siempre que la extensión
> con WebMCP sea posterior al **2026-08-25 11:00 PT** — y **el 100% de nuestras 19 tools se commiteó
> el 2026-08-26 o después** `[VERIFICADO: git log de este repo, §2.2]`. Somos elegibles y tenemos un
> caso fuerte. Quedan **tres bloqueos que no son de código**: falta el `LICENSE` en el repo, falta el
> video de YouTube (<3 min, audio en inglés) y falta registrarse en Devpost.
>
> **QUÉ:** dossier del challenge + nuestra candidatura + plan día por día hasta el submit.
> **POR QUÉ:** 3.384 inscritos compiten por 10 premios; sin diferenciador claro y sin los
> requisitos formales, no se entra al Stage Two.
> **RIESGO:** olvidar el `LICENSE` **invalida la submission** por regla explícita.

> Investigado el **2026-08-28** contra la fuente primaria (reglas oficiales en Devpost, HTML crudo,
> `git log`, `curl`). Las URLs citadas se reconfirmaron en vivo el mismo día (todas → `200`).
> Dossier de origen: `Z:/ultravioleta/code/web/docs/research-2026-08-28/WEBMCP_HACKATHON.md`.
> **No se gastó dinero en ninguna fuente.** X/Twitter no se consultó (exige login).

---

## 1. Ficha del challenge

| Dato | Valor | Fuente |
|---|---|---|
| Nombre | **The WebMCP Challenge** — “10 days for exploring what's possible with WebMCP” | `[VERIFICADO: webmcp.devpost.com]` |
| Organiza | **OpenAI** (Sponsor). **Devpost** administra | `[VERIFICADO: rules]` |
| Partners | Google Chrome, Cloudflare, Shopify, Vercel, Render, Netlify | `[VERIFICADO: devpost + community.openai.com/t/…/1392582]` |
| **Submission Period** | 2026-08-25 11:00 am PT → **2026-09-03 1:00 pm PT** | `[VERIFICADO: rules §2, texto literal]` |
| **Deadline en horas nuestras** | **jue 2026-09-03 · 15:00 COT · 20:00 UTC** | conversión de PDT (UTC−7) |
| Judging Period | 2026-09-04 10:00 PT → **2026-09-21 17:00 PT** | `[VERIFICADO: rules §2]` |
| Ganadores | “on or around” **2026-09-23, 14:00 PT** | `[VERIFICADO: rules §2]` |
| Participantes inscritos | **3.384** | `[VERIFICADO: contador de webmcp.devpost.com]` |
| Premio total | **USD 35.000** | `[VERIFICADO: devpost]` |
| Categorías | **Una sola**: “WebMCP Challenge Winners”, Qty **10**, elegibles todas las submissions. Sin tracks por partner | `[VERIFICADO: rules §9]` |
| Office hours | 2026-08-31 11:00 am PT | `[VERIFICADO: netlify.com/blog/compete-openai-webmcp-challenge]`; no aparece en Devpost `[HIPÓTESIS en el canal]` |

### 1.1 La discrepancia de fecha, resuelta

Circulan tres fechas. **La autoridad son las Official Rules.**

- **Devpost (rules §2 + header + update del organizador)**: `September 3rd, 2026 (1:00 pm Pacific
  Time)`. Un update publicado el 2026-08-28 lo repite: *“the deadline set for Thursday, September
  3rd at 1:00 PM PT”* `[VERIFICADO: webmcp.devpost.com/updates]`. (Sep 3 de 2026 **sí** es jueves.)
- **Blog de Netlify**: dice “Sep 3, 2026 5 p.m. PT” → **incorrecto**, contradice las reglas.
- **“2026-09-04”** (community.openai.com y nuestra nota previa en
  `docs/audit-2026-08-26/findings/webmcp.md` §2.3): es **la misma hora** expresada en JST
  (13:00 PDT + 16 h = 05:00 del 4 en Japón). **No es una fecha distinta.**

> El propio update de Devpost titula “6 days left to build” pero en el cuerpo dice “7 days of prime
> building time” — inconsistencia de ellos. **Usá el timestamp duro, no el conteo.**

### 1.2 Premios (por cada uno de los 10 ganadores)

`[VERIFICADO: rules §9, tabla literal]`

| Sponsor | Premio |
|---|---|
| OpenAI | **USD 3.000 cash** + spotlight en @OpenAIDevs + **Codex Micro** + swag (hasta 3 miembros) + **ChatGPT Pro 1 año** (hasta 3 miembros) |
| Cloudflare | USD 10.000 en créditos |
| Vercel | USD 300/mes en créditos + USD 50/mes de Gateway × 12 meses |
| Render | USD 300 en créditos |
| Netlify | **USD 500 cash** |
| Shopify | USD 250 en gear |
| Google Chrome | Google AI Ultra 3 meses **por miembro del equipo** |

“**Each Project is eligible for one Prize**” — no acumulan `[VERIFICADO: rules §9]`.

**Perks para todos los inscritos** (no son premios): Netlify regala **3.000 créditos**, con
solicitud por formulario **antes del 2026-09-01 12:00 PT** y canje antes del 2026-10-03
`[VERIFICADO: rules §4]`. Render: USD 50 en créditos. Vercel: créditos de AI Gateway a los primeros
1.000 builders — el monto difiere entre fuentes `[HIPÓTESIS en la cifra]`.

---

## 2. Las reglas que nos afectan

### 2.1 Elegibilidad — pasamos, con una advertencia LatAm

- Mayores de edad, equipos y organizaciones `[VERIFICADO: rules §3]`.
- **Países excluidos**: Bielorrusia, **Brasil**, China, Crimea, Cuba, Donetsk, Hong Kong, Irán,
  Corea del Norte, Luhansk, **Quebec**, Rusia, Siria, **Venezuela** `[VERIFICADO: rules §3 + selector
  de países]`. **Colombia no está excluida.** Pero para un DAO latinoamericano importa: **ningún
  contributor residente en Venezuela o Brasil puede figurar como Entrant ni recibir premio.**
- Si entra un equipo u organización hay que designar un **Representative**, que declara actuar en
  nombre del grupo; el premio se le paga a él y él lo reparte `[VERIFICADO: rules §3 y §9]`.

### 2.2 Proyecto preexistente — **nuestra mejor carta**

Texto literal `[VERIFICADO: rules §4, “New & Existing”]`:

> *“Projects must be either newly created during the Hackathon Submission Period or, if the Project
> existed prior to the Submission Period, must have been **meaningfully extended using WebMCP after
> the Submission Period start date**. Pre-existing Projects will be evaluated **only on work added
> during the Submission Period**.”*
>
> *“Entrants with pre-existing Projects must provide clear documentation distinguishing prior work
> from new work, including evidence that it was meaningfully extended with WebMCP within the
> Submission Period (e.g., **timestamped, dated commit history**, or equivalent).”*

**Nuestro historial cumple casi perfecto** `[VERIFICADO: git log --date=iso en este repo; los 7
hashes existen con esas fechas]`:

| Commit | Fecha (local −04) | Qué |
|---|---|---|
| `c4e8a7c` | **2026-05-27** | `WebMCPProvider` original — **trabajo previo**, y era **código muerto**: usaba `navigator.modelContext.provideContext`, API que ya no existe; en prod `getTools()` devolvía `[]` |
| `8b412ee` | 2026-08-26 16:24 | migración a `document.modelContext.registerTool`, borra tools sin backend |
| `11441de` | 2026-08-26 20:34 | **11 tools** + provider dentro del Router + forms declarativos |
| `bf96621` | 2026-08-27 09:37 | **8 tools del ecosistema** + ruta `/ecosystem` |
| `e7f38d1` | 2026-08-27 15:34 | salidas ≤ 1.500 chars |
| `b0cf121` / `6f6b14d` | 2026-08-27 20:27 / 23:54 | **token del origin trial** en `public/index.html` |

Traducción: **todo el WebMCP que funciona nació el 2026-08-26 o después** — dentro de la ventana que
abrió el 2026-08-25 11:00 PT. Lo anterior no solo es previo: **no registraba una sola tool.** Eso se
documenta y se convierte en ventaja, no en riesgo.

### 2.3 Requisitos de submission (checklist literal)

`[VERIFICADO: rules §4 “Submission Requirements”]`

1. **URL en vivo** que los jueces puedan abrir **en el navegador in-app de ChatGPT desktop o en
   Chrome con WebMCP habilitado**. Se puede hostear donde sea; se permite autenticación
   (credenciales en el form).
2. **Descripción en texto** que explique **cuatro cosas puntuales**:
   - por qué el caso de uso encaja fuerte con WebMCP,
   - cómo mejora la experiencia de usuario,
   - **qué pueden hacer juntos personas y agentes que antes era difícil o imposible**,
   - cómo se implementó WebMCP.
3. **Repo público** (GitHub/GitLab/Bitbucket) que **debe** contener:
   - todo el código, assets e instrucciones para correrlo,
   - **archivo de licencia open source, detectable y visible en el “About” del repo** (lo repiten
     dos veces en la misma lista),
   - y — literal en las reglas — código del tipo
     `document.modelContext.registerTool({ name, description, inputSchema, execute })`.
4. **Video demo**: **< 3 minutos**, con **audio** explicando qué construiste y cómo usaste WebMCP,
   **subido a YouTube público**, sin marcas de terceros ni música con copyright.
5. **Todo el material en inglés** (o con traducción al inglés del video, la descripción y las
   testing instructions) `[VERIFICADO: rules §4 “Language Requirements”]`.
6. Testing: acceso gratis y sin restricciones hasta que termine el Judging Period. *“Judges are not
   required to test the Project and may choose to judge based solely on the text description,
   images, and video provided”* — **el video puede ser lo único que vean.**

**Equipos**: sin tope de tamaño. Se pueden mandar varias submissions si son sustancialmente
distintas `[VERIFICADO: rules §3 y §4]`.

---

## 3. Cómo se evalúa

**Stage One** (pass/fail): que encaje en el tema y **use de verdad** las APIs del hackathon.
**Stage Two**: cuatro criterios **con peso igual** `[VERIFICADO: rules §7]`:

| Criterio | Pregunta literal del jurado |
|---|---|
| **WebMCP Leverage** | ¿Qué tan a fondo y con qué habilidad usa WebMCP? ¿El código refleja esfuerzo genuino y una implementación **no trivial** que funciona? |
| **Execution** | ¿Entrega un producto **completo y coherente**, no solo una prueba de concepto técnica? |
| **Potential Impact** | ¿Plantea un caso **creíble y específico** de resolver un problema real para una audiencia real — y lo resuelve según lo demostrado? |
| **Creativity & Ambition** | ¿Qué tan creativo y novedoso es el concepto y en qué se diferencia de lo que ya existe? |

**Desempate**: gana el que puntúe más alto en **WebMCP Leverage**, luego el siguiente
`[VERIFICADO: rules §7 “Tie Breaking”]`. **En la práctica, WebMCP Leverage es el criterio que más
pesa.**

**Jurado** `[VERIFICADO: webmcp.devpost.com, sección Judges]`:

| Juez | Cargo |
|---|---|
| Andrew Galloni | VP Research & Innovation, Cloudflare |
| **Alex Nahas** | **Creator of MCP-B** (el precursor de WebMCP) |
| Ilya Grigorik | Distinguished Engineer, Shopify |
| Jude Gao | Member of Technical Staff, Vercel · Next.js Core Team |
| Justin Rushing | **Browser Platform Lead, OpenAI** |
| Sarah Drasner | Distinguished Engineer, Chrome, Google |
| Sean Roberts | VP of Applied AI, Netlify |

Las reglas se reservan usar *“expert panels, peer review, **automated AI-driven analysis**, or any
combination”* — o sea que **el repo y el texto los va a leer un modelo**, no solo humanos.

**Lectura del jurado:** seis de siete vienen de infra web y comercio. Un sitio de DAO no les habla
solo. **El pitch no puede ser “el sitio de un DAO”: tiene que ser “una organización agent-native —
la operación entera de una org distribuida expuesta como tools, donde el agente del visitante habla
con nuestros agentes autónomos”.**

---

## 4. El listón: qué publicaron OpenAI y los partners

- **Showcase oficial de OpenAI**: la pestaña “WebMCP apps” **sigue vacía** — literal *“WebMCP
  examples are coming soon”* `[VERIFICADO: curl + grep sobre developers.openai.com/showcase]`. Sí hay
  entradas individuales que son WebMCP: **Codex Modeling Studio** (suite 3D web-native de OpenAI con
  WebAssembly + WebGPU, sin servidor de aplicación; Codex inspecciona la escena y cambia geometría
  vía WebMCP) y **Runme** (app 100% cliente que evita montar un MCP remoto justamente usando WebMCP).
- **ChatGPT desktop** shippeó soporte WebMCP el 2026-08-25 (**“Site tools”**): el navegador in-app
  descubre las tools solo `[VERIFICADO: learn.chatgpt.com/docs/webmcp]`.
- **Netlify** publicó **5 demos forkeables**: WebMCP Starter, **Kurio** (marketplace con carrito y
  checkout), **Tagboard** (guestbook moderado), **Mabel's Table** (reservas con estado dinámico) y
  **The Archive** (juego de misterio colaborativo).
- **Cloudflare**: demo de coffee-store + template para Workers. **Vercel**: storefront open source.
  **Chrome**: hook `useWebMCPTool` para React, soporte nativo en Angular, evaluación de tools y
  debugging en DevTools. **Shopify**: millones de storefronts ya WebMCP-enabled.

**Conclusión del listón:** la masa de ejemplos es **e-commerce** — casi todos *un* flujo
transaccional. **Nadie está mostrando una organización entera operable por agentes, ni tools que lean
el chat en vivo de otros agentes autónomos.** Ahí está nuestro hueco.

> La galería de proyectos de Devpost **todavía no se publicó** (*“The hackathon managers haven't
> published this gallery yet”*), así que **no hay visibilidad de la competencia**
> `[VERIFICADO: webmcp.devpost.com/project-gallery]`.

---

## 5. La candidatura de ultravioletadao.xyz

### 5.1 El pitch en una frase

> **ultravioletadao.xyz es el primer sitio donde el agente de un visitante no solo opera la página:
> se asoma a una organización que ya corre con agentes autónomos adentro** — lee la tesorería
> multisig real, busca dentro de **412 streams** indexados con deep-link al segundo exacto del video,
> mira el grafo del ecosistema que otro agente (c0der) midió hace minutos, lee el canal IRC donde
> agentes autónomos negocian tareas con escrow, y postula a la membresía dejando que el humano dé el
> submit.

### 5.2 Fortalezas mapeadas 1:1 a los criterios

**WebMCP Leverage** — el criterio de desempate, y donde estamos mejor

- **19 tools imperativas** registradas con `document.modelContext.registerTool` en todas las páginas,
  más **2 forms declarativos** `[VERIFICADO: src/agent/tools.js (11) + src/agent/ecosystemTools.js
  (8) + docs/WEBMCP_TOOLS.md]`. Los ejemplos de los partners tienen típicamente 4–8.
- **Las 19 se probaron una por una en producción**, en Chrome estable, dos pasadas, con latencias
  medidas (1 ms a 2.184 ms) y salidas reales `[VERIFICADO: docs/WEBMCP_TOOLS.md, tabla completa]`.
  Mostrar esa tabla es evidencia dura de *“genuine effort and a working, non-trivial implementation”*
  — el texto exacto del criterio.
- **Origin trial activo**: el token está en `public/index.html` y responde en producción
  `[VERIFICADO: curl a ultravioletadao.xyz → <meta http-equiv="origin-trial">]`. **Cualquier juez con
  Chrome estable ve las tools sin activar ningún flag.** Los proyectos que exigen `chrome://flags`
  pierden jueces por fricción.
- **Usamos las dos APIs de la spec, no solo la imperativa**: forms declarativos con `respondWith()`,
  verificado end-to-end en prod — el agente invoca `stream_search_form`, Chrome pre-llena el input,
  **el humano da submit**, y `respondWith()` le devuelve al agente 3 resultados reales mientras la UI
  queda mostrándolos. Ese es literalmente el *“human-agent experience”* que piden.
- **Disciplina de spec**: salidas ≤ 1.500 chars (el límite que recomienda Chrome) y errores que
  devuelven `{"error":"unknown_*","allowed":[…]}` para que el agente **se autocorrija en una
  iteración sin leer código**. Y un bug real encontrado y arreglado probando en prod (Chrome exige un
  submit button habilitado al ejecutar un form declarativo; PR #105/#106).

**Execution**

- No es un demo: es **el sitio de producción de una organización real**, con i18n en 4 idiomas,
  gobernanza en Snapshot, multisig de 30 owners / threshold 15 y 412 streams indexados.
- Las tools **tocan la UI de verdad**: `navigate_to` navega la SPA, `set_language` cambia
  `<html lang>` y toda la interfaz, `focus_ecosystem_node` selecciona el nodo en el grafo,
  `open_terminal` abre y enfoca la ventana, `set_desk_mode` cambia el modo exposé. **El humano ve en
  pantalla exactamente lo que el agente está haciendo** — la diferencia entre WebMCP y “un cliente de
  API disfrazado”.
- **Las tres puertas completas** (nuevo, 2026-08-28): WebMCP en la pestaña **+ MCP remoto propio en
  `api.ultravioletadao.xyz/mcp` con 13 tools + descubrimiento** `[VERIFICADO: POST tools/list → 13]`.
  No suma en *WebMCP Leverage* (un MCP remoto no es WebMCP), **pero sí en Execution**: demuestra la
  arquitectura de dos capas que la propia doc de Chrome recomienda, y cierra la debilidad D4.

**Potential Impact**

- **Datos vivos, no fixtures**: precio y market cap desde DexScreener, tesorería desde la Safe API,
  propuestas desde Snapshot GraphQL, 21 redes desde nuestro propio facilitator x402, el grafo del
  ecosistema desde S3 (barrido de c0der de hacía 8 minutos) y mensajes IRC de `#agents` de hacía
  minutos `[VERIFICADO: docs/WEBMCP_TOOLS.md]`.
- **Audiencia específica y real**: comunidades Web3 latinoamericanas que hoy pierden su conocimiento
  adentro de videos de stream de tres horas. `search_stream_memory` devuelve el momento exacto con
  deep-link `?t=` al VOD. Problema concreto, audiencia concreta.
- **Pagos x402 sin gas**: el facilitator propio expone 21 redes; un agente puede verificar y liquidar
  pagos USDC gasless (EIP-3009) sin que el usuario firme gas.

**Creativity & Ambition** — nuestro diferenciador más fuerte

- **El ecosistema tiene 6 MCP remotos propios ya en pie**, verificados con `POST initialize`:
  el nuestro (`api.ultravioletadao.xyz/mcp`, 13 tools), KarmaKadabra
  (`karmakadabra.ultravioletadao.xyz/mcp`, sin auth), describe.net (tools + prompts + resources),
  MeshRelay (`api.meshrelay.xyz/mcp`, **401 con auth ERC-8128 propia**), 402milly
  (`mcp.402milly.xyz/mcp`) y Execution Market. Los **seis** sitios publican
  `/.well-known/mcp/server-card.json` con `200` `[VERIFICADO: curl a los 7 hosts, 2026-08-28]`.
- **MeshRelay ya arranca con un bootstrap de WebMCP como primer script del HTML** y describe.net
  declara 7 tools WebMCP en sus metas `[VERIFICADO: curl al HTML de los dos]`. **No es un sitio
  experimentando con WebMCP: es un ecosistema.**
- **Agentes autónomos negociando en vivo**: `api.meshrelay.xyz/irc/channels` devuelve `#agents` con
  usuarios conectados, más `#bounties` con topic *“Execution Market task feed | /claim &lt;id&gt; to
  apply”* y `#workers`. Nuestra tool `get_ecosystem_messages` **ya lee ese canal en vivo desde la
  página**.
- **La historia que ningún competidor de e-commerce puede contar**: *“tu agente y mis agentes en la
  misma página”*. Cuando un juez abre ChatGPT desktop en nuestro sitio y pregunta “¿qué están
  haciendo los agentes ahora?”, ChatGPT llama `get_ecosystem_messages` y le muestra agentes autónomos
  discutiendo tareas con escrow, en tiempo real. Eso responde textual la pregunta del formulario:
  *“what people and agents can do together that was difficult or impossible before”*.

### 5.3 Debilidades honestas

| # | Debilidad | Costo en el jurado |
|---|---|---|
| **D1** | **17 de 19 tools son de lectura o de UI.** El único write real es `apply_dao_membership`. Los ejemplos de referencia (Kurio, Mabel's Table, storefront de Vercel) todos **cierran una transacción** | Execution, Creativity |
| **D2** | **6 de las 19 solo tienen sentido dentro de la página.** Un juez apurado puede leerlas como relleno | WebMCP Leverage |
| **D3** | **El sitio es español-first.** Todo el material del submission va en inglés y el juez abre la URL en inglés o no entiende nada | Execution |
| **D4** | **El server-card miente**: anuncia el endpoint MCP con `"x-status": "planned"`. **Parcialmente resuelto**: el endpoint ya existe y el card v2.0.0 corregido está en `feat/remote-mcp` — **falta deployarlo** | Execution, credibilidad |
| **D5** | **“Sitio de un DAO” no le habla a un jurado de Cloudflare/Shopify/Vercel.** Si el pitch es governance, se lee como nicho | Potential Impact |
| **D6** | **No está verificado en el navegador in-app de ChatGPT desktop** — solo en Chrome estable. Es el entorno donde los jueces van a probar | **Riesgo de Stage One** |

### 5.4 Bloqueos duros

| # | Bloqueo | Estado | Evidencia |
|---|---|---|---|
| **B1** | **Repo sin licencia open source.** Las reglas lo exigen dos veces y piden que sea detectable en el “About” | El repo `github.com/UltravioletaDAO/uvdweb` es **público** pero **`license: null`** y **no hay archivo `LICENSE*`** | `[VERIFICADO: api.github.com/repos/UltravioletaDAO/uvdweb + ls LICENSE* → no existe, reconfirmado hoy]` |
| **B2** | **Video de YouTube < 3 min con audio en inglés.** Los jueces pueden juzgar *solo* por el video | Inexistente | — |
| **B3** | **Registro en Devpost** (“Join Hackathon”) + submission form | Sin confirmar | — |
| **B4** | **Documento prior-work vs new-work** con commit history fechado, en inglés | No existe; los datos sí (§2.2) | `[VERIFICADO: git log]` |
| B5 | Verificar que el sitio expone las tools **en el navegador in-app de ChatGPT desktop** | No probado | — |

**B1 y B4 son de bajo esfuerzo y alto riesgo si se olvidan.** B1 exige un push a `main`, o sea **OK
explícito de Saul**.

---

## 6. Plan día por día hasta el cierre

Restan **6 días**. Prioridad: primero lo que **invalida**, después **WebMCP Leverage** (criterio de
desempate), después el video (puede ser lo único que vean). Cada paso lleva su `verify:`.

### D0 — viernes 2026-08-28 · *desbloquear*

1. **Registrarse en Devpost** (“Join Hackathon”) y crear la submission en **borrador**.
   → `verify:` la submission aparece en “My projects”.
2. **Agregar `LICENSE` (MIT) en la raíz** del repo, en `main`. → `verify:`
   `api.github.com/repos/UltravioletaDAO/uvdweb` devuelve `license.spdx_id: "MIT"` y GitHub lo
   muestra en el About. **⚠️ requiere OK explícito de Saul para el push.**
3. **Probar el sitio en el navegador in-app de ChatGPT desktop** (riesgo B5/D6): abrir
   `ultravioletadao.xyz`, mirar “Site tools” en la barra de direcciones, ejecutar
   `search_stream_memory` y `get_ecosystem_messages`. → `verify:` screenshot con las 19 tools
   listadas y una respuesta real. **Si acá falla algo, todo el plan se reordena.**
4. ~~**Fix del server-card (D4)**: quitarle la promesa de `/mcp`.~~ **Superado por los hechos**: el
   MCP remoto se construyó hoy y **ya responde** `[VERIFICADO: tools/list → 13]`. El fix ahora es
   **deployar el card v2.0.0** que está en `feat/remote-mcp`, que declara el endpoint real.
   → `verify:` ningún endpoint anunciado en el card devuelve 404.

### D1 — sábado 2026-08-29 · *cerrar la brecha de “qué pueden hacer juntos”*

5. **Panel de sesión de agente en la UI** (ataca D2 y el criterio human-agent): un log en vivo,
   visible en la página, que muestre cada tool que el agente llamó — nombre, args, duración, tamaño
   de salida. Es barato, se filma precioso, y convierte las 6 tools de UI de “relleno” en “el humano
   ve al agente operar”. → `verify:` abrir en Chrome, ejecutar 3 tools desde DevTools, ver las 3
   filas aparecer en pantalla.
6. **Un tercer form declarativo con write real** (ataca D1): el patrón agente-propone /
   humano-aprueba sobre el flujo que ya tiene backend (`POST /apply`). Es la mecánica que las reglas
   premian y que Netlify demuestra en Mabel's Table. → `verify:` el agente invoca el form, Chrome
   pre-llena, submit humano, `respondWith()` devuelve el resultado real.

   > **Descartado por dependencia externa**: que el agente del visitante *escriba* en el IRC de
   > MeshRelay sería la demo perfecta, pero su OpenAPI **no expone POST público** a
   > `/irc/channels/{channel}/messages` (solo GET) y `POST /mcp` exige API key
   > `[VERIFICADO: curl api.meshrelay.xyz/openapi.json]`. Requeriría trabajo del lado de MeshRelay:
   > **no cabe en 6 días con garantía.** Queda como stretch, no como plan.

### D2 — domingo 2026-08-30 · *que el juez entienda, en inglés*

7. **Inglés por defecto para el juez** (D3): que `?lang=en` fije el idioma desde la primera pintada,
   y usar esa URL en el submission y en las testing instructions. → `verify:` abrir la URL en una
   ventana limpia y ver la UI en inglés sin tocar nada.
8. **`README.md` en inglés** con sección WebMCP: las 19 tools en tabla, el snippet de
   `document.modelContext.registerTool` (las reglas piden que el repo lo contenga) y cómo probarlo.
   → `verify:` el README renderiza en la portada del repo con la tabla y el snippet.
9. **`HACKATHON.md` en inglés** (B4): tabla prior-work vs new-work con los hashes y fechas de §2.2,
   diciendo sin adorno que el provider de mayo era código muerto que registraba cero tools y que las
   19 nacieron el 26–28 de agosto. → `verify:` cada hash de la tabla existe en `git log` con esa
   fecha.

### D3 — lunes 2026-08-31 · *guion y tomas*

10. **Office hours 11:00 PT** (13:00 COT) si se confirma el canal: es la ocasión de preguntarle al
    organizador cualquier duda sobre *“meaningfully extended”*.
11. **Guion del video en inglés, cronometrado a 2:40**, con esta estructura:
    `0:00–0:20` el problema · `0:20–1:40` **demo en vivo en ChatGPT desktop** (pregunta en lenguaje
    natural → ChatGPT llama `search_stream_memory` → la página muestra el momento con deep-link → “y
    ahora mirá qué están haciendo los agentes” → `get_ecosystem_messages` con IRC en vivo) ·
    `1:40–2:20` el form declarativo con el submit humano · `2:20–2:40` las 19 tools y la tabla de
    latencias. → `verify:` leerlo en voz alta con cronómetro y que dé < 2:50.
12. **Grabar las tomas.** → `verify:` archivos en disco, **sin credenciales ni claves visibles en
    pantalla** (⚠️ regla de stream: nada de `.env`, wallets ni keys en cámara).

### D4 — martes 2026-09-01 · *video*

13. **Pedir los 3.000 créditos de Netlify antes de las 12:00 PT** (14:00 COT) — es gratis y es hoy o
    nunca. → `verify:` confirmación del formulario.
14. **Editar y subir el video a YouTube público**, < 3:00, audio en inglés, sin música con copyright
    ni logos de terceros. → `verify:` link público abierto en incógnito, duración < 3:00.

### D5 — miércoles 2026-09-02 · *el texto y el ensayo de juez*

15. **Escribir la descripción del submission** respondiendo textualmente los 4 puntos de §2.3.2, en
    inglés, con el encuadre de §5.1 (organización agent-native, **no** “sitio de un DAO”).
    → `verify:` los 4 puntos tienen su propio subtítulo en el texto.
16. **Ensayo completo de juez**: máquina limpia, abrir la URL en ChatGPT desktop **y** en Chrome
    estable, correr 6 tools, cronometrar. Anotar todo lo que se rompa. → `verify:` checklist 6/6.
17. **Llenar el Devpost completo** y dejarlo guardado como draft: URL, repo, video, descripción,
    testing instructions, Representative. → `verify:` Devpost no muestra campos requeridos vacíos.

### D6 — jueves 2026-09-03 · *submit temprano*

18. **Enviar antes de las 10:00 COT** — cinco horas de colchón antes de las **15:00 COT / 13:00 PDT**.
    → `verify:` email de confirmación de Devpost + la submission visible en el perfil.
19. **Congelar deploys a producción** hasta que termine el Judging Period (**2026-09-21 17:00 PT**):
    la URL tiene que seguir viva y funcionando durante tres semanas. Un deploy que rompa
    `document.modelContext` en esa ventana nos saca.

### Lo que NO cabe — y por qué está bien

- **Federación de MCP del ecosistema** (`uvd_ecosystem_mcp_index` y las tools federadas de
  KarmaKadabra / describe.net / 402milly): es la Opción C de `docs/ECOSYSTEM_MCP.md`, no es WebMCP y
  no suma en el criterio de desempate. **Va al backlog post-hackathon.**
- **Escritura del visitante en el IRC**: bloqueada por MeshRelay (§D1, paso 6).
- **Renovar el origin trial**: vence con Chrome 156 el 2026-11-16, muy después del judging. No es del
  hackathon.

> **Nota sobre el MCP remoto:** el dossier original lo listaba acá como “no cabe”. **Se construyó
> igual el 2026-08-28** y ya está en producción con 13 tools. No cambia la evaluación de *WebMCP
> Leverage* — un MCP remoto no es WebMCP — pero **cierra D4** y le da al pitch la línea “las tres
> puertas completas”, que es Execution y Ambition. Detalle en `docs/AGENT_ACCESS.md`.

---

## 7. Riesgos y decisiones que necesitan OK de Saul

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **R1 — el sitio no expone tools en el navegador in-app de ChatGPT** | Stage One en riesgo: es el entorno de prueba de los jueces | Probarlo **ya** (D0 paso 3). Si falla, es la única prioridad del sábado |
| **R2 — el LICENSE no se pushea a tiempo** | **Submission inválida** por regla explícita | Es un archivo. Necesita **OK explícito de Saul para el push a `main`** |
| **R3 — un deploy rompe prod entre el 3 y el 21 de septiembre** | Los jueces abren la URL y no hay tools | Congelar deploys (D6 paso 19) |
| **R4 — contributors del DAO en Venezuela o Brasil** | No pueden figurar como Entrants ni cobrar | El Representative debe residir en país elegible; **Colombia sirve** |
| **R5 — 3.384 inscritos compitiendo por 10 puestos** | ~0,3% de tasa de premio si todos entregan | Jugar el diferenciador (§5.2 Creativity), no competir en e-commerce |
| **R6 — el jurado usa análisis automático del repo** | Un repo desordenado o sin README de WebMCP puntúa bajo | D2 pasos 8–9 |

**Decisiones que Saul tiene que tomar antes del D1:**

1. **¿Licencia MIT o Apache-2.0?** MIT es lo que espera un jurado de hackathon; Apache-2.0 agrega
   cláusula de patentes. → habilita B1.
2. **¿Quién es el Representative?** El premio se paga a esa persona y ella lo reparte.
3. **¿Se entra como individuo o como organización (UltravioletaDAO)?** Afecta el W-8BEN y a quién se
   le paga.
4. **¿Se congelan los deploys del 3 al 21 de septiembre?**

---

## 8. Fuentes

**Primarias (leídas el 2026-08-28; todas reconfirmadas con `200` el mismo día)**

- Reglas oficiales: https://webmcp.devpost.com/rules — todas las citas de §1, §2 y §3 salen de ahí.
- Página del hackathon: https://webmcp.devpost.com/ — deadline, 3.384 participantes, jueces,
  criterios, países excluidos.
- Updates del organizador: https://webmcp.devpost.com/updates
- Recursos: https://webmcp.devpost.com/resources
- Galería: https://webmcp.devpost.com/project-gallery — **aún no publicada**.
- Anuncio de OpenAI: https://community.openai.com/t/the-webmcp-challenge-is-here/1392582
- Showcase: https://developers.openai.com/showcase/codex-modeling-studio
- Netlify: https://www.netlify.com/blog/compete-openai-webmcp-challenge/
- Site tools de ChatGPT desktop: https://learn.chatgpt.com/docs/webmcp
- Repo del sitio: https://github.com/UltravioletaDAO/uvdweb
- `https://openai.com/webmcp-challenge/` → **no se usó como fuente**: devolvió 403 vía WebFetch
  durante la investigación (con `curl` + User-Agent de navegador sí da 200 `[VERIFICADO]`, o sea que
  el 403 era anti-bot, no una página caída). Su contenido se corroboró igual por Devpost y el foro
  de OpenAI, que son la fuente autoritativa.
- X / Twitter (@OpenAIDevs, @ChromiumDev) → **no consultada** (exige login).

**Internas**

- Capa WebMCP, tool por tool, con latencias medidas: `docs/WEBMCP_TOOLS.md`
- Las tres puertas y el MCP remoto: `docs/AGENT_ACCESS.md`
- El ecosistema y la federación: `docs/ECOSYSTEM_MCP.md`
- Dossier de investigación de origen:
  `Z:/ultravioleta/code/web/docs/research-2026-08-28/WEBMCP_HACKATHON.md`
