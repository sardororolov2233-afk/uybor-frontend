import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import type { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';

export const MyListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = WebApp?.initDataUnsafe?.user;

  useEffect(() => {
    const fetchMyListings = async () => {
      setLoading(true);
      try {
        // const res = await api.get('/my-listings');
        // setListings(res.data);
        
        // Mock data
        setListings([
          {
            id: '1',
            title: 'Modern Apartment in City Center',
            description: 'A beautiful and spacious apartment.',
            price: 1200,
            location: 'Tashkent, Yunusabad',
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'],
            bedrooms: 2,
            bathrooms: 1,
            userId: user?.id?.toString() || '123',
            createdAt: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch my listings', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyListings();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.first_name} {user?.last_name}</h1>
            <p className="text-gray-500 text-sm">@{user?.username || 'user'}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">My Properties</h2>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : listings.length > 0 ? (
          <div className="flex flex-col gap-2">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            You haven't added any properties yet.
          </div>
        )}
      </div>
    </div>
  );
};
