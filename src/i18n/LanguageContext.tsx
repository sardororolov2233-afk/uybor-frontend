import React, { createContext, useContext, useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { translations } from './translations';
import type { Language, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('uz');

  useEffect(() => {
    // 1. Check local storage first
    const savedLang = localStorage.getItem('uybor_lang') as Language;
    if (savedLang && (savedLang === 'uz' || savedLang === 'ru')) {
      setLanguageState(savedLang);
      return;
    }

    // 2. Check Telegram WebApp user language
    try {
      const tgUserLang = WebApp?.initDataUnsafe?.user?.language_code;
      if (tgUserLang) {
        if (tgUserLang.startsWith('ru')) {
          setLanguageState('ru');
        } else {
          setLanguageState('uz'); // Default for others
        }
      }
    } catch (e) {
      console.error('Error reading TG language', e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('uybor_lang', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['uz'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
