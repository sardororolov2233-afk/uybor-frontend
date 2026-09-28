import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, BedDouble, Bath, Phone, Heart, X, Copy, Check } from 'lucide-react';
import type { Listing } from '../types';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from '../i18n/LanguageContext';

export const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      if (WebApp && WebApp.BackButton) {
        WebApp.BackButton.show();
        const handleBack = () => navigate(-1);
        WebApp.BackButton.onClick(handleBack);
        
        return () => {
          WebApp.BackButton.hide();
          WebApp.BackButton.offClick(handleBack);
        };
      }
    } catch (e) {
      console.error("BackButton error:", e);
    }
  }, [navigate]);

  useEffect(() => {
    // Mock fetch
    const fetchListing = async () => {
      setListing({
        id: id || '1',
        title: 'Modern Apartment in City Center',
        description: 'A beautiful and spacious apartment located in the heart of the city. Perfect for young professionals or couples. The apartment features a modern kitchen, large windows, and a balcony with a great view. Close to public transport, shopping malls, and restaurants.',
        price: 1200,
        location: 'Tashkent, Yunusabad',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        bedrooms: 2,
        bathrooms: 1,
        userId: 'user123',
        createdAt: new Date().toISOString(),
        phone: '+998 90 123 45 67',
        telegram: 'sardororolov2233_afk'
      });
    };
    fetchListing();
  }, [id]);

  const handleTelegram = () => {
    if (!listing?.telegram) return;
    const url = `https://t.me/${listing.telegram}`;
    if (WebApp && WebApp.openTelegramLink) {
      WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const copyPhone = () => {
    if (listing?.phone) {
      navigator.clipboard.writeText(listing.phone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!listing) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="relative h-72 bg-gray-200">
        {listing.images && listing.images.length > 0 && (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        )}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-800"
        >
          <Heart size={20} />
        </button>
      </div>

      <div className="p-5 pb-24">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
        </div>
        
        <p className="text-2xl font-bold text-blue-600 mb-4">
          ${listing.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">{t('details.month')}</span>
        </p>

        <div className="flex items-center text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl">
          <MapPin size={18} className="mr-2 text-blue-500" />
          <span>{listing.location}</span>
        </div>

        <div className="flex justify-around items-center border-y border-gray-100 py-4 mb-6">
          <div className="flex flex-col items-center">
            <BedDouble size={24} className="text-gray-400 mb-1" />
            <span className="font-semibold">{listing.bedrooms}</span>
            <span className="text-xs text-gray-500">{t('details.bedrooms')}</span>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="flex flex-col items-center">
            <Bath size={24} className="text-gray-400 mb-1" />
            <span className="font-semibold">{listing.bathrooms}</span>
            <span className="text-xs text-gray-500">{t('details.bathrooms')}</span>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-2">{t('details.description')}</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          {listing.description}
        </p>
      </div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-safe-bottom flex gap-3">
        <button 
          onClick={handleTelegram}
          className="flex-1 bg-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-sm shadow-blue-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          {t('details.contact')}
        </button>
        <button 
          onClick={() => setPhoneModalOpen(true)}
          className="p-3.5 bg-green-100 text-green-600 rounded-xl active:scale-[0.98] transition-transform"
        >
          <Phone size={24} />
        </button>
      </div>

      {/* Phone Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setPhoneModalOpen(false)}
          />
          
          <div className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Telefon raqam</h3>
              <button 
                onClick={() => setPhoneModalOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-95 transition-transform"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 mb-6">
              <span className="text-2xl font-bold tracking-wider text-gray-900">{listing.phone}</span>
            </div>

            <button 
              onClick={copyPhone}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all ${
                copied 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                  : 'bg-[#ffde33] text-gray-900 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Nusxa olindi!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Nusxa olish
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
