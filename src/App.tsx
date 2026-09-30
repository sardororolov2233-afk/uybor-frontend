import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { AddListing } from './pages/AddListing';
import { MyListings } from './pages/MyListings';
import { AllListings } from './pages/AllListings';
import { Messages } from './pages/Messages';
import { loginWithTelegram, isLoggedIn } from './api/auth';

const App: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      console.log('=== UYBOR INIT START ===');
      console.log('WebApp available:', !!WebApp);
      console.log('WebApp.initData:', WebApp?.initData ? `"${WebApp.initData.substring(0, 50)}..."` : 'EMPTY');
      console.log('WebApp.initDataUnsafe:', JSON.stringify(WebApp?.initDataUnsafe));
      console.log('WebApp.initDataUnsafe.user:', JSON.stringify(WebApp?.initDataUnsafe?.user));
      console.log('isLoggedIn:', isLoggedIn());

      if (!isLoggedIn()) {
        console.log('Not logged in, attempting loginWithTelegram...');
        const result = await loginWithTelegram();
        console.log('loginWithTelegram result:', result ? 'SUCCESS' : 'FAILED (null)');
        
        if (result) {
          console.log('User from backend:', JSON.stringify(result.user));
        } else {
          console.warn('Login failed! Saving Telegram user data as fallback...');
          // Zaxira: Telegram ma'lumotlarini to'g'ridan-to'g'ri saqlash
          const tgUser = WebApp?.initDataUnsafe?.user;
          if (tgUser) {
            console.log('Saving Telegram user as fallback:', JSON.stringify(tgUser));
            localStorage.setItem('uybor_user', JSON.stringify({
              telegram_id: tgUser.id,
              first_name: tgUser.first_name || '',
              last_name: tgUser.last_name || '',
              username: tgUser.username || '',
              photo_url: tgUser.photo_url || null,
            }));
          } else {
            console.error('No Telegram user data available either!');
          }
        }
      } else {
        console.log('Already logged in, stored user:', localStorage.getItem('uybor_user'));
      }

      console.log('=== UYBOR INIT COMPLETE ===');
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="all-listings" element={<AllListings />} />
          <Route path="messages" element={<Messages />} />
          <Route path="listing/:id" element={<Details />} />
          <Route path="add" element={<AddListing />} />
          <Route path="my-listings" element={<MyListings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

