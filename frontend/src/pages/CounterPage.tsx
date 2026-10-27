import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  callNext,
  closeQueue,
  getDashboard,
  joinQueue,
  openQueue,
  pauseQueue,
  recallToken,
  serveToken,
  skipToken,
  type Dashboard,
} from '../api';
import AppShell, { ShellMessage } from '../app/AppShell';
import CounterView from '../counter/CounterView';
import { useQueueUpdates } from '../useQueueUpdates';

const REFRESH_EVERY_MS = 5_000;

export default function CounterPage() {
  const { queueId } = useParams();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const { changeCount, liveStatus } = useQueueUpdates(queueId);
  const shouldPoll = liveStatus === 'reconnecting' || liveStatus === 'offline';

  useEffect(() => {
    if (!queueId) {
      return;
    }

    const id = queueId;
    let stopped = false;

    async function refresh() {
      try {
        const latest = await getDashboard(id);

        if (!stopped) {
          setDashboard(latest);
          setLoadError(null);
        }
      } catch (e) {
        if (!stopped) {
          setLoadError((e as Error).message);
        }
      }
    }

    refresh();
    const timer = shouldPoll ? setInterval(refresh, REFRESH_EVERY_MS) : undefined;

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [queueId, reloadCount, changeCount, shouldPoll]);

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    setNotice(null);

    try {
      await action();
    } catch (e) {
      setActionError((e as Error).message);
    }

    setBusy(false);
    setReloadCount((count) => count + 1);
  }

  function handleCallNext() {
    if (!queueId) {
      return;
    }

    const id = queueId;

    runAction(async () => {
      const called = await callNext(id);

      if (!called) {
        setNotice('No one is waiting.');
      }
    });
  }

  function handleWalkIn() {
    if (!queueId) {
      return;
    }

    const id = queueId;

    runAction(async () => {
      const token = await joinQueue(id, '');
      setNotice(`Walk-in token ${token.displayNumber} issued. Tell the customer their number.`);
    });
  }

  function handleClose() {
    if (!queueId || !window.confirm('Close the queue for today? Everyone still waiting will be cancelled.')) {
      return;
    }

    const id = queueId;
    runAction(() => closeQueue(id));
  }

  if (!dashboard) {
    return (
      <AppShell>
        <ShellMessage message={loadError ?? 'Loading…'} error={loadError !== null} />
      </AppShell>
    );
  }

  const id = dashboard.queue.id;
  const errors = [actionError, loadError].filter((message): message is string => message !== null);

  return (
    <AppShell>
      <CounterView
        dashboard={dashboard}
        liveStatus={liveStatus}
        busy={busy}
        notice={notice}
        errors={errors}
        onCallNext={handleCallNext}
        onServe={(tokenId) => runAction(() => serveToken(tokenId))}
        onSkip={(tokenId) => runAction(() => skipToken(tokenId))}
        onRecall={(tokenId) => runAction(() => recallToken(tokenId))}
        onWalkIn={handleWalkIn}
        onPause={() => runAction(() => pauseQueue(id))}
        onOpen={() => runAction(() => openQueue(id))}
        onClose={handleClose}
      />
    </AppShell>
  );
}
