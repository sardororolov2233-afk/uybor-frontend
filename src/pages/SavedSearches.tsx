import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { ChevronLeft, Bell, Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserPreferences } from '../api/ai';

export const SavedSearches: React.FC = () => {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserPreferences();
        setPreferences(data);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-[#f5f8ff] min-h-screen">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 active:scale-95 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Saqlangan qidiruvlar</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : preferences.length > 0 ? (
          <div className="flex flex-col gap-3">
            {preferences.map((pref, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-blue-500" />
                    <span className="font-bold text-gray-900 text-sm">
                      {pref.raw_prompt || 'Qidiruv so\'rovi'}
                    </span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-md font-bold ${pref.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {pref.is_active ? 'Faol' : 'Faol emas'}
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-3">
                  {pref.category && (
                    <div className="text-[13px] text-gray-600">
                      <span className="font-semibold mr-1">Turi:</span> {pref.category === 'SALE' ? 'Sotuv' : 'Ijara'}
                    </div>
                  )}
                  {pref.property_type && (
                    <div className="text-[13px] text-gray-600">
                      <span className="font-semibold mr-1">Uy turi:</span> {pref.property_type}
                    </div>
                  )}
                  {pref.district && (
                    <div className="flex items-center text-[13px] text-gray-600">
                      <MapPin size={12} className="mr-1" />
                      <span className="font-semibold mr-1">Hudud:</span> {pref.district}
                    </div>
                  )}
                  {(pref.min_price || pref.max_price) && (
                    <div className="text-[13px] text-gray-600">
                      <span className="font-semibold mr-1">Narx:</span> 
                      {pref.min_price ? pref.min_price : 0} dan {pref.max_price ? pref.max_price : ''} {pref.currency} gacha
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(pref.created_at).toLocaleDateString('uz-UZ')} {new Date(pref.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button className="flex items-center gap-1.5 text-[13px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                    <Bell size={14} className="fill-red-500" />
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Saqlangan qidiruvlar yo'q</h3>
            <p className="text-gray-500 text-sm max-w-[250px]">O'zingizga yoqqan mezonlarni saqlab qo'ying va xabarnoma oling</p>
            <button 
              onClick={() => navigate('/messages')}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl active:scale-95 shadow-md shadow-blue-200"
            >
              AI orqali qidirish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
