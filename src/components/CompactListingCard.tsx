import React from 'react';
import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { MapPin } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface CompactListingCardProps {
  listing: Listing;
}

export const CompactListingCard: React.FC<CompactListingCardProps> = ({ listing }) => {
  const { t } = useTranslation();
  return (
    <Link to={`/listing/${listing.id}`} className="block shrink-0 w-[160px] sm:w-[200px]">
      <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col active:scale-95 transition-transform">
        <div className="aspect-[4/3] w-full bg-gray-200 relative">
          {listing.images && listing.images.length > 0 ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              {t('card.noImage')}
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg font-bold text-white text-xs">
            {listing.price.toLocaleString()} {listing.currency || 'y.e'}
          </div>
        </div>
        
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2 text-gray-900">{listing.title}</h3>
          
          <div className="flex items-center text-gray-500 text-xs mt-auto pt-1">
            <MapPin size={12} className="mr-1 shrink-0 text-gray-400" />
            <span className="truncate">{listing.address}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
