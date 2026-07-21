# Plan: embeber el observatorio KarmaKadabra en ultravioletadao.xyz

> Pedido por Saul 2026-07-21 ("iframe de karmakadabra en alguna sección — no
> necesariamente ya, pero for sure después"). Estado: **PLAN, no implementado.**
> Relación: fila en `karmakadabra/docs/planning/BACKLOG.md` + `todo.md` de este repo.

## Factibilidad (verificada 2026-07-21)

- `https://karmakadabra.ultravioletadao.xyz` (observatorio 3D en vivo del swarm:
  WebGL + WebSocket a `bridge.meshrelay.xyz` + mirror de trades) se sirve por
  S3+CloudFront **sin `X-Frame-Options` ni CSP `frame-ancestors`** → es
  **iframeable HOY sin tocar nada** del lado KK.
- El shell pesa ~30KB; el costo real es el runtime 3D + WS (CPU/GPU). Existe
  `classic.html` (vista 2D liviana) como alternativa de bajo costo.

## Dónde (opciones, en orden recomendado)

1. **Sección en `/agents` (recomendada)** — la página AgentDiscovery ya presenta
   el ecosistema de agentes; el observatorio en vivo es su demo perfecta.
2. Ruta dedicada `/karmakadabra` — más SEO/juice propio, un click más lejos.
3. Teaser en el home — máximo alcance pero compite con el hero y carga WebGL a
   todo visitante: solo con facade click-to-load.

## Cómo (diseño de implementación)

- **Componente `KarmaKadabraEmbed.js`** con patrón **facade/click-to-load**:
  póster estático (screenshot del observatorio) + botón "Ver el swarm en vivo";
  el `<iframe>` se monta SOLO al click (no WebGL/WS gratis para cada visita).
  - `<iframe src="https://karmakadabra.ultravioletadao.xyz" title="KarmaKadabra
    live observatory" loading="lazy" allow="fullscreen"
    referrerpolicy="strict-origin" className="aspect-video w-full rounded-lg
    border border-violet-700/30">`
  - NO usar `sandbox` restrictivo: el observatorio necesita scripts + WS del
    mismo origen embebido; sandbox sin `allow-same-origin` rompería el WS.
  - Botones: fullscreen (`requestFullscreen` del wrapper) + "Abrir en pestaña
    nueva ↗" (siempre visible — el 3D en móvil viejo sufre).
  - **Móvil**: default = link-out (el observatorio ya tiene modo móvil r9, pero
    dentro de iframe pequeño el 3D pierde sentido); mostrar iframe solo ≥768px,
    o embeber `classic.html` (2D) en móvil.
- **i18n ×4** (es/en/pt/fr): título de sección, CTA, disclaimer "datos en vivo".
- **SEO**: JSON-LD `VideoObject`/`WebApplication` apuntando al observatorio;
  el iframe no indexa — acompañar con 2-3 frases de texto real describiendo qué
  se ve (agentes comerciando con USDC real, ERC-8004, x402).
- **Fallback**: si el iframe falla en cargar (timeout ~8s), mostrar el póster
  con el link-out.

## Hardening opcional del lado KK (NO bloqueante)

Hoy CUALQUIER sitio puede iframear el observatorio. Si se quiere restringir:
CloudFront response-headers-policy con `Content-Security-Policy:
frame-ancestors 'self' https://ultravioletadao.xyz https://dev.ultravioletadao.xyz`.
⚠️ Coordinar con la fila "Agent-readiness: CloudFront + Route53" del backlog KK
(ya hay trabajo autorizado sobre la distribución del dashboard) para no pisarse.

## Esfuerzo y gate

- ~Medio día: componente + facade + i18n + integración en `/agents` + deploy dev.
- Gate de aceptación: en dev, la sección carga el póster sin abrir WS; al click
  el observatorio vive dentro del sitio y el WS conecta (verificable en la
  pestaña Network: conexión a `bridge.meshrelay.xyz` solo tras el click);
  fullscreen funciona; móvil ofrece link-out.
