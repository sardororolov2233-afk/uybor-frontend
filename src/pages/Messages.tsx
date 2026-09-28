import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export const Messages: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#f5f8ff] min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-blue-50 text-[#0066b2] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900">{t('nav.messages') || 'Xabarlar'}</h2>
        <p className="text-gray-500 text-sm">
          Sizda hozircha hech qanday xabar yo'q.
        </p>
      </div>
    </div>
  );
};
