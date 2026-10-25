import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { getMyQueues, updateQueue, type QueueOverview } from '../api';
import StaffHeader from '../components/StaffHeader';
import { parseDailyLimit } from '../limits';

export default function QueueSettingsPage() {
  const { queueId } = useParams();

  const [queue, setQueue] = useState<QueueOverview | null>(null);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stopped = false;

    async function load() {
      try {
        const found = (await getMyQueues()).find((mine) => mine.id === queueId);

        if (stopped) {
          return;
        }

        if (!found) {
          setError('This queue was not found.');
          return;
        }

        setQueue(found);
        setName(found.name);
        setMinutes(String(found.averageServiceMinutes));
        setDailyLimit(found.dailyTokenLimit === null ? '' : String(found.dailyTokenLimit));
      } catch (e) {
        if (!stopped) {
          setError((e as Error).message);
        }
      }
    }

    load();

    return () => {
      stopped = true;
    };
  }, [queueId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!queue) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      setQueue(await updateQueue(queue.id, name, Number(minutes), parseDailyLimit(dailyLimit)));
      setNotice('Saved.');
    } catch (e) {
      setError((e as Error).message);
    }

    setBusy(false);
  }

  return (
    <main className="page page-wide">
      <StaffHeader />
      <h1>{queue ? queue.name : 'Queue settings'}</h1>

      {!queue && !error && <p className="muted">Loading…</p>}

      {queue && (
        <>
          <p className="muted">
            Token letter {queue.prefix} · {queue.status}
          </p>

          <form onSubmit={handleSubmit} className="form panel">
            <label htmlFor="queue-name">Name</label>
            <input
              id="queue-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <label htmlFor="queue-minutes">Average minutes per customer</label>
            <input
              id="queue-minutes"
              type="number"
              required
              min={1}
              max={120}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />

            <label htmlFor="queue-limit">Daily token limit (optional)</label>
            <input
              id="queue-limit"
              type="number"
              min={1}
              max={1000}
              placeholder="No limit"
              value={dailyLimit}
              onChange={(event) => setDailyLimit(event.target.value)}
            />

            <button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </form>

          <section className="panel">
            <h2>Share this queue</h2>
            <div className="actions">
              <Link className="button-link" to={`/queues/${queue.id}/poster`}>
                QR poster
              </Link>
              <Link className="button-link secondary" to={`/display/${queue.id}`}>
                TV display
              </Link>
            </div>
          </section>
        </>
      )}

      <div aria-live="polite">
        {notice && <p className="notice">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </main>
  );
}
