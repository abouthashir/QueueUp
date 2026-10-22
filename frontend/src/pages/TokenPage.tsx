import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getToken, type TokenInfo } from '../api';

function describe(token: TokenInfo): string {
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
      return 'This token is no longer active.';
    case 'NoShow':
      return 'The queue has closed for today.';
  }
}

export default function TokenPage() {
  const { tokenId } = useParams();

  const [token, setToken] = useState<TokenInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId) {
      return;
    }

    const id = tokenId;

    async function load() {
      try {
        setToken(await getToken(id));
      } catch (e) {
        setError((e as Error).message);
      }
    }

    load();
  }, [tokenId]);

  if (!token) {
    return (
      <main className="page">
        {error ? <p className="error" role="alert">{error}</p> : <p className="muted">Loading…</p>}
      </main>
    );
  }

  return (
    <main className="page">
      <p className="muted">{token.queueName}</p>
      <p className="token-number" aria-label={`Your token number is ${token.displayNumber}`}>
        {token.displayNumber}
      </p>

      <p className={`status status-${token.status.toLowerCase()}`} aria-live="polite">
        {describe(token)}
      </p>
    </main>
  );
}
