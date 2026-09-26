import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, User } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const hideBottomNav = pathname.includes('/listing/');

  // Expand Telegram Mini App to full height
  React.useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {!hideBottomNav && (
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe-bottom">
          <div className="flex justify-around items-center h-16">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`
              }
            >
              <Home size={24} />
              <span className="text-[10px] font-medium">Explore</span>
            </NavLink>
            
            <NavLink 
              to="/add" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`
              }
            >
              <PlusCircle size={24} />
              <span className="text-[10px] font-medium">Add</span>
            </NavLink>
            
            <NavLink 
              to="/my-listings" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`
              }
            >
              <User size={24} />
              <span className="text-[10px] font-medium">Profile</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
};
