import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getJoinInfo, getToken, joinQueue, type JoinInfo } from '../api';
import { forgetTokenId, loadTokenId, saveTokenId } from '../tokenStorage';
import { Button } from '../ui/Button';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import QueueStatusBadge from '../ui/QueueStatusBadge';
import StatusScreen from '../ui/StatusScreen';
import TextField from '../ui/TextField';
import styles from './JoinPage.module.css';

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

  if (!info) {
    return error ? <StatusScreen message={error} error /> : <StatusScreen message="Loading…" />;
  }

  const { queue, business } = info;
  const details = [business.address, business.openingHours && `Open ${business.openingHours}`].filter(Boolean);

  return (
    <div className={styles.screen}>
      <header className={styles.bar}>
        <Logo />
        <QueueStatusBadge status={queue.status} />
      </header>

      <main className={styles.main}>
        <p className={`label ${styles.business}`}>{business.name}</p>
        <h1 className={styles.title}>{queue.name}</h1>
        {details.length > 0 && <p className={styles.meta}>{details.join(' · ')}</p>}

        {queue.status === 'Open' && (
          <>
            <dl className={styles.wait}>
              <div>
                <dt>Waiting</dt>
                <dd className="num">{queue.peopleWaiting}</dd>
              </div>
              <div>
                <dt>About</dt>
                <dd className="num">
                  {queue.estimatedWaitMinutes}
                  <small> min</small>
                </dd>
              </div>
            </dl>

            <form onSubmit={handleSubmit} className={styles.form}>
              <TextField
                id="customer-name"
                label="Your name"
                optional
                hint="So staff can greet you. Names are erased after 30 days."
                autoComplete="given-name"
                maxLength={100}
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />

              <Button type="submit" size="lg" block disabled={joining}>
                {joining ? 'Getting your token…' : 'Get a token'}
                {!joining && <Icon name="arrow" size={18} />}
              </Button>
            </form>
          </>
        )}

        {queue.status === 'Paused' && <p className={styles.notice}>The queue is paused. It will open again soon.</p>}
        {queue.status === 'Closed' && <p className={styles.notice}>The queue is closed for today.</p>}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
