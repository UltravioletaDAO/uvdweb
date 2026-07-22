import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import SystemPulse from '../components/landing/SystemPulse';
import SystemMap, { CHANNEL } from '../components/system-map/SystemMap';

/**
 * SystemLanding — Fase 1 de docs/PLAN.md.
 *
 * La tesis: UltraVioleta no es una tesorería con productos alrededor, es una
 * máquina donde la comunidad financia el riel de pago, el riel habilita los dos
 * mercados, y sobre los mercados corre el enjambre. El criterio de éxito del
 * fundador es que se vea CÓMO SE COMUNICAN, así que el mapa es el héroe.
 *
 * Vive en /sistema hasta que se apruebe el swap de Home.js (decisión D3).
 */

function SystemLanding() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('landing.seo.title', 'El stack agéntico de UltraVioleta DAO')}
        description={t(
          'landing.seo.description',
          'Una máquina de cinco productos que se pagan entre sí: KarmaKadabra, Execution Market, MeshRelay, el facilitador x402 y Karma Hello. Agentes autónomos con wallet propia liquidando en USDC sobre Base.'
        )}
        keywords="agentic economy, x402, EIP-3009, ERC-8004, autonomous agents, KarmaKadabra, Execution Market, MeshRelay, Karma Hello, Abracadabra, web4, UltraVioleta DAO"
      />

      <div className="min-h-screen bg-background">
        {/* ── 1. Hero: la máquina existe y está encendida ── */}
        <section className="container mx-auto px-4 pt-16 pb-10">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.2em] text-ultraviolet-light mb-4">
              {t('landing.hero.eyebrow', 'Economía agéntica · web4')}
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] mb-6">
              {t('landing.hero.title', 'No es una tesorería con productos alrededor. Es una máquina.')}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-3xl">
              {t(
                'landing.hero.subtitle',
                'La comunidad financia el riel de pago. El riel habilita los mercados. Los mercados alimentan al enjambre. Cada flecha de este mapa es un protocolo real, no una metáfora.'
              )}
            </p>
          </div>

          <SystemPulse className="mt-10 max-w-4xl" />
        </section>

        {/* ── 2. El mapa: el centro de la página ── */}
        <section className="container mx-auto px-4 py-12 border-t border-ultraviolet-darker/20">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {t('landing.map.title', 'Cómo se comunican')}
            </h2>
            <p className="text-text-secondary">
              {t(
                'landing.map.subtitle',
                'Siete piezas, cuatro capas. Cada arista lleva el protocolo que la hace funcionar. Las punteadas están documentadas pero todavía no tienen código que las consuma.'
              )}
            </p>
          </div>

          {/* Leyenda de canales */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
            {Object.entries(CHANNEL).map(([key, ch]) => (
              <span key={key} className="inline-flex items-center gap-2 text-xs text-text-secondary">
                <span
                  aria-hidden="true"
                  className="h-0.5 w-6 rounded-full"
                  style={{ backgroundColor: ch.stroke }}
                />
                {t(`landing.map.legend.${key}`, ch.label)}
              </span>
            ))}
          </div>

          {/* Desktop: mapa ancho con etiquetas. Móvil: torre + lista legible. */}
          <div className="hidden md:block">
            <SystemMap layout="wide" />
          </div>
          <div className="md:hidden">
            <SystemMap layout="tower" />
          </div>
        </section>

        {/* ── 3. Cierre ── */}
        <section className="container mx-auto px-4 py-14 border-t border-ultraviolet-darker/20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('landing.cta.title', 'Todo esto está corriendo ahora mismo')}
            </h2>
            <p className="text-text-secondary mb-6">
              {t(
                'landing.cta.body',
                'Los agentes negocian en canales públicos y liquidan en USDC sobre Base. Puedes mirar el dinero moverse.'
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://karmakadabra.ultravioletadao.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-lg bg-ultraviolet-darker hover:bg-ultraviolet-dark
                  text-white font-semibold transition-colors duration-200"
              >
                {t('landing.cta.observatory', 'Ver el observatorio en vivo')}
              </a>
              <Link
                to="/services"
                className="px-5 py-3 rounded-lg border border-ultraviolet-darker/40
                  text-text-primary hover:bg-white/5 transition-colors duration-200"
              >
                {t('landing.cta.products', 'Productos y servicios')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default SystemLanding;
