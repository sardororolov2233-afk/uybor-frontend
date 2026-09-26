import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { AddListing } from './pages/AddListing';
import { MyListings } from './pages/MyListings';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="listing/:id" element={<Details />} />
          <Route path="add" element={<AddListing />} />
          <Route path="my-listings" element={<MyListings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
