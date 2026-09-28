import React, { useState } from 'react';
import { Search, SlidersHorizontal, Building2, User, Home as HomeIcon } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface FilterFormProps {
  onSearch: (query: string) => void;
  onOpenFilter: () => void;
}

export const FilterForm: React.FC<FilterFormProps> = ({ onSearch, onOpenFilter }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'sale' | 'rent' | 'daily'>('sale');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          onClick={() => setActiveTab('sale')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'sale' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {t('filter.sale')}
        </button>
        <button 
          onClick={() => setActiveTab('rent')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'rent' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {t('filter.rent')}
        </button>
        <button 
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'daily' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {t('filter.daily')}
        </button>
      </div>

      {/* Horizontal Chips */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
        <button className="flex items-center gap-1.5 whitespace-nowrap bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
          <Building2 size={14} />
          {t('filter.type')}
          <span className="ml-1 text-[10px]">▼</span>
        </button>
        <button className="flex items-center gap-1.5 whitespace-nowrap bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
          <User size={14} />
          {t('filter.owner')}
        </button>
        <button className="flex items-center gap-1.5 whitespace-nowrap bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
          <HomeIcon size={14} />
          {t('filter.mortgage')}
        </button>
      </div>
    </div>
  );
};
