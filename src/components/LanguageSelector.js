import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
          bg-background-lighter/50 hover:bg-background-lighter
          border border-ultraviolet-darker/20 hover:border-ultraviolet-darker/40
          text-text-primary transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <GlobeAltIcon className="w-4 h-4 text-ultraviolet" />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <span className="text-sm hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-text-secondary transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 py-1 rounded-lg
            bg-[#1a1a2e] border border-ultraviolet-darker/30
            shadow-xl shadow-black/30 z-50"
          role="listbox"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left
                transition-colors duration-150
                ${lang.code === currentLanguage.code
                  ? 'bg-ultraviolet-darker/40 text-text-primary'
                  : 'text-text-secondary hover:bg-ultraviolet-darker/20 hover:text-text-primary'
                }`}
              role="option"
              aria-selected={lang.code === currentLanguage.code}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
