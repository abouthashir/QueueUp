import { describe, expect, it } from 'vitest';
import type { TokenInfo } from './api';
import { describeToken, isNext } from './tokenMessages';

function token(changes: Partial<TokenInfo>): TokenInfo {
  return {
    id: 't1',
    queueId: 'q1',
    displayNumber: 'A-014',
    status: 'Waiting',
    queueName: 'General OPD',
    queueStatus: 'Open',
    customerName: null,
    counterName: null,
    peopleAhead: 3,
    estimatedWaitMinutes: 15,
    nowServing: [],
    ...changes,
  };
}

describe('describeToken', () => {
  it('shows people ahead and the wait', () => {
    expect(describeToken(token({}))).toBe('3 people ahead · about 15 min');
  });

  it('uses "person" for exactly one', () => {
    expect(describeToken(token({ peopleAhead: 1, estimatedWaitMinutes: 5 }))).toBe('1 person ahead · about 5 min');
  });

  it('tells a called customer where to go', () => {
    expect(describeToken(token({ status: 'Called', counterName: 'Counter 2' }))).toBe('Please go to Counter 2');
  });

  it('explains a token cancelled by closing time', () => {
    expect(describeToken(token({ status: 'Cancelled', queueStatus: 'Closed' }))).toBe('The queue has closed for today.');
  });
});

describe('isNext', () => {
  it('is true only for a waiting token with nobody ahead', () => {
    expect(isNext(token({ peopleAhead: 0 }))).toBe(true);
    expect(isNext(token({ peopleAhead: 2 }))).toBe(false);
    expect(isNext(token({ status: 'Called', peopleAhead: 0 }))).toBe(false);
  });
});
