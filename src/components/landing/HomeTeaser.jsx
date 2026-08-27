import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useReducedMotion } from 'framer-motion';
import useLiveMetric from '../../hooks/useLiveMetric';
import { ENDPOINTS } from '../../services/ecosystem/endpoints';
import { loadEcosystemGraph, indexGraph } from '../../services/ecosystem/graph';
import { loadI18nBundle } from '../../i18n/loadBundle';

// Top-level del módulo (el teaser es lazy desde Home.js): el chunk i18n 'home-teaser' se pide
// apenas ejecuta este chunk; config.js ya lo dispara además por ruta (idempotente).
const I18N_READY = loadI18nBundle('home-teaser');

/**
 * HomeTeaser — la única terminal del Home (ECOSYSTEM_PLAN §1.1 / WP4).
 *
 * Una ventana de vidrio que ejecuta TRES comandos reales, ejecutables tal cual
 * contra la fuente citada, y abre /ecosystem al click/Enter:
 *
 *   curl -s https://api.meshrelay.xyz/irc/stats               -> useLiveMetric (ENDPOINTS.meshrelay_stats)
 *   curl -s https://facilitator.ultravioletadao.xyz/health    -> useLiveMetric (ENDPOINTS.facilitator_health)
 *   curl -s https://ultravioletadao.xyz/ecosystem/graph.json | jq .source -> loadEcosystemGraph().graph.source
 *
 * Reglas duras (jueces): 0 KB en el chunk inicial (lazy desde Home.js), altura
 * reservada desde el primer render (min-h 232 px, cada linea de salida ocupa UNA
 * fila; las lineas de comando reservan su caja con el texto completo invisible),
 * fetch solo cuando el hero intersecta, typewriter solo tras fonts.ready +
 * requestIdleCallback y nunca con prefers-reduced-motion, fuente del sistema
 * (sin Google Fonts), sin IRC/iframe/WebSocket/WebGL.
 */

const PS1 = 'uvd@ecosystem:~$ ';
const TYPE_MS = 12;
const IDLE_FALLBACK_MS = 1500;

// Los comandos salen de la allowlist (C3) para que "lo que se ve" sea exactamente
// "lo que se llama". El tercero cita la URL publica del snapshot versionado.
const CMD_MESH = `curl -s ${ENDPOINTS.meshrelay_stats.url}`;
const CMD_FAC = `curl -s ${ENDPOINTS.facilitator_health.url}`;
const CMD_GRAPH = 'curl -s https://ultravioletadao.xyz/ecosystem/graph.json | jq .source';
const CMD_OPEN = 'open /ecosystem';
const PROMPTS = [CMD_MESH, CMD_FAC, CMD_GRAPH, CMD_OPEN];

// Offsets acumulados para el typewriter (un solo contador para las 4 lineas).
const OFFSETS = PROMPTS.reduce((acc, cmd) => {
  acc.push((acc[acc.length - 1] || 0) + cmd.length);
  return acc;
}, []);
const TOTAL_CHARS = OFFSETS[OFFSETS.length - 1];

// Identidad estable: useLiveMetric la guarda en un ref, pero un select nuevo por
// render es ruido innecesario.
const selectJson = (j) => (j && typeof j === 'object' ? j : null);

// Estilos locales (mismas reglas que la terminal de /ecosystem, sin importar su
// CSS para no arrastrar la hoja del escritorio al chunk del Home).
const CSS = `
.uvd-ht-win{position:relative;overflow:hidden;border-radius:12px;font-family:ui-monospace,"Cascadia Code",Consolas,monospace;background:rgba(10,10,27,.94);border:1px solid rgba(124,31,255,.35);box-shadow:inset 0 0 0 1px rgba(255,255,255,.04),0 0 32px rgba(106,0,255,.18),0 24px 48px -24px rgba(0,0,0,.85)}
@supports (backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px)){.uvd-ht-win{background:rgba(10,10,27,.72);-webkit-backdrop-filter:blur(12px) saturate(120%);backdrop-filter:blur(12px) saturate(120%)}}
@media (prefers-reduced-transparency:reduce){.uvd-ht-win{background:rgba(10,10,27,.94);-webkit-backdrop-filter:none;backdrop-filter:none}}
.uvd-ht-win::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)}
.uvd-ht-cur{border-right:.55em solid #ddd6fe}
@keyframes uvd-ht-blink{0%,49%{border-color:#ddd6fe}50%,100%{border-color:transparent}}
@media (prefers-reduced-motion:no-preference){.uvd-ht-cur{animation:uvd-ht-blink 1.1s step-end infinite}}
@media (min-width:1024px) and (prefers-reduced-motion:no-preference){
  .uvd-ht-win{transform:perspective(1200px) rotateY(-6deg);transition:transform .35s ease,box-shadow .35s ease}
  .uvd-ht-win:hover,.uvd-ht-win:focus-visible{transform:perspective(1200px) rotateY(-2deg);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),0 0 48px rgba(106,0,255,.3),0 24px 48px -24px rgba(0,0,0,.85)}
}
`;

function fmtTime(iso, lng) {
  try {
    return new Date(iso).toLocaleTimeString(lng, { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

function fmtDate(iso) {
  return typeof iso === 'string' ? iso.slice(0, 10) : '';
}

// Una salida siempre se imprime en UNA linea: JSON compacto (o el stdout de un
// replay grabado, unido por espacios). Nunca inventa nada: sin valor, sin texto.
function toLine(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value.stdout)) return value.stdout.join(' ');
  try {
    return JSON.stringify(value);
  } catch (e) {
    return '';
  }
}

function Chip({ status, fetchedAt, measured }) {
  const { t, i18n } = useTranslation();
  let body = null;
  if (status === 'live') {
    body = <span className="text-emerald-400">● {t('home.teaser.live', 'en vivo')}</span>;
  } else if (status === 'stale') {
    body = (
      <span className="text-amber-400/90">
        {t('home.teaser.stale', 'último dato {{time}}', { time: fmtTime(fetchedAt, i18n.language) })}
      </span>
    );
  } else if (status === 'snapshot') {
    body = (
      <span className="text-gray-500">
        {t('home.teaser.snapshot', 'snapshot {{date}}', { date: fmtDate(fetchedAt) })}
      </span>
    );
  } else if (status === 'loading') {
    body = <span className="text-gray-600">···</span>;
  } else {
    body = <span className="text-gray-600">—</span>;
  }
  return (
    <span className="shrink-0 text-[10px] uppercase tracking-wider" data-chip={status}>
      {measured ? <span className="text-violet-300">▪ {t('home.teaser.measured', 'medido')} · </span> : null}
      {body}
    </span>
  );
}

// Linea de comando: el texto completo (invisible) reserva la caja; el texto
// tipeado se superpone. Misma fuente y mismo wrapping => altura fija siempre.
// El cursor es un border-right del span tecleado (CSS), no un nodo: un glifo
// que se mueve por cada caracter cuenta como layout-shift y ensancha la fila.
function PromptLine({ cmd, typed, cursor, id }) {
  return (
    <span className="relative block min-h-5 leading-5 whitespace-pre-wrap break-all" data-term-line={id}>
      <span className="invisible" aria-hidden="true">
        {PS1}
        {cmd}
      </span>
      <span className="absolute inset-0">
        <span className="text-violet-300">{PS1}</span>
        <span className={cursor ? 'text-gray-100 uvd-ht-cur' : 'text-gray-100'}>{typed}</span>
      </span>
    </span>
  );
}

function OutLine({ text, status, fetchedAt, measured, id }) {
  return (
    <span className="flex h-5 items-center gap-2 leading-5" data-term-line={id}>
      <span className="min-w-0 flex-1 truncate text-cyan-100/90">{text}</span>
      {text ? <Chip status={status} fetchedAt={fetchedAt} measured={measured} /> : null}
    </span>
  );
}

export default function HomeTeaser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true, rootMargin: '0px' });

  // Sin claves crudas en ningún frame: la terminal no se pinta hasta que el bundle i18n
  // 'home-teaser' está registrado; mientras tanto la caja reservada (232 px) mantiene el CLS en 0.
  const [i18nReady, setI18nReady] = useState(false);
  useEffect(() => {
    let alive = true;
    I18N_READY.then(() => {
      if (alive) setI18nReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // --- datos reales -------------------------------------------------------
  const mesh = useLiveMetric({
    url: ENDPOINTS.meshrelay_stats.url,
    cacheKey: 'home_teaser_meshrelay_stats',
    select: selectJson,
    snapshot: ENDPOINTS.meshrelay_stats.snapshot ?? null,
    snapshotDate: ENDPOINTS.meshrelay_stats.snapshotDate ?? null,
    enabled: inView,
  });
  const fac = useLiveMetric({
    url: ENDPOINTS.facilitator_health.url,
    cacheKey: 'home_teaser_facilitator_health',
    select: selectJson,
    snapshot: ENDPOINTS.facilitator_health.snapshot ?? null,
    snapshotDate: ENDPOINTS.facilitator_health.snapshotDate ?? null,
    enabled: inView,
  });

  const [graphState, setGraphState] = useState({ status: 'loading', source: null, fetchedAt: null, products: null, edges: null });
  useEffect(() => {
    if (!inView) return undefined;
    const controller = new AbortController();
    let cancelled = false;
    loadEcosystemGraph({ signal: controller.signal })
      .then(({ graph, status, fetchedAt }) => {
        if (cancelled) return;
        const index = indexGraph(graph);
        setGraphState({
          status,
          source: graph.source || null,
          fetchedAt: status === 'snapshot' ? graph.generated_at || fetchedAt : fetchedAt,
          products: index.products.length,
          edges: index.counts.edges,
        });
      })
      .catch(() => {
        if (!cancelled) setGraphState((prev) => ({ ...prev, status: 'error' }));
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [inView]);

  // --- typewriter ---------------------------------------------------------
  // reduce-motion: todo el texto en el primer render (cero mutaciones).
  const [typed, setTyped] = useState(() => (reduced ? TOTAL_CHARS : 0));
  const startedRef = useRef(false);
  useEffect(() => {
    if (reduced) {
      setTyped(TOTAL_CHARS);
      return undefined;
    }
    if (startedRef.current) return undefined;
    let cancelled = false;
    let idleId = null;
    let timer = null;
    let interval = null;

    const run = () => {
      if (cancelled) return;
      startedRef.current = true;
      const t0 = performance.now();
      interval = setInterval(() => {
        const n = Math.min(TOTAL_CHARS, Math.floor((performance.now() - t0) / TYPE_MS));
        setTyped(n);
        if (n >= TOTAL_CHARS) clearInterval(interval);
      }, TYPE_MS);
    };
    const schedule = () => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(run, { timeout: 3000 });
      } else {
        timer = setTimeout(run, IDLE_FALLBACK_MS);
      }
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(schedule, schedule);

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [reduced]);

  const lines = useMemo(() => {
    let current = PROMPTS.length - 1;
    for (let i = 0; i < PROMPTS.length; i += 1) {
      if (typed < OFFSETS[i]) {
        current = i;
        break;
      }
    }
    return PROMPTS.map((cmd, i) => {
      const start = i === 0 ? 0 : OFFSETS[i - 1];
      const shown = Math.max(0, Math.min(cmd.length, typed - start));
      return { cmd, typed: cmd.slice(0, shown), done: typed >= OFFSETS[i], cursor: i === current };
    });
  }, [typed]);

  // --- titulo con cifras del grafo (nunca hardcodeadas) --------------------
  const title =
    graphState.products !== null
      ? t('home.teaser.title', 'ecosystem — {{products}} productos · {{edges}} aristas medidas', {
          products: graphState.products,
          edges: graphState.edges,
        })
      : 'ecosystem — …';

  const go = () => navigate('/ecosystem');

  // El <style> va fuera del wrapper: su CSS no debe entrar al textContent de
  // [data-home-teaser] (lo leen tests, agentes y el propio WebMCP).
  if (!i18nReady) {
    // Caja reservada idéntica (min-h 232): al llegar el bundle la ventana se pinta dentro sin mover nada.
    return (
      <>
        <style>{CSS}</style>
        <div ref={inViewRef} data-home-teaser className="min-h-[232px] w-full" aria-busy="true" />
      </>
    );
  }
  return (
    <>
      <style>{CSS}</style>
      <div ref={inViewRef} data-home-teaser className="min-h-[232px] w-full">
        <button
          type="button"
          onClick={go}
          aria-label={t(
            'home.teaser.aria',
            'Abrir el mapa del ecosistema: terminal con comandos reales contra MeshRelay, el facilitator x402 y el grafo medido por c0der'
          )}
          className="uvd-ht-win block min-h-[232px] w-full cursor-pointer text-left text-[11px] lg:text-[10px] xl:text-[11px] text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
        >
          <span className="flex h-8 items-center gap-2 border-b border-white/10 bg-white/[.03] px-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="min-w-0 flex-1 truncate text-gray-300" data-teaser-title>
              {title}
            </span>
            <span className="shrink-0 text-violet-300">{t('home.teaser.open', 'abrir')} ↗</span>
          </span>

          <span className="block px-4 py-2">
            <PromptLine id="prompt-mesh" cmd={lines[0].cmd} typed={lines[0].typed} cursor={lines[0].cursor} />
            <OutLine
              id="out-mesh"
              text={lines[0].done ? toLine(mesh.value) : ''}
              status={mesh.status}
              fetchedAt={mesh.fetchedAt}
            />
            <PromptLine id="prompt-fac" cmd={lines[1].cmd} typed={lines[1].typed} cursor={lines[1].cursor} />
            <OutLine
              id="out-fac"
              text={lines[1].done ? toLine(fac.value) : ''}
              status={fac.status}
              fetchedAt={fac.fetchedAt}
            />
            <PromptLine id="prompt-graph" cmd={lines[2].cmd} typed={lines[2].typed} cursor={lines[2].cursor} />
            <OutLine
              id="out-graph"
              text={lines[2].done ? toLine(graphState.source) : ''}
              status={graphState.status}
              fetchedAt={graphState.fetchedAt}
              measured
            />
            <PromptLine id="prompt-open" cmd={lines[3].cmd} typed={lines[3].typed} cursor={lines[3].cursor} />
          </span>
        </button>
      </div>
    </>
  );
}
