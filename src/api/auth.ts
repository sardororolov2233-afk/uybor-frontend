import api from './index';
import WebApp from '@twa-dev/sdk';

const TOKEN_KEY = 'uybor_jwt_token';
const USER_KEY = 'uybor_user';

export async function loginWithTelegram(): Promise<{ token: string; user: any } | null> {
  try {
    let initData = '';
    try {
      initData = WebApp?.initData || '';
      console.log('[AUTH] WebApp.initData length:', initData.length);
    } catch (e) {
      console.warn('[AUTH] WebApp not available:', e);
    }

    if (!initData) {
      console.warn('[AUTH] No Telegram initData available — cannot authenticate');
      return null;
    }

    console.log('[AUTH] Sending initData to backend...');
    const { data } = await api.post('/auth/telegram', { initData });
    console.log('[AUTH] Backend response:', JSON.stringify(data?.user));

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  } catch (error: any) {
    console.error('[AUTH] Login failed:', error?.response?.status, error?.response?.data || error?.message);
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): any | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
