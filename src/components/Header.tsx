import React from 'react';
import WebApp from '@twa-dev/sdk';
import { Moon, ChevronDown } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const user = WebApp?.initDataUnsafe?.user;

  // Placeholder values if outside Telegram
  const firstName = user?.first_name || 'Mehmon';
  const photoUrl = user?.photo_url || 'https://ui-avatars.com/api/?name=' + firstName + '&background=0D8ABC&color=fff';
  
  const displayName = firstName.length > 10 ? firstName.substring(0, 8) + '...' : firstName;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-400 p-0.5 overflow-hidden">
          <img src={photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Salom 👋</span>
          <span className="font-bold text-sm uppercase text-gray-900 tracking-wide">{displayName}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef5fd] text-gray-800 rounded-full text-xs font-semibold active:scale-95 transition-transform"
        >
          <span>{language === 'uz' ? '🇺🇿' : '🇷🇺'}</span>
          <span className="uppercase">{language}</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>
        
        <div className="px-3 py-1.5 bg-[#eef5fd] text-gray-800 rounded-full text-xs font-semibold">
          UZS
        </div>
        
        <button className="p-1.5 bg-[#eef5fd] text-gray-800 rounded-full active:scale-95 transition-transform">
          <Moon size={16} />
        </button>
      </div>
    </div>
  );
};
