// REPL de la ventana agent@uvd (contrato C12). Gramática cerrada, sin eval ni shell: cada verbo
// mapea a una tool WebMCP o a un evento del bus, y `curl` solo alcanza la allowlist de ENDPOINTS
// (más el grafo medido por c0der). Lo consume AgentTerm (eco-live) y la tool run_ecosystem_command.
import i18n from '../i18n/config';
import { buildTools } from './tools';
import { EV, emit } from '../services/ecosystem/bus';
import { GRAPH_LIVE_URL, GRAPH_SNAPSHOT_URL } from '../services/ecosystem/graph';
import { DESKTOPS } from '../components/ecosystem/desktops';
import { openWindow, WINDOW_KINDS, DESKTOP_IDS, ECOSYSTEM_TOOL_NAMES } from './ecosystemTools';

const OUTPUT_MAX = 800;
const CURL_TIMEOUT_MS = 8000;
const SITE_GRAPH_URL = 'https://ultravioletadao.xyz/ecosystem/graph.json';
// `| jq .a.b` — solo rutas de claves, sin filtros ni funciones
const JQ_PATH = /^\.(?:[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)?$/;

export const COMMANDS_HELP = [
  'help                   esta ayuda',
  'tools                  tools WebMCP registradas en esta página',
  'run <tool> [json]      ejecuta una tool, p.ej. run get_ecosystem_map {"limit":3}',
  `open <kind> [desktop]  abre una ventana (${WINDOW_KINDS.join(' ')})`,
  'graph <nodeId>         enfoca un nodo del mapa, p.ej. graph karmakadabra',
  'curl <url> [| jq .k]   GET a un endpoint de la allowlist de la página',
  'braille                mapa del ecosistema en braille',
  'expose | list          modo del escritorio',
  `desk <n|id>            cambia de escritorio (${DESKTOP_IDS.join(' ')})`,
  'clear                  limpia la terminal'
];

const clip = (value, max = OUTPUT_MAX) => {
  const str = String(value ?? '');
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
};

const errorMessage = (err) => clip(err?.message || String(err), 160);

const fallbackNavigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const trace = (name, command, result) => {
  try {
    emit(EV.TRACE, { name, args: { command }, result, at: new Date().toISOString(), origin: 'repl' });
  } catch (_) {
    // el bus nunca rompe el REPL
  }
};

const notAllowed = () => ({ error: 'command_not_allowed', help: COMMANDS_HELP });

const format = (value) => clip(typeof value === 'string' ? value : JSON.stringify(value, null, 1));

// Solo tools de lectura, idempotentes o del ecosistema: nada que escriba (apply_dao_membership).
const runnable = (tool) =>
  ECOSYSTEM_TOOL_NAMES.includes(tool.name)
  || !!tool.annotations?.readOnlyHint
  || !!tool.annotations?.idempotentHint;

const runTool = async (tools, name, args) => {
  const tool = tools.find((t) => t.name === name);
  if (!tool) return { error: 'unknown_tool', help: tools.filter(runnable).map((t) => t.name) };
  if (name === 'run_ecosystem_command' || !runnable(tool)) return notAllowed();
  const result = await tool.execute(args, { uvdOrigin: 'repl' });
  const out = { ok: true, output: format(result) };
  if (tool.annotations?.untrustedContentHint) out.untrusted = true;
  if (result && result.error) out.tool_error = result.error;
  return out;
};

const parseJsonArgs = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    return null;
  }
};

const resolveDesktop = (ref) => {
  const n = parseInt(ref, 10);
  if (Number.isFinite(n) && String(n) === String(ref).trim()) return DESKTOPS[n] || null;
  return DESKTOPS.find((d) => d.id === String(ref).trim().toLowerCase()) || null;
};

const walkPath = (json, path) =>
  path.slice(1).split('.').filter(Boolean).reduce((acc, key) => (acc == null ? undefined : acc[key]), json);

// curl [-s|-sS] <url> [| jq .path]
const runCurl = async (curlTokens, pipe) => {
  const flags = curlTokens.filter((t) => t.startsWith('-'));
  if (flags.some((f) => !['-s', '-sS', '-S'].includes(f))) return notAllowed();
  const positional = curlTokens.filter((t) => !t.startsWith('-'));
  if (positional.length !== 1) return notAllowed();
  const rawUrl = positional[0].replace(/^['"]|['"]$/g, '');
  let jqPath = null;
  if (pipe) {
    const [cmd, ...rest] = pipe.trim().split(/\s+/);
    if (cmd !== 'jq' || rest.length !== 1 || !JQ_PATH.test(rest[0])) return notAllowed();
    jqPath = rest[0];
  }

  let url = rawUrl;
  let untrusted = true;
  const isGraph = rawUrl === SITE_GRAPH_URL || rawUrl === GRAPH_LIVE_URL || rawUrl === GRAPH_SNAPSHOT_URL;
  if (isGraph) {
    // El grafo del sitio se sirve del mismo origen (en dev es el snapshot versionado).
    url = rawUrl === SITE_GRAPH_URL ? GRAPH_SNAPSHOT_URL : rawUrl;
    untrusted = false;
  } else {
    const { isAllowedUrl } = await import('../services/ecosystem/endpoints');
    if (!isAllowedUrl(rawUrl)) return notAllowed();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CURL_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json, text/plain;q=0.9, */*;q=0.5' }, signal: controller.signal });
    const text = await res.text();
    if (!res.ok) return { ok: true, output: clip(`HTTP ${res.status}\n${text}`), untrusted, http_status: res.status };
    if (jqPath) {
      let json;
      try {
        json = JSON.parse(text);
      } catch (_) {
        return { error: 'bad_json', output: 'jq: la respuesta no es JSON' };
      }
      return { ok: true, output: format(walkPath(json, jqPath) ?? null), untrusted };
    }
    return { ok: true, output: clip(text), untrusted };
  } catch (err) {
    return { ok: true, output: `curl: ${errorMessage(err)}`, untrusted };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * @param {string} command una línea del prompt (≤ 200 chars)
 * @param {{ navigate?: (path: string) => void }} deps
 * @returns {Promise<{ok:true, output:string, untrusted?:true, clear?:true} | {error:string, help?:string[], output?:string}>}
 */
export async function runEcosystemCommand(command, { navigate: nav } = {}) {
  const navigate = typeof nav === 'function' ? nav : fallbackNavigate;
  const line = String(command ?? '').trim().slice(0, 200);
  if (!line) return { ok: true, output: '' };

  const [left, ...pipes] = line.split('|');
  const tokens = left.trim().split(/\s+/);
  const verb = tokens[0].toLowerCase();
  if (pipes.length > 1 || (pipes.length === 1 && verb !== 'curl')) {
    const result = notAllowed();
    trace(verb, line, result);
    return result;
  }
  const tools = () => buildTools({ navigate, i18n });

  let result;
  switch (verb) {
    case 'help':
      result = { ok: true, output: COMMANDS_HELP.join('\n') };
      break;
    case 'tools': {
      const list = tools().map((t) => `${t.name}${runnable(t) ? '' : '  (solo agente)'}`);
      result = { ok: true, output: clip(list.join('\n')) };
      break;
    }
    case 'run': {
      const name = tokens[1];
      if (!name) {
        result = notAllowed();
        break;
      }
      const rawJson = left.trim().slice(left.trim().indexOf(name) + name.length).trim();
      const args = parseJsonArgs(rawJson);
      if (args === null) {
        result = { error: 'bad_json', help: ['run <tool> {"clave": "valor"}'] };
        break;
      }
      // La tool ya emite su propio EV.TRACE (origin repl): no se duplica aquí.
      return runTool(tools(), name, args);
    }
    case 'open': {
      if (!tokens[1]) {
        result = notAllowed();
        break;
      }
      const args = { kind: tokens[1] };
      if (tokens[2]) args.desktop = tokens[2];
      const out = await runTool(tools(), 'open_terminal', args);
      return out;
    }
    case 'graph': {
      if (!tokens[1]) {
        result = notAllowed();
        break;
      }
      return runTool(tools(), 'focus_ecosystem_node', { node_id: tokens[1] });
    }
    case 'expose':
    case 'list':
      return runTool(tools(), 'set_desk_mode', { mode: verb });
    case 'braille': {
      const opened = await openWindow({ kind: 'graph', desktop: 'ecosystem', params: { view: 'braille' } }, navigate);
      result = opened.ok ? { ok: true, output: `→ ${opened.desktop} · ${opened.window_id} (vista braille; m cambia de vista)` } : { ...opened, output: format(opened) };
      break;
    }
    case 'desk': {
      const desk = tokens[1] ? resolveDesktop(tokens[1]) : null;
      if (!desk) {
        result = { error: 'command_not_allowed', help: [`desk <0-${DESKTOPS.length - 1}|${DESKTOP_IDS.join('|')}>`] };
        break;
      }
      const first = (desk.windows || []).find((w) => w.open) || (desk.windows || [])[0];
      if (!first) {
        result = notAllowed();
        break;
      }
      const opened = await openWindow({ kind: first.kind, desktop: desk.id, params: first.params }, navigate);
      result = opened.ok ? { ok: true, output: `→ escritorio ${opened.desktop}` } : { ...opened, output: format(opened) };
      break;
    }
    case 'curl':
      result = await runCurl(tokens.slice(1), pipes[0]);
      break;
    case 'clear':
      result = { ok: true, output: '', clear: true };
      break;
    default:
      result = notAllowed();
  }
  trace(verb, line, result);
  return result;
}
