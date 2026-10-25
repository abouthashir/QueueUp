import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { playChime, unlockSound } from '../alerts';
import { getDisplay, type DisplayInfo } from '../api';
import ConnectionNotice from '../components/ConnectionNotice';
import { useQueueUpdates } from '../useQueueUpdates';

const REFRESH_EVERY_MS = 15_000;

function callKeys(info: DisplayInfo): string[] {
  return info.nowServing.map((serving) => `${serving.counterName}:${serving.displayNumber}`);
}

export default function DisplayPage() {
  const { queueId } = useParams();

  const [info, setInfo] = useState<DisplayInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const previousCalls = useRef<string[] | null>(null);
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
        const latest = await getDisplay(id);

        if (!stopped) {
          setInfo(latest);
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
  }, [queueId, changeCount, shouldPoll]);

  useEffect(() => {
    if (!info) {
      return;
    }

    const calls = callKeys(info);
    const before = previousCalls.current;
    previousCalls.current = calls;

    if (started && before && calls.some((call) => !before.includes(call))) {
      playChime();
    }
  }, [info, started]);

  function handleStart() {
    unlockSound();
    setStarted(true);
    document.documentElement.requestFullscreen?.().catch(() => {
      // Full screen is optional; the board still works in a normal window.
    });
  }

  if (!info) {
    return (
      <main className="display">
        {error ? <p role="alert">{error}</p> : <p>Loading…</p>}
      </main>
    );
  }

  return (
    <main className="display">
      <ConnectionNotice liveStatus={liveStatus} />
      <header className="display-header">
        <p>{info.businessName}</p>
        <h1>{info.queueName}</h1>
      </header>

      {info.status !== 'Open' && (
        <p className="display-status">{info.status === 'Paused' ? 'Paused. Back soon.' : 'Closed for today.'}</p>
      )}

      <section aria-label="Now serving" aria-live="polite">
        <h2>Now serving</h2>
        {info.nowServing.length === 0 ? (
          <p className="display-empty">Please wait for your number.</p>
        ) : (
          <ul className="display-serving">
            {info.nowServing.map((serving) => (
              <li key={serving.counterName}>
                <span className="display-number">{serving.displayNumber}</span>
                <span className="display-counter">{serving.counterName}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Next">
        <h2>Next</h2>
        <p className="display-next">{info.next.length > 0 ? info.next.join('   ') : 'No one waiting'}</p>
        <p>{info.peopleWaiting} waiting</p>
      </section>

      {!started && (
        <button type="button" className="display-start" onClick={handleStart}>
          Start display
        </button>
      )}
    </main>
  );
}
