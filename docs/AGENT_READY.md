# agent-ready en ultravioletadao.xyz

Qué superficies para agentes publica el dominio de marca, de dónde sale cada una, qué paso del
deploy la sube y qué checks de agent-ready no se cumplen con verdad (con su motivo, para que se
excluyan en vez de fabricarlos).

La herramienta es `agent_ready.py`, la que publicó c0der:
https://gist.github.com/0xultravioleta/e5d94ff3f2990db75392de2ccc0ba2bd. El test que ata cada ruta
a su content-type y a que su cuerpo no sea el `index.html` de la SPA es
`src/agent/__tests__/agentReadySurfaces.test.js`.

## Cómo llega un archivo al dominio

`public/` → build de Amplify de la rama `main` (`amplify.yml`: `npm ci` y `npm run build`; CRA
copia `public/` a `build/` tal cual) → Amplify Hosting (app `dhck0d8f8ypxv`), con las cabeceras de
`customHttp.yml` y las reglas de reescritura de `uvd-backend/environments/prod/amplify.tf` → borde
propio de CloudFront (`infra/terraform/edge`, sin caché, solo negocia Markdown y redirige `www`).

La trampa de este camino: la regla SPA de Amplify reescribe a `/index.html` con 200 **toda ruta
sin extensión, aunque el archivo exista** (`/.well-known/x402` daba la home). Una superficie nueva
lleva extensión (`.json`, `.md`, `.txt`, `.xml`) o, si el estándar exige la ruta sin extensión,
una copia `.json` más una regla 200 en `amplify.tf` (así se sirven `api-catalog` y
`oauth-protected-resource`). El test lo verifica con la regla copiada de `amplify.tf`.

## Los checks, uno por uno

Medido por c0der el 2026-10-02 en producción (`agent_ready.py --url https://ultravioletadao.xyz`,
perfil por defecto): 65 % (26/40).

| Check | Antes | Ahora | Archivo | Qué lo publica |
|---|---|---|---|---|
| `wellknown-json-valid` | FAIL: `$schema` en `schemas.agentskills.io`, host que no resuelve (NXDOMAIN de nuevo el 2026-10-02) | se quitó el `$schema` | `public/.well-known/agent-skills/index.json` | build de Amplify |
| `mcp-endpoint-live` | FAIL: `transport` era un array con `url` adentro; el check busca `transport.endpoint` o `url` | `transport` es un objeto con `endpoint`, la forma de los MCP hermanos (execution-market, meshrelay) | `public/.well-known/mcp/server-card.json` y su generador `scripts/generateMcpServerCard.js` | build de Amplify |
| `openapi-json` | FAIL: 404 | publicado, al día con el backend | `public/openapi.json` (copia idéntica en `public/.well-known/openapi/uvdao-api.json`, que enlaza el api-catalog) | build de Amplify |
| `skill-md` | FAIL: 404 | publicado | `public/skill.md` | build de Amplify |
| `agent-card` | FAIL: 404 | sin cambio: excluir (ver abajo) | — | — |
| `agent-json-legacy` | FAIL: 404 | sin cambio: excluir (ver abajo) | — | — |
| `x402-discovery` | FAIL: la SPA devolvía el `index.html` | sin cambio: fuera del perfil (ver abajo) | — | — |

No hace falta `terraform apply` en `infra/terraform/edge` ni tocar las reglas de Amplify: los dos
archivos nuevos llevan extensión excluida de la regla SPA y el borde no reescribe rutas con extensión.

`llms.txt` enlaza ahora `skill.md` y `openapi.json`.

### El OpenAPI

Describe `https://api.ultravioletadao.xyz` contra el código de `uvd-backend`
(`services/new-applicants/app.js` y `mcp.js`, `origin/main` en `589463b`): `getStatus`,
`getHealth`, `applyMembership`, `getApplicationStatus`, `registerWallet` (que ahora declara el
token de Twitch del streamer que exige) y `mcpJsonRpc`. La versión anterior no tenía `/health`,
`/apply/status/{email}` ni `/mcp` y describía `/wallets` sin autenticación.

Se edita `public/openapi.json` y se copia a `public/.well-known/openapi/uvdao-api.json`; el test
falla si difieren en un byte. Los `operationId` publicados están fijados en el test: uno nuevo se
agrega, uno que cambia o desaparece lo pone rojo (un agente escribió código contra él).

## Lo que no se cumple con verdad (excluir, no fabricar)

**`agent-card` y `agent-json-legacy`: no hay servidor A2A.** Una tarjeta A2A anuncia un `url`
que habla el protocolo A2A (JSON-RPC, gRPC o HTTP+JSON de A2A). La DAO sirve un MCP
(`https://api.ultravioletadao.xyz/mcp`) y una API REST, ninguno de los dos es A2A. Publicar la
tarjeta sería anunciar un endpoint que no existe, lo que el SKILL de agent-ready prohíbe. Es la
misma decisión de `docs/planning/BACKLOG.md` (fila del 2026-08-27, "A2A Agent Card: Wontfix
mientras no exista servidor A2A"). Los dos son `applies_to = "api"` y `--profile` no los separa
de `mcp-server-card`, `api-catalog` y `openapi-json`, que sí aplican: la exclusión es una edición
de la copia del registro de c0der para este sitio (`--print-sites`, quitar los dos bloques con
este motivo al lado, correr con `--sites`). Se cumple el día que exista un servidor A2A de verdad.

**`x402-discovery` (perfil `paid`): el dominio no cobra nada.** Ninguna ruta de
`ultravioletadao.xyz` ni de `api.ultravioletadao.xyz` pide pago: el api-catalog declara
`price.model = free` para la API de la DAO, `auth.md` dice del MCP "No authentication, no
session, no payments" y no lista ninguna ruta paga, y el único cobro x402 que hubo (resúmenes de stream a 0,05 USDC en ECS) se retiró:
`uvd-backend/environments/prod/main.tf` lo deja escrito ("x402 never worked, S3 fallback is
sufficient"). Un `/.well-known/x402` sin rutas pagas no contesta nada que un agente necesite. Se
mide con `--profile api`. `auth.md` se sigue publicando porque explica qué es público.

## Verificar después del deploy

```bash
# El de c0der: el perfil que aplica a este sitio, sin escanear rankings.
python agent_ready.py --url https://ultravioletadao.xyz --profile api
# Esperado: PASS en todo salvo agent-card y agent-json-legacy (excluidos arriba).

# A mano, las cuatro superficies tocadas:
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://ultravioletadao.xyz/openapi.json   # 200 application/json
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://ultravioletadao.xyz/skill.md       # 200 text/markdown
curl -s https://ultravioletadao.xyz/.well-known/mcp/server-card.json | python -c "import json,sys; print(json.load(sys.stdin)['transport']['endpoint'])"
curl -s -o /dev/null -w '%{http_code}\n' https://api.ultravioletadao.xyz/mcp                        # 405 (vivo: solo POST)
curl -s https://ultravioletadao.xyz/.well-known/agent-skills/index.json | grep -c schema              # 0
```

Los rankings (is-agentic, ora.ai, isitagentready) se re-escanean después del deploy, a mano y
dentro de sus cuotas: la última lectura (66/100 y 68/100) es anterior a estos archivos.

## Lo que sigue abierto

- El preflight de agent-ready seguirá en WARNING: una ruta inexistente sin extensión responde 200
  con la home por la regla SPA. No es un check, pero hace que un código de estado solo no sirva para
  saber si algo existe. Arreglarlo es cambiar la regla SPA en `uvd-backend/environments/prod/amplify.tf`.
- `skill.md` no está enlazado como `service-meta` en el api-catalog: el catálogo se genera desde
  `src/data/apiCatalog/services.json`, copia de `config/ecosystem.toml` de c0der, y el cambio va primero allá.
