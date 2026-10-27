import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { TokenInfo } from '../api';
import TokenCard from './TokenCard';

const waiting: TokenInfo = {
  id: 't1',
  queueId: 'q1',
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

describe('TokenCard', () => {
  afterEach(cleanup);

  it('shows how many people are ahead while waiting', () => {
    render(<TokenCard token={waiting} />);

    expect(screen.getByText('Ahead of you').nextElementSibling?.textContent).toBe('3');
    expect(screen.getByText('Waiting')).toBeTruthy();
  });

  it('sends the customer to their counter when called', () => {
    render(<TokenCard token={{ ...waiting, status: 'Called', counterName: 'Counter 2' }} />);

    expect(screen.getByText('Counter 2')).toBeTruthy();
    expect(screen.queryByText('Ahead of you')).toBeNull();
  });
});
