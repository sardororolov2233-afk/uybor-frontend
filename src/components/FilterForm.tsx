import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Building2, User, Home as HomeIcon } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { SelectSheet } from './SelectSheet';

export interface FilterState {
  query: string;
  category: 'sale' | 'rent' | 'daily';
  rentFilter: string | null;
  isOwner: boolean;
  isMortgage: boolean;
  propertyType: string;
}

interface FilterFormProps {
  onFiltersChange: (filters: FilterState) => void;
  onOpenFilter: () => void;
}

export const FilterForm: React.FC<FilterFormProps> = ({ onFiltersChange, onOpenFilter }) => {
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    category: 'rent',
    rentFilter: null,
    isOwner: false,
    isMortgage: false,
    propertyType: 'all',
  });

  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);
  const { t } = useTranslation();

  const propertyTypes = [
    { value: 'all', label: t('filter.propAll') || 'Barcha turlar' },
    { value: 'apartment', label: t('filter.propApartment') || 'Kvartira' },
    { value: 'house', label: t('filter.propHouse') || 'Hovli/dacha' },
    { value: 'commercial', label: t('filter.propCommercial') || 'Tijorat binolari' },
    { value: 'land', label: t('filter.propLand') || 'Yer' }
  ];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleRentFilter = (val: string) => {
    updateFilter('rentFilter', filters.rentFilter === val ? null : val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange(filters);
  };

  return (
    <div className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 shadow-sm flex flex-col gap-3">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border-transparent rounded-xl text-sm placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-0 transition-colors"
            placeholder={t('search.placeholder')}
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
          />
        </div>
        <button 
          type="button"
          onClick={onOpenFilter}
          className="p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <SlidersHorizontal size={20} />
        </button>
      </form>

      {/* Main Filter Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button 
          onClick={() => updateFilter('category', 'rent')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${filters.category === 'rent' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {t('filter.rent')}
        </button>
        <button 
          onClick={() => updateFilter('category', 'sale')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${filters.category === 'sale' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {t('filter.sale')}
        </button>
        <button 
          onClick={() => updateFilter('category', 'daily')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${filters.category === 'daily' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {t('filter.daily')}
        </button>
      </div>

      {/* Horizontal Chips */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
        {filters.category === 'rent' ? (
          <>
            <button 
              onClick={() => toggleRentFilter('family')}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.rentFilter === 'family' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-700 active:bg-gray-200'}`}
            >
              {t('filter.family')}
            </button>
            <button 
              onClick={() => toggleRentFilter('girls')}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.rentFilter === 'girls' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-700 active:bg-gray-200'}`}
            >
              {t('filter.studentGirls')}
            </button>
            <button 
              onClick={() => toggleRentFilter('boys')}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.rentFilter === 'boys' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-700 active:bg-gray-200'}`}
            >
              {t('filter.studentBoys')}
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsTypeSheetOpen(true)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.propertyType !== 'all' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-700 active:bg-gray-200'}`}
            >
              <Building2 size={14} />
              {filters.propertyType !== 'all' ? propertyTypes.find(p => p.value === filters.propertyType)?.label : t('filter.type')}
              <span className="ml-1 text-[10px]">▼</span>
            </button>
            <button 
              onClick={() => updateFilter('isOwner', !filters.isOwner)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.isOwner ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-700 active:bg-gray-200'}`}
            >
              <User size={14} />
              {t('filter.owner')}
            </button>
            <button 
              onClick={() => updateFilter('isMortgage', !filters.isMortgage)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.isMortgage ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-700 active:bg-gray-200'}`}
            >
              <HomeIcon size={14} />
              {t('filter.mortgage')}
            </button>
          </>
        )}
      </div>

      <SelectSheet
        isOpen={isTypeSheetOpen}
        onClose={() => setIsTypeSheetOpen(false)}
        title={t('filter.type')}
        options={propertyTypes}
        selectedValue={filters.propertyType}
        onSelect={(val) => updateFilter('propertyType', val)}
      />
    </div>
  );
};
