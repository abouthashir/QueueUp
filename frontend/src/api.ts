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
