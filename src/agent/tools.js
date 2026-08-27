// Fuente única de verdad de las tools WebMCP del sitio (in-browser, document.modelContext).
// Las registra WebMCPProvider.js. Convenciones: inputSchema con additionalProperties:false,
// salida = objeto pequeño (clip + listas <= 10), errores como { error } (un throw llega al
// agente como UnknownError), readOnlyHint en lecturas y untrustedContentHint cuando la salida
// trae texto de terceros (transcripts, propuestas). Nunca secretos ni PII.
import streamSummariesService, { PaymentRequiredError } from '../services/streamSummaries';
import { getTokenData } from '../services/metrics/Token/TokenMetricsService';
import { getSafeInfo, getSafeBalances } from '../services/metrics/funds/safeService';

const SITE_URL = 'https://ultravioletadao.xyz';
const S3_BASE_URL = 'https://ultravioletadao.s3.us-east-1.amazonaws.com';
const SNAPSHOT_HUB = 'https://hub.snapshot.org/graphql';
const SNAPSHOT_SPACE = 'ultravioletadao.eth';
const UVD_CONTRACT = '0x4Ffe7e01832243e03668E090706F17726c26d6B2';
const SAFE_ADDRESS = '0x52110a2Cc8B6bBf846101265edAAe34E753f3389';
const STREAM_SEARCH_API = process.env.REACT_APP_STREAM_SEARCH_API;
const LANGS = ['es', 'en', 'pt', 'fr'];

const SECTIONS = {
  home: '/',
  about: '/about',
  apply: '/aplicar',
  snapshot: '/snapshot',
  'stream-summaries': '/stream-summaries',
  token: '/token',
  metrics: '/metrics',
  services: '/services',
  facilitator: '/facilitator',
  agents: '/agents',
  events: '/events',
  nfts: '/nfts',
  links: '/links',
  courses: '/courses',
  contributors: '/contributors',
  experiments: '/experiments',
  safestats: '/safestats',
  wheel: '/wheel'
};

const clip = (value, max) => {
  const str = String(value ?? '');
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
};

const toNumber = (value) => {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
};

const clampLimit = (limit, fallback = 5) => {
  const n = parseInt(limit, 10);
  return Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : fallback;
};

const langParam = (lang, i18n) => {
  const candidate = (lang || i18n?.language || 'es').split('-')[0].toLowerCase();
  return LANGS.includes(candidate) ? candidate : 'es';
};

const errorMessage = (err) => clip(err?.message || String(err), 160);

// Hostnames de testnet en /supported del facilitador (sepolia, fuji, amoy, devnet, testnet)
const isTestnet = (network) => /sepolia|testnet|devnet|fuji|amoy/i.test(network);

// Corre el índice del servicio con un idioma puntual sin dejar el singleton en otro idioma
// que el que usa la página /stream-summaries.
const withServiceLanguage = async (lang, fn) => {
  const previous = streamSummariesService.currentLanguage;
  streamSummariesService.setLanguage(lang);
  try {
    return await fn();
  } finally {
    streamSummariesService.currentLanguage = previous;
  }
};

// Espera a que el buscador de /stream-summaries monte (chunk lazy) antes de despachar el evento.
const dispatchStreamSearch = (detail, tries = 20) => {
  if (document.querySelector('input[type="search"]')) {
    window.dispatchEvent(new CustomEvent('uvd:stream-search', { detail }));
    return;
  }
  if (tries > 0) {
    setTimeout(() => dispatchStreamSearch(detail, tries - 1), 200);
  }
};

const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

/**
 * @param {{ navigate: (path: string) => void, i18n: { language?: string, changeLanguage: (lang: string) => Promise<unknown> } }} deps
 * @returns {Array<object>} definiciones de tools para document.modelContext.registerTool
 */
export function buildTools({ navigate, i18n }) {
  return [
    {
      name: 'apply_dao_membership',
      description:
        'Submit a membership application to UltravioletaDAO (Latin America Web3 community). ' +
        'Provide name, email, skills array, and motivation text.',
      inputSchema: {
        type: 'object',
        required: ['name', 'email', 'skills', 'motivation'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', description: 'Full name of the applicant' },
          email: { type: 'string', format: 'email' },
          skills: {
            type: 'array',
            items: { type: 'string' },
            description: 'Technical skills (e.g. ["Solidity", "React", "DeFi"])'
          },
          motivation: {
            type: 'string',
            maxLength: 1000,
            description: 'Why the applicant wants to join the DAO'
          }
        }
      },
      execute: async ({ name, email, skills, motivation }) => {
        try {
          const res = await fetch('https://api.ultravioletadao.xyz/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              skills,
              motivation,
              // Mismos campos que envía /aplicar (el backend guarda el body tal cual)
              fullName: name,
              story: Array.isArray(skills) ? skills.join(', ') : String(skills ?? ''),
              purpose: motivation,
              timestamp: Math.floor(Date.now() / 1000)
            })
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) return { error: `apply_failed_${res.status}`, message: clip(data.error, 160) };
          return { ok: true, id: data.id, message: clip(data.message, 160) };
        } catch (err) {
          return { error: 'apply_failed', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'get_facilitator_networks',
      description:
        'List the blockchain networks supported by the UltravioletaDAO x402 gasless payment ' +
        'facilitator (facilitator.ultravioletadao.xyz). Without "network" returns the mainnet ' +
        'names; with "network" (e.g. "avalanche", "base", "solana" or a CAIP-2 id like ' +
        '"eip155:43114") returns its supported tokens and fee payer.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          network: { type: 'string', description: 'Network name or CAIP-2 id to inspect' },
          include_testnets: { type: 'boolean', description: 'Include testnets (default false)' }
        }
      },
      annotations: { readOnlyHint: true },
      execute: async ({ network, include_testnets = false } = {}) => {
        try {
          const { kinds = [] } = await fetchJson('https://facilitator.ultravioletadao.xyz/supported');
          if (network) {
            const wanted = String(network).trim().toLowerCase();
            const kind = kinds.find((k) => String(k.network).toLowerCase() === wanted);
            if (!kind) return { error: 'unknown_network', network: clip(network, 40) };
            const tokens = (kind.extra?.tokens || []).slice(0, 10).map((t) => ({
              symbol: String(t.token || '').toUpperCase(),
              address: t.address
            }));
            const out = { network: kind.network, scheme: kind.scheme, tokens };
            if (kind.extra?.feePayer) out.feePayer = kind.extra.feePayer;
            return out;
          }
          // /supported repite cada red como nombre y como CAIP-2 (eip155:43114); listamos los nombres
          const names = [...new Set(kinds.map((k) => String(k.network)))]
            .filter((n) => !n.includes(':'))
            .filter((n) => include_testnets || !isTestnet(n))
            .sort();
          return { count: names.length, networks: names };
        } catch (err) {
          return { error: 'facilitator_unavailable', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'get_dao_info',
      description:
        'Get public information about UltravioletaDAO: token contract, treasury address, ' +
        'governance space and official links.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        return {
          name: 'UltravioletaDAO',
          description: 'Latin American Web3 community DAO focused on agentic economy infrastructure',
          token: {
            symbol: 'UVD',
            contract: UVD_CONTRACT,
            network: 'Avalanche C-Chain (chainId: 43114)'
          },
          treasury: {
            address: SAFE_ADDRESS,
            type: 'Safe Multisig',
            network: 'Avalanche C-Chain'
          },
          governance: {
            snapshot_space: SNAPSHOT_SPACE,
            url: `https://snapshot.org/#/${SNAPSHOT_SPACE}`
          },
          links: {
            website: SITE_URL,
            agent_discovery: `${SITE_URL}/agents`,
            facilitator: 'https://facilitator.ultravioletadao.xyz',
            github: 'https://github.com/ultravioletadao',
            discord: 'https://discord.gg/ultravioletadao'
          }
        };
      }
    },
    {
      name: 'search_stream_memory',
      description:
        'Full-text search over the transcripts of UltravioletaDAO Twitch streams (2024-2026). ' +
        'Returns matching moments with date, timestamp and a Twitch link. If the user is on the ' +
        'site, the results are also shown on the /stream-summaries page.',
      inputSchema: {
        type: 'object',
        required: ['query'],
        additionalProperties: false,
        properties: {
          query: { type: 'string', minLength: 2, maxLength: 120, description: 'Search terms' },
          limit: { type: 'integer', minimum: 1, maximum: 10, description: 'Max results (default 5)' }
        }
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async ({ query, limit } = {}) => {
        if (!STREAM_SEARCH_API) return { error: 'search_unavailable' };
        const q = String(query ?? '').trim();
        if (q.length < 2 || q.length > 120) return { error: 'invalid_query' };
        const max = clampLimit(limit);
        try {
          const url = `${STREAM_SEARCH_API.replace(/\/$/, '')}/?q=${encodeURIComponent(q)}&limit=${max}`;
          const data = await fetchJson(url);
          const results = (data.results || []).slice(0, max).map((r) => ({
            title: r.title || null,
            date: r.date_formatted,
            t: r.t,
            snippet: clip(String(r.snippet || '').replace(/<\/?mark>/g, ''), 200),
            url: r.url
          }));
          if (window.location.pathname !== '/stream-summaries') navigate('/stream-summaries');
          dispatchStreamSearch({ query: q, results: data });
          return { count: data.count ?? results.length, results };
        } catch (err) {
          return { error: 'search_failed', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'list_stream_summaries',
      description:
        'List the most recent AI-generated summaries of UltravioletaDAO Twitch streams ' +
        '(newest first). Optional filters: language (es/en/pt/fr) and streamer username. ' +
        'Use get_stream_summary with a video_id to read one.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          lang: { type: 'string', enum: LANGS, description: 'Summary language (default: UI language)' },
          limit: { type: 'integer', minimum: 1, maximum: 10, description: 'Max items (default 5)' },
          streamer: { type: 'string', description: 'Filter by streamer username' }
        }
      },
      annotations: { readOnlyHint: true },
      execute: async ({ lang, limit, streamer } = {}) => {
        const max = clampLimit(limit);
        try {
          const index = await withServiceLanguage(langParam(lang, i18n), () =>
            streamSummariesService.fetchIndex()
          );
          const wanted = streamer ? String(streamer).trim().toLowerCase() : null;
          const items = (index.resumenes || [])
            .filter((s) => !wanted || String(s.streamer).toLowerCase() === wanted)
            .slice(0, max)
            .map((s) => ({
              video_id: s.video_id,
              streamer: s.streamer,
              date: s.fecha_formateada,
              title: clip(s.titulo_stream, 80),
              twitch_url: s.twitch_url,
              url: `${SITE_URL}/stream-summaries`
            }));
          return { total: index.total_resumenes ?? (index.resumenes || []).length, count: items.length, summaries: items };
        } catch (err) {
          return { error: 'index_unavailable', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'get_stream_summary',
      description:
        'Get the AI-generated summary (markdown, truncated to ~1200 chars) of one UltravioletaDAO ' +
        'Twitch stream by its video_id (from list_stream_summaries). Premium summaries may ' +
        'require an x402 payment; in that case the tool returns error "payment_required".',
      inputSchema: {
        type: 'object',
        required: ['video_id'],
        additionalProperties: false,
        properties: {
          video_id: { type: 'string', description: 'Twitch video id, e.g. "2856217000"' },
          lang: { type: 'string', enum: LANGS, description: 'Summary language (default: UI language)' }
        }
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async ({ video_id, lang } = {}) => {
        const wanted = String(video_id ?? '').trim();
        if (!wanted) return { error: 'invalid_video_id' };
        const pageUrl = `${SITE_URL}/stream-summaries`;
        try {
          return await withServiceLanguage(langParam(lang, i18n), async () => {
            const index = await streamSummariesService.fetchIndex();
            const item = (index.resumenes || []).find((s) => String(s.video_id) === wanted);
            if (!item) return { error: 'not_found', video_id: clip(wanted, 20) };
            const data = await streamSummariesService.fetchSummary(item.streamer, item.video_id, item.fecha_stream);
            // Detalle S3 [VERIFICADO: <video_id>.es.json]: { metadata: {...}, resumenes: { web: { contenido } } }
            const text = data?.resumenes?.web?.contenido || data?.summary || item.preview || '';
            return {
              title: clip(data?.metadata?.titulo_stream || item.titulo_stream, 80),
              date: data?.metadata?.fecha_formateada || item.fecha_formateada,
              streamer: item.streamer,
              summary: clip(text, 1200),
              twitch_url: item.twitch_url,
              url: pageUrl
            };
          });
        } catch (err) {
          if (err instanceof PaymentRequiredError || err?.name === 'PaymentRequiredError') {
            return { error: 'payment_required', price_usd: err.paymentDetails?.price, url: pageUrl };
          }
          return { error: 'summary_unavailable', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'list_governance_proposals',
      description:
        'List UltravioletaDAO governance proposals from Snapshot (space ultravioletadao.eth) ' +
        'with state, closing date, choices, vote count, quorum status and a short Spanish ' +
        'briefing when available. Default: active proposals only.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          state: { type: 'string', enum: ['active', 'closed', 'all'], description: 'Default active' },
          limit: { type: 'integer', minimum: 1, maximum: 10, description: 'Max items (default 5)' }
        }
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async ({ state = 'active', limit } = {}) => {
        const max = clampLimit(limit);
        const where = { space: SNAPSHOT_SPACE };
        if (state !== 'all') where.state = state;
        const query = `query Proposals($first: Int!, $where: ProposalWhere) {
          proposals(first: $first, skip: 0, where: $where, orderBy: "created", orderDirection: desc) {
            id title state end choices votes quorum scores_total
          }
        }`;
        try {
          const json = await fetchJson(SNAPSHOT_HUB, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { first: max, where } })
          });
          if (json.errors?.length) return { error: 'snapshot_failed', message: clip(json.errors[0].message, 160) };
          const briefings = await fetchJson(`${S3_BASE_URL}/governance/briefings.json`)
            .then((b) => b.briefings || [])
            .catch(() => []);
          const proposals = (json.data?.proposals || []).slice(0, max).map((p) => {
            const briefing = briefings.find((b) => b.id === p.id);
            return {
              id: p.id,
              title: clip(p.title, 80),
              state: p.state,
              end: p.end ? new Date(p.end * 1000).toISOString() : null,
              choices: (p.choices || []).slice(0, 10).map((c) => clip(c, 40)),
              votes: p.votes,
              quorum_reached: briefing?.quorum_alcanzado ?? (p.quorum ? p.scores_total >= p.quorum : null),
              briefing_es: briefing ? clip(briefing.resumen_es, 240) : null,
              url: `https://snapshot.org/#/${SNAPSHOT_SPACE}/proposal/${p.id}`
            };
          });
          return { state, count: proposals.length, proposals };
        } catch (err) {
          return { error: 'snapshot_unavailable', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'get_token_metrics',
      description:
        'Live market metrics of the UVD token (Avalanche C-Chain): USD/AVAX price, 24h change, ' +
        'market cap, liquidity, burned tokens and holders (from DexScreener/Routescan).',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        try {
          const data = await getTokenData();
          return {
            symbol: 'UVD',
            contract: UVD_CONTRACT,
            network: 'Avalanche C-Chain (chainId: 43114)',
            price_usd: toNumber(data.priceUsd),
            price_avax: toNumber(data.priceNative),
            price_change_24h: toNumber(data.priceChange24h),
            market_cap_usd: toNumber(data.marketCap),
            liquidity_usd: toNumber(data.liquidity),
            total_supply: toNumber(data.totalSupply) ?? data.totalSupply,
            burned: toNumber(data.totalBurnedTokens) ?? data.totalBurnedTokens,
            holders: toNumber(data.holderCount) ?? data.holderCount,
            updated_at: new Date().toISOString()
          };
        } catch (err) {
          return { error: 'metrics_unavailable', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'get_treasury',
      description:
        'Balance of the UltravioletaDAO treasury (Safe multisig on Avalanche C-Chain): total in ' +
        'USD, top token holdings, number of owners and signature threshold.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        try {
          const [info, balances] = await Promise.all([getSafeInfo(SAFE_ADDRESS), getSafeBalances(SAFE_ADDRESS)]);
          const tokens = (balances.items || [])
            .map((t) => ({ symbol: t.tokenInfo?.symbol, usd: Math.round(Number(t.fiatBalance) || 0) }))
            .sort((a, b) => b.usd - a.usd)
            .slice(0, 5);
          return {
            address: SAFE_ADDRESS,
            network: 'Avalanche C-Chain',
            owners_count: (info.owners || []).length,
            threshold: info.threshold,
            fiat_total_usd: Math.floor(Number(balances.fiatTotal) || 0),
            tokens,
            url: `${SITE_URL}/safestats`
          };
        } catch (err) {
          return { error: 'treasury_unavailable', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'set_language',
      description: 'Switch the UltravioletaDAO site UI language (es, en, pt or fr).',
      inputSchema: {
        type: 'object',
        required: ['lang'],
        additionalProperties: false,
        properties: { lang: { type: 'string', enum: LANGS } }
      },
      annotations: { idempotentHint: true },
      execute: async ({ lang } = {}) => {
        if (!LANGS.includes(lang)) return { error: 'invalid_lang', allowed: LANGS };
        try {
          await i18n.changeLanguage(lang);
          return { ok: true, lang };
        } catch (err) {
          return { error: 'language_failed', message: errorMessage(err) };
        }
      }
    },
    {
      name: 'navigate_to',
      description:
        'Open a section of the UltravioletaDAO site in the current tab (client-side routing): ' +
        Object.keys(SECTIONS).join(', ') + '.',
      inputSchema: {
        type: 'object',
        required: ['section'],
        additionalProperties: false,
        properties: { section: { type: 'string', enum: Object.keys(SECTIONS) } }
      },
      annotations: { idempotentHint: true },
      execute: async ({ section } = {}) => {
        const path = SECTIONS[section];
        if (!path) return { error: 'unknown_section', allowed: Object.keys(SECTIONS) };
        navigate(path);
        return { ok: true, path };
      }
    }
  ];
}
