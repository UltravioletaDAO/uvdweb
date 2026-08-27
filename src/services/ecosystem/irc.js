// IRC de MeshRelay (contrato C6). Lee mensajes públicos de api.meshrelay.xyz (ACAO *,
// verificado 2026-08-27) y traduce los códigos de formato mIRC a segmentos {text,fg,bg,bold}
// que Terminal.jsx pinta como <span class="irc-fg-N">. Nunca HTML: el texto viaja plano.
import { ENDPOINTS, endpointFor } from './endpoints';

// Códigos mIRC (escritos como escapes para que el archivo sea texto plano legible):
//   \u0003NN[,NN] color · \u0002 bold · \u000f reset · \u001d italic · \u001f underline ·
//   \u0016 reverse · \u0011 mono · \u001e strike.
const COLOR = '\u0003';
const BOLD = '\u0002';
const RESET = '\u000f';
// eslint-disable-next-line no-control-regex
const CODE_RE = /\u0003(\d{1,2})?(?:,(\d{1,2}))?|[\u0002\u000f\u001d\u001f\u0016\u0011\u001e]/g;

/** Quita todos los códigos de formato. */
export function stripIrcCodes(text) {
  if (typeof text !== 'string') return '';
  return text.replace(CODE_RE, '');
}

const clampColor = (raw) => {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  // Paleta clásica de 16; los colores extendidos (16-98) caen al módulo 16.
  return ((n % 16) + 16) % 16;
};

/** Convierte una línea con códigos mIRC en segmentos renderizables. */
export function ircToSegments(text) {
  if (typeof text !== 'string' || text.length === 0) return [];
  const segments = [];
  let fg;
  let bg;
  let bold = false;
  let buffer = '';
  const flush = () => {
    if (!buffer) return;
    const seg = { text: buffer };
    if (fg !== undefined) seg.fg = fg;
    if (bg !== undefined) seg.bg = bg;
    if (bold) seg.bold = true;
    segments.push(seg);
    buffer = '';
  };

  let last = 0;
  const re = new RegExp(CODE_RE.source, 'g');
  let match = re.exec(text);
  while (match) {
    buffer += text.slice(last, match.index);
    flush();
    const code = match[0][0];
    if (code === COLOR) {
      if (match[1] === undefined && match[2] === undefined) {
        fg = undefined;
        bg = undefined;
      } else {
        const nextFg = clampColor(match[1]);
        const nextBg = clampColor(match[2]);
        if (nextFg !== undefined) fg = nextFg;
        if (nextBg !== undefined) bg = nextBg;
      }
    } else if (code === BOLD) {
      bold = !bold;
    } else if (code === RESET) {
      fg = undefined;
      bg = undefined;
      bold = false;
    }
    // italic / underline / reverse / mono / strike: sin efecto visual (se eliminan).
    last = match.index + match[0].length;
    match = re.exec(text);
  }
  buffer += text.slice(last);
  flush();
  return segments;
}

// Bots de la casa (verificado con GET /irc/channels/%23agents/messages?limit=100 el
// 2026-08-27): Sentinel (guardián, oculto por defecto), pm-lifecrawler-*, claude-exec-market-*,
// claude-x402-rs-*, karmakadabra-kk-*. Los nicks del punto de partida del plan (em-bot,
// Guardian, MultiBrain, MeshRelayBridge) no aparecen en las últimas 100 líneas pero siguen
// siendo cuentas de la casa; Turnstile viene de /health.services.turnstile.irc.nick.
export const HOUSE_BOTS = ['Sentinel', 'Turnstile', 'em-bot', 'Guardian', 'MultiBrain', 'MeshRelayBridge'];
export const HOUSE_BOT_PATTERNS = [/^claude-[a-z0-9-]+$/i, /^karmakadabra-[a-z0-9-]+$/i, /^pm-[a-z0-9-]+$/i];
/** Nicks de la casa que el filtro por defecto oculta (ruido del guardián). */
export const NOISY_HOUSE_BOTS = ['Sentinel'];

export function isHouseBot(nick) {
  if (typeof nick !== 'string') return false;
  if (HOUSE_BOTS.includes(nick)) return true;
  return HOUSE_BOT_PATTERNS.some((re) => re.test(nick));
}

export const IRC_CHANNELS = ['agents', 'karmakadabra', 'bounties', 'execution-market'];

const normalizeChannel = (channel) => String(channel || 'agents').replace(/^#/, '');

/**
 * Lee los últimos mensajes de un canal público.
 * @returns {Promise<Array<{id, channel, nick, text, raw, time}>>} text = sin códigos mIRC
 */
export async function fetchMessages(channel, limit = 30, { signal } = {}) {
  const ch = normalizeChannel(channel);
  const max = Math.max(1, Math.min(100, Number(limit) || 30));
  const { url, method, headers } = endpointFor('meshrelay_messages', { channel: ch, limit: max });
  const res = await fetch(url, { method, headers, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : Array.isArray(json && json.messages) ? json.messages : [];
  return list
    .filter((m) => m && typeof m === 'object')
    .map((m, i) => {
      const raw = typeof m.text === 'string' ? m.text : '';
      return {
        id: m.id !== undefined && m.id !== null ? String(m.id) : `${ch}-${i}`,
        channel: typeof m.channel === 'string' ? m.channel : `#${ch}`,
        nick: typeof m.nick === 'string' ? m.nick : '?',
        text: stripIrcCodes(raw),
        raw,
        time: typeof m.time === 'string' ? m.time : null,
      };
    });
}

export const MESSAGES_POLL_MS = ENDPOINTS.meshrelay_messages.pollMs;
