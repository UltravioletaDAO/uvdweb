# Backlog — ultravioletadao.xyz

> Formato: | Date | Item | Context | Priority | Status |
> Nace del ciclo de audit + Ecosystem 2026-08-26/27 (`docs/audit-2026-08-26/REPORT.md` en el workspace).
> Se trabaja de arriba hacia abajo a medida que avanzamos.

| Date | Item | Context | Priority | Status |
|---|---|---|---|---|
| 2026-08-27 | Origin trial de WebMCP | Registrar https://ultravioletadao.xyz en developer.chrome.com/origintrials (trial "WebMCP") con la cuenta Google de Saul y pegar el `<meta http-equiv="origin-trial">` en `public/index.html`. Saul dijo "sí, ahora": EN CURSO. Snippet e instrucciones: audit wave3/governance.md §4 | P1 | In progress |
| 2026-08-27 | Markdown negotiation (Level 3 isitagentready) | POSPUESTO por decisión de Saul 2026-08-27. Stack CloudFront listo y apagado en uvd-backend `environments/prod/cloudfront-agents.tf`; bloqueado por CNAMEAlreadyExists (el alias pertenece a la distro de Amplify). Opciones A/B/C/D en wave3/cloudfront-cutover.md | P2 | Deferred |
| 2026-08-27 | Web pública para Faro y Tarotof | Ambos aparecen en /ecosystem como beta SIN link (decisión Saul: mostrar con descripción). Al publicar su sitio: poner `url` en c0der `config/ecosystem.toml` y re-scan | P2 | Open |
| 2026-08-27 | Escritorios propios para Faro, Tarotof y EnclaveOps en /ecosystem | Hoy solo tienen nodo en el mapa; 402milly tiene ventana. Diseñar ventana/escritorio con datos reales cuando tengan API/web pública | P3 | Open |
| 2026-08-27 | authMd: bloque `agent_auth` real | isitagentready lo pide; requiere registro de agentes de verdad (endpoint + credenciales). Hoy auth.md es honesto ("planned") | P3 | Open |
| 2026-08-27 | A2A Agent Card | Wontfix mientras no exista servidor A2A (decisión del audit, ratificada) | P3 | Wontfix |
| 2026-08-26 | Bump @snapshot-labs/snapshot.js 0.12→0.17 o migrar a viem.signTypedData | El typed-data EIP-712 del voto cambió; requiere voto de prueba con wallet real en dev. Análisis completo en wave3 (deps:install) | P2 | Open |
| 2026-08-26 | MCP server remoto (`/mcp`) + MCP Apps | El server-card lo declara "planned". Abriría el camino "rendering en el chat" (ChatGPT/Claude) | P3 | Open |
| 2026-08-26 | SSR/prerender (content-no-js, 404 reales, trust anchors) | 3 checks de is-agentic que una SPA no puede pasar; evaluar prerender selectivo | P3 | Open |
| 2026-08-26 | Rate-limit headers en api.ultravioletadao.xyz | Check de is-agentic; API Gateway + Lambda | P3 | Open |
| 2026-08-26 | Coherencia robots.txt: Google-Extended/GPTBot Allow vs Content-Signal ai-train=no | Decisión de producto pendiente de Saul (D-01) | P3 | Open |
| 2026-08-26 | Unificar REACT_APP_DEBUG vs REACT_APP_DEBUG_ENABLED | 24 sitios; decidir nombre único en Amplify (D-07) | P3 | Open |
| 2026-08-26 | Twitch OAuth de la ruleta a Authorization Code + PKCE | Hoy implicit flow con state; PKCE requiere backend (D-08) | P3 | Open |
| 2026-08-26 | /metrics: spaces de Snapshot en header vs cards | Decidir qué space(s) mostrar (D-09) | P3 | Open |
| 2026-08-26 | "Caja fuerte comunitaria": etiquetar multisig Avalanche o sumar otras tesorerías | D-10 / PM-NS-13.4 | P3 | Open |
| 2026-08-26 | CSP enforce (hoy Report-Only) | Tras validar wallets/thirdweb en dev con el reporte (D-05) | P2 | Open |
| 2026-08-26 | SourceChip desbordado en móvil | Deuda anotada en wave3/polish-eco-ui.md §5 | P3 | Open |
| 2026-08-26 | Índice de búsqueda del stream: automatizar refresh (EventBridge → ecs:RunTask) | Hoy manual; corrido 2026-08-26 (402 streams). Diseño en todo.md | P2 | Open |
| 2026-08-26 | tests/: crear suite mínima de jest (hoy 0 tests en src/) | "craco test" sale con "No tests found" | P3 | Open |
| 2026-07-21 | Cron de briefings de gobernanza | Sin proposals nuevas desde 2026-07-01; cuando haya, regenerar briefings.json (manual hoy) | P2 | Open |
