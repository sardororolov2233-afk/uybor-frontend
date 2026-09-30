import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Heart, X, Copy, Check, MessageCircle, Send, PhoneCall } from 'lucide-react';
import type { Listing } from '../types';
import WebApp from '@twa-dev/sdk';
import { fetchListingById } from '../api/listings';
import { fetchFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { isLoggedIn } from '../api/auth';

// Simple Telegram Icon component since lucide doesn't have a perfect match
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.5 2L2 10.5L9.5 13.5L12.5 22L15 15L21.5 2Z" />
    <path d="M21.5 2L9.5 13.5" />
  </svg>
);

export const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  // New States
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    const loadListing = async () => {
      if (!id) return;
      try {
        const data = await fetchListingById(id);
        setListing(data);

        // Check if favorite
        if (isLoggedIn()) {
          const favs = await fetchFavorites();
          if (favs.some((f: any) => f.listing_id === id)) {
            setIsFavorite(true);
          }
        }
      } catch (err) {
        console.error('Error loading listing:', err);
        setError(true);
      }
    };
    loadListing();
  }, [id]);

  const phone = listing?.users?.phone_number || '';
  const username = listing?.users?.username || '';

  const handleTelegram = () => {
    if (!username) {
      alert('Sotuvchining Telegram username ko\'rsatilmagan');
      return;
    }
    const url = `https://t.me/${username}`;
    if (WebApp && WebApp.openTelegramLink) {
      WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const copyPhone = () => {
    if (phone) {
      navigator.clipboard.writeText(phone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    if (!isLoggedIn()) {
      alert("Iltimos, avval tizimga kiring!");
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: listing?.title || "UyBor E'lon",
        url: url
      }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert("Havola nusxalandi!");
      });
    }
  };

  const handleReport = () => {
    alert("Shikoyatingiz qabul qilindi. Tez orada ko'rib chiqiladi.");
  };

  if (error) return (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
      <p className="text-gray-500 font-medium">E'lon topilmadi</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold">Orqaga</button>
    </div>
  );

  if (!listing) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-[140px]">
      {/* Image Carousel Area */}
      <div className="relative h-72 bg-gray-200">
        {listing.images && listing.images.length > 0 && (
          <img 
            src={listing.images[currentImageIndex]} 
            alt={listing.title} 
            className="w-full h-full object-cover transition-opacity duration-300" 
          />
        )}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-1 text-gray-800 bg-white/50 backdrop-blur-md rounded-full active:scale-95"
        >
          <ChevronLeft size={32} />
        </button>
        
        {/* Pagination Dots */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
            {listing.images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentImageIndex(i)}
                className={`h-1.5 transition-all rounded-full ${
                  currentImageIndex === i ? 'w-6 bg-[#ffde33]' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Tags and Actions Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
            {listing.category && (
              <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-900">
                {listing.category}
              </div>
            )}
            {listing.property_type && (
              <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-900">
                {listing.property_type}
              </div>
            )}
          </div>
          
          <div className="flex gap-4 text-gray-700 ml-2 shrink-0">
            <Heart 
              size={24} 
              className={`cursor-pointer transition-colors active:scale-90 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} 
              onClick={handleToggleFavorite}
            />
            <MessageCircle size={24} className="cursor-pointer active:scale-90" onClick={handleTelegram} />
            <Send size={24} className="cursor-pointer active:scale-90" onClick={handleShare} />
          </div>
        </div>

        {/* Time */}
        <p className="text-gray-500 text-sm mb-3">
          {new Date(listing.created_at).toLocaleDateString('uz-UZ')}
        </p>

        {/* Title & Price */}
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight mb-2">
          {listing.title}
        </h1>
        <p className="text-[26px] font-extrabold text-gray-900 mb-3">
          {listing.price.toLocaleString()} {listing.currency || 'y.e'}
        </p>

        {/* Description */}
        <p className="text-gray-800 text-[15px] leading-snug mb-6 whitespace-pre-wrap">
          {listing.description}
        </p>

        {/* Details Table */}
        <div className="space-y-3 mb-8">
          {listing.users?.first_name && (
            <div className="flex items-center text-[15px]">
              <span className="font-semibold text-gray-900 shrink-0">Kim joylashtirdi</span>
              <div className="flex-1 border-b-2 border-gray-100 mx-3 mb-1"></div>
              <span className="font-bold text-gray-900 shrink-0 text-right">{listing.users.first_name}</span>
            </div>
          )}
          {listing.property_type && (
            <div className="flex items-center text-[15px]">
              <span className="font-semibold text-gray-900 shrink-0">Turi</span>
              <div className="flex-1 border-b-2 border-gray-100 mx-3 mb-1"></div>
              <span className="font-bold text-gray-900 shrink-0 text-right">{listing.property_type}</span>
            </div>
          )}
          {listing.rooms > 0 && (
            <div className="flex items-center text-[15px]">
              <span className="font-semibold text-gray-900 shrink-0">Xonalar soni</span>
              <div className="flex-1 border-b-2 border-gray-100 mx-3 mb-1"></div>
              <span className="font-bold text-gray-900 shrink-0 text-right">{listing.rooms}</span>
            </div>
          )}
          {listing.area && (
            <div className="flex items-center text-[15px]">
              <span className="font-semibold text-gray-900 shrink-0">Maydon, m²</span>
              <div className="flex-1 border-b-2 border-gray-100 mx-3 mb-1"></div>
              <span className="font-bold text-gray-900 shrink-0 text-right">{listing.area}</span>
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Joylashuv</h2>
          <button 
            onClick={handleReport}
            className="bg-red-50 text-[#ff3366] font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            Shikoyat qilish
          </button>
        </div>
        
        <div className="flex items-start text-gray-800 mb-6">
          <MapPin size={20} className="mr-2 shrink-0 mt-0.5" />
          <span className="text-[15px]">{listing.address}</span>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 w-full bg-white px-4 py-3 pb-safe-bottom flex flex-col gap-2 border-t border-gray-100 z-40">
        <button 
          onClick={handleTelegram}
          className="w-full bg-[#f2f4f7] text-gray-900 font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <TelegramIcon className="w-5 h-5 text-[#0088cc]" />
          Sotuvchiga yozing
        </button>
        <button 
          onClick={() => phone ? setPhoneModalOpen(true) : alert('Telefon raqam ko\'rsatilmagan')}
          className="w-full bg-black text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform"
        >
          Qo'ng'iroq qiling
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
              <span className="text-2xl font-bold tracking-wider text-gray-900">{phone || "Raqam ko'rsatilmagan"}</span>
            </div>

            <div className="flex gap-2">
              <a 
                href={`tel:${phone}`}
                className="flex-[2] py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all bg-[#ffde33] text-gray-900 shadow-sm"
              >
                <PhoneCall size={20} />
                Qo'ng'iroq
              </a>
              <button 
                onClick={copyPhone}
                disabled={!phone}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
