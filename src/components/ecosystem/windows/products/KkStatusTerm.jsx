// KkStatusTerm — ventana `kk_status`: estado del enjambre de KarmaKadabra desde el replay FECHADO de
// live/fuel.json (estado, motivo, agentes_vivos, medido_en). kk_get_kpis no trae estado: por eso esta
// ventana es un replay y el chip dice "snapshot" con su fecha, nunca "en vivo".
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import { loadReplay, replayJson, replayLines, replayTitle, ReplayLink, REPLAY_LINKS } from './ReplayTerm';

const FUEL_REPLAY = loadReplay('kk_fuel');
const FUEL = replayJson('kk_fuel');

const show = (v) => (v === null || v === undefined ? '—' : String(v));

/** Resumen de una línea del fuel.json (solo campos presentes en el replay). */
export function fuelSummary(fuel) {
  if (!fuel || typeof fuel !== 'object') return null;
  return ['estado', 'motivo', 'agentes_vivos', 'agentes_totales', 'medido_en']
    .filter((k) => fuel[k] !== undefined)
    .map((k) => `${k}: ${show(fuel[k])}`)
    .join(' · ');
}

export default function KkStatusTerm({ windowId }) {
  const { t } = useTranslation();
  const lines = useMemo(() => {
    if (!FUEL_REPLAY) {
      return [{ id: 'missing', kind: 'err', text: `${t('ecosystem.status.unavailable', 'sin dato')} · replay kk_fuel` }];
    }
    return replayLines(FUEL_REPLAY, { notes: [fuelSummary(FUEL)] });
  }, [t]);

  return (
    <TermWindow
      windowId={windowId}
      title={`${t('ecosystem.windows.kk_status.title', 'status — enjambre')} · ${replayTitle(t, FUEL_REPLAY)}`}
      sourceChip={{
        status: FUEL_REPLAY ? 'snapshot' : 'unavailable',
        fetchedAt: FUEL_REPLAY ? FUEL_REPLAY.recorded_at : null,
        label: t('ecosystem.windows.kk_status.source', 'replay con fecha de fuel.json de KarmaKadabra')
      }}
    >
      <Terminal lines={lines} typewriter ariaLive="off" maxLines={60} />
      <ReplayLink link={REPLAY_LINKS.kk_fuel} t={t} />
    </TermWindow>
  );
}
