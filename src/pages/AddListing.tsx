import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from '../i18n/LanguageContext';
import { createListingDirect } from '../api/listings';
import { ListingForm, type ListingSubmitData } from '../components/ListingForm';

export const AddListing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ListingSubmitData) => {
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

      await createListingDirect({
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
      });

      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert(t('add.success'));
      } else {
        alert(t('add.success'));
      }
      navigate('/my-listings');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      // Check if limit reached by either error code or status or message
      if (error?.response?.data?.error === 'LIMIT_REACHED' || error?.response?.status === 403) {
         navigate('/packages');
         return;
      }
      
      const msg = error?.response?.data?.message || error?.message || t('add.error');
      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert(msg);
      } else {
        alert(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return <ListingForm onSubmit={handleSubmit} isLoading={isSubmitting} />;
};
