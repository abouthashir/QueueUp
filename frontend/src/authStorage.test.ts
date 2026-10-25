import { afterEach, describe, expect, it } from 'vitest';
import type { AuthInfo } from './api';
import { loadAuth, saveAuth } from './authStorage';

function authExpiringAt(expiresAt: Date): AuthInfo {
  return {
    token: 'pass',
    expiresAt: expiresAt.toISOString(),
    name: 'Reshma',
    role: 'Staff',
    counterName: 'Counter 2',
    businessName: 'Sunrise Clinic',
  };
}

describe('loadAuth', () => {
  afterEach(() => localStorage.clear());

  it('returns a saved login that has not expired', () => {
    saveAuth(authExpiringAt(new Date(Date.now() + 60_000)));

    expect(loadAuth()?.name).toBe('Reshma');
  });

  it('forgets a login that has expired', () => {
    saveAuth(authExpiringAt(new Date(Date.now() - 60_000)));

    expect(loadAuth()).toBeNull();
    expect(localStorage.getItem('queueup.auth')).toBeNull();
  });
});
