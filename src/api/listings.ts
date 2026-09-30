import api from './index';
import type { Listing } from '../types';

interface ListingsParams {
  category?: string;
  property_type?: string;
  rooms?: number;
  price_max?: number;
}

export async function fetchListings(params?: ListingsParams): Promise<Listing[]> {
  const { data } = await api.get('/listings', { params });
  return data;
}

export async function fetchListingById(id: string): Promise<Listing> {
  const { data } = await api.get(`/listings/${id}`);
  return data;
}

export async function createListing(listing: Partial<Listing>): Promise<Listing> {
  const { data } = await api.post('/listings', listing);
  return data;
}

export async function updateListingApi(id: string, listing: Partial<Listing>): Promise<Listing> {
  const { data } = await api.put(`/listings/${id}`, listing);
  return data;
}

export async function deleteListingApi(id: string): Promise<void> {
  await api.delete(`/listings/${id}`);
}

export async function fetchMyListings(): Promise<Listing[]> {
  const { data } = await api.get('/users/me/listings');
  return data;
}
