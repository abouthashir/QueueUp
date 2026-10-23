import type { AuthInfo } from './api';

const AUTH_KEY = 'queueup.auth';

export function loadAuth(): AuthInfo | null {
  const saved = localStorage.getItem(AUTH_KEY);

  if (!saved) {
    return null;
  }

  const auth = JSON.parse(saved) as AuthInfo;

  if (new Date(auth.expiresAt) <= new Date()) {
    forgetAuth();
    return null;
  }

  return auth;
}

export function saveAuth(auth: AuthInfo): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function forgetAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}
