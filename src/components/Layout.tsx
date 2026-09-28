import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, User } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from '../i18n/LanguageContext';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const hideBottomNav = pathname.includes('/listing/') || pathname.includes('/add');
  const showHeader = pathname === '/';
  const { t } = useTranslation();

  // Expand Telegram Mini App to full height
  React.useEffect(() => {
    try {
      if (WebApp && WebApp.ready) {
        WebApp.ready();
        WebApp.expand();
      }
    } catch (e) {
      console.error("Telegram WebApp init error:", e);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f8ff] pb-safe">
      {showHeader && <Header />}
      
      <main className="flex-1 overflow-y-auto pb-32">
        <Outlet />
      </main>

      {!hideBottomNav && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <nav className="bg-white rounded-[32px] shadow-lg shadow-blue-900/5 px-2 py-2 flex justify-between items-center h-[72px]">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-[72px] h-[56px] rounded-[24px] transition-all ${isActive ? 'bg-[#0066b2] text-white' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <Home size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">{t('nav.explore') || 'Asosiy'}</span>
            </NavLink>
            
            <NavLink 
              to="/add" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-[72px] h-[56px] rounded-[24px] transition-all ${isActive ? 'bg-[#0066b2] text-white' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <PlusCircle size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">{t('nav.add') || "Qo'shish"}</span>
            </NavLink>

            <NavLink 
              to="/messages" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-[72px] h-[56px] rounded-[24px] transition-all ${isActive ? 'bg-[#0066b2] text-white' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <MessageSquare size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">{t('nav.messages') || 'Xabarlar'}</span>
            </NavLink>
            
            <NavLink 
              to="/my-listings" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-[72px] h-[56px] rounded-[24px] transition-all ${isActive ? 'bg-[#0066b2] text-white' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <User size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium">{t('nav.profile') || 'Profil'}</span>
            </NavLink>
          </nav>
        </div>
      )}
    </div>
  );
};
