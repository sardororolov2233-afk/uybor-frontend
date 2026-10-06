import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from '../i18n/LanguageContext';
import { fetchListingById, updateListingDirect } from '../api/listings';
import { ListingForm, type ListingData, type ListingSubmitData } from '../components/ListingForm';

export const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<ListingData | undefined>();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await fetchListingById(id);
        const [c, r, d, ...s] = (data.address || '').split(', ');
        
        let parsedDesc = data.description || '';
        let rentTarget = '';
        const match = parsedDesc.match(/^Kimlar uchun: (.*?)\n\n/);
        if (match) {
          rentTarget = match[1];
          parsedDesc = parsedDesc.replace(match[0], '');
        }

        setInitialData({
          goal: data.category === 'SALE' ? 'sell' : 'rent_out',
          propertyType: data.property_type?.toLowerCase() || 'apartment',
          formData: {
            title: data.title || '',
            description: parsedDesc,
            whoPosted: 'egasi',
            rentTarget,
            area: (data.area || '').toString(),
            price: (data.price || '').toString(),
            currency: data.currency === 'USD' ? 'y.e' : 'so\'m',
            rooms: (data.rooms || '').toString(),
            floors: '',
            country: c || 'O\'zbekiston',
            region: r || '',
            district: d || '',
            streetAddress: s.join(', ') || '',
            phone: data.users?.phone_number || '+998',
          },
          images: data.images || [] // string[] — existing URLs
        });
      } catch (err) {
        console.error('Error loading listing to edit:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (data: ListingSubmitData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const category = ['sell', 'buy'].includes(data.goal) ? 'SALE' : 'RENT';
      let finalDescription = data.formData.description;
      if (category === 'RENT' && data.formData.rentTarget) {
        finalDescription = `Kimlar uchun: ${data.formData.rentTarget}\n\n${finalDescription}`;
      }

      const propTypeMap: Record<string, string> = {
        apartment: 'APARTMENT',
        house: 'HOUSE',
        commercial: 'COMMERCIAL',
        land: 'LAND',
      };

      await updateListingDirect(id, {
        title: data.formData.title,
        description: finalDescription,
        price: parseFloat(data.formData.price) || 0,
        currency: data.formData.currency === "so'm" ? 'UZS' : 'USD',
        category,
        property_type: propTypeMap[data.propertyType] || 'APARTMENT',
        rooms: parseInt(data.formData.rooms) || 1,
        area: data.formData.area ? parseFloat(data.formData.area) : null,
        address: [data.formData.country, data.formData.region, data.formData.district, data.formData.streetAddress]
          .filter(Boolean).join(', '),
        imageUrls: data.imageUrls,
        contact_phone: data.formData.phone,
      });

      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert("E'lon muvaffaqiyatli saqlandi!");
      } else {
        alert("E'lon muvaffaqiyatli saqlandi!");
      }
      navigate('/my-listings');
    } catch (error: any) {
      console.error('Error updating listing:', error);
      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert(error?.message || t('add.error'));
      } else {
        alert(error?.message || t('add.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <ListingForm initialData={initialData} onSubmit={handleSubmit} isLoading={isSubmitting} />;
};
