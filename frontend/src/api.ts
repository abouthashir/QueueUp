const API_URL: string = import.meta.env.VITE_API_URL;

export type QueueStatus = 'Closed' | 'Open' | 'Paused';
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
  displayNumber: string;
  status: TokenStatus;
  queueName: string;
  customerName: string | null;
  counterName: string | null;
  peopleAhead: number;
  estimatedWaitMinutes: number;
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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error('Cannot reach QueueUp. Check your internet connection and try again.');
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

export function getQueue(queueId: string): Promise<QueueInfo> {
  return request<QueueInfo>(`/api/queues/${queueId}`);
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

export function getDashboard(queueId: string, counterName: string): Promise<Dashboard> {
  return request<Dashboard>(`/api/queues/${queueId}/dashboard?counterName=${encodeURIComponent(counterName)}`);
}

export function callNext(queueId: string, counterName: string): Promise<TokenInfo | null> {
  return request<TokenInfo | null>(`/api/queues/${queueId}/call-next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ counterName }),
  });
}

export function serveToken(tokenId: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}/serve`, { method: 'POST' });
}

export function skipToken(tokenId: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}/skip`, { method: 'POST' });
}

export function recallToken(tokenId: string, counterName: string): Promise<TokenInfo> {
  return request<TokenInfo>(`/api/tokens/${tokenId}/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ counterName }),
  });
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
