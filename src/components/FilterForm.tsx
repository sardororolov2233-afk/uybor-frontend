import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface FilterFormProps {
  onSearch: (query: string) => void;
}

export const FilterForm: React.FC<FilterFormProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 shadow-sm">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border-transparent rounded-xl text-sm placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-0 transition-colors"
            placeholder="Search by location or title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button 
          type="button"
          className="p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <SlidersHorizontal size={20} />
        </button>
      </form>
    </div>
  );
};
