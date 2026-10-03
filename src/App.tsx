import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { Layout } from './components/Layout';
import { loginWithTelegram } from './api/auth';
import { ProtectedRoute } from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Details = lazy(() => import('./pages/Details').then(m => ({ default: m.Details })));
const AddListing = lazy(() => import('./pages/AddListing').then(m => ({ default: m.AddListing })));
const EditListing = lazy(() => import('./pages/EditListing').then(m => ({ default: m.EditListing })));
const MyListings = lazy(() => import('./pages/MyListings').then(m => ({ default: m.MyListings })));
const AllListings = lazy(() => import('./pages/AllListings').then(m => ({ default: m.AllListings })));
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const SavedSearches = lazy(() => import('./pages/SavedSearches').then(m => ({ default: m.SavedSearches })));

const App: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      console.log('=== UYBOR INIT START ===');
      const tg = (window as any)?.Telegram?.WebApp || WebApp;
      try {
        tg?.ready();
        tg?.expand();
      } catch (e) {
        console.warn('Error calling tg.ready()/expand():', e);
      }

      console.log('WebApp available:', !!tg);
      console.log('WebApp.initData length:', tg?.initData?.length || 0);
      console.log('WebApp.initDataUnsafe.user:', JSON.stringify(tg?.initDataUnsafe?.user));

      const tgUser = tg?.initDataUnsafe?.user;

      // Always try to login if initData exists
      if (tg?.initData) {
        console.log('initData found, calling loginWithTelegram...');
        const result = await loginWithTelegram();
        if (result?.user) {
          console.log('Successfully logged in with backend user:', result.user);
        } else if (tgUser) {
          console.warn('Backend login failed, fallback to tgUser:', tgUser);
          localStorage.setItem('uybor_user', JSON.stringify({
            telegram_id: tgUser.id,
            first_name: tgUser.first_name || '',
            last_name: tgUser.last_name || '',
            username: tgUser.username || '',
            photo_url: tgUser.photo_url || null,
          }));
        }
      } else if (tgUser) {
        console.log('Only initDataUnsafe available, storing fallback user:', tgUser);
        localStorage.setItem('uybor_user', JSON.stringify({
          telegram_id: tgUser.id,
          first_name: tgUser.first_name || '',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          photo_url: tgUser.photo_url || null,
        }));
      }

      console.log('Current stored user:', localStorage.getItem('uybor_user'));
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
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Yuklanmoqda...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="all-listings" element={<AllListings />} />
            <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="listing/:id" element={<Details />} />
            <Route path="add" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
            <Route path="edit/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
            <Route path="my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="saved-searches" element={<SavedSearches />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
