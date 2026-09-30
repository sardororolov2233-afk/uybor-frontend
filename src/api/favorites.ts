import api from './index';

export async function fetchFavorites(): Promise<any[]> {
  const { data } = await api.get('/favorites');
  return data;
}

export async function addFavorite(listingId: string): Promise<any> {
  const { data } = await api.post('/favorites', { listing_id: listingId });
  return data;
}

export async function removeFavorite(listingId: string): Promise<void> {
  await api.delete(`/favorites/${listingId}`);
}
