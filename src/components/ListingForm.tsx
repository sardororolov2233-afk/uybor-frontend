import React, { useState, useRef, useEffect } from 'react';
import { Camera, ChevronLeft, Home, Hourglass, Handshake, Map as MapIcon, ChevronRight, ChevronDown, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { SelectSheet } from './SelectSheet';
import { uploadImages } from '../api/listings';
import { getUser } from '../api/auth';
import { uzbekistanRegions } from '../constants/regions';

export interface ListingFormData {
  title: string;
  description: string;
  whoPosted: string;
  rentTarget?: string;
  area: string;
  price: string;
  currency: string;
  rooms: string;
  floors: string;
  country: string;
  region: string;
  district: string;
  streetAddress: string;
  phone: string;
}

export interface ListingSubmitData {
  goal: string;
  propertyType: string;
  formData: ListingFormData;
  imageUrls: string[];
}

// Keep old interface for backward compat with EditListing initial data
export interface ListingData {
  goal: string;
  propertyType: string;
  formData: ListingFormData;
  images: (File | string)[];
}

export interface ListingFormProps {
  initialData?: ListingData;
  onSubmit: (data: ListingSubmitData) => Promise<void>;
  isLoading?: boolean;
}

interface ImageItem {
  id: string;
  file?: File;
  url?: string;      // already uploaded URL (for editing)
  status: 'pending' | 'uploading' | 'done' | 'error';
  previewUrl: string; // local preview
}

export const ListingForm: React.FC<ListingFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(initialData ? 3 : 1);
  const [goal, setGoal] = useState(initialData?.goal || '');
  const [propertyType, setPropertyType] = useState(initialData?.propertyType || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState<ListingFormData>(initialData?.formData || {
    title: '',
    description: '',
    whoPosted: 'rieltor',
    rentTarget: '',
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

  const [images, setImages] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSelect, setActiveSelect] = useState<'region' | 'district' | 'country' | null>(null);

  const regionOptions = Object.keys(uzbekistanRegions).map(r => ({ value: r, label: r }));
  const districtOptions = formData.region 
    ? uzbekistanRegions[formData.region as keyof typeof uzbekistanRegions]?.map(d => ({ value: d, label: d })) || []
    : [];
  const countryOptions = [{ value: "O'zbekiston", label: "O'zbekiston" }, { value: "Qozog'iston", label: "Qozog'iston" }, { value: "Tojikiston", label: "Tojikiston" }];

  // initialData dan rasmlarni yuklash
  useEffect(() => {
    if (initialData) {
      setGoal(initialData.goal);
      setPropertyType(initialData.propertyType);
      setFormData(initialData.formData);
      
      const items: ImageItem[] = initialData.images.map((img, idx) => {
        if (typeof img === 'string') {
          return {
            id: `existing-${idx}`,
            url: img,
            status: 'done' as const,
            previewUrl: img,
          };
        }
        return {
          id: `file-${idx}-${Date.now()}`,
          file: img,
          status: 'pending' as const,
          previewUrl: URL.createObjectURL(img),
        };
      });
      setImages(items);
    }
  }, [initialData]);

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

  // Rasm tanlanganda — darhol Supabase'ga yuklash boshlanadi
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const filesArray = Array.from(e.target.files);
    const remainingSlots = 5 - images.length;
    const filesToProcess = filesArray.slice(0, remainingSlots);
    
    if (!filesToProcess.length) return;

    const user = getUser();
    const userId = user?.id || user?.telegram_id?.toString() || 'anonymous';

    // Har bir fayl uchun ImageItem yaratish (pending holatda)
    const newItems: ImageItem[] = filesToProcess.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      file,
      status: 'uploading' as const,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newItems]);
    setUploadingImages(true);

    // Parallel yuklash
    const uploadPromises = newItems.map(async (item) => {
      try {
        const urls = await uploadImages([item.file!], userId);
        if (urls.length > 0) {
          setImages(prev => prev.map(img => 
            img.id === item.id 
              ? { ...img, url: urls[0], status: 'done' as const }
              : img
          ));
        } else {
          setImages(prev => prev.map(img => 
            img.id === item.id 
              ? { ...img, status: 'error' as const }
              : img
          ));
        }
      } catch {
        setImages(prev => prev.map(img => 
          img.id === item.id 
            ? { ...img, status: 'error' as const }
            : img
        ));
      }
    });

    await Promise.all(uploadPromises);
    setUploadingImages(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(img => img.id === id);
      if (item?.previewUrl && item.file) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // Xato bo'lgan rasmni qayta yuklash
  const retryImage = async (id: string) => {
    const item = images.find(img => img.id === id);
    if (!item?.file) return;

    const user = getUser();
    const userId = user?.id || user?.telegram_id?.toString() || 'anonymous';

    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status: 'uploading' as const } : img
    ));

    try {
      const urls = await uploadImages([item.file], userId);
      if (urls.length > 0) {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, url: urls[0], status: 'done' as const } : img
        ));
      } else {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, status: 'error' as const } : img
        ));
      }
    } catch {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'error' as const } : img
      ));
    }
  };

  const handleMapClick = () => {
    alert("Xaritadan tanlash funksiyasi tez orada qo'shiladi!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading || uploadingImages) return;

    // Hali yuklanmagan rasmlar bormi?
    const hasUploading = images.some(img => img.status === 'uploading');
    if (hasUploading) {
      setSubmitError('Rasmlar hali yuklanmoqda, kuting...');
      return;
    }

    // Xato bo'lgan rasmlar haqida ogohlantirish
    const errorImages = images.filter(img => img.status === 'error');
    if (errorImages.length > 0 && images.every(img => img.status === 'error')) {
      setSubmitError('Barcha rasmlar yuklanishda xatolik. Qayta urinib ko\'ring.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Faqat muvaffaqiyatli yuklangan rasm URL'larini yig'ish
      const imageUrls = images
        .filter(img => img.status === 'done' && img.url)
        .map(img => img.url!);

      await onSubmit({
        goal,
        propertyType,
        formData,
        imageUrls,
      });
    } catch (error: any) {
      console.error('[ListingForm Submit Error]:', error);
      const errorMsg = error?.message || 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center">
      <button 
        onClick={() => {
          if (step > 1 && !initialData) setStep(step - 1);
          else navigate(-1);
        }} 
        className="flex items-center gap-1 text-gray-900 font-semibold active:scale-95 transition-transform"
      >
        <ChevronLeft size={20} />
        {t('add.back')}
      </button>
    </div>
  );

  // Rasm status badge
  const renderImageBadge = (item: ImageItem) => {
    if (item.status === 'uploading') {
      return (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
          <Loader2 size={24} className="text-white animate-spin" />
        </div>
      );
    }
    if (item.status === 'error') {
      return (
        <button
          type="button"
          onClick={() => retryImage(item.id)}
          className="absolute inset-0 bg-red-500/40 flex flex-col items-center justify-center rounded-2xl"
        >
          <AlertCircle size={20} className="text-white" />
          <span className="text-white text-[10px] font-bold mt-1">Qayta</span>
        </button>
      );
    }
    if (item.status === 'done') {
      return (
        <div className="absolute bottom-1 left-1">
          <CheckCircle2 size={16} className="text-green-500 drop-shadow" />
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

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

  return (
    <div className="bg-white min-h-screen pb-32">
      {renderHeader()}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium">
            ⚠️ {submitError}
          </div>
        )}

        {/* Photos — bevosita Supabase'ga yuklash */}
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
                disabled={uploadingImages}
                className="shrink-0 w-[100px] h-[100px] bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-900 active:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {uploadingImages ? <Loader2 size={28} className="animate-spin" /> : <Camera size={28} />}
              </button>
            )}
            
            {images.map((item) => (
              <div key={item.id} className="shrink-0 w-[100px] h-[100px] relative rounded-2xl border border-gray-200 overflow-hidden">
                <img src={item.previewUrl} alt="Uploaded" className="w-full h-full object-cover" />
                {renderImageBadge(item)}
                {item.status !== 'uploading' && (
                  <button 
                    type="button"
                    onClick={() => removeImage(item.id)}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 backdrop-blur-sm shadow-sm"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Uploading progress text */}
          {uploadingImages && (
            <p className="text-xs text-blue-600 font-medium mt-2 animate-pulse">
              📤 Rasmlar yuklanmoqda...
            </p>
          )}

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

        {/* Kimlar uchun (Only for Rent) */}
        {(goal === 'daily_rent' || goal === 'rent_out' || goal === 'rent_in') && (
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Kimlar uchun (Ijaraga)</h3>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, rentTarget: 'Oila' })}
                className={`py-3 rounded-xl font-bold text-sm transition-colors ${formData.rentTarget === 'Oila' ? 'bg-[#ffde33] text-gray-900' : 'bg-gray-50 text-gray-400'}`}
              >
                Oila
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, rentTarget: 'Student qizlar' })}
                className={`py-3 rounded-xl font-bold text-sm transition-colors ${formData.rentTarget === 'Student qizlar' ? 'bg-[#ffde33] text-gray-900' : 'bg-gray-50 text-gray-400'}`}
              >
                Talaba qizlar
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, rentTarget: 'Student bolalar' })}
                className={`py-3 rounded-xl font-bold text-sm transition-colors ${formData.rentTarget === 'Student bolalar' ? 'bg-[#ffde33] text-gray-900' : 'bg-gray-50 text-gray-400'}`}
              >
                Talaba yigitlar
              </button>
            </div>
          </div>
        )}

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
          disabled={isSubmitting || isLoading || uploadingImages}
          className="w-full py-4 bg-black text-white rounded-[20px] font-bold text-lg active:scale-[0.98] transition-transform mt-6 disabled:opacity-70"
        >
          {uploadingImages ? '📤 Rasmlar yuklanmoqda...' : isSubmitting || isLoading ? 'Saqlanmoqda...' : t('add.ready')}
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
