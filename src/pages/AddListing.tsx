import React, { useState, useRef } from 'react';
import { Camera, ChevronLeft, Home, Hourglass, Handshake, Map as MapIcon, ChevronRight, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from '../i18n/LanguageContext';
import { SelectSheet } from '../components/SelectSheet';
import { createListing } from '../api/listings';
import imageCompression from 'browser-image-compression';

export const AddListing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    whoPosted: 'rieltor',
    area: '',
    price: '',
    currency: 'so\'m',
    rooms: '',
    floors: '',
    country: 'O\'zbekiston',
    region: '',
    district: '',
    streetAddress: '',
    phone: '+998',
  });

  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSelect, setActiveSelect] = useState<'region' | 'district' | 'country' | null>(null);

  // Reusing region data from Home
  const uzbekistanRegions = {
    "Toshkent shahri": ["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yashnobod", "Sirg'ali", "Yakkasaroy", "Olmazor", "Uchtepa", "Shayxontohur", "Mirobod", "Bektemir", "Yangihayot"],
    "Toshkent viloyati": ["Zangiota", "Qibray", "Toshkent tumani", "Parkent", "Yangiyo'l", "Chirchiq", "Angren", "Olmaliq", "Ohangaron", "Bo'stonliq"],
    "Samarqand viloyati": ["Samarqand shahri", "Urgut", "Tayloq", "Jomboy", "Pastdarg'om", "Bulung'ur", "Kattaqo'rg'on"],
    "Farg'ona viloyati": ["Farg'ona shahri", "Marg'ilon", "Qo'qon", "Buvayda", "Oltiariq", "Qo'shtepa", "Rishton"],
    "Andijon viloyati": ["Andijon shahri", "Asaka", "Shahrixon", "Xo'jaobod", "Buloqboshi", "Baliqchi"],
    "Namangan viloyati": ["Namangan shahri", "Chust", "Kosonsoy", "Uychi", "To'raqo'rg'on", "Pop"],
    "Buxoro viloyati": ["Buxoro shahri", "G'ijduvon", "Vobkent", "Jondor", "Kogon", "Peshku", "Qorako'l"],
    "Xorazm viloyati": ["Urganch", "Xiva", "Xonqa", "Shovot", "Hazorasp", "Bog'ot"],
    "Qashqadaryo viloyati": ["Qarshi", "Shahrisabz", "Kitob", "Yakkabog'", "Qamashi", "Chiroqchi"],
    "Surxondaryo viloyati": ["Termiz", "Denov", "Boysun", "Sho'rchi", "Qumqo'rg'on", "Sherobod"],
    "Jizzax viloyati": ["Jizzax shahri", "Zomin", "Forish", "Paxtakor", "G'allaorol"],
    "Sirdaryo viloyati": ["Guliston", "Sirdaryo", "Boyovut", "Oqoltin", "Sayxunobod"],
    "Navoiy viloyati": ["Navoiy shahri", "Zarafshon", "Karmana", "Qiziltepa", "Nurota", "Xatirchi"],
    "Qoraqalpog'iston": ["Nukus", "Xo'jayli", "Beruniy", "To'rtko'l", "Amudaryo", "Chimboy", "Mo'ynoq"]
  };

  const regionOptions = Object.keys(uzbekistanRegions).map(r => ({ value: r, label: r }));
  const districtOptions = formData.region 
    ? uzbekistanRegions[formData.region as keyof typeof uzbekistanRegions]?.map(d => ({ value: d, label: d })) || []
    : [];
  const countryOptions = [{ value: "O'zbekiston", label: "O'zbekiston" }, { value: "Qozog'iston", label: "Qozog'iston" }, { value: "Tojikiston", label: "Tojikiston" }];
  
  const handleGoalSelect = (selectedGoal: string) => {
    setGoal(selectedGoal);
    setStep(2);
  };

  const handlePropertyTypeSelect = (selectedType: string) => {
    setPropertyType(selectedType);
    setStep(3);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 5 - images.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);
      
      const compressedFiles = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            const options = {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1280,
              useWebWorker: false,
            };
            const compressedBlob = await imageCompression(file, options);
            return new File([compressedBlob], file.name, { type: compressedBlob.type });
          } catch (error) {
            console.error('Error compressing image:', error);
            return file;
          }
        })
      );
      
      setImages(prev => [...prev, ...compressedFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMapClick = () => {
    alert("Xaritadan tanlash funksiyasi tez orada qo'shiladi!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const category = ['sell', 'buy', 'rent_out', 'daily_rent'].includes(goal) ? 'SALE' : 'RENT';
      const propTypeMap: Record<string, string> = {
        apartment: 'APARTMENT',
        house: 'HOUSE',
        commercial: 'COMMERCIAL',
        land: 'LAND',
      };

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('currency', formData.currency === "so'm" ? 'UZS' : 'USD');
      formDataToSend.append('category', category);
      formDataToSend.append('property_type', propTypeMap[propertyType] || 'APARTMENT');
      formDataToSend.append('rooms', String(parseInt(formData.rooms) || 1));
      if (formData.area) formDataToSend.append('area', formData.area);
      formDataToSend.append('address', [formData.country, formData.region, formData.district, formData.streetAddress].filter(Boolean).join(', '));
      
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await createListing(formDataToSend);

      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert(t('add.success'));
      } else {
        alert(t('add.success'));
      }
      navigate('/my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert(t('add.error'));
      } else {
        alert(t('add.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center">
      <button 
        onClick={() => {
          if (step > 1) setStep(step - 1);
          else navigate(-1);
        }} 
        className="flex items-center gap-1 text-gray-900 font-semibold active:scale-95 transition-transform"
      >
        <ChevronLeft size={20} />
        {t('add.back')}
      </button>
    </div>
  );

  if (step === 1) {
    return (
      <div className="bg-white min-h-screen">
        {renderHeader()}
        <div className="p-4 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('add.title')}</h1>
          
          <div>
            <h2 className="text-[15px] font-bold text-gray-400 mb-3 uppercase tracking-wide">{t('add.seller')}</h2>
            <div className="space-y-1">
              <button onClick={() => handleGoalSelect('daily_rent')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
                <Home size={22} className="text-gray-800" />
                <span className="font-semibold text-gray-900">{t('add.dailyRent')}</span>
              </button>
              <button onClick={() => handleGoalSelect('rent_out')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
                <Hourglass size={22} className="text-gray-800" />
                <span className="font-semibold text-gray-900">{t('add.rentOut')}</span>
              </button>
              <button onClick={() => handleGoalSelect('sell')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
                <Handshake size={22} className="text-gray-800" />
                <span className="font-semibold text-gray-900">{t('add.sell')}</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-[15px] font-bold text-gray-400 mb-3 uppercase tracking-wide">{t('add.buyer')}</h2>
            <div className="space-y-1">
              <button onClick={() => handleGoalSelect('rent_in')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
                <Hourglass size={22} className="text-gray-800" />
                <span className="font-semibold text-gray-900">{t('add.rentIn')}</span>
              </button>
              <button onClick={() => handleGoalSelect('buy')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
                <Handshake size={22} className="text-gray-800" />
                <span className="font-semibold text-gray-900">{t('add.buy')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-white min-h-screen">
        {renderHeader()}
        <div className="p-4 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('add.title')}</h1>
          
          <div className="space-y-1">
            <button onClick={() => handlePropertyTypeSelect('apartment')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
              <Home size={22} className="text-gray-800" />
              <span className="font-semibold text-gray-900">{t('filter.propApartment')}</span>
            </button>
            <button onClick={() => handlePropertyTypeSelect('house')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
              <Home size={22} className="text-gray-800" />
              <span className="font-semibold text-gray-900">{t('filter.propHouse')}</span>
            </button>
            <button onClick={() => handlePropertyTypeSelect('commercial')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
              <Home size={22} className="text-gray-800" />
              <span className="font-semibold text-gray-900">{t('filter.propCommercial')}</span>
            </button>
            <button onClick={() => handlePropertyTypeSelect('land')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
              <MapIcon size={22} className="text-gray-800" />
              <span className="font-semibold text-gray-900">{t('filter.propLand')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3
  return (
    <div className="bg-white min-h-screen pb-32">
      {renderHeader()}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        
        {/* Photos */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-gray-900">{t('add.photos')}</h3>
            <span className="text-gray-400 text-sm">{images.length}/5</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-3">{t('add.photoHintMax')}</p>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.length < 5 && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-[100px] h-[100px] bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-900 active:bg-gray-100 transition-colors"
              >
                <Camera size={28} />
              </button>
            )}
            
            {images.map((file, idx) => (
              <div key={idx} className="shrink-0 w-[100px] h-[100px] relative rounded-2xl border border-gray-200 overflow-hidden">
                <img src={URL.createObjectURL(file)} alt="Uploaded" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 backdrop-blur-sm shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        {/* Title */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.titleLabel')}</h3>
          <input 
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text" 
            placeholder={t('add.titlePlaceholder')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.descLabel')}</h3>
          <textarea 
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            maxLength={1000}
            placeholder={t('add.descPlaceholder')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none resize-none font-medium"
          />
          <div className="text-right text-gray-400 text-xs mt-1">{formData.description.length}/1000</div>
        </div>

        {/* Who Posted */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.whoPosted')}</h3>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, whoPosted: 'rieltor' })}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-colors ${formData.whoPosted === 'rieltor' ? 'bg-[#ffde33] text-gray-900' : 'bg-gray-50 text-gray-400'}`}
            >
              {t('add.realtor')}
            </button>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, whoPosted: 'egasi' })}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-colors ${formData.whoPosted === 'egasi' ? 'bg-[#ffde33] text-gray-900' : 'bg-gray-50 text-gray-400'}`}
            >
              {t('add.owner')}
            </button>
          </div>
        </div>

        {/* Area */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.area')}</h3>
          <input 
            required
            name="area"
            value={formData.area}
            onChange={handleChange}
            type="number" 
            placeholder={t('add.areaPlaceholder')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        {/* Price */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.priceLabel')}</h3>
          <div className="flex gap-2">
            <input 
              required
              name="price"
              value={formData.price}
              onChange={handleChange}
              type="number" 
              placeholder={t('add.pricePlaceholder')}
              className="flex-[2] p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none font-medium"
            />
            <div className="flex bg-gray-50 rounded-xl p-1 flex-1">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, currency: 'so\'m' })}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.currency === 'so\'m' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-400'}`}
              >
                so'm
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, currency: 'y.e' })}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.currency === 'y.e' ? 'bg-[#ffde33] text-gray-900 shadow-sm' : 'text-gray-400'}`}
              >
                y.e
              </button>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.rooms')}</h3>
          <input 
            required
            name="rooms"
            value={formData.rooms}
            onChange={handleChange}
            type="number" 
            placeholder={t('add.roomsPlaceholder')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        {/* Floors */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.floors')}</h3>
          <input 
            required
            name="floors"
            value={formData.floors}
            onChange={handleChange}
            type="number" 
            placeholder={t('add.floorsPlaceholder')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        {/* Country */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.country')}</h3>
          <button 
            type="button"
            onClick={() => setActiveSelect('country')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl flex justify-between items-center active:bg-gray-100 transition-colors"
          >
            <span className="font-bold text-gray-900">{formData.country}</span>
            <ChevronDown size={20} className="text-gray-900" />
          </button>
        </div>

        {/* Region */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.region')}</h3>
          <button 
            type="button"
            onClick={() => setActiveSelect('region')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl flex justify-between items-center active:bg-gray-100 transition-colors"
          >
            <span className={formData.region ? "font-bold text-gray-900" : "font-semibold text-gray-400"}>
              {formData.region || t('add.region')}
            </span>
            <ChevronDown size={20} className="text-gray-400" />
          </button>
        </div>

        {/* District */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.district')}</h3>
          <button 
            type="button"
            onClick={() => formData.region && setActiveSelect('district')}
            className={`w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl flex justify-between items-center transition-colors ${formData.region ? 'active:bg-gray-100' : 'opacity-70'}`}
          >
            <span className={formData.district ? "font-bold text-gray-900" : "font-semibold text-gray-400"}>
              {formData.district || t('add.district')}
            </span>
            <ChevronDown size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Street Address */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.streetAddress')}</h3>
          <input 
            required
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleChange}
            type="text" 
            placeholder={t('add.streetAddressPlaceholder')}
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        {/* Phone */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.phone')}</h3>
          <input 
            required
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel" 
            className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl focus:border-gray-200 focus:bg-white transition-all outline-none font-bold text-gray-900"
          />
        </div>

        {/* Location */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{t('add.map')}</h3>
          <button 
            type="button"
            onClick={handleMapClick}
            className="w-full bg-gray-50 rounded-2xl p-4 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">{t('add.addMap')}</span>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
            <ul className="text-[13px] text-gray-400 font-medium space-y-1 list-disc pl-4">
              <li>{t('add.mapHint1')}</li>
              <li>{t('add.mapHint2')}</li>
            </ul>
          </button>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-black text-white rounded-[20px] font-bold text-lg active:scale-[0.98] transition-transform mt-6 disabled:opacity-70"
        >
          {isSubmitting ? 'Yuklanmoqda...' : t('add.ready')}
        </button>
      </form>

      <SelectSheet
        isOpen={activeSelect === 'country'}
        onClose={() => setActiveSelect(null)}
        title={t('add.country')}
        options={countryOptions}
        selectedValue={formData.country}
        onSelect={(val) => {
          setFormData({ ...formData, country: val });
        }}
      />
      <SelectSheet
        isOpen={activeSelect === 'region'}
        onClose={() => setActiveSelect(null)}
        title={t('add.region')}
        options={regionOptions}
        selectedValue={formData.region}
        onSelect={(val) => {
          setFormData({ ...formData, region: val, district: '' });
        }}
      />
      <SelectSheet
        isOpen={activeSelect === 'district'}
        onClose={() => setActiveSelect(null)}
        title={t('add.district')}
        options={districtOptions}
        selectedValue={formData.district}
        onSelect={(val) => setFormData({ ...formData, district: val })}
      />
    </div>
  );
};
