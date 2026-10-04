import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Check, Star, Shield, Zap } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export const Packages: React.FC = () => {
  const { t } = useTranslation();

  const packages = [
    {
      id: 'plus',
      name: 'Rieltor Plus',
      price: '69 000',
      icon: <Star className="text-[#ffde33]" size={24} />,
      features: [
        'Oyiga 20 tagacha e\'lonlar',
        '5 ta e\'lon VIP darajasida',
        'Limitdan oshsa: e\'lon 7,000 so\'m',
        'Qo\'shimcha VIP: 15,000 so\'m'
      ]
    },
    {
      id: 'pro',
      name: 'Rieltor Pro',
      price: '129 000',
      icon: <Zap className="text-blue-500" size={24} />,
      popular: true,
      features: [
        'Oyiga 50 tagacha e\'lonlar',
        '20 ta e\'lon VIP darajasida',
        'Limitdan oshsa: e\'lon 7,000 so\'m',
        'Qo\'shimcha VIP: 15,000 so\'m'
      ]
    },
    {
      id: 'max',
      name: 'Rieltor Max',
      price: '299 000',
      icon: <Shield className="text-purple-500" size={24} />,
      features: [
        'Oyiga 300 tagacha e\'lonlar',
        '100 tagacha VIP e\'lonlar',
        'Limitdan oshsa: e\'lon 7,000 so\'m',
        'Qo\'shimcha VIP: 15,000 so\'m'
      ]
    }
  ];

  const handlePurchase = (pkgId: string) => {
    if (WebApp && WebApp.showAlert) {
      WebApp.showAlert('To\'lov tizimiga o\'tilmoqda... Tez orada qo\'shiladi!');
    } else {
      alert('To\'lov tizimiga o\'tilmoqda... Tez orada qo\'shiladi!');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white px-4 py-6 text-center border-b border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tariflar va Paketlar</h1>
        <p className="text-gray-500 text-sm">
          Sizning oylik bepul limiti (5 ta) tugadi. Ko'proq e'lon berish va VIP imkoniyatlardan foydalanish uchun o'zingizga mos paketni tanlang.
        </p>
      </div>

      <div className="px-4 space-y-4">
        {packages.map((pkg) => (
          <div 
            key={pkg.id}
            className={`bg-white rounded-2xl p-5 border-2 relative overflow-hidden ${pkg.popular ? 'border-[#ffde33] shadow-md' : 'border-gray-100 shadow-sm'}`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-[#ffde33] text-xs font-bold px-3 py-1 rounded-bl-lg">
                Eng ommabop
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-50 p-2.5 rounded-xl">
                {pkg.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                <div className="text-lg font-extrabold text-gray-900">{pkg.price} <span className="text-sm font-normal text-gray-500">so'm/oy</span></div>
              </div>
            </div>

            <ul className="space-y-2.5 mb-5">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                  <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePurchase(pkg.id)}
              className={`w-full py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${
                pkg.popular ? 'bg-[#ffde33] text-gray-900' : 'bg-gray-100 text-gray-900'
              }`}
            >
              Tanlash
            </button>
          </div>
        ))}

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mt-6">
          <h3 className="font-bold text-gray-900 mb-2">Bitta e'lonni VIP qilish</h3>
          <p className="text-sm text-gray-500 mb-4">
            Agar sizda paket bo'lmasa, har qanday bitta e'lonni VIP darajasiga ko'tarish narxi: <strong>20,000 so'm</strong>
          </p>
          <button 
            onClick={() => handlePurchase('single_vip')}
            className="w-full py-3 rounded-xl font-bold bg-blue-50 text-blue-600 active:scale-95 transition-transform"
          >
            VIP qilish (20,000 so'm)
          </button>
        </div>
      </div>
    </div>
  );
};
