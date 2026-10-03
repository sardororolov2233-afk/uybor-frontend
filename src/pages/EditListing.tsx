import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from '../i18n/LanguageContext';
import { fetchListingById, updateListingApi } from '../api/listings';
import { ListingForm, type ListingData } from '../components/ListingForm';

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
        
        setInitialData({
          goal: data.category === 'SALE' ? 'sell' : 'rent_out',
          propertyType: data.property_type?.toLowerCase() || 'apartment',
          formData: {
            title: data.title || '',
            description: data.description || '',
            whoPosted: 'egasi',
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
          images: data.images || []
        });
      } catch (err) {
        console.error('Error loading listing to edit:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (formDataToSend: FormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateListingApi(id, formDataToSend);

      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert("E'lon muvaffaqiyatli saqlandi!");
      } else {
        alert("E'lon muvaffaqiyatli saqlandi!");
      }
      navigate('/my-listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert(t('add.error'));
      } else {
        alert(t('add.error'));
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
