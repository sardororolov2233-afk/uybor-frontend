import React, { useEffect, useState } from 'react';
import { FilterForm } from '../components/FilterForm';
import { CompactListingCard } from '../components/CompactListingCard';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [vipListings, setVipListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchListings = async (searchQuery?: string) => {
    setLoading(true);
    console.log('Fetching listings with query:', searchQuery);
    try {
      // MOCK DATA for demonstration
      const mockListings: Listing[] = [
        {
          id: '1', title: 'Modern Apartment in City Center', description: 'A beautiful and spacious apartment.',
          price: 1200, location: 'Tashkent, Yunusabad', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'],
          bedrooms: 2, bathrooms: 1, userId: 'user123', createdAt: new Date().toISOString()
        },
        {
          id: '2', title: 'Cozy House with Garden', description: 'Perfect for a family.',
          price: 2500, location: 'Tashkent, Mirzo Ulugbek', images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80'],
          bedrooms: 4, bathrooms: 2, userId: 'user456', createdAt: new Date().toISOString()
        },
        {
          id: '3', title: 'Luxury Villa with Pool', description: 'Stunning views.',
          price: 4500, location: 'Tashkent, Yakkasaroy', images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=500&q=80'],
          bedrooms: 5, bathrooms: 3, userId: 'user789', createdAt: new Date().toISOString()
        },
        {
          id: '4', title: 'Studio near Metro', description: 'Great for students.',
          price: 400, location: 'Tashkent, Chilonzor', images: ['https://images.unsplash.com/photo-1502672260266-1c1e5250ad99?w=500&q=80'],
          bedrooms: 1, bathrooms: 1, userId: 'user101', createdAt: new Date().toISOString()
        },
      ];
      
      // Split mock data into sections just for display
      setNewListings([...mockListings].reverse());
      setVipListings([mockListings[2], mockListings[1], mockListings[0]]);
      setFeaturedListings(mockListings);
      
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

  if (loading) {
    return (
      <div>
        <FilterForm onSearch={handleSearch} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f8ff] min-h-screen">
      <FilterForm onSearch={handleSearch} />
      
      <div className="py-4 flex flex-col gap-8">
        
        {/* Yangi e'lonlar (New Listings) */}
        <section>
          <div className="flex justify-between items-center px-4 mb-3">
            <h2 className="text-lg font-bold text-gray-900">{t('home.newListings')}</h2>
            <button className="text-sm font-semibold text-blue-600 flex items-center gap-1 active:scale-95 transition-transform">
              {t('home.seeAll')} <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-3 px-4 pb-2 snap-x">
            {newListings.map(listing => (
              <div key={`new-${listing.id}`} className="snap-start">
                <CompactListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>

        {/* VIP e'lonlar (VIP Listings) */}
        <section>
          <div className="flex justify-between items-center px-4 mb-3">
            <h2 className="text-lg font-bold text-gray-900">{t('home.vipListings')}</h2>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-3 px-4 pb-2 snap-x">
            {vipListings.map(listing => (
              <div key={`vip-${listing.id}`} className="snap-start">
                <CompactListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>

        {/* Tavsiya etilgan e'lonlar (Featured Listings) */}
        <section className="px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">{t('home.featured')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredListings.map(listing => (
              <CompactListingCard key={`feat-${listing.id}`} listing={listing} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
