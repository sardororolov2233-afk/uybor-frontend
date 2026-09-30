import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
      if (!isLoggedIn()) {
        await loginWithTelegram();
      }
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
