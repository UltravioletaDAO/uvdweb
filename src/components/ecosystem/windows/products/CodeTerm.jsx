// CodeTerm — ventana `code`: snippet de código PÚBLICO del ecosistema, congelado en build por
// scripts/ecosystem/pin-snippets.js (src/data/ecosystem/snippets.json: repo, path, sha, rango, sha256,
// texto y blob_url). El runtime no toca GitHub: solo enlaza al blob del SHA pineado.
// Prism se carga con import() dentro del efecto (chunk ecosystem-vendor) y con Prism.manual = true
// ANTES de evaluar el core, para que no auto-resalte el DOM. Los tokens se renderizan como <span>
// (Prism.tokenize), sin innerHTML.
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import SNIPPETS from '../../../../data/ecosystem/snippets.json';

export const SNIPPET_IDS = (SNIPPETS.snippets || []).map((s) => s.id);
const BY_ID = new Map((SNIPPETS.snippets || []).map((s) => [s.id, s]));

export function getSnippet(id) {
  return typeof id === 'string' ? BY_ID.get(id) || null : null;
}

// Un solo Prism por página; los lenguajes se registran una vez.
let prismPromise = null;
function loadPrism() {
  if (!prismPromise) {
    prismPromise = (async () => {
      if (typeof window !== 'undefined') {
        window.Prism = window.Prism || {};
        window.Prism.manual = true;
      }
      const core = await import('prismjs');
      const Prism = core.default || core;
      // typescript extiende javascript: el orden importa.
      await import('prismjs/components/prism-javascript');
      await import('prismjs/components/prism-typescript');
      await import('prismjs/components/prism-rust');
      await import('prismjs/components/prism-python');
      return Prism;
    })();
  }
  return prismPromise;
}

// Clases por tipo de token (paleta del sitio; #6a00ff solo en bordes, texto con contraste AA).
const TOKEN_CLASS = {
  comment: 'text-slate-400 italic',
  prolog: 'text-slate-400',
  doctype: 'text-slate-400',
  cdata: 'text-slate-400',
  punctuation: 'text-slate-400',
  keyword: 'text-purple-300',
  builtin: 'text-cyan-200',
  'class-name': 'text-cyan-200',
  function: 'text-cyan-300',
  'function-variable': 'text-cyan-300',
  macro: 'text-amber-200',
  attribute: 'text-amber-200',
  decorator: 'text-amber-200',
  string: 'text-emerald-300',
  'template-string': 'text-emerald-300',
  char: 'text-emerald-300',
  number: 'text-amber-300',
  boolean: 'text-amber-300',
  constant: 'text-amber-300',
  operator: 'text-slate-300',
  property: 'text-sky-300',
  namespace: 'text-sky-300',
  'lifetime-annotation': 'text-amber-200',
  variable: 'text-text-primary',
  important: 'text-error-light',
  regex: 'text-emerald-200'
};

function renderTokens(tokens, keyPrefix = 't') {
  return tokens.map((tok, i) => {
    if (typeof tok === 'string') return tok;
    const content = Array.isArray(tok.content) ? renderTokens(tok.content, `${keyPrefix}${i}-`) : typeof tok.content === 'string' ? tok.content : renderTokens([tok.content], `${keyPrefix}${i}-`);
    const cls = TOKEN_CLASS[tok.type] || (Array.isArray(tok.alias) ? TOKEN_CLASS[tok.alias[0]] : TOKEN_CLASS[tok.alias]) || '';
    return (
      <span key={`${keyPrefix}${i}`} className={cls || undefined}>
        {content}
      </span>
    );
  });
}

/** Parte una lista de tokens en líneas (los strings pueden contener saltos de línea). */
function splitLines(tokens) {
  const lines = [[]];
  const push = (tok) => lines[lines.length - 1].push(tok);
  const walk = (tok) => {
    if (typeof tok === 'string') {
      const parts = tok.split('\n');
      parts.forEach((p, i) => {
        if (i > 0) lines.push([]);
        if (p) push(p);
      });
      return;
    }
    const inner = Array.isArray(tok.content) ? tok.content : [tok.content];
    const hasNl = JSON.stringify(inner).includes('\\n');
    if (!hasNl) {
      push(tok);
      return;
    }
    // Token multilínea (p.ej. comentario de bloque): se re-emite por línea con el mismo tipo.
    const text = flatten(inner);
    text.split('\n').forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) push({ type: tok.type, alias: tok.alias, content: p });
    });
  };
  tokens.forEach(walk);
  return lines;
}

function flatten(tokens) {
  return tokens.map((tk) => (typeof tk === 'string' ? tk : Array.isArray(tk.content) ? flatten(tk.content) : String(tk.content))).join('');
}

export default function CodeTerm({ windowId, params = {} }) {
  const { t } = useTranslation();
  const snippet = getSnippet(params.snippet);
  const [Prism, setPrism] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!snippet || snippet.lang === 'text') return undefined;
    loadPrism()
      .then((p) => {
        if (alive) setPrism(p);
      })
      .catch(() => {
        /* sin resaltado: el texto plano sigue siendo el código real */
      });
    return () => {
      alive = false;
    };
  }, [snippet]);

  const lines = useMemo(() => {
    if (!snippet) return [];
    const grammar = Prism && Prism.languages ? Prism.languages[snippet.lang] : null;
    if (!grammar) return snippet.text.split('\n').map((text) => [text]);
    try {
      return splitLines(Prism.tokenize(snippet.text, grammar));
    } catch (e) {
      return snippet.text.split('\n').map((text) => [text]);
    }
  }, [snippet, Prism]);

  if (!snippet) {
    return (
      <TermWindow windowId={windowId} title={t('ecosystem.windows.code.title', 'code')} sourceChip={{ status: 'unavailable', fetchedAt: null, label: t('ecosystem.status.unavailable', 'sin dato') }}>
        <p className="font-mono text-xs text-error-light">{`${t('ecosystem.status.unavailable', 'sin dato')} · snippet ${params.snippet || '?'}`}</p>
      </TermWindow>
    );
  }

  const sha7 = snippet.sha.slice(0, 7);
  const title = `${snippet.repo}/${snippet.path}:${snippet.start}-${snippet.end} @ ${sha7}`;
  const gutter = String(snippet.end).length;

  return (
    <TermWindow
      windowId={windowId}
      title={title}
      sourceChip={{ status: 'snapshot', fetchedAt: SNIPPETS.generated_at || null, label: t('ecosystem.windows.code.source', 'código público en GitHub, pineado por SHA en el build') }}
    >
      <pre
        className="uvd-code m-0 overflow-x-auto whitespace-pre font-mono text-[12px] leading-5 text-text-primary"
        data-code-lang={snippet.lang}
        data-code-highlighted={Prism ? 'true' : 'false'}
        aria-label={`${snippet.path} ${t('ecosystem.code.lines', { defaultValue: 'líneas {{start}}–{{end}}', start: snippet.start, end: snippet.end })}`}
      >
        {lines.map((toks, i) => (
          <div key={i} className="flex">
            <span aria-hidden="true" className="mr-3 select-none text-right text-slate-500" style={{ minWidth: `${gutter + 1}ch` }}>
              {snippet.start + i}
            </span>
            <span className="flex-1">{renderTokens(toks, `l${i}-`)}</span>
          </div>
        ))}
      </pre>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-text-secondary">
        <span>{t('ecosystem.code.pinned_at', { defaultValue: 'pineado en @{{sha}}', sha: snippet.sha })}</span>
        <span>·</span>
        <span>{t('ecosystem.code.lines', { defaultValue: 'líneas {{start}}–{{end}}', start: snippet.start, end: snippet.end })}</span>
        <span>·</span>
        <a
          href={snippet.blob_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ultraviolet-light underline-offset-2 hover:underline focus:outline focus:outline-2 focus:outline-purple-300"
          data-code-github
        >
          {t('ecosystem.window.view_on_github', 'Ver en GitHub')} ↗
        </a>
      </div>
      <p className="mt-1 font-mono text-[11px] text-slate-500">{t('ecosystem.code.stale_warning', 'el rango puede haber cambiado en la rama principal; el enlace apunta al SHA pineado')}</p>
    </TermWindow>
  );
}
