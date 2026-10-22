function keyFor(queueId: string): string {
  return `queueup.token.${queueId}`;
}

export function saveTokenId(queueId: string, tokenId: string): void {
  localStorage.setItem(keyFor(queueId), tokenId);
}

export function loadTokenId(queueId: string): string | null {
  return localStorage.getItem(keyFor(queueId));
}

export function forgetTokenId(queueId: string): void {
  localStorage.removeItem(keyFor(queueId));
}
