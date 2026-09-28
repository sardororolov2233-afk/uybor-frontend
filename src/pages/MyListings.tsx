import React, { useEffect, useState, useRef } from 'react';
import WebApp from '@twa-dev/sdk';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { LogOut, Edit3, Trash2, Zap, Image as ImageIcon, CheckCircle, Copy, Check } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';

// Mock user's own listings
const mockMyListings: Listing[] = [
  {
    id: 'my1',
    title: 'Chilonzorda 3 xonali kvartira',
    description: 'Ajoyib holatda, yangi ta\'mirlangan kvartira sotiladi.',
    price: 65000,
    currency: '$',
    location: 'Toshkent, Chilonzor',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
    bedrooms: 3,
    bathrooms: 1,
    userId: '1060024205',
    createdAt: new Date().toISOString()
  }
];

export const MyListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'balance'>('listings');
  
  // Balance state
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'checking' | 'success'>('idle');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
  
  const user = WebApp?.initDataUnsafe?.user;
  const firstName = user?.first_name || 'Sardorbek';
  const lastName = user?.last_name || "O'ralov";
  const fullName = `${firstName} ${lastName}`.trim();
  const photoUrl = user?.photo_url || 'https://ui-avatars.com/api/?name=' + firstName + '&background=0066b2&color=fff';

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setListings(mockMyListings);
      setLoading(false);
    }, 500);
  }, []);

  const handleCopyCard = () => {
    navigator.clipboard.writeText('9860020144204623').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadState('checking');
      // Simulate AI checking
      setTimeout(() => {
        setUploadState('success');
        setBalance(prev => prev + (parseInt(amount.replace(/\D/g, '')) || 50000));
        setTimeout(() => {
          setUploadState('idle');
          setAmount('');
        }, 3000);
      }, 2500);
    }
  };

  return (
    <div className="bg-[#f5f8ff] min-h-screen pb-[120px] pt-safe">
      
      {/* Top Header / Avatar */}
      <div className="bg-white px-4 pt-6 pb-4 rounded-b-[32px] shadow-sm mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#0066b2] p-0.5 overflow-hidden">
              <img src={photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{fullName}</h1>
              <p className="text-sm text-gray-500">{balance.toLocaleString()} so'm</p>
            </div>
          </div>
          <button className="p-2 bg-red-50 text-red-500 rounded-full active:scale-95 transition-transform">
            <LogOut size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 relative z-10">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 text-[15px] font-bold rounded-xl transition-all ${
              activeTab === 'listings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            E'lonlarim
          </button>
          <button 
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-2.5 text-[15px] font-bold rounded-xl transition-all ${
              activeTab === 'balance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Hisobim
          </button>
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'listings' ? (
          <div>
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 mb-4 shadow-sm">
              <span className="text-sm font-bold text-gray-700 ml-2">{t('profile.language')}</span>
              <LanguageSwitcher />
            </div>

            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : listings.length > 0 ? (
              <div className="flex flex-col gap-4">
                {listings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 relative">
                    <ListingCard listing={listing} />
                    
                    {/* Action Buttons for User's own listing */}
                    <div className="flex justify-between items-center mt-3 gap-2 px-1 pb-1">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                        <Edit3 size={16} />
                        Tahrirlash
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-500 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                        <Trash2 size={16} />
                        O'chirish
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#ffde33] text-gray-900 rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-sm">
                        <Zap size={16} />
                        Top
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-10 mb-4 text-[15px] font-medium bg-white p-8 rounded-3xl border border-gray-100">
                {t('profile.noProperties')}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* The Black Balance Card */}
            <div className="relative bg-[#1c1c1e] rounded-[24px] overflow-hidden p-6 mb-6 shadow-xl shadow-gray-300/50">
              {/* Background Circle */}
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#4a4733] rounded-full opacity-60"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="text-gray-300 font-medium tracking-wide text-sm">
                    {fullName.toUpperCase()}
                  </div>
                  <div className="text-[#ffde33] font-black tracking-wider text-lg">
                    UyTop
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="text-white text-4xl font-extrabold tracking-tight">
                    {balance.toLocaleString()} so'm
                  </div>
                </div>
              </div>
            </div>

            {/* Top Up Section */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 ml-1 text-lg">Hisobni to'ldirish</h3>
              
              <input 
                type="text" 
                placeholder="Summani kiriting"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 mb-4 text-[15px] font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              
              <div className="grid grid-cols-4 gap-2 mb-2">
                {['50 000', '100 000', '200 000', '500 000'].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val)}
                    className="bg-gray-50 hover:bg-gray-100 py-3 rounded-xl text-sm font-bold text-gray-800 transition-colors border border-gray-100"
                  >
                    {val.split(' ')[0]}k
                  </button>
                ))}
              </div>
            </div>

            {/* Receiver Card Info */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-yellow-400 mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
              <h4 className="text-gray-500 text-sm font-semibold mb-1">To'lov uchun karta raqami:</h4>
              <div className="flex justify-between items-center mb-1">
                <span className="text-2xl font-black text-gray-900 tracking-wider">9860 0201 4420 4623</span>
                <button 
                  onClick={handleCopyCard}
                  className="p-2 bg-gray-100 rounded-full text-gray-700 active:scale-95"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-gray-900 font-bold">O'ralov Sardorbek</p>
            </div>

            {/* Receipt Upload */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`bg-white border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                uploadState === 'success' 
                  ? 'border-green-500 bg-green-50' 
                  : uploadState === 'checking'
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              {uploadState === 'idle' && (
                <>
                  <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-3">
                    <ImageIcon size={28} />
                  </div>
                  <p className="text-gray-900 font-bold text-center">Chek yuklash uchun bosing</p>
                  <p className="text-gray-500 text-sm mt-1">To'lov qilinganligini tasdiqlash uchun</p>
                </>
              )}
              
              {uploadState === 'checking' && (
                <>
                  <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-3">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="text-blue-700 font-bold text-center">Chek AI tomonidan tekshirilmoqda...</p>
                  <p className="text-blue-500 text-sm mt-1">Iltimos, kuting</p>
                </>
              )}
              
              {uploadState === 'success' && (
                <>
                  <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle size={28} />
                  </div>
                  <p className="text-green-700 font-bold text-center">Tasdiqlandi!</p>
                  <p className="text-green-600 text-sm mt-1">Hisobingiz muvaffaqiyatli to'ldirildi</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
