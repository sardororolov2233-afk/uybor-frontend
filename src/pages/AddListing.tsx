import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from '../i18n/LanguageContext';
import { createListing } from '../api/listings';
import { ListingForm } from '../components/ListingForm';

export const AddListing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formDataToSend: FormData) => {
    setIsSubmitting(true);
    try {
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

  return <ListingForm onSubmit={handleSubmit} isLoading={isSubmitting} />;
};
