import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { createQueue, getMyQueues, type QueueOverview } from '../api';
import { loadAuth } from '../authStorage';
import StaffHeader from '../components/StaffHeader';
import { parseDailyLimit } from '../limits';

export default function QueuesPage() {
  const isOwner = loadAuth()?.role === 'Owner';

  const [queues, setQueues] = useState<QueueOverview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('A');
  const [minutes, setMinutes] = useState('5');
  const [dailyLimit, setDailyLimit] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stopped = false;

    async function load() {
      try {
        const mine = await getMyQueues();

        if (!stopped) {
          setQueues(mine);
          setError(null);
        }
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
  }, [reloadCount]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await createQueue({
        name,
        prefix,
        averageServiceMinutes: Number(minutes),
        dailyTokenLimit: parseDailyLimit(dailyLimit),
      });
      setName('');
      setReloadCount((count) => count + 1);
    } catch (e) {
      setError((e as Error).message);
    }

    setBusy(false);
  }

  return (
    <main className="page page-wide">
      <StaffHeader />
      <h1>Your queues</h1>

      {!queues && !error && <p className="muted">Loading…</p>}

      {queues && queues.length === 0 && (
        <p className="muted">
          {isOwner ? 'No queues yet. Create your first one below.' : 'No queues yet. Ask the owner to create one.'}
        </p>
      )}

      {queues && queues.length > 0 && (
        <ul className="queue-list">
          {queues.map((queue) => (
            <li key={queue.id} className="panel">
              <h2>{queue.name}</h2>
              <p className="muted">
                {queue.prefix} · {queue.status} · {queue.peopleWaiting} waiting
              </p>
              <p className="counts">
                Today: {queue.issuedToday} issued · {queue.servedToday} served · {queue.noShowsToday} no-shows
              </p>
              <div className="actions">
                <Link className="button-link" to={`/counter/${queue.id}`}>
                  Open counter
                </Link>
                <Link className="button-link secondary" to={`/q/${queue.id}`}>
                  Customer page
                </Link>
                {isOwner && (
                  <Link className="button-link secondary" to={`/queues/${queue.id}`}>
                    Settings
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      {isOwner && (
        <section className="panel">
          <h2>New queue</h2>
          <form onSubmit={handleCreate} className="form">
            <label htmlFor="queue-name">Name</label>
            <input
              id="queue-name"
              type="text"
              required
              maxLength={100}
              placeholder="General OPD"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <label htmlFor="queue-prefix">Token letter</label>
            <input
              id="queue-prefix"
              type="text"
              required
              maxLength={1}
              pattern="[A-Za-z]"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
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
              {busy ? 'Creating…' : 'Create queue'}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
