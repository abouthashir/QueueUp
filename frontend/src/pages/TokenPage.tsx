import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { alertCustomer, enableAlerts } from '../alerts';
import { getToken, leaveQueue, type TokenInfo } from '../api';
import TokenView from '../token/TokenView';
import { isNext } from '../tokenMessages';
import StatusScreen from '../ui/StatusScreen';
import { useQueueUpdates } from '../useQueueUpdates';

const REFRESH_EVERY_MS = 15_000;

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
    return error ? <StatusScreen message={error} error /> : <StatusScreen message="Loading your token…" />;
  }

  return (
    <TokenView
      token={token}
      liveStatus={liveStatus}
      alertsOn={alertsOn}
      error={error}
      onEnableAlerts={handleEnableAlerts}
      onLeave={handleLeave}
    />
  );
}
