const COUNTER_NAME_KEY = 'queueup.counterName';

export function loadCounterName(): string {
  return localStorage.getItem(COUNTER_NAME_KEY) ?? '';
}

export function saveCounterName(counterName: string): void {
  localStorage.setItem(COUNTER_NAME_KEY, counterName);
}
