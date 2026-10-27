import type { TokenInfo } from '../api';

// Sample data for illustrations. The cards are the same components customers really see.
export const SAMPLE_WAITING: TokenInfo = {
  id: 'sample-1',
  queueId: 'sample',
  displayNumber: 'A-042',
  status: 'Waiting',
  queueName: 'General OPD',
  queueStatus: 'Open',
  customerName: null,
  counterName: null,
  peopleAhead: 3,
  estimatedWaitMinutes: 15,
  nowServing: ['A-039'],
};
