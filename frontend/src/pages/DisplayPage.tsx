import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { playChime, unlockSound } from '../alerts';
import { getDisplay, type DisplayInfo } from '../api';
import { Button } from '../ui/Button';
import LiveLabel from '../ui/LiveLabel';
import StatusScreen from '../ui/StatusScreen';
import { useQueueUpdates } from '../useQueueUpdates';
import styles from './DisplayPage.module.css';

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
    return error ? <StatusScreen message={error} error dark /> : <StatusScreen message="Loading…" dark />;
  }

  return (
    <main className={styles.screen}>
      <header className={styles.bar}>
        <div>
          <p className={styles.business}>{info.businessName}</p>
          <h1 className={styles.title}>{info.queueName}</h1>
        </div>
        <LiveLabel status={liveStatus} />
      </header>

      <div className={styles.board}>
        <section aria-labelledby="serving-label" aria-live="polite">
          {info.status !== 'Open' && (
            <p className={styles.status}>{info.status === 'Paused' ? 'Paused. Back soon.' : 'Closed for today.'}</p>
          )}
          <h2 id="serving-label" className={`label ${styles.sectionLabel}`}>
            Now serving
          </h2>
          {info.nowServing.length === 0 ? (
            <p className={styles.empty}>Please wait for your number.</p>
          ) : (
            <ul className={styles.serving}>
              {info.nowServing.map((serving) => (
                <li key={serving.counterName}>
                  <span className={`num ${styles.number}`}>{serving.displayNumber}</span>
                  <span className={styles.counter}>{serving.counterName}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="next-label">
          <h2 id="next-label" className={`label ${styles.sectionLabel}`}>
            Next
          </h2>
          {info.next.length > 0 ? (
            <ol className={styles.next}>
              {info.next.map((number) => (
                <li key={number} className="num">
                  {number}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>No one waiting</p>
          )}
          <p className={styles.waiting}>{info.peopleWaiting} waiting</p>
        </section>
      </div>

      {!started && (
        <div className={styles.start}>
          <div className={styles.startPanel}>
            <h2>Ready for the waiting room?</h2>
            <p>Starting the display turns on the chime for new calls and fills the screen.</p>
            <Button variant="light" size="lg" onClick={handleStart}>
              Start display
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
