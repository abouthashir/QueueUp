const API_URL: string = import.meta.env.VITE_API_URL;

export type QueueStatus = 'Closed' | 'Open' | 'Paused';

export interface QueueInfo {
  id: string;
  name: string;
  status: QueueStatus;
  peopleWaiting: number;
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
