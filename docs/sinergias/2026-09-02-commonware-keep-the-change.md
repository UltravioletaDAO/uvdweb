# Sinergias con "Keep the Change" (Commonware) — 3.10 uvdweb

> Depositado por c0der el 2026-09-02. Fuente: `c0der/docs/plans/commonware-clearing-que-adoptar.md`
> (análisis de los 15 proyectos x402 del stack: 66 sinergias propuestas, 40 sostenidas por un refutador
> que abrió cada `archivo:línea`; las descartadas y su motivo están en la sección 4 del documento fuente).
> Post original: <https://commonware.xyz/blogs/clearing> (Patrick O'Grady, 2026-08-19). Esta carpeta
> `docs/sinergias/` es donde c0der deja lo que otros análisis encuentren para este proyecto.

## Principios transversales que aplican a todo el stack (títulos; el detalle está en la fuente, sección 2)

- P1 · La preconfirmación es un par firmado transferible, no un booleano
- P2 · El reintento devuelve el mismo recibo, y la clave se DERIVA de la identidad del pedido
- P3 · Una escritura cara por cuenta cambiada, no por evento
- P4 · La retención de evidencia se ata a la ventana de disputa — y la ventana no existe
- P5 · La ventana de idempotencia y la de retención de evidencia son dos relojes
- P6 · Disputa de un solo tiro: el que reclama presenta el par, y un predicado lo resuelve
- P7 · Un piso es seguro para gastar; el estado que se reconcilia tarde se ajusta, nunca se sobrescribe
- P8 · El benchmark declara qué variable NO aparece
- P9 · El identificador de deduplicación lo pone quien ya lo usa, no vos *(no sale del post)*
- P10 · Cada componente declara su postura ante fallo en su propio doc-comment *(no sale del post)*
- P11 · El valor efectivo de un parámetro se publica en un endpoint legible *(regla del CLAUDE.md global, no del post)*

## Lo específico de este proyecto (sección 3.10 de la fuente, verbatim)

### 3.10 uvdweb

> **Estado:** último commit `fe019ae`, **2026-07-22**. Confirmar con el dueño que sigue
> vivo antes de tocarlo.

| Idea (sección del post) | Aplicación concreta | archivo:línea | Esf. | Valor | Riesgo | Cómo se verifica |
|---|---|---|---|---|---|---|
| **(el post no aporta acá)** — es código muerto en el camino del pago | **Borrar** la rama que manda `X-PAYMENT` con JSON plano (no es un sobre x402 en base64) | `src/services/streamSummaries.js:253-256`; su estado nunca se puebla — `setPaymentProofs` solo aparece en el `useState` de `src/pages/StreamSummaries.js:22`, y `:472` siempre pasa `undefined` | **S** | medio | bajo | `grep -rn "setPaymentProofs" src/` tiene que seguir dando 0; y que el header solo se emita en base64 |

**Nota.** Es un **borrado**, no un renombre: `X-PAYMENT-RESPONSE` es la dirección
vendedor→comprador y este código es el comprador mandando; renombrarlo crearía una segunda
cosa mal. Hoy es inerte; el día que alguien pueble ese estado, el header pisaría el que arma
`x402-fetch` y **todo pago fallaría en el vendedor**.
