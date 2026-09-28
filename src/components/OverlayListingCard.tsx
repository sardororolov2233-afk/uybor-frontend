import React from 'react';
import { Link } from 'react-router-dom';
import type { Listing } from '../types';

interface OverlayListingCardProps {
  listing: Listing;
  badge?: string; // 'VIP' or 'TOP'
}

export const OverlayListingCard: React.FC<OverlayListingCardProps> = ({ listing, badge }) => {
  return (
    <Link to={`/listing/${listing.id}`} className="block shrink-0 w-[180px] sm:w-[220px]">
      <div className="relative rounded-[20px] overflow-hidden shadow-sm aspect-[4/5] flex flex-col active:scale-95 transition-transform bg-gray-200">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full pl-1 pr-2 py-1">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-white">
              <img src={`https://ui-avatars.com/api/?name=${listing.userId}&background=random&color=fff`} className="w-full h-full object-cover" alt="user" />
            </div>
            <span className="text-[10px] text-white font-medium truncate max-w-[60px]">Sotuvchi</span>
          </div>

          {badge && (
            <div className="bg-[#ffde33] text-gray-900 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase flex items-center gap-1 shadow-sm">
              <span className="text-[10px]">👑</span> {badge}
            </div>
          )}
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="font-extrabold text-lg leading-tight mb-1">
            {listing.price.toLocaleString()} y.e
          </div>
          <div className="text-[11px] font-medium opacity-90 line-clamp-2">
            {listing.title} • {listing.bedrooms}-kom | {listing.location}
          </div>
        </div>
      </div>
    </Link>
  );
};
