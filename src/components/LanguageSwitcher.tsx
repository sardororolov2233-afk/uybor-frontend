import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setLanguage('uz')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          language === 'uz' ? 'bg-white shadow-sm font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        UZ
      </button>
      <button
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          language === 'ru' ? 'bg-white shadow-sm font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        RU
      </button>
    </div>
  );
};
