import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import type { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { LogOut, Plus } from 'lucide-react';

export const MyListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  
  const user = WebApp?.initDataUnsafe?.user;
  
  const firstName = user?.first_name || 'Mehmon';
  const lastName = user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim().toUpperCase() || 'SARDORBEK O\'ROLOV';
  const photoUrl = user?.photo_url || 'https://ui-avatars.com/api/?name=' + firstName + '&background=0D8ABC&color=fff';
  const userId = user?.id || '1060024205';

  useEffect(() => {
    const fetchMyListings = async () => {
      setLoading(true);
      try {
        // Mock data
        setListings([]);
      } catch (error) {
        console.error('Failed to fetch my listings', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyListings();
  }, [user?.id]);

  return (
    <div className="bg-[#f5f8ff] min-h-screen px-4 py-6">
      
      {/* Profile Card */}
      <div className="bg-[#f5f9ff] border border-blue-50/50 shadow-sm rounded-[32px] p-5 mb-4">
        
        {/* Avatar & Info */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-[100px] h-[100px] rounded-full border-4 border-[#0066b2] p-0.5 overflow-hidden mb-3">
            <img src={photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{fullName}</h1>
          <div className="bg-[#e4eff9] text-gray-600 text-xs px-3 py-1.5 rounded-full">
            tg_{userId}@telegram.local · ID: {userId.toString().substring(0, 8)}
          </div>
        </div>

        {/* Balance */}
        <div className="bg-[#e4eff9] rounded-[24px] p-5 flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-500 font-medium tracking-wide mb-1 uppercase">BALANS</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">0</span>
              <span className="text-sm font-medium text-gray-700">so'm</span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 bg-[#0066b2] text-white px-5 py-3 rounded-full font-semibold active:scale-95 transition-transform">
            <Plus size={18} />
            <span>To'ldirish</span>
          </button>
        </div>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 bg-[#e4eff9] text-[#e63946] py-3.5 rounded-full font-semibold active:scale-95 transition-transform">
          <LogOut size={18} />
          <span>Chiqish</span>
        </button>

      </div>
      
      {/* Settings / My Listings */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-[32px] p-5">
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
          <span className="text-sm font-medium text-gray-700">{t('profile.language')}</span>
          <LanguageSwitcher />
        </div>

        <h2 className="text-lg font-bold mb-4">{t('profile.title')}</h2>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066b2]"></div>
          </div>
        ) : listings.length > 0 ? (
          <div className="flex flex-col gap-2">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-6 mb-4 text-sm">
            {t('profile.noProperties')}
          </div>
        )}
      </div>

    </div>
  );
};
