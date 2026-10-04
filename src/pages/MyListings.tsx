import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { LogOut, Edit3, Trash2, Zap, Image as ImageIcon, CheckCircle, Copy, Check, X, Hourglass } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { fetchMyListings, deleteListingDirect } from '../api/listings';
import { supabase } from '../api/supabase';
import { getUser, logout } from '../api/auth';
import { verifyReceiptPayment } from '../api/ai';

export const MyListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'balance'>('listings');
  
  // Balance state
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'checking' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { t } = useTranslation();
  
  const tgUser = WebApp?.initDataUnsafe?.user;
  const storedUser = getUser();
  const firstName = storedUser?.first_name || tgUser?.first_name || 'Foydalanuvchi';
  const lastName = storedUser?.last_name || tgUser?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const photoUrl = tgUser?.photo_url || 'https://ui-avatars.com/api/?name=' + firstName + '&background=0066b2&color=fff';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyListings();
        setListings(data);
      } catch (error) {
        console.error('Error loading my listings:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (listingId: string) => {
    if (window.confirm("Rostdan ham bu e'lonni o'chirmoqchimisiz?")) {
      try {
        await deleteListingDirect(listingId);
        setListings(prev => prev.filter(l => l.id !== listingId));
      } catch (error) {
        console.error('Error deleting listing:', error);
      }
    }
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText('9860020144204623').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateOrder = () => {
    if (amount && parseInt(amount.replace(/\D/g, '')) >= 1000) {
      setTimeLeft(15 * 60); // 15 daqiqa
    }
  };

  const cancelOrder = () => {
    setTimeLeft(null);
    setUploadState('idle');
  };

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      cancelOrder();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handlePromoteTop = async (id: string) => {
    if (balance < 20000) {
      alert("Hisobingizda yetarli mablag' yo'q. Iltimos hisobingizni to'ldiring.");
      setActiveTab('balance');
      return;
    }
    
    if (window.confirm("E'lonni TOP qilish narxi 20,000 so'm. Hisobingizdan yechiladi. Tasdiqlaysizmi?")) {
      try {
        await supabase.from('listings').update({ status: 'PROMOTED' }).eq('id', id);
        setBalance(prev => prev - 20000);
        alert("E'loningiz TOP ga chiqarildi!");
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'PROMOTED' } : l));
      } catch (err) {
        console.error(err);
        alert("Xatolik yuz berdi");
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadState('checking');
      setUploadError('');
      try {
        const file = e.target.files[0];
        const base64Image = await fileToBase64(file);
        const expected = parseInt(amount.replace(/\D/g, '')) || undefined;
        
        const res = await verifyReceiptPayment(base64Image, undefined, expected);
        
        if (res.analysis?.status === 'APPROVED') {
          setUploadState('success');
          setBalance(prev => prev + (res.analysis.amount || expected || 0));
          setTimeout(() => {
            setUploadState('idle');
            setAmount('');
            setTimeLeft(null);
          }, 3000);
        } else {
          setUploadState('error');
          setUploadError(res.analysis?.reason || 'To\'lov tasdiqlanmadi');
        }
      } catch (err) {
        console.error(err);
        setUploadState('error');
        setUploadError('Tizim xatosi. Qayta urinib ko\'ring.');
      }
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
          <button 
            onClick={() => { logout(); window.location.reload(); }}
            className="p-2 bg-red-50 text-red-500 rounded-full active:scale-95 transition-transform"
          >
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

            <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">Mening e'lonlarim</h3>

            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : listings.length > 0 ? (
              <div className="flex flex-col gap-4 mb-6">
                {listings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 relative">
                    <ListingCard listing={listing} />
                    
                    {/* Action Buttons for User's own listing */}
                    <div className="flex justify-between items-center mt-3 gap-2 px-1 pb-1">
                      <button 
                        onClick={() => handleEdit(listing.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                      >
                        <Edit3 size={16} />
                        Tahrirlash
                      </button>
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-500 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                      >
                        <Trash2 size={16} />
                        O'chirish
                      </button>
                      <button 
                        onClick={() => handlePromoteTop(listing.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#ffde33] text-gray-900 rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-sm"
                      >
                        <Zap size={16} />
                        Top
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-2 mb-6 text-[15px] font-medium bg-white p-8 rounded-3xl border border-gray-100">
                {t('profile.noProperties')}
              </div>
            )}

            {/* VIP Boost Explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-5 mb-4 shadow-sm border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="bg-[#ffde33] p-2 rounded-xl text-gray-900 shadow-sm">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">E'lonni VIP (Top) qilish</h3>
                  <p className="text-sm text-gray-700 font-medium">Bitta e'lonni VIP qilish narxi: <strong>20,000 so'm</strong>.</p>
                  <p className="text-xs text-gray-600 mt-1">VIP e'lonlar qidiruv natijalarida va bosh sahifada eng yuqorida (qizil "VIP" belgisi bilan) chiqadi. Bu sizga tezkor mijoz topishga yordam beradi.</p>
                </div>
              </div>
            </div>

            {/* Realtor Packages */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">Rieltorlik tariflari</h3>
              <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 snap-x">
                {/* Rieltor Plus */}
                <div className="min-w-[260px] snap-start bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-black text-gray-900 mb-1">Plus</h4>
                    <div className="text-lg font-bold text-blue-600 mb-3">69,000 <span className="text-xs text-gray-500 font-normal">so'm/oy</span></div>
                    <ul className="space-y-1.5 mb-4">
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-green-500"/> Oyiga 20 ta e'lon</li>
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-green-500"/> 5 ta e'lon VIP</li>
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-gray-400"/> Limitdan so'ng: 7,000 so'm/e'lon</li>
                    </ul>
                  </div>
                  <button onClick={() => alert("To'lov tizimi tez orada ishga tushadi")} className="w-full py-2 bg-gray-100 text-gray-800 font-bold text-sm rounded-xl active:scale-95 transition-transform">Xarid qilish</button>
                </div>
                {/* Rieltor Pro */}
                <div className="min-w-[260px] snap-start bg-white rounded-2xl p-4 border-2 border-[#ffde33] shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#ffde33] text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Tavsiya</div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 mb-1">Pro</h4>
                    <div className="text-lg font-bold text-blue-600 mb-3">129,000 <span className="text-xs text-gray-500 font-normal">so'm/oy</span></div>
                    <ul className="space-y-1.5 mb-4">
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-green-500"/> Oyiga 50 ta e'lon</li>
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-green-500"/> 20 ta e'lon VIP</li>
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-gray-400"/> Limitdan so'ng: 7,000 so'm/e'lon</li>
                    </ul>
                  </div>
                  <button onClick={() => alert("To'lov tizimi tez orada ishga tushadi")} className="w-full py-2 bg-[#ffde33] text-gray-900 font-bold text-sm rounded-xl active:scale-95 transition-transform shadow-sm">Xarid qilish</button>
                </div>
                {/* Rieltor Max */}
                <div className="min-w-[260px] snap-start bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-black text-gray-900 mb-1">Max</h4>
                    <div className="text-lg font-bold text-blue-600 mb-3">299,000 <span className="text-xs text-gray-500 font-normal">so'm/oy</span></div>
                    <ul className="space-y-1.5 mb-4">
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-green-500"/> Oyiga 300 ta e'lon</li>
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-green-500"/> 100 ta e'lon VIP</li>
                      <li className="flex items-center gap-1.5 text-xs font-medium text-gray-700"><CheckCircle size={14} className="text-gray-400"/> Limitdan so'ng: 7,000 so'm/e'lon</li>
                    </ul>
                  </div>
                  <button onClick={() => alert("To'lov tizimi tez orada ishga tushadi")} className="w-full py-2 bg-gray-100 text-gray-800 font-bold text-sm rounded-xl active:scale-95 transition-transform">Xarid qilish</button>
                </div>
              </div>
            </div>
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

            {timeLeft === null ? (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-gray-900 mb-3 ml-1 text-lg">Hisobni to'ldirish</h3>
                
                <input 
                  type="text" 
                  placeholder="Summani kiriting"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 mb-4 text-[15px] font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                
                <div className="grid grid-cols-4 gap-2 mb-4">
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

                <button 
                  onClick={handleCreateOrder}
                  disabled={!amount || parseInt(amount.replace(/\D/g, '')) < 1000}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    !amount || parseInt(amount.replace(/\D/g, '')) < 1000 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-blue-600 text-white shadow-md active:scale-95'
                  }`}
                >
                  To'lov qilish
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                    <h3 className="font-bold text-gray-900 text-lg">To'lov jarayoni</h3>
                    <div className="bg-red-50 text-red-600 font-mono font-bold px-3 py-1.5 rounded-lg text-lg flex items-center gap-1.5">
                      <Hourglass size={18} className="animate-pulse" />
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-gray-500 text-sm">To'lanadigan summa</p>
                    <p className="text-2xl font-black text-gray-900">{parseInt(amount.replace(/\D/g, '')).toLocaleString()} so'm</p>
                  </div>

                  {/* Receiver Card Info */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-yellow-400 mb-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                    <h4 className="text-gray-500 text-sm font-semibold mb-1">Ushbu karta raqamiga o'tkazing:</h4>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-wider">9860 0201 4420 4623</span>
                      <button 
                        onClick={handleCopyCard}
                        className="p-2 bg-white rounded-full text-gray-700 shadow-sm active:scale-95"
                      >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                    <p className="text-gray-900 font-bold">O'ralov Sardorbek</p>
                  </div>

                  {/* Receipt Upload */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`bg-white border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      uploadState === 'success' 
                        ? 'border-green-500 bg-green-50' 
                        : uploadState === 'checking'
                        ? 'border-blue-400 bg-blue-50'
                        : uploadState === 'error'
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
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
                        <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                          <ImageIcon size={28} />
                        </div>
                        <p className="text-gray-900 font-bold text-center">Chek yuklash uchun bosing</p>
                        <p className="text-gray-500 text-sm mt-1">Yoki rasmni shu yerga tashlang</p>
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

                    {uploadState === 'error' && (
                      <>
                        <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
                          <X size={28} />
                        </div>
                        <p className="text-red-700 font-bold text-center">Xatolik yuz berdi</p>
                        <p className="text-red-600 text-sm mt-1 text-center">{uploadError}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setUploadState('idle'); }} 
                          className="mt-3 px-4 py-1.5 bg-white rounded-lg shadow-sm text-sm font-semibold border border-red-100 text-red-600"
                        >
                          Qayta yuklash
                        </button>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={cancelOrder}
                    className="w-full mt-4 py-3 text-red-500 font-semibold bg-red-50 rounded-xl active:scale-95"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {/* Tushuntirish qismi */}
            <div className="px-2">
              <h4 className="font-bold text-gray-800 mb-4 ml-1">To'lov qanday ishlaydi?</h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <p className="text-sm text-gray-600 leading-snug"><strong className="text-gray-900">Summani kiriting:</strong> Qancha miqdorda pul kiritmoqchi bo'lsangiz yozing va "To'lov qilish" ni bosing.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <p className="text-sm text-gray-600 leading-snug"><strong className="text-gray-900">Pul o'tkazing:</strong> Berilgan 15 daqiqa ichida karta raqamiga (Payme/Click orqali) pul o'tkazing.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <p className="text-sm text-gray-600 leading-snug"><strong className="text-gray-900">Chekni yuklang:</strong> Muvaffaqiyatli to'lov chekini skrinshot qilib, ilovaga yuklang.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                  <p className="text-sm text-gray-600 leading-snug"><strong className="text-gray-900">Avtomatik tasdiqlash:</strong> Sun'iy intellekt (AI) chekni tekshiradi va balansingiz darhol to'ldiriladi!</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
