import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const internalLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.metrics'), to: '/metrics' },
    { label: t('nav.services'), to: '/services' },
  ];

  const externalLinks = [
    { label: t('footer.links.twitter'), href: 'https://twitter.com/UltravioletaDAO' },
    { label: t('footer.links.discord'), href: 'https://discord.gg/ultravioletadao' },
    { label: t('footer.links.github'), href: 'https://github.com/ultravioletadao' },
    { label: t('footer.links.linktree'), href: 'https://linktr.ee/UltravioletaDAO' },
  ];

  const operations = t('footer.operations.items', { returnObjects: true });

  return (
    <footer className="bg-[#0b0613] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black uppercase tracking-wider">
                {t('footer.legal_entity')}
              </span>
              <span className="rounded-full bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-200 uppercase">
                {t('footer.brand.tagline')}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xl">
              {t('footer.brand.description')}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-200">
              {t('footer.navigation_title')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {internalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors duration-200 hover:text-purple-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-200">
              {t('footer.links.title')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {externalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-purple-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-gray-300">{t('footer.registered_label')}</p>
            <p className="mt-2 text-lg font-semibold text-white">{t('footer.legal_entity')}</p>
            <div className="mt-3 text-sm text-gray-300 space-y-1">
              <p>{t('footer.address')}</p>
              <p>{t('footer.city_state_zip')}</p>
              <p>{t('footer.country')}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-gray-300">{t('footer.operations.title')}</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              {Array.isArray(operations) &&
                operations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-gray-300">{t('footer.contact.title')}</p>
            <p className="mt-3 text-sm text-gray-300">
              <a
                href="mailto:hola@ultravioletadao.xyz"
                className="transition-colors duration-200 hover:text-purple-200"
              >
                {t('footer.contact.email')}
              </a>
            </p>
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
              {t('footer.contact.note')}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {currentYear} {t('footer.legal_entity')}. {t('footer.all_rights_reserved')}.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/privacy" className="transition-colors duration-200 hover:text-purple-200">
              {t('footer.legal_links.privacy')}
            </Link>
            <Link to="/terms" className="transition-colors duration-200 hover:text-purple-200">
              {t('footer.legal_links.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
