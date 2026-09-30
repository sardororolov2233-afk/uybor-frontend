import React, { useEffect, useState } from 'react';
import { CompactListingCard } from '../components/CompactListingCard';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchListings } from '../api/listings';

export const AllListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchListings();
        setListings(data);
      } catch (error) {
        console.error('Error loading listings:', error);
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
        <h1 className="text-xl font-bold text-gray-900">{t('home.newListings')}</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-bold">Topildi: {listings.length}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pb-safe-bottom">
              {listings.map((listing, i) => (
                <CompactListingCard key={`all-${listing.id}-${i}`} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
