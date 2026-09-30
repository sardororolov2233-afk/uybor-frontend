import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { Moon, Sun, ChevronDown, Heart } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getUser } from '../api/auth';

export const Header: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  
  const [currency, setCurrency] = useState<'UZS' | 'USD'>(() => {
    return (localStorage.getItem('currency') as 'UZS' | 'USD') || 'UZS';
  });

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  // 1) Server-authenticated user from localStorage (primary source)
  const savedUser = getUser();
  // 2) Telegram WebApp user (secondary fallback)
  const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user || WebApp?.initDataUnsafe?.user;

  // Build full name: prefer saved DB user, then Telegram, then "Mehmon"
  const firstName = savedUser?.first_name || tgUser?.first_name || '';
  const lastName = savedUser?.last_name || tgUser?.last_name || '';
  const rawName = [firstName, lastName].filter(Boolean).join(' ');
  const fullName = rawName || (savedUser?.username ? `@${savedUser.username}` : (tgUser?.username ? `@${tgUser.username}` : 'Mehmon'));

  const photoUrl = savedUser?.photo_url || tgUser?.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=0D8ABC&color=fff';
  
  const displayName = fullName.length > 12 ? fullName.substring(0, 10) + '...' : fullName;

  const toggleCurrency = () => {
    const nextCurr = currency === 'UZS' ? 'USD' : 'UZS';
    setCurrency(nextCurr);
    localStorage.setItem('currency', nextCurr);
    // For MVP, reloading might be needed if other components read from localStorage. Or we dispatch an event.
    window.dispatchEvent(new Event('currencyChange'));
  };

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-400 p-0.5 overflow-hidden">
          <img src={photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Salom 👋</span>
          <span className="font-bold text-sm uppercase text-gray-900 dark:text-white tracking-wide">{displayName}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef5fd] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold active:scale-95 transition-transform"
        >
          <span>{language === 'uz' ? '🇺🇿' : '🇷🇺'}</span>
          <span className="uppercase">{language}</span>
          <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
        
        <button 
          onClick={toggleCurrency}
          className="px-3 py-1.5 bg-[#eef5fd] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold active:scale-95 transition-transform"
        >
          {currency}
        </button>
        
        <button 
          onClick={() => window.location.href = '/favorites'}
          className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full active:scale-95 transition-transform"
        >
          <Heart size={16} />
        </button>
        
        <button 
          onClick={toggleDarkMode}
          className="p-1.5 bg-[#eef5fd] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full active:scale-95 transition-transform"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
};
