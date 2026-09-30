import api from './index';
import type { Listing } from '../types';

export interface AIChatResponse {
  reply: string;
  recommended_listings: Listing[];
}

export async function sendAIChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<AIChatResponse> {
  const { data } = await api.post('/ai/chat', { message, history });
  return data;
}

export async function saveAIPreferences(prompt: string): Promise<any> {
  const { data } = await api.post('/ai/preferences', { prompt });
  return data;
}

export async function getUserPreferences(): Promise<any[]> {
  const { data } = await api.get('/ai/preferences');
  return data;
}

export async function verifyReceiptPayment(
  receiptImageUrl: string,
  listingId?: string,
  expectedAmount?: number
): Promise<any> {
  const { data } = await api.post('/payments/verify-receipt', {
    receipt_image_url: receiptImageUrl,
    listing_id: listingId,
    expected_amount: expectedAmount,
  });
  return data;
}
