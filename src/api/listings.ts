import api from './index';
import { supabase } from './supabase';
import { getUser } from './auth';
import type { Listing } from '../types';
import imageCompression from 'browser-image-compression';

interface ListingsParams {
  category?: string;
  property_type?: string;
  rooms?: number;
  price_max?: number;
}

// ============ READ operatsiyalari (backend orqali — public) ============

export async function fetchListings(params?: ListingsParams): Promise<Listing[]> {
  const { data } = await api.get('/listings', { params });
  return data;
}

export async function fetchListingById(id: string): Promise<Listing> {
  const { data } = await api.get(`/listings/${id}`);
  return data;
}

export async function fetchMyListings(): Promise<Listing[]> {
  const { data } = await api.get('/users/me/listings');
  return data;
}

// ============ RASM YUKLASH — bevosita Supabase Storage'ga ============

export interface UploadProgress {
  index: number;
  total: number;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  percent: number;
}

/**
 * Bitta rasmni siqib, Supabase Storage'ga yuklaydi.
 * @returns Public URL yoki null (xato bo'lganda)
 */
async function uploadSingleImage(
  file: File,
  userId: string,
): Promise<string | null> {
  try {
    // 1) Rasmni siqish
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    });

    // 2) Unique fayl nomi
    const ext = compressed.type.split('/')[1] || 'jpeg';
    const fileName = `listings/${userId}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;

    // 3) Supabase Storage'ga yuklash
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, compressed, {
        contentType: compressed.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return null;
    }

    // 4) Public URL olish
    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Image upload error:', err);
    return null;
  }
}

/**
 * Bir nechta rasmni parallel yuklaydi, progress callback beradi.
 */
export async function uploadImages(
  files: File[],
  userId: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<string[]> {
  const urls: string[] = [];

  const promises = files.map(async (file, index) => {
    onProgress?.({ index, total: files.length, status: 'compressing', percent: 0 });

    const url = await uploadSingleImage(file, userId);

    if (url) {
      urls.push(url);
      onProgress?.({ index, total: files.length, status: 'done', percent: 100 });
    } else {
      onProgress?.({ index, total: files.length, status: 'error', percent: 0 });
    }
  });

  await Promise.all(promises);
  return urls;
}

/**
 * Supabase Storage'dan rasmlarni o'chirish (URL dan path ajratib)
 */
async function removeImagesFromStorage(imageUrls: string[]): Promise<void> {
  if (!imageUrls.length) return;
  const paths = imageUrls.map((url) => {
    const parts = url.split('/');
    return 'listings/' + parts[parts.length - 1];
  });
  await supabase.storage.from('listing-images').remove(paths);
}

// ============ E'LON YARATISH — bevosita Supabase DB'ga ============

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  property_type: string;
  rooms: number;
  area?: number | null;
  address: string;
  imageUrls: string[];
}

export async function createListingDirect(input: CreateListingInput): Promise<Listing> {
  const user = getUser();
  if (!user?.id) throw new Error('Foydalanuvchi tizimga kirmagan');

  const { data, error } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      category: input.category,
      property_type: input.property_type,
      rooms: input.rooms,
      area: input.area || null,
      address: input.address,
      images: input.imageUrls,
      status: 'ACTIVE',
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(error.message);
  }

  // Backend'ga bildirishnoma yuborish (matching users notification) — fire and forget
  api.post('/listings/notify', { listing_id: data.id }).catch(() => {});

  return data;
}

// ============ E'LON TAHRIRLASH — bevosita Supabase DB'ga ============

export interface UpdateListingInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  property_type: string;
  rooms: number;
  area?: number | null;
  address: string;
  imageUrls: string[];
  status?: string;
}

export async function updateListingDirect(id: string, input: UpdateListingInput): Promise<Listing> {
  const user = getUser();
  if (!user?.id) throw new Error('Foydalanuvchi tizimga kirmagan');

  // Avval eski e'lonni olish (o'chirilgan rasmlarni tozalash uchun)
  const { data: existing } = await supabase
    .from('listings')
    .select('user_id, images')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    throw new Error('Ruxsat berilmagan');
  }

  // O'chirilgan rasmlarni storage'dan tozalash
  const removedImages = (existing.images || []).filter(
    (img: string) => !input.imageUrls.includes(img)
  );
  if (removedImages.length > 0) {
    await removeImagesFromStorage(removedImages);
  }

  const { data, error } = await supabase
    .from('listings')
    .update({
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      category: input.category,
      property_type: input.property_type,
      rooms: input.rooms,
      area: input.area || null,
      address: input.address,
      images: input.imageUrls,
      status: input.status || 'ACTIVE',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    throw new Error(error.message);
  }

  return data;
}

// ============ E'LON O'CHIRISH — bevosita Supabase'dan ============

export async function deleteListingDirect(id: string): Promise<void> {
  const user = getUser();
  if (!user?.id) throw new Error('Foydalanuvchi tizimga kirmagan');

  // Avval rasmlarni olish
  const { data: existing } = await supabase
    .from('listings')
    .select('user_id, images')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    throw new Error('Ruxsat berilmagan');
  }

  // Rasmlarni storage'dan tozalash
  if (existing.images?.length) {
    await removeImagesFromStorage(existing.images);
  }

  const { error } = await supabase
    .from('listings')
    .delete()
    .match({ id, user_id: user.id });

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(error.message);
  }
}

// Eski funksiyalarni eksport qilish (backward compatibility)
export const createListing = createListingDirect as any;
export const updateListingApi = updateListingDirect as any;
export const deleteListingApi = deleteListingDirect;
