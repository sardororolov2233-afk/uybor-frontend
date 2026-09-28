import React, { useEffect, useState } from 'react';
import { FilterForm } from '../components/FilterForm';
import { CompactListingCard } from '../components/CompactListingCard';
import { OverlayListingCard } from '../components/OverlayListingCard';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ArrowRight, X, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [vipListings, setVipListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
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
      
      setNewListings([...mockListings].reverse());
      setVipListings([mockListings[2], mockListings[1], mockListings[0]]);
      setFeaturedListings(mockListings);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (query: string) => {
    console.log('search', query);
    fetchListings();
  };

  const openAllListings = () => {
    // Navigates to a new route that will be created later (e.g., /all-listings)
    navigate('/all-listings');
  };

  return (
    <div className="bg-white min-h-screen">
      <FilterForm onSearch={handleSearch} onOpenFilter={() => setIsFilterOpen(true)} />
      
      <div className="py-4 flex flex-col gap-8">
        
        {/* VIP e'lonlar (VIP Listings) - First Position */}
        <section>
          <div className="flex justify-between items-center px-4 mb-3">
            <h2 className="text-xl font-bold text-gray-900">{t('home.vipListings')}</h2>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-3 px-4 pb-2 snap-x">
            {vipListings.map(listing => (
              <div key={`vip-${listing.id}`} className="snap-start">
                <OverlayListingCard listing={listing} badge="VIP" />
              </div>
            ))}
          </div>
        </section>

        {/* Yangi e'lonlar (New Listings) - Second Position */}
        <section>
          <div className="flex justify-between items-center px-4 mb-3">
            <h2 className="text-xl font-bold text-gray-900">{t('home.newListings')}</h2>
            <button 
              onClick={openAllListings}
              className="text-sm font-semibold text-blue-600 flex items-center gap-1 active:scale-95 transition-transform"
            >
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

        {/* Tavsiya etilgan e'lonlar (Featured Listings) - 2-column Grid */}
        <section className="px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-900">{t('home.featured')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredListings.map(listing => (
              <OverlayListingCard key={`feat-${listing.id}`} listing={listing} badge="TOP" />
            ))}
          </div>
        </section>
      </div>

      {/* Full Screen Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-100">
            <button onClick={() => setIsFilterOpen(false)} className="text-gray-700 active:scale-95">
              <X size={24} />
            </button>
            <h2 className="text-lg font-bold">{t('filter.title')}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Saved Searches */}
            <button className="w-full flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <Bookmark size={16} className="text-[#ffde33]" fill="#ffde33" />
                {t('filter.savedSearches')}
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </button>
            
            {/* Region / District */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.region')}</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-500 font-medium appearance-none focus:outline-none">
                  <option>{t('filter.region')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.district')}</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-500 font-medium appearance-none focus:outline-none">
                  <option>{t('filter.district')}</option>
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.condition')}</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-500 font-medium appearance-none focus:outline-none">
                <option>{t('filter.conditionSelect')}</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.area')}</label>
              <div className="flex gap-3">
                <input type="number" placeholder={t('filter.from')} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none" />
                <input type="number" placeholder={t('filter.to')} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none" />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.price')}</label>
              <div className="flex gap-3 mb-3">
                <input type="number" placeholder={t('filter.from')} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none" />
                <input type="number" placeholder={t('filter.to')} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none" />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button className="flex-1 py-2 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-900">so'm</button>
                <button className="flex-1 py-2 text-sm font-semibold rounded-md bg-white text-gray-900 shadow-sm">y.e</button>
              </div>
            </div>
            
            <div className="h-10"></div> {/* Bottom padding */}
          </div>
          
          {/* Bottom Actions */}
          <div className="border-t border-gray-100 p-4 pb-safe flex gap-3 bg-white">
            <button className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
              <Bookmark size={16} /> {t('filter.save')}
            </button>
            <button onClick={() => setIsFilterOpen(false)} className="flex-[2] bg-[#ffde33] text-gray-900 font-bold py-3.5 rounded-xl shadow-sm">
              {t('filter.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
