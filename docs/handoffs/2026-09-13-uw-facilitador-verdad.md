# La card MCP y la ficha del facilitador dejan de mentir — uvdweb — 2026-09-13

Rama `0xultravioleta/uw-facilitador-verdad`, creada desde `origin/develop` (`b5e92d9`), con PR contra `develop`.
Worker de Orca `task_00798d023ad8`, despachado por c0der (master-4). Filas del encargo: **[7]** y **[74]**.

## Resumen en tres líneas

- **[7] cerrada en el repo.** La card decía que verify/settle "no son tools MCP", pero el facilitador sí las sirve por MCP. Para el cierre vivo falta el deploy.
- **[74] cerrada, con la cifra del encargo refutada.** El facilitador sirve **39** redes, no 78: `/supported` repite cada red en v1 (`base`) y en CAIP-2 (`eip155:8453`), y 78 es ese doble conteo. La ficha ya no tipea la cifra, la lee de `/supported`.
- Quedan cinco filas nuevas en `docs/planning/BACKLOG.md`. La más importante: el pulso del ecosistema imprime el mismo 78 en Home y en `/ecosystem`.

## Base del PR: `develop`

El worktree nació en `origin/main` (`927c228`). Lo moví a `origin/develop` antes de escribir nada, sin commits de por medio.

- Los PR de feature entran a `develop` y `develop` se promueve a `main`. #127 `uw-ci`, #126 `uw-backlog`, #124, #122, #120 y #118 fueron a `develop`; #129, #125, #123, #121, #119 y #117 son `develop` → `main` (`gh pr list --state merged --limit 12`).
- `.github/workflows/frontend-ci.yml:10-18` corre en `push` y en `pull_request` a `develop` y a `main`, así que este PR pasa por la compuerta.
- No choca con #130 (`develop` → `main`), que toca `infra/terraform/edge/*`, `src/i18n/bundles/wheel.*`, `src/pages/UvdWheelPage.js` y `src/utils/wheelParticipants*`.

## Qué cambió

### [7] MCP server card

| Archivo | Cambio |
|---|---|
| `public/.well-known/mcp/server-card.json:415` | `x402.description` decía *"Verify/settle are plain HTTP endpoints of the facilitator, not MCP tools"*. Ahora dice que además son tools del MCP del facilitador (`x402_verify`, `x402_settle`) y cita su card, `https://facilitator.ultravioletadao.xyz/.well-known/mcp/server-card.json`. También quité *"x402 v1 … scheme exact"*: `/supported` sirve v1 y v2 con cinco esquemas (`exact`, `upto`, `escrow`, `commerce`, `fhe-transfer`) |
| `scripts/generateMcpServerCard.js:79` | El mismo texto. La card sale de este script: corregir solo el JSON dejaba la frase vieja lista para volver en la próxima regeneración |
| `src/agent/__tests__/mcpServerCard.test.js` (nuevo) | Falla si la card o el generador vuelven a decir "not MCP tools". Exige `x402_verify`, `x402_settle` y la URL de la card del facilitador, y que el generador tenga el mismo texto que la card |

Antes de escribir lo medí en vivo: `POST https://facilitator.ultravioletadao.xyz/mcp` con `tools/list` devuelve `x402_supported`, `x402_accepts`, `x402_verify` y `x402_settle`. La card del facilitador declara `serverInfo.version` 2.28.0 y transporte `streamable-http` en `/mcp`.

No regeneré la card con `node scripts/generateMcpServerCard.js`. Ese script llama al MCP vivo de `api.ultravioletadao.xyz` y habría metido en el diff cualquier drift de tools ajeno a esta fila.

### [74] Cifra de redes

| Archivo | Cambio |
|---|---|
| `src/services/facilitator/supportedNetworks.js` (nuevo) | `countFacilitatorNetworks(kinds)` une `network` y `networkAliases` de cada kind y cuenta redes distintas. Si no hay kinds devuelve `null`, nunca 0 |
| `src/pages/FacilitatorPage.js` | El chip `'8 Networks'` (línea 50) sale de `useLiveMetric` sobre `ENDPOINTS.facilitator_supported.url` (la allowlist única de endpoints) más el helper. Sin respuesta muestra `features.facilitator.stats.networksUnknown`, sin cifra. El `featureList` del JSON-LD (línea 104, *"4 mainnets + 4 testnets"*) usa la misma cifra viva, o ninguna |
| `src/components/SEO.js:315` | *"Multi-network: 4 mainnets + 4 testnets"* queda sin cifra |
| `src/i18n/{en,es,pt,fr}.json` | `features.facilitator.stats.networks` pasa del literal viejo a `{{count}} Networks / Redes / Réseaux` y se agrega `networksUnknown`. `facilitatorPage.features.multichain.description` deja de decir "4 mainnets … 4 testnets". `fr.json:199` también tenía el literal, aunque el encargo no lo nombraba |
| `src/services/facilitator/__tests__/supportedNetworks.test.js` (nuevo) | Cubre la deduplicación v1/CAIP-2, varios esquemas por red, un kind sin alias y el `null` sin kinds |
| `src/pages/__tests__/facilitatorNetworkFigure.test.js` (nuevo) | Verifica que ni los cuatro diccionarios, ni `FacilitatorPage.js`, ni `SEO.js` traigan un número pegado a networks/redes/réseaux/mainnets/testnets, y que la página lea del endpoint |

**Por qué toqué la descripción multired, el JSON-LD y `SEO.js`, además del chip.** Es la misma cifra (ocho, o sea cuatro más cuatro) en la misma ficha. Arreglar solo el chip habría dejado "39 Networks" arriba de "Live on 4 mainnets and 4 testnets".

**Hallazgo.** Ningún componente usaba los keys `features.facilitator.stats.*` (`grep` sin resultados en `src/`). Lo que se veía era el literal en inglés de `FacilitatorPage.js:50`, igual en los cuatro idiomas. Ahora el chip usa ese key y se traduce.

## Estado de cada fila

### [7] — CERRADA en el repo, con el cierre vivo pendiente del deploy

```
$ curl -s https://ultravioletadao.xyz/.well-known/mcp/server-card.json | grep -c "not MCP tools"
1        # 2026-09-13, antes del merge; tiene que dar 0 cuando la promoción llegue a main
$ git grep -n "not MCP tools" -- public scripts
(vacío)
$ CI=true npx react-scripts test --watchAll=false src/agent/__tests__/mcpServerCard
Tests: 3 passed
```

### [74] — CERRADA, con la cifra del encargo (78) REFUTADA: son 39

```
$ curl -s https://facilitator.ultravioletadao.xyz/supported | node -e "<conteo de la sección de verificación>"
kinds 150 network strings 78 redes 39
```

Los 150 kinds traen `networkAliases` con las dos grafías (`["base","eip155:8453"]`). Son 39 nombres v1 y 39 ids CAIP-2 de las mismas redes: 21 mainnets y 18 testnets según la regla `isTestnet` de `src/agent/tools.js`. El propio `tools.js:184` ya lo decía: *"/supported repite cada red como nombre y como CAIP-2"*.

```
$ git grep -n -E "8 (Networks|Redes)" -- src                 # árbol de esta rama
(vacío)
$ git grep -c -E "8 (Networks|Redes)" origin/main -- src     # hoy
en.json:1  es.json:1  pt.json:1  FacilitatorPage.js:1       # queda vacío cuando la promoción llegue a main
```

Verifiqué la página con el build de producción servido en local (`npm run build`, un servidor estático y Playwright):

| Caso | Chip de la tarjeta multired |
|---|---|
| `/facilitator?lang=en` con `/supported` vivo | **39 Networks**; el mismo navegador cuenta 39 sobre `/supported` |
| `/facilitator?lang=es` con `/supported` vivo | **39 Redes** |
| `/facilitator?lang=es` con `/supported` cortado y el caché local vacío | **Multi-red** (sin cifra) |

JSON-LD de la página: `"Multi-network support (39 networks)"` y `"Multi-network: mainnets and testnets listed live at GET /supported"`.

## Test discriminante: rojo → verde

- **Rojo.** Los tres archivos de test contra el código de `origin/develop`, antes de tocar código: `Test Suites: 3 failed · Tests: 12 failed, 1 passed, 13 total`. `supportedNetworks.test.js` falla con `Cannot find module '../supportedNetworks'`. El único que pasa es el de amarre "generador = card", porque en la base los dos tienen la misma frase vieja. El caso de `SEO.js` lo agregué después; en la base, la línea 315 de `git show origin/develop:src/components/SEO.js` trae *"Multi-network: 4 mainnets + 4 testnets"* y la regex la atrapa.
- **Verde.** Suite completa: `Test Suites: 11 passed · Tests: 120 passed`.

## Pre-CI (los pasos de `frontend-ci.yml`, corridos en local)

`python c0der/scripts/preci.py --repo . --base origin/develop --event pull_request` dice que el diff dispara solo `frontend-ci.yml`, que no tiene filtro de paths.

| Paso del workflow | Comando local | Resultado |
|---|---|---|
| Install | `npm ci` | exit 0, 2722 paquetes |
| Lint (informativo) | `npx eslint src/ --ext .js,.jsx` | 0 errores y 37 warnings. En los archivos tocados solo aparece `'useEffect' is defined but never used` en `FacilitatorPage.js:1`, que ya estaba |
| Unit Tests | `CI=true npm test -- --watchAll=false --passWithNoTests` | 11/11 suites, 120/120 tests |
| Build verification | `CI=false npm run build` (con las env del workflow) | exit 0 |
| Verificar build | `test -f build/index.html` y `du -sk build` | presente, 54.396 KB |

`npm run build` corre `prebuild`, que regenera `public/sitemap*.xml`. Los restauré y no van en el PR.

## Cómo se despliega

Leído del repo y de Amplify (solo lectura, con `aws amplify list-branches` y `list-domain-associations`):

- `amplify.yml:4-17` corre `npm ci`, después `npm run build`, y publica `build/`.
- En la app Amplify `uvdweb`, `develop` sale en `https://dev.ultravioletadao.xyz` y `main` es **PRODUCTION** en `https://ultravioletadao.xyz`; las dos ramas tienen autobuild. El dominio de marca pasa hoy por el borde CloudFront de `infra/terraform/edge/` (`main.tf:1`; `dns.tf:4` dice "El subdominio `dev` no se toca: sigue directo en Amplify"), y ese borde está en `develop`.
- Camino: merge de este PR a `develop` → dev en minutos → PR de promoción `develop` → `main` (hoy está abierto el #130) → producción.

## Cómo verificarlo en producción (o en dev, cambiando el host)

```
curl -s https://ultravioletadao.xyz/.well-known/mcp/server-card.json | grep -c "not MCP tools"   # 0
curl -s https://ultravioletadao.xyz/.well-known/mcp/server-card.json | grep -c "x402_verify"     # 1
curl -s https://facilitator.ultravioletadao.xyz/supported | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const k=JSON.parse(s).kinds;const p=new Map();const f=x=>{while(p.get(x)!==x)x=p.get(x);return x};for(const it of k){const n=[it.network,...(it.networkAliases||[])];n.forEach(a=>p.has(a)||p.set(a,a));const r=f(n[0]);n.forEach(a=>{const o=f(a);if(o!==r)p.set(o,r)})}console.log('kinds',k.length,'network strings',new Set(k.map(x=>x.network)).size,'redes',new Set([...p.keys()].map(f)).size)})"
```

Después hay que abrir `https://ultravioletadao.xyz/facilitator?lang=en`. El chip de "Multi-Network Support" tiene que decir `<redes> Networks`, con el mismo número que imprime el último comando (hoy, 39). El chip lo pinta el SPA en el navegador, así que `curl` a la página no lo ve.

## Para c0der

**Lo que NO hice, y por qué.** Todo esto queda fuera de la sección 2 del encargo, así que va como fila de backlog y no como código:

1. **El pulso del ecosistema sigue diciendo 78 redes** en Home y en `/ecosystem` (`src/services/ecosystem/endpoints.js:18`, `PulseTerm.jsx:205`, `FacSupportedTerm.jsx:18-29`). Es el mismo doble conteo, y ahora no coincide con el 39 de `/facilitator`. El arreglo es de una línea por superficie usando el helper nuevo. Ojo: el replay grabado (`src/data/ecosystem/replays/facilitator_supported.json`, del 2026-08-27) no trae `networkAliases` y hay que re-grabarlo. **P1: es el que más conviene encadenar.**
2. **La lista "Supported Networks" de `/facilitator`** sigue tipeando cuatro mainnets y cuatro testnets, y pone HyperEVM mainnet con chainId 998 (el facilitador la sirve como `eip155:999`). P1.
3. El SEO de `/facilitator` usa una lista cerrada de cuatro cadenas (`en.json:6`, `SEO.js:302`, `featureList` y `keywords`). P2.
4. `docs/ECOSYSTEM_MCP.md:36,84` dicen que el facilitador no tiene MCP. P2.
5. `frontend-ci.yml` no tiene `paths:`. P2, en su propio PR.

**Decisiones y avisos:**

- **Congelamiento de deploys.** `docs/planning/BACKLOG.md` tiene abierta (P1) la fila "Congelar deploys a prod del 2026-09-03 al 2026-09-21", y hoy cae adentro de esa ventana. En la práctica no se está respetando: #129 se mergeó a `main` el 2026-09-12. Mergear a `develop` solo despliega dev. Si la promoción a `main` espera al 22 lo deciden c0der o el dueño.
- La fila [74] daba 78 redes. Si alguien compara la página con `new Set(kinds.map(k => k.network)).size`, va a ver 39 contra 78. El número correcto es 39; el porqué está arriba.
- Marqué **Done** la fila del 2026-08-28 "MCP para el facilitator x402" de `docs/planning/BACKLOG.md`. Ese MCP ya existe en x402-rs, y la evidencia quedó en la fila.

## Filas de backlog nuevas (en `docs/planning/BACKLOG.md`)

| Date | Item | Priority | Status |
|---|---|---|---|
| 2026-09-13 | El pulso del ecosistema cuenta 78 redes del facilitador y son 39 | P1 | Open |
| 2026-09-13 | La sección "Supported Networks" de `/facilitator` lista 8 redes a mano y con chainId errado | P1 | Open |
| 2026-09-13 | SEO de `/facilitator` nombra solo Avalanche, Base, Celo y HyperEVM | P2 | Open |
| 2026-09-13 | Docs internas dicen que el facilitador no tiene MCP ni server-card | P2 | Open |
| 2026-09-13 | `frontend-ci.yml` corre con cualquier archivo | P2 | Open |
