# Barrido de backlog — uvdweb — 2026-09-05

Rama: `0xultravioleta/uw-backlog` · Working tree al empezar: **limpio** (ninguna otra sesión adentro).

## Dónde está el backlog

Uno solo con forma de tabla: **`docs/planning/BACKLOG.md`** (`| Date | Item | Context | Priority | Status |`, 38 filas).

Hay un segundo archivo, **`todo.md`** en la raíz, pero **no es un backlog**: es un volcado de ideas
de comunidad sin prioridades ni estados (badges de contribuidores, línea de tiempo de streams,
footer de echoes, meritocracia). Sus dos primeras secciones sí son ítems reales y con decisión de
Saul ya tomada ("después" / "manual por ahora"), y están duplicadas en `BACKLOG.md`. **No lo toqué.**

## La refutación que cambia cómo leer este backlog

**Los cuatro P0 están vencidos.** El header dice que vencen el **2026-09-03 13:00 PT**; hoy es
**2026-09-05**. Son todos del WebMCP Challenge. Uno ya estaba hecho desde el 2026-08-29 y los otros
tres no son verificables ni ejecutables desde el repo. **Hoy no son P0 de nada** — están arriba de
la cola mandando trabajo que ya no tiene destino.

Segundo dato: el último commit de `main` es del **2026-08-29**. Una semana sin actividad.

## Filas cerradas por vencidas (3) — el comando que lo prueba

### 1. P0 — `LICENSE` open source en el repo

La fila decía "`license: null` y no hay archivo. **Sin esto la submission es inválida**".

```
$ gh repo view UltravioletaDAO/uvdweb --json visibility,licenseInfo
{"licenseInfo":{"key":"mit","name":"MIT License"},"visibility":"PUBLIC"}

$ head -1 LICENSE
MIT License

$ git log --oneline --all | grep -i license
b4ee996 chore: LICENSE MIT        # 2026-08-29
```

GitHub lo detecta en el About. **Hecho hace una semana.**

### 2. P1 — Deployar el server-card v2.0.0

La fila decía que en prod seguía diciendo `"x-status": "planned"` y "No MCP endpoint is deployed yet".

```
$ curl -s https://ultravioletadao.xyz/.well-known/mcp/server-card.json | grep -o '"version": "[^"]*"' | head -1
"version": "2.0.0"

$ ... | grep -c 'No MCP endpoint is deployed yet'
0
```

Transporte real: `streamable-http` → `https://api.ultravioletadao.xyz/mcp`, 13 tools. Llegó a prod
con el merge del PR #120 (`d3fc627`, 2026-08-29).

> **Trampa que casi me come.** `grep -c planned` sobre el card devuelve **1**, que leído como conteo
> confirma la fila. Mirando la coincidencia una por una: está dentro de la *descripción de una tool*
> explicando que `~` marca un edge planeado en el grafo del ecosistema. **No** es el campo `x-status`.
> Confiar en el conteo habría dejado esta fila abierta sin razón.

### 3. P3 — "crear suite mínima de jest (hoy 0 tests en `src/`)"

La fila decía que `craco test` sale con "No tests found".

```
$ CI=true npx react-scripts test --watchAll=false
Test Suites: 5 passed, 5 total
Tests:       88 passed, 88 total
```

Había 69 tests desde `7c25083` (2026-08-28) en `src/services/swap/__tests__/`. Cerrada **con nota
honesta de cobertura**: cubre swap, el flag de debug y el detector de idioma; el resto de `src/`
sigue sin tests.

## Fila resuelta en la práctica (1)

### P2 — Decidir el CORS de `POST /mcp`

La preocupación era que abrirla a `*` abriría también `/apply` al mundo. **Ya está desplegada la
opción restrictiva:**

```
$ curl -i -X OPTIONS https://api.ultravioletadao.xyz/mcp \
    -H "Origin: https://evil.example.com" -H "Access-Control-Request-Method: POST"
HTTP/1.1 204 No Content
(sin header access-control-allow-origin)

$ ... -H "Origin: https://ultravioletadao.xyz" ...
access-control-allow-origin: https://ultravioletadao.xyz
access-control-allow-methods: GET,OPTIONS,POST
```

`/apply` no quedó expuesto. Sigue siendo decisión viva sólo si algún día se quieren clientes MCP
de navegador.

## Filas arregladas (2) — rojo y verde de cada test

### A. P3 / D-07 — Unificar `REACT_APP_DEBUG` vs `REACT_APP_DEBUG_ENABLED`

Commit `243c6bd`. **La fila subestimaba el problema: no era cosmético, era un bug.**

El conteo real es **21 sitios, no 24**: 18 con el canónico y **3 con `REACT_APP_DEBUG` pelado**, los
tres en `src/lib/utils.js` — o sea `debugLog`/`debugWarn`/`debugError`, con **11 usos en 5 archivos**
(`TwitchAuth.js`, `ApplicationForm.js`, `ApplicationStatus.js`, `Snapshot.js`).

Lo que lo vuelve un defecto y no una preferencia de nombre: `.github/workflows/frontend-ci.yml` setea
`REACT_APP_DEBUG_ENABLED: 'false'` y **nunca** setea la otra. Igual `.env.example` y el `CLAUDE.md`.
Así que esos 11 logs eran **código muerto**: no se encendían ni poniendo en `'true'` el flag documentado.

Arreglo: `src/lib/config.js` como fuente única (el canónico manda cuando está definido,
`REACT_APP_DEBUG` sobrevive como alias heredado). **Esto no le roba la decisión a Saul** — qué nombre
queda en Amplify sigue siendo D-07; lo que se quitó es el bug que la estaba esperando.

**ROJO** (con el `utils.js` original, leyendo `REACT_APP_DEBUG` a secas):

```
● debugError emite cuando REACT_APP_DEBUG_ENABLED=true y el alias no está
    expect(jest.fn()).toHaveBeenCalledWith(...expected)
    Expected: "feo"
    Number of calls: 0

Test Suites: 1 failed, 1 total
Tests:       3 failed, 7 passed, 10 total
```

**VERDE** (con el cambio):

```
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

### B. P1 (parcial) — `?lang=en`

Commit `3c11d77`. `i18next-browser-languagedetector` sólo mira `?lng=` (su `lookupQuerystring` por
defecto) y `src/i18n/config.js` no traía bloque `detection`. **`?lang=en` no hacía absolutamente nada.**

Arreglo: `src/i18n/langDetector.js` registra un detector propio para `?lang=`, primero en el orden;
el nativo queda segundo, así que `?lng=` sigue funcionando. `SUPPORTED_LNGS` queda definido una sola
vez y `config.js` lo consume.

**ROJO** (sacando `queryLang` del orden de detección):

```
× ?lang=en resuelve en          Expected: "en"   Received: "en-US"
× ?lang=pt resuelve pt          Expected: "pt"   Received: "en-US"
× ?lang= gana sobre ?lng=       Expected: "en"   Received: "pt"

Tests: 3 failed, 6 passed, 9 total
```

`?lang=pt` devolvía `en-US` — el idioma del navegador. Prueba de que el parámetro se ignoraba entero.

**VERDE**:

```
Tests: 9 passed, 9 total
```

## Estado de la suite y del build

**Suite: verde.** `CI=true npx react-scripts test --watchAll=false` → **5 suites, 88 tests**
(69 preexistentes + 19 míos). ESLint sobre mis 6 archivos: limpio, exit 0.

**El build local falla, y NO es por mi cambio:**

```
Module not found: Error: Can't resolve 'prismjs' in '...\src\components\ecosystem\windows\products'
```

Verificado antes de culpar a nadie:

- `prismjs@1.30.0` está en `package.json` **y en `package-lock.json`** → el `npm ci` de la CI lo instala.
- `origin/main` declara exactamente lo mismo (`git show origin/main:package.json`).
- Quien lo importa es `CodeTerm.jsx`, del commit `6e203ac` (2026-08-27) — mis commits no tocan ni
  `package.json` ni ese archivo (`git diff --name-only origin/main...HEAD` lo confirma).
- Causa real: en este worktree `node_modules` es un **symlink al checkout principal**
  (`/z/ultravioleta/code/web/uvdweb/node_modules`), que está desactualizado y no tiene `prismjs`.

No corrí `npm install` porque ese `node_modules` es del checkout principal y puede haber otra sesión
usándolo. **El build listó ese único error, o sea que mis módulos sí compilaron.** La CI, que hace
`npm ci` contra el lock, es el gate real.

## Lo que necesita a Saul (no lo toqué)

| Fila | Prioridad | Qué necesita para desbloquearse |
|---|---|---|
| Probar el sitio en el navegador in-app de ChatGPT desktop | P0 vencido | Su máquina con ChatGPT desktop. **Y antes: decir si el hackathon sigue vivo.** |
| Registro en Devpost + submission | P0 vencido | Su cuenta. Write externo. Fecha límite pasada. |
| Video demo en YouTube | P0 vencido | Grabación + su cuenta de YouTube. |
| Registrar los 6 MCP en `registry.modelcontextprotocol.io` | P2 | **OK explícito: es un write a un registry público.** Re-verificado hoy: sigue en **0** entradas de la DAO (`ultravioleta`, `uvd`, `karmakadabra`, `describe`, `402milly` → 0 cada una; `x402` da 26, todos de terceros). La fila es correcta. |
| Bump `@snapshot-labs/snapshot.js` 0.12→0.17 | P2 | Sigue en `^0.12.54`. El criterio de aceptación es **un voto de prueba con wallet real**. |
| Traducir el README al inglés | P1 | Decisión suya. Ver defecto abajo. |
| D-07: qué nombre de var queda en Amplify | P3 | Sigue siendo suya. El bug que la esperaba ya no está. |
| CSP enforce (hoy Report-Only) | P2 | No lo toqué: cambiarlo puede romper wallets/thirdweb en prod, **y estamos en congelamiento**. |

## Dos cosas que encontré y no estaban en ninguna fila

1. **El README está desactualizado.** Documenta la ruta `/services` como "Nueva Página de Productos y
   Servicios", pero `/services` fue **retirada** en `76b97bb` (2026-08-29) y reapuntada a
   `/ecosystem#productos`. No lo arreglé: la fila P1 pide reescribirlo **en inglés**, y traducir el
   README entero es decisión de Saul, no un fix suelto. Lo anoté en la fila.
2. **El congelamiento de deploys está activo ahora mismo.** La fila P1 congela prod del **2026-09-03
   al 2026-09-21** por el Judging Period. Hoy es 2026-09-05: **estamos adentro de la ventana.**
   Ver la advertencia de abajo antes de mergear.

## Este PR NO tiene CI, y no es por un push que falte

**Dicho explícito para que nadie lo mergee a ciegas: el PR #126 no corrió ni un solo check.**

No es el caso conocido de "la CI no se dispara al abrir el PR sobre una rama ya pusheada, pero un
push nuevo sí". Acá **ningún push la dispara**: `.github/workflows/frontend-ci.yml` escucha en
`pull_request: branches: [main]` y `push: [develop, main]`. Un PR contra `develop` y un push a una
rama de feature quedan los dos fuera del disparador.

`$ gh pr checks 126` → `no checks reported on the '0xultravioleta/uw-backlog' branch`

**La evidencia de este PR soy yo, y está pegada en el cuerpo del PR y acá arriba**: los dos tests
discriminantes corridos en rojo y en verde, la suite completa en 88 tests, y ESLint en exit 0 sobre
los 6 archivos. El único gate que no pude cerrar localmente es el build, por `prismjs` ausente del
`node_modules` symlinkeado del worktree — preexistente, idéntico en `main`, y resuelto por el
`npm ci` de la CI.

### Y el hallazgo que salió de preguntar esto

Si la CI sólo escucha `pull_request` sobre `main`, **todo lo que entra a `develop` entra sin
verificar**. Medido sobre los últimos 20 PR mergeados: **los 9 PR de feature apuntan a `develop`** y
los 11 restantes son promociones `develop` a `main`. O sea **el 100% del trabajo de feature se
mergea sin compuerta**; la CI recién mira en la promoción, ya con varios features encima, y cuando
ese batch sale rojo hay que bisectar entre N cambios.

Quedó como **fila P1 nueva en `BACKLOG.md`** (2026-09-05). **No lo arreglé en este PR a propósito**:
cambiar el disparador de la CI es infraestructura del repo y mezclarlo con dos arreglos de producto
volvería este PR dos cambios disfrazados de uno.

## Advertencia sobre el merge

`.github/workflows/frontend-ci.yml` corre en `pull_request: branches: [main]` y en
`push: branches: [develop, main]`. **Un PR contra `develop` no dispara la CI**; el push del merge a
`develop` sí. Abrí el PR contra `develop` siguiendo la convención del repo (feature → develop → main)
y porque `main` alimenta el deploy de Amplify y **estamos dentro del congelamiento**.

Nada de lo que toqué afecta a `document.modelContext` ni al server-card, así que no debería poner en
riesgo el Judging Period — pero **la decisión de mergear durante el congelamiento es de c0der/Saul, no mía.**

## Para c0der

1. **Cerré 3 filas por vencidas** (LICENSE P0, server-card v2.0.0 P1, suite de jest P3), cada una con
   el comando y su salida escritos en el backlog; más 1 resuelta en la práctica (CORS de `/mcp`).
2. **Arreglé 2 filas** con test discriminante corrido en rojo y en verde: el flag de debug (D-07, que
   resultó ser un bug real —11 logs muertos— y no cosmético) y `?lang=` (que se ignoraba entero).
3. **Necesitan a Saul:** los 3 P0 vencidos del hackathon (y antes que nada, **decidir si el hackathon
   sigue vivo — la fecha límite pasó el 2026-09-03**), el registry MCP (write público), el bump de
   snapshot.js (voto con wallet real), traducir el README, D-07 en Amplify y el CSP enforce.
4. **PR #126 abierto contra `develop`, listo para revisar pero NO mergeado — y SIN CI**: ningún push
   la dispara, el workflow sólo escucha PR contra `main`. La evidencia son los tests locales en rojo
   y en verde, pegados en el cuerpo del PR. De paso salió una fila P1 nueva: el 100% del trabajo de
   feature entra a `develop` sin compuerta (9 de 9 PR de feature en los últimos 20).
5. **El resto del estado de gates:** Suite en verde (88 tests); el build local
   falla sólo por `prismjs` ausente del `node_modules` symlinkeado del worktree — preexistente,
   idéntico en `main`, y la CI lo instala con `npm ci`. **Ojo: el congelamiento de deploys a prod
   está activo hasta el 2026-09-21.**
