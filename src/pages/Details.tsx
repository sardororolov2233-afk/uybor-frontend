import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, BedDouble, Bath, Phone, Heart } from 'lucide-react';
import type { Listing } from '../types';
import WebApp from '@twa-dev/sdk';

export const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    try {
      if (WebApp && WebApp.BackButton) {
        WebApp.BackButton.show();
        const handleBack = () => navigate(-1);
        WebApp.BackButton.onClick(handleBack);
        
        return () => {
          WebApp.BackButton.hide();
          WebApp.BackButton.offClick(handleBack);
        };
      }
    } catch (e) {
      console.error("BackButton error:", e);
    }
  }, [navigate]);

  useEffect(() => {
    // Mock fetch
    const fetchListing = async () => {
      // const res = await api.get(`/listings/${id}`);
      // setListing(res.data);
      setListing({
        id: id || '1',
        title: 'Modern Apartment in City Center',
        description: 'A beautiful and spacious apartment located in the heart of the city. Perfect for young professionals or couples. The apartment features a modern kitchen, large windows, and a balcony with a great view. Close to public transport, shopping malls, and restaurants.',
        price: 1200,
        location: 'Tashkent, Yunusabad',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        bedrooms: 2,
        bathrooms: 1,
        userId: 'user123',
        createdAt: new Date().toISOString()
      });
    };
    fetchListing();
  }, [id]);

  if (!listing) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="relative h-72 bg-gray-200">
        {listing.images && listing.images.length > 0 && (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        )}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-800"
        >
          <Heart size={20} />
        </button>
      </div>

      <div className="p-5 pb-24">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
        </div>
        
        <p className="text-2xl font-bold text-blue-600 mb-4">
          ${listing.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ month</span>
        </p>

        <div className="flex items-center text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl">
          <MapPin size={18} className="mr-2 text-blue-500" />
          <span>{listing.location}</span>
        </div>

        <div className="flex justify-around items-center border-y border-gray-100 py-4 mb-6">
          <div className="flex flex-col items-center">
            <BedDouble size={24} className="text-gray-400 mb-1" />
            <span className="font-semibold">{listing.bedrooms}</span>
            <span className="text-xs text-gray-500">Bedrooms</span>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="flex flex-col items-center">
            <Bath size={24} className="text-gray-400 mb-1" />
            <span className="font-semibold">{listing.bathrooms}</span>
            <span className="text-xs text-gray-500">Bathrooms</span>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-2">Description</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          {listing.description}
        </p>
      </div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-safe-bottom flex gap-3">
        <button className="flex-1 bg-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-sm shadow-blue-200 active:scale-[0.98] transition-transform">
          Contact Host
        </button>
        <button className="p-3.5 bg-green-100 text-green-600 rounded-xl active:scale-[0.98] transition-transform">
          <Phone size={24} />
        </button>
      </div>
    </div>
  );
};
