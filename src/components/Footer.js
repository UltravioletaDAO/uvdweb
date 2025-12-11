import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const externalLinks = [
    { label: t('footer.links.twitter'), href: 'https://twitter.com/UltravioletaDAO' },
    { label: t('footer.links.discord'), href: 'https://discord.gg/ultravioletadao' },
    { label: t('footer.links.github'), href: 'https://github.com/ultravioletadao' },
    { label: t('footer.links.linktree'), href: 'https://linktr.ee/UltravioletaDAO' },
    { label: 'The Arena', href: 'https://arena.social/UltravioletaDAO' },
    { label: t('navigation.multisig', 'Multisig'), href: 'https://app.safe.global/home?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389' },
  ];

  const operations = t('footer.operations.items', { returnObjects: true });

  return (
    <footer className="relative border-t border-white/5 bg-background-lighter/50 backdrop-blur-xl pt-20 pb-10 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-ultraviolet/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-ultraviolet-light blur opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <img src="/uvd.png" alt="UVD" className="h-10 w-10 relative z-10" />
              </div>
              <span className="text-2xl font-bold tracking-wider text-white">
                ULTRAVIOLETA
              </span>
            </Link>
            <p className="text-text-secondary leading-relaxed max-w-sm">
              {t('footer.brand.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-ultraviolet/10 border border-ultraviolet/20 text-ultraviolet-light text-xs font-semibold uppercase tracking-wider">
                {t('footer.legal_entity')}
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan-glow text-xs font-semibold uppercase tracking-wider">
                DAO LLC
              </span>
            </div>
          </div>

          {/* Links Column */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <span className="w-1.5 h-1.5 bg-ultraviolet-light rounded-full mr-2"></span>
              {t('footer.links.title')}
            </h3>
            <ul className="space-y-3">
              {externalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span className="h-px w-0 bg-ultraviolet-light mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Operations Column */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <span className="w-1.5 h-1.5 bg-cyan-glow rounded-full mr-2"></span>
              {t('footer.operations.title')}
            </h3>
            <ul className="space-y-3">
              {Array.isArray(operations) &&
                operations.map((item) => (
                  <li key={item} className="text-text-secondary text-sm">
                    {item}
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Legal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="glass-panel p-6 hover:border-ultraviolet/30 transition-colors">
            <h4 className="text-white font-medium mb-3">{t('footer.registered_label')}</h4>
            <div className="space-y-1 text-sm text-text-muted">
              <p className="font-semibold text-text-primary">{t('footer.legal_entity')}</p>
              <p>{t('footer.address')}</p>
              <p>{t('footer.city_state_zip')}</p>
              <p>{t('footer.country')}</p>
            </div>
          </div>

          <div className="glass-panel p-6 hover:border-cyan/30 transition-colors">
            <h4 className="text-white font-medium mb-3">{t('footer.contact.title')}</h4>
            <div className="space-y-3">
              <a
                href="mailto:ultravioletadao@gmail.com"
                className="inline-flex items-center text-cyan-glow hover:text-cyan-400 font-medium transition-colors"
              >
                ultravioletadao@gmail.com
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
              <p className="text-xs text-text-muted leading-relaxed">
                {t('footer.contact.note')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {currentYear} {t('footer.legal_entity')}. {t('footer.all_rights_reserved')}.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-text-muted/50 font-mono">
              v1.0.0 • Built with ❤️ on Avalanche
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
