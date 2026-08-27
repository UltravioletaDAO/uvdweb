// Dock inferior: las ventanas del escritorio activo (abiertas ●, minimizadas ○, cerradas +).
// Click = enfocar / restaurar / volver a abrir por kind con los params declarados en DESKTOPS.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DESKTOPS } from '../desktops';
import { useDeskActions, useDeskLayoutState } from './useDesk';

function hint(params) {
  if (!params) return '';
  if (params.channel) return ` #${params.channel}`;
  if (params.key) return ` ${params.key}`;
  if (params.snippet) return ` ${params.snippet}`;
  if (params.nodeId) return ` ${params.nodeId}`;
  return '';
}

export default function Dock() {
  const { t } = useTranslation();
  const state = useDeskLayoutState();
  const actions = useDeskActions();
  const desk = DESKTOPS[state.desktop];
  if (!desk) return null;

  const same = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);
  const existing = state.windows.filter((w) => w.desktop === state.desktop);
  const items = desk.windows.map((decl) => {
    const win = existing.find((w) => w.kind === decl.kind && same(w.params, decl.params)) || null;
    return { kind: decl.kind, params: decl.params || null, win };
  });
  // Ventanas abiertas por tools/REPL que no están declaradas (p. ej. node).
  existing.forEach((w) => {
    if (!items.some((it) => it.win && it.win.id === w.id)) items.push({ kind: w.kind, params: w.params, win: w });
  });

  return (
    <nav className="uvd-dock" aria-label={t('ecosystem.panel.desktops.' + desk.id, desk.id)} data-dock="">
      {items.map((it, i) => {
        const title = `${t(`ecosystem.windows.${it.kind}.title`, it.kind)}${hint(it.params)}`;
        const stateLabel = !it.win ? '+' : it.win.minimized ? '○' : '●';
        const onClick = () => {
          if (!it.win) actions.open(it.kind, it.params);
          else actions.focus(it.win.id);
        };
        return (
          <button
            key={it.win ? it.win.id : `${it.kind}-${i}`}
            type="button"
            className={`uvd-dock__item ${it.win && !it.win.minimized ? 'is-open' : ''} ${it.win && state.focusId === it.win.id ? 'is-focused' : ''}`}
            data-dock-item={it.kind}
            aria-pressed={it.win ? !it.win.minimized : false}
            title={title}
            onClick={onClick}
          >
            <span aria-hidden="true">{stateLabel}</span> {title}
          </button>
        );
      })}
    </nav>
  );
}
