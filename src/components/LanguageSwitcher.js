import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LanguageIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' }
];

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const handleChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/30 hover:bg-background/50 transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={t('navigation.aria.change_language')}
    >
      <LanguageIcon className="w-5 h-5 text-ultraviolet" />
      <select
        value={(i18n.language || 'es').slice(0, 2)}
        onChange={handleChange}
        className="bg-transparent font-medium text-text-primary focus:outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-background text-text-primary">
            {lang.label}
          </option>
        ))}
      </select>
    </motion.div>
  );
};

export default LanguageSwitcher;