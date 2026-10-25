import type { TokenInfo } from './api';

export function isNext(token: TokenInfo): boolean {
  return token.status === 'Waiting' && token.peopleAhead === 0;
}

export function describeToken(token: TokenInfo): string {
  switch (token.status) {
    case 'Waiting':
      if (token.peopleAhead === 0) {
        return "You're next!";
      }
      return `${token.peopleAhead} ${token.peopleAhead === 1 ? 'person' : 'people'} ahead · about ${token.estimatedWaitMinutes} min`;
    case 'Called':
      return `Please go to ${token.counterName}`;
    case 'Served':
      return 'Thank you! Your visit is complete.';
    case 'Skipped':
      return 'You missed your turn. Please speak to the reception desk.';
    case 'Cancelled':
      if (token.queueStatus === 'Closed') {
        return 'The queue has closed for today.';
      }
      return 'This token is no longer active.';
    case 'NoShow':
      return 'The queue has closed for today.';
  }
}
