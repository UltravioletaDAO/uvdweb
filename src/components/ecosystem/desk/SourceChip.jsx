// Chip de procedencia (contrato C10): estado de la escalera de datos + hora/fecha + fuente.
// Cada número del escritorio lleva uno: en vivo / último dato hh:mm / snapshot YYYY-MM-DD / sin dato.
import React from 'react';
import { useTranslation } from 'react-i18next';

const DOT = {
  live: '●',
  stale: '◐',
  snapshot: '▪',
  loading: '…',
  unavailable: '○',
  error: '○',
  blocked: '⊘',
};

const CLASS = {
  live: 'uvd-chip--live',
  stale: 'uvd-chip--stale',
  snapshot: 'uvd-chip--snapshot',
  loading: 'uvd-chip--loading',
  unavailable: 'uvd-chip--off',
  error: 'uvd-chip--off',
  blocked: 'uvd-chip--off',
};

export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDay(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

export default function SourceChip({ status = 'loading', fetchedAt = null, label = '', className = '' }) {
  const { t } = useTranslation();
  const s = CLASS[status] ? status : 'unavailable';
  let text = t(`ecosystem.status.${s}`, s);
  if (s === 'stale' && fetchedAt) text = `${text} ${formatTime(fetchedAt)}`;
  if (s === 'snapshot' && fetchedAt) text = `${text} ${formatDay(fetchedAt)}`;
  return (
    <span className={`uvd-chip ${CLASS[s]} ${className}`} data-status={s} title={label || undefined}>
      <span aria-hidden="true">{DOT[s]}</span> {text}
      {label ? <span className="uvd-chip__label"> · {label}</span> : null}
    </span>
  );
}
