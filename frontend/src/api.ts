import { forgetAuth, loadAuth } from './authStorage';

export const API_URL: string = import.meta.env.VITE_API_URL;

export type QueueStatus = 'Closed' | 'Open' | 'Paused';
export type UserRole = 'Owner' | 'Staff';
export type BusinessType = 'Clinic' | 'Bank' | 'Salon' | 'Other';
export type TokenStatus = 'Waiting' | 'Called' | 'Served' | 'Skipped' | 'Cancelled' | 'NoShow';

export interface QueueInfo {
  id: string;
  name: string;
  status: QueueStatus;
  peopleWaiting: number;
  estimatedWaitMinutes: number;
}

export interface TokenInfo {
  id: string;
  queueId: string;
  displayNumber: string;
  status: TokenStatus;
  queueName: string;
  queueStatus: QueueStatus;
  customerName: string | null;
  counterName: string | null;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  nowServing: string[];
}

export interface TokenSummary {
  id: string;
  displayNumber: string;
  customerName: string | null;
}

export interface Dashboard {
  queue: QueueInfo;
  counterName: string;
  nowServing: TokenInfo | null;
  waiting: TokenSummary[];
  skipped: TokenSummary[];
  servedToday: number;
}

export interface AuthInfo {
  token: string;
  expiresAt: string;
  name: string;
  role: UserRole;
  counterName: string;
  businessName: string;
}

export interface SignupDetails {
  businessName: string;
  name: string;
  email: string;
  password: string;
  counterName: string;
}

export interface BusinessProfile {
  name: string;
  type: BusinessType;
  address: string;
  openingHours: string;
}

export interface JoinInfo {
  queue: QueueInfo;
  business: BusinessProfile;
}

export interface QueueOverview {
  id: string;
  name: string;
  prefix: string;
  averageServiceMinutes: number;
  status: QueueStatus;
  peopleWaiting: number;
  issuedToday: number;
  servedToday: number;
  noShowsToday: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  counterName: string;
}

export interface NewStaff {
  name: string;
  email: string;
  password: string;
  counterName: string;
}

export interface CounterServing {
  counterName: string;
  displayNumber: string;
}

export interface DisplayInfo {
  businessName: string;
  queueName: string;
  status: QueueStatus;
  nowServing: CounterServing[];
  next: string[];
  peopleWaiting: number;
}

export interface NewQueue {
  name: string;
  prefix: string;
  averageServiceMinutes: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const auth = loadAuth();
  const headers = new Headers(options?.headers);

  if (auth) {
    headers.set('Authorization', `Bearer ${auth.token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach QueueUp. Check your internet connection and try again.');
  }

  if (response.status === 401 && auth) {
    forgetAuth();
    window.location.assign('/login?expired=1');
    throw new Error('Your session has ended. Please log in again.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Something went wrong. Please try again.');
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export function getJoinInfo(queueId: string): Promise<JoinInfo> {
  return request<JoinInfo>(`/api/queues/${queueId}`);
}

export function joinQueue(queueId: string, customerName: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/queues/${queueId}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerName: customerName.trim() || null }),
  });
}

export function getToken(tokenId: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}`);
}

export function leaveQueue(tokenId: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}/cancel`, { method: 'POST' });
}

export function getDashboard(queueId: string): Promise<Dashboard> {
  return request<Dashboard>(`/api/queues/${queueId}/dashboard`);
}

export function callNext(queueId: string): Promise<TokenInfo | null> {
  return request<TokenInfo | null>(`/api/queues/${queueId}/call-next`, { method: 'POST' });
}

export function serveToken(tokenId: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}/serve`, { method: 'POST' });
}

export function skipToken(tokenId: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}/skip`, { method: 'POST' });
}

export function recallToken(tokenId: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}/recall`, { method: 'POST' });
}

export function pauseQueue(queueId: string): Promise<QueueInfo> {
  return request<QueueInfo>(`/api/queues/${queueId}/pause`, { method: 'POST' });
}

export function openQueue(queueId: string): Promise<QueueInfo> {
  return request<QueueInfo>(`/api/queues/${queueId}/open`, { method: 'POST' });
}

export function closeQueue(queueId: string): Promise<QueueInfo> {
  return request<QueueInfo>(`/api/queues/${queueId}/close`, { method: 'POST' });
}

export function signup(details: SignupDetails): Promise<AuthInfo> {
  return request<AuthInfo>('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
}

export function login(email: string, password: string): Promise<AuthInfo> {
  return request<AuthInfo>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function getMyQueues(): Promise<QueueOverview[]> {
  return request<QueueOverview[]>('/api/queues');
}

export function createQueue(queue: NewQueue): Promise<QueueInfo> {
  return request<QueueInfo>('/api/queues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queue),
  });
}

export function getBusiness(): Promise<BusinessProfile> {
  return request<BusinessProfile>('/api/business');
}

export function updateBusiness(profile: BusinessProfile): Promise<BusinessProfile> {
  return request<BusinessProfile>('/api/business', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
}

export function updateQueue(queueId: string, name: string, averageServiceMinutes: number): Promise<QueueOverview> {
  return request<QueueOverview>(`/api/queues/${queueId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, averageServiceMinutes }),
  });
}

export function getStaff(): Promise<StaffMember[]> {
  return request<StaffMember[]>('/api/staff');
}

export function createStaff(staff: NewStaff): Promise<StaffMember> {
  return request<StaffMember>('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staff),
  });
}

export function updateStaff(staffId: string, name: string, counterName: string): Promise<StaffMember> {
  return request<StaffMember>(`/api/staff/${staffId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, counterName }),
  });
}

export function removeStaff(staffId: string): Promise<null> {
  return request<null>(`/api/staff/${staffId}`, { method: 'DELETE' });
}

export function getDisplay(queueId: string): Promise<DisplayInfo> {
  return request<DisplayInfo>(`/api/queues/${queueId}/display`);
}
