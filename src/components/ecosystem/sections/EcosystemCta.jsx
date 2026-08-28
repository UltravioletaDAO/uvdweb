// EcosystemCta — sección 04, cierre de /ecosystem: dos tarjetas, una para agentes (→ /llms.txt,
// archivo estático, botón ghost terminal) y otra para personas (→ /aplicar, ruta del SPA, único
// botón primario de la zona plana). Claves ecosystem.cta.*.
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bot, Users, ArrowRight } from 'lucide-react';

// Receta única del sistema visual de la zona plana (PLAN_EDITORIAL §3); las 2 cards del CTA
// conservan rounded-2xl (remate editorial).
const CARD = 'flex flex-col justify-between rounded-2xl border border-ultraviolet-darker/40 bg-background/80 p-6 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(124,31,255,0.55)] hover:shadow-[0_0_24px_rgba(106,0,255,0.18)]';
const BTN = 'inline-flex min-h-[44px] w-fit items-center gap-2 rounded-xl bg-ultraviolet px-6 py-3 font-semibold text-white transition-colors hover:bg-ultraviolet-light focus:outline focus:outline-2 focus:outline-purple-300';
const GHOST_BTN = 'inline-flex min-h-[44px] w-fit items-center gap-2 rounded-xl border border-ultraviolet-darker/60 bg-transparent px-6 py-3 font-mono text-[#a78bfa] transition-colors hover:border-[rgba(124,31,255,0.55)] hover:bg-ultraviolet/10 hover:text-[#c4b5fd] focus:outline focus:outline-2 focus:outline-purple-300';

export default function EcosystemCta() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="ecosystem-cta-title" className="mx-auto w-full max-w-7xl px-4 py-12" data-ecosystem-cta>
      <h2 id="ecosystem-cta-title" className="mb-2 font-mono text-2xl font-bold text-text-primary">
        <span className="text-[#a78bfa]" aria-hidden="true">04 · </span>
        {t('ecosystem.cta.title', 'Siguiente paso')}
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className={CARD} data-cta="agent">
          <div>
            <Bot className="mb-4 h-8 w-8 text-[#a78bfa]" aria-hidden="true" />
            <h3 className="mb-2 text-2xl font-bold text-text-primary">{t('ecosystem.cta.agent_title', '¿Eres un agente?')}</h3>
            <p className="mb-6 text-text-secondary">{t('ecosystem.cta.agent_body', 'Empieza por llms.txt: rutas, tools y protocolos de pago sin gas.')}</p>
          </div>
          <a href="/llms.txt" className={GHOST_BTN}>
            <span aria-hidden="true">$ </span>
            {t('ecosystem.cta.agent_button', 'Leer llms.txt')}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className={CARD} data-cta="human">
          <div>
            <Users className="mb-4 h-8 w-8 text-[#a78bfa]" aria-hidden="true" />
            <h3 className="mb-2 text-2xl font-bold text-text-primary">{t('ecosystem.cta.human_title', '¿Eres una persona?')}</h3>
            <p className="mb-6 text-text-secondary">{t('ecosystem.cta.human_body', 'Aplica al DAO y construye con nosotros.')}</p>
          </div>
          <Link to="/aplicar" className={BTN}>
            {t('ecosystem.cta.human_button', 'Aplicar')}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
