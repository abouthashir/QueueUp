import { useEffect, useState, type FormEvent } from 'react';
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
import ConnectionNotice from '../components/ConnectionNotice';
import NowServing from '../components/NowServing';
import TokenList from '../components/TokenList';
import { loadCounterName, saveCounterName } from '../counterStorage';
import { useQueueUpdates } from '../useQueueUpdates';

const REFRESH_EVERY_MS = 5_000;

export default function CounterPage() {
  const { queueId } = useParams();

  const [counterName, setCounterName] = useState(loadCounterName);
  const [counterInput, setCounterInput] = useState(loadCounterName);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const { changeCount, liveStatus } = useQueueUpdates(queueId);
  const shouldPoll = liveStatus === 'reconnecting' || liveStatus === 'offline';

  useEffect(() => {
    if (!queueId || !counterName) {
      return;
    }

    const id = queueId;
    const counter = counterName;
    let stopped = false;

    async function refresh() {
      try {
        const latest = await getDashboard(id, counter);

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
  }, [queueId, counterName, reloadCount, changeCount, shouldPoll]);

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
      const called = await callNext(id, counterName);

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

  function handleCounterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = counterInput.trim();

    if (!name) {
      return;
    }

    saveCounterName(name);
    setDashboard(null);
    setCounterName(name);
  }

  if (!counterName) {
    return (
      <main className="page">
        <h1>Which counter are you?</h1>
        <form onSubmit={handleCounterSubmit} className="join-form">
          <label htmlFor="counter-name">Counter name</label>
          <input
            id="counter-name"
            type="text"
            maxLength={50}
            placeholder="Counter 1"
            value={counterInput}
            onChange={(event) => setCounterInput(event.target.value)}
          />
          <button type="submit">Start serving</button>
        </form>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="page">
        {loadError ? <p className="error" role="alert">{loadError}</p> : <p className="muted">Loading…</p>}
      </main>
    );
  }

  const serving = dashboard.nowServing !== null;
  const status = dashboard.queue.status;
  const id = dashboard.queue.id;

  return (
    <main className="page page-wide">
      <ConnectionNotice liveStatus={liveStatus} />
      <header className="counter-header">
        <h1>{dashboard.queue.name}</h1>
        <p className="muted">
          {counterName} · {dashboard.queue.status} ·{' '}
          <button type="button" className="link" onClick={() => setCounterName('')}>
            Change counter
          </button>
        </p>
      </header>

      <p className="counts">
        Waiting {dashboard.waiting.length} · Served {dashboard.servedToday} · Skipped {dashboard.skipped.length}
      </p>

      <NowServing
        token={dashboard.nowServing}
        busy={busy}
        onServe={(tokenId) => runAction(() => serveToken(tokenId))}
        onSkip={(tokenId) => runAction(() => skipToken(tokenId))}
      />

      <button type="button" className="call-next" disabled={busy || serving} onClick={handleCallNext}>
        Call next
      </button>

      <div aria-live="polite">
        {notice && <p className="notice">{notice}</p>}
        {actionError && <p className="error" role="alert">{actionError}</p>}
        {loadError && <p className="error" role="alert">{loadError}</p>}
      </div>

      <section className="panel">
        <h2>Queue</h2>
        <div className="actions">
          <button type="button" className="secondary" disabled={busy || status !== 'Open'} onClick={handleWalkIn}>
            Walk-in token
          </button>
          {status === 'Open' && (
            <button type="button" className="secondary" disabled={busy} onClick={() => runAction(() => pauseQueue(id))}>
              Pause
            </button>
          )}
          {status !== 'Open' && (
            <button type="button" className="secondary" disabled={busy} onClick={() => runAction(() => openQueue(id))}>
              Open
            </button>
          )}
          {status !== 'Closed' && (
            <button type="button" className="secondary" disabled={busy} onClick={handleClose}>
              Close for today
            </button>
          )}
        </div>
      </section>

      <div className="lists">
        <TokenList title="Waiting" tokens={dashboard.waiting} emptyText="No one is waiting." />
        <TokenList
          title="Skipped"
          tokens={dashboard.skipped}
          emptyText="No skipped tokens."
          actionLabel="Recall"
          busy={busy || serving}
          onAction={(tokenId) => runAction(() => recallToken(tokenId, counterName))}
        />
      </div>
    </main>
  );
}
