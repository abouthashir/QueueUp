import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getQueue, type QueueInfo } from '../api';

export default function JoinPage() {
  const { queueId } = useParams();

  const [queue, setQueue] = useState<QueueInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queueId) {
      return;
    }

    const id = queueId;

    async function load() {
      try {
        setQueue(await getQueue(id));
      } catch (e) {
        setError((e as Error).message);
      }
    }

    load();
  }, [queueId]);

  if (error) {
    return (
      <main className="page">
        <p className="error" role="alert">{error}</p>
      </main>
    );
  }

  if (!queue) {
    return (
      <main className="page">
        <p className="muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>{queue.name}</h1>

      {queue.status === 'Open' && (
        <>
          <p className="summary">
            {queue.peopleWaiting} {queue.peopleWaiting === 1 ? 'person' : 'people'} waiting · about{' '}
            {queue.estimatedWaitMinutes} min
          </p>

          <form className="join-form">
            <label htmlFor="customer-name">Your name (optional)</label>
            <input id="customer-name" type="text" autoComplete="given-name" maxLength={100} />

            <button type="submit">Get token</button>
          </form>
        </>
      )}

      {queue.status === 'Paused' && <p className="notice">The queue is paused. Back soon.</p>}
      {queue.status === 'Closed' && <p className="notice">The queue is closed for today.</p>}
    </main>
  );
}
