// ObservatoryWindow — ventana `observatory` del escritorio KarmaKadabra: póster fechado + facade
// click-to-load del observatorio 3D real (three.js + WebSocket a bridge.meshrelay.xyz, corre en KK).
// El chip de estado sale del replay grabado de live/fuel.json (estado/motivo/medido_en) y la fecha
// "detenido desde" es el día del último trade que devuelve kk_recent_trades (MCP en vivo, cache local
// o replay). Nada se marca "en vivo" sobre el póster.
import React from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import useLiveMetric from '../../../../hooks/useLiveMetric';
import EmbedFacade from './EmbedFacade';
import { replayJson, loadReplay, isoDay } from './ReplayTerm';
import { KK_MCP_URL } from './KkKpiTerm';
import { fetchTrades, selectTrades, lastTradeDay, TRADES_SNAPSHOT, TRADES_SNAPSHOT_DATE } from './KkTradesTerm';

export const OBSERVATORY_URL = 'https://karmakadabra.ultravioletadao.xyz/';
export const OBSERVATORY_CLASSIC_URL = 'https://karmakadabra.ultravioletadao.xyz/classic.html';
export const OBSERVATORY_POSTER = '/ecosystem/posters/kk-observatory.webp';
// Fecha de captura del póster (design-d4-kk-observatory-1440.png, Playwright 2026-08-27). Va en el alt, no en la imagen.
export const OBSERVATORY_POSTER_DATE = '2026-08-27';

const FUEL = replayJson('kk_fuel');
const FUEL_REPLAY = loadReplay('kk_fuel');

/** Chip de estado del enjambre a partir del fuel.json grabado y del último trade observado. */
export function observatoryChip(t, trades) {
  const none = t('ecosystem.status.unavailable', 'sin dato');
  if (!FUEL) return `fuel.json · ${none}`;
  const recorded = isoDay(FUEL.medido_en) || (FUEL_REPLAY && isoDay(FUEL_REPLAY.recorded_at)) || none;
  const halted = FUEL.halted === true || FUEL.estado === 'detenido';
  if (!halted) return `${FUEL.estado || none} · fuel.json ${recorded}`;
  const date = lastTradeDay(trades) || none;
  return t('ecosystem.observatory.halted', { defaultValue: 'enjambre detenido desde {{date}} · replay fuel.json {{recorded}}', date, recorded });
}

export default function ObservatoryWindow({ windowId }) {
  const { t } = useTranslation();
  // Comparte cacheKey con KkTradesTerm: una sola verdad para "último trade".
  const { value: trades } = useLiveMetric({
    url: KK_MCP_URL,
    cacheKey: 'kk_recent_trades',
    fetcher: fetchTrades,
    select: selectTrades,
    snapshot: TRADES_SNAPSHOT,
    snapshotDate: TRADES_SNAPSHOT_DATE,
    pollMs: 0
  });
  const chip = observatoryChip(t, trades);
  const title = t('ecosystem.windows.observatory.title', 'observatorio 3D — KarmaKadabra');
  const posterAlt = t('ecosystem.observatory.poster_alt', { defaultValue: 'Captura del observatorio 3D de KarmaKadabra tomada el {{date}}', date: OBSERVATORY_POSTER_DATE });

  return (
    <TermWindow
      windowId={windowId}
      title={title}
      sourceChip={{
        status: 'snapshot',
        fetchedAt: FUEL ? FUEL.medido_en : null,
        label: t('ecosystem.windows.observatory.source', 'karmakadabra.ultravioletadao.xyz · iframe bajo demanda · WebSocket a bridge.meshrelay.xyz')
      }}
    >
      <EmbedFacade
        url={OBSERVATORY_URL}
        classicUrl={OBSERVATORY_CLASSIC_URL}
        poster={OBSERVATORY_POSTER}
        posterAlt={posterAlt}
        title={title}
        minWidth={1024}
        chip={chip}
        requireWebGL
      />
      <p className="mt-2 font-mono text-xs leading-relaxed text-text-secondary">
        {t(
          'ecosystem.observatory.desc',
          'Observatorio three.js de KarmaKadabra: los agentes del enjambre, sus wallets y sus intercambios, alimentado por WebSocket desde bridge.meshrelay.xyz. Se embebe bajo demanda; el póster es una captura con fecha.'
        )}
      </p>
    </TermWindow>
  );
}
