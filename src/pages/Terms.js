import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

// Versión vigente de los términos. Es el dato que el dueño lee arriba de la
// página y el que las máquinas leen en <meta name="terms-version"> y en el
// atributo data-terms-version del contenedor. Fuente única: no tipear la
// versión en los diccionarios i18n ni en ningún otro lado.
export const TERMS_VERSION = 'v1-2026-09';
export const TERMS_EFFECTIVE_DATE = '2026-09-21';

// El orden de las secciones es el orden de lectura de la página.
const SECTIONS = [
  'operator',
  'scope',
  'asIs',
  'liability',
  'acceptableUse',
  'law',
  'contact',
  'changes'
];

const Terms = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // La entidad y el canal de contacto no se re-tipean acá: salen de las mismas
  // claves que ya publica el pie del sitio (footer.*).
  const email = t('footer.contact.email');
  const entityValues = {
    entity: t('footer.legal_entity'),
    address: t('footer.address'),
    cityStateZip: t('footer.city_state_zip'),
    country: t('footer.country')
  };

  return (
    <>
      <SEO
        title={t('terms.seoTitle')}
        description={t('terms.seoDescription')}
      />
      <Helmet>
        <meta name="terms-version" content={TERMS_VERSION} />
        <meta name="terms-effective-date" content={TERMS_EFFECTIVE_DATE} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background py-16 px-4"
        data-terms-version={TERMS_VERSION}
      >
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Título y versión */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-text-primary mb-4">
                {t('terms.title')}
              </h1>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="rounded-full bg-purple-600/20 px-4 py-2 text-sm font-semibold text-purple-200 tracking-wide">
                  {t('terms.version_label')}: {TERMS_VERSION}
                </span>
                <span className="text-sm text-text-secondary">
                  {t('terms.effective_label')}: {TERMS_EFFECTIVE_DATE}
                </span>
              </div>
            </div>

            {/* Secciones */}
            {SECTIONS.map((section) => (
              <div key={section} className="bg-card rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary mb-6 pb-4 border-b border-border">
                  {t(`terms.sections.${section}.title`)}
                </h2>
                <div className="space-y-4 text-text-secondary">
                  <p className="leading-relaxed">
                    {t(`terms.sections.${section}.body`, entityValues)}
                  </p>
                  {section === 'contact' && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-block text-ultraviolet-dark hover:text-ultraviolet-light transition-colors duration-200"
                    >
                      {email}
                    </a>
                  )}
                </div>
              </div>
            ))}

            <p className="text-sm text-text-secondary text-center">
              {t('terms.languages_note')}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Terms;
