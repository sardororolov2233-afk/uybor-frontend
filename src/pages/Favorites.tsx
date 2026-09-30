import React, { useEffect, useState } from 'react';
import { CompactListingCard } from '../components/CompactListingCard';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ChevronLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFavorites } from '../api/favorites';

export const Favorites: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFavorites();
        // Backend qaytaradi: { id, user_id, listing_id, created_at, listings: { ... } }
        // Shuning uchun data.map orqali listings obyektini ajratib olamiz
        const formatted = data.map((item: any) => item.listings);
        setListings(formatted);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 active:scale-95 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart size={20} className="text-red-500 fill-red-500" />
          Sevimlilar
        </h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="text-sm text-gray-500 mb-4 font-medium">Saqlangan e'lonlar: {listings.length} ta</div>
            <div className="grid grid-cols-2 gap-3 pb-safe-bottom">
              {listings.map((listing, i) => (
                <CompactListingCard key={`fav-${listing?.id}-${i}`} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-300 rounded-full flex items-center justify-center mb-4">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Hali hech narsa yo'q</h3>
            <p className="text-gray-500 text-sm">Yoqqan e'lonlarni saqlash uchun yurakchani bosing</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-900 font-bold rounded-xl active:scale-95"
            >
              E'lonlarni ko'rish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
