import React, { useEffect, useState } from 'react';
import { FilterForm } from '../components/FilterForm';
import { ListingCard } from '../components/ListingCard';
import type { Listing } from '../types';

export const Home: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async (searchQuery?: string) => {
    setLoading(true);
    console.log('Fetching listings with query:', searchQuery);
    try {
      // In a real app, you would pass the searchQuery to the backend
      // const res = await api.get('/listings', { params: { q: searchQuery }});
      
      // MOCK DATA for demonstration
      const mockListings: Listing[] = [
        {
          id: '1',
          title: 'Modern Apartment in City Center',
          description: 'A beautiful and spacious apartment.',
          price: 1200,
          location: 'Tashkent, Yunusabad',
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'],
          bedrooms: 2,
          bathrooms: 1,
          userId: 'user123',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Cozy House with Garden',
          description: 'Perfect for a family.',
          price: 2500,
          location: 'Tashkent, Mirzo Ulugbek',
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80'],
          bedrooms: 4,
          bathrooms: 2,
          userId: 'user456',
          createdAt: new Date().toISOString()
        }
      ];
      
      setListings(mockListings);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (query: string) => {
    fetchListings(query);
  };

  return (
    <div>
      <FilterForm onSearch={handleSearch} />
      
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Featured Listings</h1>
        
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
            No listings found.
          </div>
        )}
      </div>
    </div>
  );
};
