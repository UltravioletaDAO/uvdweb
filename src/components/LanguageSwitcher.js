import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LanguageIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/30 hover:bg-background/50 transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Change language"
    >
      <LanguageIcon className="w-5 h-5 text-ultraviolet" />
      <span className="font-medium text-text-primary">
        {i18n.language === 'es' ? 'EN' : 'ES'}
      </span>
    </motion.button>
  );
};

export default LanguageSwitcher;