# Handoff — el api-catalog de la DAO lista los servicios vivos del stack (rebanada 0.5)

**Fecha:** 2026-09-14 · **Rama:** `0xultravioleta/uw-api-catalog` → PR a `develop` · **Worker:** uw-api-catalog

## Qué quedó

- `https://ultravioletadao.xyz/.well-known/api-catalog` deja de escribirse a mano. Sale de
  `src/data/apiCatalog/services.json` con `node scripts/generateApiCatalog.js`, que escribe
  `public/.well-known/api-catalog` y su copia `api-catalog.json`.
- `services.json` es copia de `config/ecosystem.toml` de c0der en el commit
  `c631f268ea8fb362a145d37094eab890d46913f2`. Tiene 7 servicios, cada uno con un anchor directo a
  su backend, y 6 nodos fuera, cada uno con su motivo. Los 13 nodos del toml están decididos.
- Forma del linkset: el primer contexto es el catálogo y lista los 7 anchors como `item`
  (RFC 9727 A.2). Después hay un contexto por servicio con `service-desc` (OpenAPI y MCP server
  card), `service-doc`, `service-meta` y `status`, más `api-catalog` hacia el catálogo propio del
  producto (RFC 9727 §4.3). Auth y precio son atributos de extensión (RFC 9264 §4.2.4.3) del link
  `service-meta` que apunta al `auth.md` del producto: `auth-scheme` ∈ `none | erc-8128 | oauth2 |
  x402 | api-key`, `price-model` ∈ `free | x402-per-call | x402-escrow`. El número del precio no se
  copia: queda en la superficie de cada producto y en el 402 en vivo.
- `customHttp.yml` agrega al content-type el profile de RFC 9727 (§4.2, SHOULD):
  `application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"`.
- `src/data/apiCatalog/__tests__/apiCatalog.test.js` (19 tests) se pone rojo si el artefacto no es
  el generado, si pierde la forma de RFC 9264, si los datos y el linkset divergen en cualquier
  dirección o si `customHttp.yml` deja de servirlo como linkset. Con el catálogo de 3 entradas de
  hoy fallan 11.

| Nodo | Anchor | Auth | Precio |
|---|---|---|---|
| karmakadabra | `https://karmakadabra.ultravioletadao.xyz` | none | free |
| execution-market | `https://api.execution.market` | erc-8128, oauth2 | x402-escrow |
| meshrelay | `https://api.meshrelay.xyz` | erc-8128, api-key | x402-per-call |
| describe-net | `https://api.describe.net` | x402 | x402-per-call |
| facilitator | `https://facilitator.ultravioletadao.xyz` | none | free |
| ultravioletadao | `https://api.ultravioletadao.xyz` | none | free |
| 402milly | `https://api.402milly.xyz` | x402 | x402-per-call |

**Fuera del catálogo** (motivo completo en `services.json`, campo `excluded`):

| Nodo | Motivo |
|---|---|
| x402-sdk | Su `url` es la página del paquete en PyPI: es una librería, no un servicio HTTP |
| abracadabra | Su `url` es una ruta de este sitio (`/stream-summaries`), no una API propia |
| karma-hello, tarotof, faro, enclaveops | Sin `url` en `ecosystem.toml` (status beta) |

## Cómo actualizarlo

1. Editar `src/data/apiCatalog/services.json` (y `source.commit` si se volvió a copiar del toml).
2. `node scripts/generateApiCatalog.js`
3. `npm test -- --watchAll=false src/data/apiCatalog`
4. Commitear los tres archivos juntos. `node scripts/generateApiCatalog.js --check` sale 1 si el
   artefacto quedó viejo.

## Verificar en producción (después de develop → main y el deploy de Amplify)

```bash
# 1. Content-type con el profile de RFC 9727
curl -s -D - -o /dev/null https://ultravioletadao.xyz/.well-known/api-catalog | grep -i '^content-type'
# esperado: Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"
# (medido 2026-09-14 00:59Z, antes del deploy: Content-Type: application/linkset+json)

# 2. Conteo: servicios en el linkset e items del catálogo
curl -s https://ultravioletadao.xyz/.well-known/api-catalog | python -c "import json,sys; l=json.load(sys.stdin)['linkset']; print(len(l)-1, len(l[0]['item']))"
# esperado: 7 7   (medido 2026-09-14 00:58Z, antes del deploy: 2 3)

# 3. El HEAD sigue trayendo el Link con rel="api-catalog" (RFC 9727 §2)
curl -sI https://ultravioletadao.xyz/.well-known/api-catalog | grep -i '^link' | grep -c 'rel="api-catalog"'
# esperado: 1
```

## Para c0der

La comparación del catálogo vivo contra `config/ecosystem.toml` le toca a c0der. El script de abajo ya
se corrió desde `c0der/master-4` el 2026-09-14 a las 00:56Z contra el `services.json` local: los 13
nodos quedan decididos, los 7 anchors están vivos según `destino_codigos_vivos` de
`config/agentic-sites.toml` y el resultado es `DIVERGE`, exit 1, porque producción todavía sirve el
catálogo viejo. Después del deploy tiene que dar `OK` y exit 0.

Guardarlo **con Write** (regla de escritura determinista) como `scripts/api_catalog_check.py` en la
raíz de c0der y correr, desde esa raíz:

```bash
python scripts/api_catalog_check.py
# antes de que develop llegue a main, el services.json todavía no está en main:
python scripts/api_catalog_check.py https://raw.githubusercontent.com/UltravioletaDAO/uvdweb/develop/src/data/apiCatalog/services.json
```

```python
import json
import subprocess
import sys
import tomllib
import urllib.error
import urllib.request

DATA = sys.argv[1] if len(sys.argv) > 1 else "https://raw.githubusercontent.com/UltravioletaDAO/uvdweb/main/src/data/apiCatalog/services.json"
LIVE = "https://ultravioletadao.xyz/.well-known/api-catalog"
UA = {"User-Agent": "c0der-api-catalog-check"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, r.headers.get("Content-Type", ""), r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Content-Type", ""), b""


def load_data(src):
    if src.startswith("https://"):
        return json.loads(get(src)[2])
    with open(src, "rb") as f:
        return json.load(f)


eco = {n["id"]: n for n in tomllib.load(open("config/ecosystem.toml", "rb"))["node"]}
sites = tomllib.load(open("config/agentic-sites.toml", "rb"))["sitio"]
vivos = next(s["check"]["destino_codigos_vivos"] for s in sites if s["id"] == "card-endpoint-vivo")
eco_commit = subprocess.run(["git", "log", "-1", "--format=%H", "--", "config/ecosystem.toml"], capture_output=True, text=True).stdout.strip()

data = load_data(DATA)
listed = {s["node"]: s for s in data["services"]}
excluded = {e["node"]: e["reason"] for e in data["excluded"]}
problems = []

for nid in eco:
    if nid not in listed and nid not in excluded:
        problems.append("nodo de ecosystem.toml sin decidir en services.json: " + nid)
    if nid in listed and not eco[nid].get("url"):
        problems.append("en el catalogo pero sin url en ecosystem.toml: " + nid)
for nid in list(listed) + list(excluded):
    if nid not in eco:
        problems.append("services.json nombra un nodo que ecosystem.toml ya no declara: " + nid)

status, ctype, body = get(LIVE)
linkset = json.loads(body)["linkset"] if status == 200 else []
if not ctype.startswith("application/linkset+json"):
    problems.append("content-type del catalogo vivo: " + repr(ctype))
anchors = sorted(s["anchor"] for s in data["services"])
live_items = sorted(i["href"] for i in (linkset[0].get("item", []) if linkset else []))
live_anchors = sorted(c["anchor"] for c in linkset[1:])
if live_items != anchors or live_anchors != anchors:
    problems.append("linkset vivo != services.json: vivo " + str(len(live_anchors)) + " anchors, datos " + str(len(anchors)))

for s in data["services"]:
    code = get(s["anchor"])[0]
    mark = "vivo" if code in vivos else "MUERTO"
    print(s["node"].ljust(18), str(code), mark, s["anchor"])
    if code not in vivos:
        problems.append("anchor no vivo segun agentic-sites.toml: " + s["anchor"] + " -> " + str(code))

if data["source"]["commit"] != eco_commit:
    print("aviso: services.json copio ecosystem.toml en " + data["source"]["commit"][:7] + "; hoy va en " + eco_commit[:7])
print("fuera del catalogo:", ", ".join(excluded))
print("OK" if not problems else "DIVERGE")
for p in problems:
    print(" -", p)
sys.exit(1 if problems else 0)
```

`urllib` sigue redirects y manda User-Agent. Por eso `api.execution.market` (301 a `/docs`) y
`api.describe.net` (307 a `/docs`) dan 200. Un anchor que cambie de host sin redirect aparece como
`MUERTO`.

## Hallazgos fuera de alcance (filas de backlog propuestas)

No van en `docs/planning/BACKLOG.md` en este PR porque el #131 edita ese archivo y los dos PR
chocarían. Quedan acá para que las registre quien mergee:

| Fecha | Item | Contexto | Prioridad | Estado |
|---|---|---|---|---|
| 2026-09-14 | uvdweb borde: `Accept: text/markdown` en `/.well-known/api-catalog` devuelve `index.md` | Medido a las 00:42:49Z: `200 text/markdown; charset=utf-8`, 1598 B. `isPage` de `infra/terraform/edge/functions/viewer-request.js.tftpl` trata como página toda ruta sin punto, y `/.well-known/*` no tiene punto. Con `Accept: application/linkset+json` sirve bien. Los demás `/.well-known/` sin extensión probablemente también caen [HIPÓTESIS: solo se midió api-catalog]. cierra: `curl -s -H 'Accept: text/markdown' -o /dev/null -w '%{content_type}' https://ultravioletadao.xyz/.well-known/api-catalog` imprime `application/linkset+json…` | P2 | propuesta |
| 2026-09-14 | 402milly: `api.402milly.xyz` responde 403 si no hay User-Agent | Anchor, `/openapi.json` y `/grid/metadata`: 200 con UA y 403 `application/json` sin UA (00:54:14Z–00:54:44Z). Es el mismo patrón del WAF que `ecosystem.toml` documenta para EM. Un agente que llega sin UA no ve la API. cierra: `curl -s -A '' -o /dev/null -w '%{http_code}' https://api.402milly.xyz/openapi.json` imprime `200` | P2 | propuesta |
| 2026-09-14 | EM: la marca sin User-Agent sirve el SPA en server-card, `auth.md` y api-catalog | Sin UA, `execution.market/.well-known/mcp/server-card.json`, `/auth.md` y `/.well-known/api-catalog` dan `200 text/html` (00:54:19Z–00:54:24Z). Es la rebanada 0.1, que ya está propuesta. El catálogo de la DAO sigue apuntando ahí porque `api.execution.market` no publica esos tres archivos (404); `service-doc` sí usa `api.execution.market/skill.md`, que responde sin UA. cierra: la de la 0.1 | P1 | ya propuesta (0.1) |

## Estado

- Commit de código y este handoff en `0xultravioleta/uw-api-catalog`. PR contra `develop`, sin mergear
  ni desplegar. No se tocó ningún archivo del #131.
