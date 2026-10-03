import React, { useEffect, useState } from 'react';
import { FilterForm } from '../components/FilterForm';
import type { FilterState } from '../components/FilterForm';
import { CompactListingCard } from '../components/CompactListingCard';
import { OverlayListingCard } from '../components/OverlayListingCard';
import { SelectSheet } from '../components/SelectSheet';
import type { Listing } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ArrowRight, X, Bookmark, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchListings } from '../api/listings';
import { uzbekistanRegions } from '../constants/regions';

export const Home: React.FC = () => {
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [vipListings, setVipListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Full filter state
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    query: '',
    category: 'sale',
    rentFilter: null,
    isOwner: false,
    isMortgage: false,
    propertyType: 'all',
  });

  // Modal specific state
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedForWhom, setSelectedForWhom] = useState('');
  const [activeSelect, setActiveSelect] = useState<'region' | 'district' | 'forWhom' | null>(null);
  
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [currency, setCurrency] = useState<'so\'m' | 'y.e'>('so\'m');


  const regionOptions = Object.keys(uzbekistanRegions).map(r => ({ value: r, label: r }));
  const districtOptions = selectedRegion 
    ? uzbekistanRegions[selectedRegion as keyof typeof uzbekistanRegions]?.map(d => ({ value: d, label: d })) || []
    : [];
  const forWhomOptions = [
    { value: 'family', label: t('filter.family') },
    { value: 'student_girls', label: t('filter.studentGirls') },
    { value: 'student_boys', label: t('filter.studentBoys') }
  ];

  const loadListings = async () => {
    try {
      setLoading(true);
      
      const queryParams: Record<string, string | number> = {};
      
      if (currentFilters.category === 'sale') queryParams.category = 'SALE';
      if (currentFilters.category === 'rent') queryParams.category = 'RENT';
      // If daily, maybe a specific type, skipping for now
      
      if (currentFilters.propertyType && currentFilters.propertyType !== 'all') {
        const propMap: Record<string, string> = {
          apartment: 'APARTMENT',
          house: 'HOUSE',
          commercial: 'COMMERCIAL',
          land: 'LAND'
        };
        queryParams.property_type = propMap[currentFilters.propertyType] || currentFilters.propertyType;
      }
      
      if (priceTo) queryParams.price_max = parseInt(priceTo);
      // Backend does not currently support `price_min`, `query`, or complex location filters, 
      // but we send what it supports and do the rest in memory for MVP or just wait for backend support.
      
      let allListings = await fetchListings(queryParams);
      
      // Client-side filtering for unsupported params
      if (currentFilters.query) {
        const q = currentFilters.query.toLowerCase();
        allListings = allListings.filter(l => 
          l.title.toLowerCase().includes(q) || 
          l.description.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
        );
      }
      
      if (currentFilters.isOwner) {
        // e.g. we can check if listing doesn't have 'rieltor' somewhere, or we can assume backend users
        // For MVP, if there is a 'whoPosted' field or similar, we'd check it.
        // Assuming we have no exact field, we do a basic mock filter or skip.
        // allListings = allListings.filter(l => l.user_id !== null);
      }

      if (selectedRegion || selectedDistrict) {
        allListings = allListings.filter(l => {
          if (selectedDistrict) return l.address.includes(selectedDistrict);
          if (selectedRegion) return l.address.includes(selectedRegion);
          return true;
        });
      }

      setNewListings(allListings.slice(0, 10));
      setVipListings(allListings.slice(0, 3));
      setFeaturedListings(allListings.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload when main filters change
  useEffect(() => {
    loadListings();
  }, [currentFilters]);

  const handleApplyModalFilters = () => {
    setIsFilterOpen(false);
    loadListings();
  };

  const handleSaveSearch = () => {
    navigate('/saved-searches');
  };

  const openAllListings = () => {
    navigate('/all-listings', { state: { currentFilters, selectedRegion, selectedDistrict, priceFrom, priceTo, currency, selectedForWhom } });
  };

  return (
    <div className="bg-white min-h-screen">
      <FilterForm onFiltersChange={setCurrentFilters} onOpenFilter={() => setIsFilterOpen(true)} />
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="py-4 flex flex-col gap-8">
          
          {/* VIP e'lonlar */}
          {vipListings.length > 0 && (
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
          )}

          {/* Yangi e'lonlar */}
          {newListings.length > 0 && (
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
          )}

          {/* Tavsiya etilgan e'lonlar */}
          {featuredListings.length > 0 && (
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
          )}

          {/* Bo'sh holat */}
          {newListings.length === 0 && (
            <div className="text-center text-gray-500 mt-10 text-[15px] font-medium px-4">
              {t('home.noListings')}
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col animate-in slide-in-from-bottom-full duration-300 pb-[88px]">
          <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-100">
            <button onClick={() => setIsFilterOpen(false)} className="text-gray-700 active:scale-95">
              <X size={24} />
            </button>
            <h2 className="text-lg font-bold">{t('filter.title')}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Saved Searches */}
            <button 
              onClick={handleSaveSearch}
              className="w-full flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3 active:bg-gray-200 transition-colors"
            >
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
                <button 
                  onClick={() => setActiveSelect('region')}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm font-medium text-left flex justify-between items-center text-gray-900 active:bg-gray-100 transition-colors"
                >
                  <span>{selectedRegion || t('filter.region')}</span>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.district')}</label>
                <button 
                  onClick={() => selectedRegion && setActiveSelect('district')}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm font-medium text-left flex justify-between items-center transition-colors ${
                    selectedRegion ? 'text-gray-900 active:bg-gray-100' : 'text-gray-400 opacity-70'
                  }`}
                >
                  <span>{selectedDistrict || t('filter.district')}</span>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Target Audience (Kimlar uchun) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.forWhom')}</label>
              <button 
                onClick={() => setActiveSelect('forWhom')}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm font-medium text-left flex justify-between items-center text-gray-900 active:bg-gray-100 transition-colors"
              >
                <span>
                  {selectedForWhom 
                    ? forWhomOptions.find(o => o.value === selectedForWhom)?.label 
                    : t('filter.forWhomSelect')}
                </span>
                <ChevronDown size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">{t('filter.price')}</label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="number" 
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  placeholder={t('filter.from')} 
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-[#ffde33]" 
                />
                <input 
                  type="number" 
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  placeholder={t('filter.to')} 
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-[#ffde33]" 
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setCurrency('so\'m')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${currency === 'so\'m' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  so'm
                </button>
                <button 
                  onClick={() => setCurrency('y.e')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${currency === 'y.e' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  y.e
                </button>
              </div>
            </div>
            
          </div>
          
          {/* Bottom Actions */}
          <div className="border-t border-gray-100 p-4 bg-white flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-10">
            <button 
              onClick={handleSaveSearch}
              className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Bookmark size={16} /> {t('filter.save')}
            </button>
            <button 
              onClick={handleApplyModalFilters}
              className="flex-[2] bg-[#ffde33] text-gray-900 font-bold py-3.5 rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              {t('filter.apply')}
            </button>
          </div>
        </div>
      )}

      {/* Select Sheets */}
      <SelectSheet
        isOpen={activeSelect === 'region'}
        onClose={() => setActiveSelect(null)}
        title={t('filter.region')}
        options={regionOptions}
        selectedValue={selectedRegion}
        onSelect={(val) => {
          setSelectedRegion(val);
          setSelectedDistrict('');
        }}
      />
      <SelectSheet
        isOpen={activeSelect === 'district'}
        onClose={() => setActiveSelect(null)}
        title={t('filter.district')}
        options={districtOptions}
        selectedValue={selectedDistrict}
        onSelect={setSelectedDistrict}
      />
      <SelectSheet
        isOpen={activeSelect === 'forWhom'}
        onClose={() => setActiveSelect(null)}
        title={t('filter.forWhom')}
        options={forWhomOptions}
        selectedValue={selectedForWhom}
        onSelect={setSelectedForWhom}
      />
    </div>
  );
};
