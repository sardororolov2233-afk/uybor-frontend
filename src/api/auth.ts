import api from './index';
import WebApp from '@twa-dev/sdk';

const TOKEN_KEY = 'uybor_jwt_token';
const USER_KEY = 'uybor_user';

export async function loginWithTelegram(): Promise<{ token: string; user: any } | null> {
  try {
    let initData = '';
    try {
      initData = WebApp?.initData || '';
    } catch (e) {
      console.warn('WebApp not available');
    }

    if (!initData) {
      console.warn('No Telegram initData available');
      return null;
    }

    const { data } = await api.post('/auth/telegram', { initData });

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Login failed:', error);
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
