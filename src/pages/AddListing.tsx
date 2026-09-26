import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

export const AddListing: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    bedrooms: '1',
    bathrooms: '1',
  });
  
  const user = WebApp.initDataUnsafe.user;
  console.log('Current user:', user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await api.post('/listings', formData);
      WebApp.showAlert('Listing added successfully!');
      navigate('/my-listings');
    } catch (error) {
      WebApp.showAlert('Error adding listing');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center">
        <h1 className="text-xl font-bold mx-auto">Add New Listing</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        
        {/* Photo Upload Mock */}
        <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 active:bg-gray-100 transition-colors">
          <Camera size={32} className="mb-2 text-gray-300" />
          <span className="font-medium text-sm">Tap to add photos</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              type="text" 
              placeholder="e.g. Modern Apartment in Center"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price ($)</label>
              <input 
                required
                name="price"
                value={formData.price}
                onChange={handleChange}
                type="number" 
                placeholder="0"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
              <input 
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                type="text" 
                placeholder="City, District"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bedrooms</label>
              <select 
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bathrooms</label>
              <select 
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
              >
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea 
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your property..."
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-sm shadow-blue-200 active:scale-[0.98] transition-transform mt-4"
        >
          Publish Listing
        </button>
      </form>
    </div>
  );
};
