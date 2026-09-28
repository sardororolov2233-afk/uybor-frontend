import React, { useEffect, useState } from 'react';
import { CompactListingCard } from '../components/CompactListingCard';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AllListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Mock Data
    const mockListings: Listing[] = [
      {
        id: '1', title: 'Modern Apartment in City Center', description: 'A beautiful and spacious apartment.',
        price: 120000, location: 'Tashkent, Yunusabad', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'],
        bedrooms: 2, bathrooms: 1, userId: 'user123', createdAt: new Date().toISOString()
      },
      {
        id: '2', title: 'Cozy House with Garden', description: 'Perfect for a family.',
        price: 250000, location: 'Tashkent, Mirzo Ulugbek', images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80'],
        bedrooms: 4, bathrooms: 2, userId: 'user456', createdAt: new Date().toISOString()
      },
      {
        id: '3', title: 'Luxury Villa with Pool', description: 'Stunning views.',
        price: 450000, location: 'Tashkent, Yakkasaroy', images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=500&q=80'],
        bedrooms: 5, bathrooms: 3, userId: 'user789', createdAt: new Date().toISOString()
      },
      {
        id: '4', title: 'Studio near Metro', description: 'Great for students.',
        price: 40000, location: 'Tashkent, Chilonzor', images: ['https://images.unsplash.com/photo-1502672260266-1c1e5250ad99?w=500&q=80'],
        bedrooms: 1, bathrooms: 1, userId: 'user101', createdAt: new Date().toISOString()
      },
    ];
    setListings([...mockListings, ...mockListings]); // Duplicate to fill the page
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 active:scale-95 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t('home.newListings')}</h1>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold">Topildi: {listings.length}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pb-safe-bottom">
          {listings.map((listing, i) => (
            <CompactListingCard key={`all-${listing.id}-${i}`} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
};
