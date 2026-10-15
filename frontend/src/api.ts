export type QueueStatus = 'Closed' | 'Open' | 'Paused';

export interface QueueInfo {
    id: string;
    name: string;
    status: QueueStatus;
    peopleWaiting: number;
    estimatedWaitMinutes: number;
}
