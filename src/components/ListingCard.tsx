import React from 'react';
import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { MapPin, BedDouble } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { t } = useTranslation();
  return (
    <Link to={`/listing/${listing.id}`} className="block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 transition-transform active:scale-[0.98]">
        <div className="aspect-[4/3] w-full bg-gray-200 relative">
          {listing.images && listing.images.length > 0 ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {t('card.noImage')}
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg font-semibold text-primary">
            {listing.price.toLocaleString()} {listing.currency || 'y.e'}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-1">{listing.title}</h3>
          
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin size={14} className="mr-1 shrink-0" />
            <span className="truncate">{listing.address}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-50 pt-3">
            <div className="flex items-center">
              <BedDouble size={16} className="mr-1.5 text-gray-400" />
              <span>{listing.rooms} {t('card.beds')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
