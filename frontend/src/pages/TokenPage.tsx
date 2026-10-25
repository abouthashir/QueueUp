import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { alertCustomer, enableAlerts } from '../alerts';
import { getToken, leaveQueue, type TokenInfo } from '../api';
import ConnectionNotice from '../components/ConnectionNotice';
import { useQueueUpdates } from '../useQueueUpdates';

const REFRESH_EVERY_MS = 15_000;

function isNext(token: TokenInfo): boolean {
  return token.status === 'Waiting' && token.peopleAhead === 0;
}

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
      if (token.queueStatus === 'Closed') {
        return 'The queue has closed for today.';
      }
      return 'This token is no longer active.';
    case 'NoShow':
      return 'The queue has closed for today.';
  }
}

export default function TokenPage() {
  const { tokenId } = useParams();

  const [token, setToken] = useState<TokenInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertsOn, setAlertsOn] = useState(false);
  const previousToken = useRef<TokenInfo | null>(null);
  const { changeCount, liveStatus } = useQueueUpdates(token?.queueId);
  const shouldPoll = liveStatus === 'reconnecting' || liveStatus === 'offline';

  useEffect(() => {
    if (!tokenId) {
      return;
    }

    const id = tokenId;
    let stopped = false;

    async function refresh() {
      try {
        const latest = await getToken(id);

        if (!stopped) {
          setToken(latest);
          setError(null);
        }
      } catch (e) {
        if (!stopped) {
          setError((e as Error).message);
        }
      }
    }

    refresh();
    const timer = shouldPoll ? setInterval(refresh, REFRESH_EVERY_MS) : undefined;

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [tokenId, changeCount, shouldPoll]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const before = previousToken.current;
    previousToken.current = token;

    if (!alertsOn || !before) {
      return;
    }

    if (token.status === 'Called' && before.status !== 'Called') {
      alertCustomer(`Please go to ${token.counterName}`, `Token ${token.displayNumber} is being called.`);
    } else if (isNext(token) && !isNext(before)) {
      alertCustomer("You're next!", `Token ${token.displayNumber} is first in line.`);
    }
  }, [token, alertsOn]);

  async function handleEnableAlerts() {
    try {
      await enableAlerts();
    } finally {
      setAlertsOn(true);
    }
  }

  async function handleLeave() {
    if (!token || !window.confirm('Leave the queue? You will lose your place.')) {
      return;
    }

    try {
      setToken(await leaveQueue(token.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!token) {
    return (
      <main className="page">
        {error ? <p className="error" role="alert">{error}</p> : <p className="muted">Loading…</p>}
      </main>
    );
  }

  return (
    <main className="page">
      <ConnectionNotice liveStatus={liveStatus} />
      <p className="muted">{token.queueName}</p>
      <p className="token-number" aria-label={`Your token number is ${token.displayNumber}`}>
        {token.displayNumber}
      </p>

      <p className={`status status-${token.status.toLowerCase()}`} aria-live="polite">
        {describe(token)}
      </p>


      {token.status === 'Waiting' && token.nowServing.length > 0 && (
        <p className="muted">Now serving {token.nowServing.join(', ')}</p>
      )}

      {token.status === 'Waiting' && !alertsOn && (
        <button type="button" onClick={handleEnableAlerts}>
          Turn on alerts
        </button>
      )}

      {token.status === 'Waiting' && alertsOn && (
        <p className="muted">Alerts are on. Keep this page open and we'll beep when it's your turn.</p>
      )}

      {token.status === 'Waiting' && (
        <button type="button" className="secondary" onClick={handleLeave}>
          Leave queue
        </button>
      )}

      {error && <p className="error" role="alert">{error}</p>}
    </main>
  );
}
