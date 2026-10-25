import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getJoinInfo, getToken, joinQueue, type JoinInfo } from '../api';
import { forgetTokenId, loadTokenId, saveTokenId } from '../tokenStorage';

export default function JoinPage() {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!queueId) {
      return;
    }

    const id = queueId;

    async function load() {
      const savedTokenId = loadTokenId(id);

      if (savedTokenId) {
        const saved = await getToken(savedTokenId).catch(() => null);

        if (saved && (saved.status === 'Waiting' || saved.status === 'Called' || saved.status === 'Skipped')) {
          navigate(`/t/${saved.id}`, { replace: true });
          return;
        }

        forgetTokenId(id);
      }

      try {
        setInfo(await getJoinInfo(id));
      } catch (e) {
        setError((e as Error).message);
      }
    }

    load();
  }, [queueId, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!queueId) {
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const token = await joinQueue(queueId, customerName);
      saveTokenId(queueId, token.id);
      navigate(`/t/${token.id}`);
    } catch (e) {
      setError((e as Error).message);
      setJoining(false);
    }
  }

  if (error && !info) {
    return (
      <main className="page">
        <p className="error" role="alert">{error}</p>
      </main>
    );
  }

  if (!info) {
    return (
      <main className="page">
        <p className="muted">Loading…</p>
      </main>
    );
  }

  const { queue, business } = info;

  return (
    <main className="page">
      <p className="business-name">{business.name}</p>
      <h1>{queue.name}</h1>
      {business.address && <p className="muted">{business.address}</p>}
      {business.openingHours && <p className="muted">Open {business.openingHours}</p>}

      {queue.status === 'Open' && (
        <>
          <p className="summary">
            {queue.peopleWaiting} {queue.peopleWaiting === 1 ? 'person' : 'people'} waiting · about{' '}
            {queue.estimatedWaitMinutes} min
          </p>

          <form onSubmit={handleSubmit} className="form">
            <label htmlFor="customer-name">Your name (optional)</label>
            <input
              id="customer-name"
              type="text"
              autoComplete="given-name"
              maxLength={100}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />

            <button type="submit" disabled={joining}>
              {joining ? 'Getting your token…' : 'Get token'}
            </button>
          </form>
        </>
      )}

      {queue.status === 'Paused' && <p className="notice">The queue is paused. Back soon.</p>}
      {queue.status === 'Closed' && <p className="notice">The queue is closed for today.</p>}

      {error && <p className="error" role="alert">{error}</p>}
    </main>
  );
}
