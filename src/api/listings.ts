import api from './index';
import { supabase } from './supabase';
import type { Listing } from '../types';
import imageCompression from 'browser-image-compression';

interface ListingsParams {
  category?: string;
  property_type?: string;
  rooms?: number;
  price_max?: number;
  rent_target?: string;
}

// ============ READ operatsiyalari (backend orqali) ============

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

// ============ RASM YUKLASH (Signed URLs orqali xavfsiz yuklash) ============

export interface UploadProgress {
  index: number;
  total: number;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  percent: number;
}

export async function uploadImages(
  files: File[],
  _userId: string, // parameter ignored but kept for compatibility
  onProgress?: (p: UploadProgress) => void,
): Promise<string[]> {
  if (!files.length) return [];

  // 1. Backenddan signed URL'larni so'rash
  const fileData = files.map(f => ({ ext: f.type.split('/')[1] || 'jpeg' }));
  const { data } = await api.post('/listings/upload-urls', { files: fileData });
  const urls = data.urls;

  const publicUrls: string[] = [];

  // 2. Har bir rasmni siqish va olingan Signed URL'ga yuklash
  const promises = files.map(async (file, index) => {
    try {
      onProgress?.({ index, total: files.length, status: 'compressing', percent: 0 });

      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      onProgress?.({ index, total: files.length, status: 'uploading', percent: 50 });

      const urlInfo = urls[index];

      // To'g'ridan-to'g'ri Signed URL orqali Supabase Storage'ga yozish
      const { error } = await supabase.storage
        .from('listing-images')
        .uploadToSignedUrl(urlInfo.path, urlInfo.token, compressed, { upsert: false });

      if (error) {
        console.error('Signed URL upload error:', error);
        onProgress?.({ index, total: files.length, status: 'error', percent: 0 });
      } else {
        publicUrls.push(urlInfo.publicUrl);
        onProgress?.({ index, total: files.length, status: 'done', percent: 100 });
      }
    } catch (err) {
      console.error('Image compression or upload error:', err);
      onProgress?.({ index, total: files.length, status: 'error', percent: 0 });
    }
  });

  await Promise.all(promises);
  return publicUrls;
}

// ============ E'LON YARATISH (Backend orqali xavfsiz) ============

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
  // Backend endi faqat JSON malumot qabul qiladi
  const { data } = await api.post('/listings', input);
  return data;
}

// ============ E'LON TAHRIRLASH (Backend orqali xavfsiz) ============

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
  const { data } = await api.put(`/listings/${id}`, input);
  return data;
}

// ============ E'LON O'CHIRISH (Backend orqali xavfsiz) ============

export async function deleteListingDirect(id: string): Promise<void> {
  await api.delete(`/listings/${id}`);
}

// Backward compatibility (eski nomlar ham ishlayverishi uchun)
export const createListing = createListingDirect as any;
export const updateListingApi = updateListingDirect as any;
export const deleteListingApi = deleteListingDirect;
