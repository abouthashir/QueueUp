import { useEffect, useState, type FormEvent } from 'react';
import { createQueue, getMyQueues, type QueueOverview } from '../api';
import AppShell, { ShellMessage } from '../app/AppShell';
import { loadAuth } from '../authStorage';
import { parseDailyLimit } from '../limits';
import { Button, ButtonLink } from '../ui/Button';
import Icon from '../ui/Icon';
import QueueStatusBadge from '../ui/QueueStatusBadge';
import TextField from '../ui/TextField';
import styles from './QueuesPage.module.css';

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

  if (!queues) {
    return (
      <AppShell>
        <ShellMessage message={error ?? 'Loading…'} error={error !== null} />
      </AppShell>
    );
  }

  const letter = prefix.toUpperCase() || 'A';

  return (
    <AppShell>
      <div className={styles.page}>
        <header>
          <h1 className={styles.title}>Queues</h1>
          <p className={styles.intro}>Open a counter to start calling people.</p>
        </header>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {queues.length === 0 ? (
          <p className={styles.empty}>
            {isOwner ? 'No queues yet. Create your first one below.' : 'No queues yet. Ask the owner to create one.'}
          </p>
        ) : (
          <ul className={styles.cards}>
            {queues.map((queue) => (
              <li key={queue.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>{queue.name}</h2>
                  <QueueStatusBadge status={queue.status} />
                </div>
                <p className={styles.cardMeta}>
                  Letter {queue.prefix} · about {queue.averageServiceMinutes} min per customer
                </p>

                <p className={styles.waiting}>
                  <span className="num">{queue.peopleWaiting}</span>
                  waiting
                </p>

                <dl className={styles.today}>
                  <div>
                    <dt>Issued</dt>
                    <dd className="num">
                      {queue.issuedToday}
                      {queue.dailyTokenLimit !== null && <small> / {queue.dailyTokenLimit}</small>}
                    </dd>
                  </div>
                  <div>
                    <dt>Served</dt>
                    <dd className="num">{queue.servedToday}</dd>
                  </div>
                  <div>
                    <dt>No-shows</dt>
                    <dd className="num">{queue.noShowsToday}</dd>
                  </div>
                </dl>

                <div className={styles.actions}>
                  <ButtonLink to={`/counter/${queue.id}`} block>
                    Open counter
                    <Icon name="arrow" size={18} />
                  </ButtonLink>
                  <ButtonLink to={`/q/${queue.id}`} variant="outline">
                    Customer page
                  </ButtonLink>
                  {isOwner && (
                    <ButtonLink to={`/queues/${queue.id}`} variant="ghost">
                      Settings
                    </ButtonLink>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {isOwner && (
          <section className={styles.create} aria-labelledby="new-queue">
            <h2 id="new-queue" className={styles.createTitle}>
              New queue
            </h2>
            <form onSubmit={handleCreate} className={styles.form}>
              <TextField
                id="queue-name"
                label="Name"
                className={styles.wide}
                required
                maxLength={100}
                placeholder="General OPD"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <TextField
                id="queue-prefix"
                label="Token letter"
                hint={`Tokens will read ${letter}-001, ${letter}-002…`}
                required
                maxLength={1}
                pattern="[A-Za-z]"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
              />
              <TextField
                id="queue-minutes"
                label="Minutes per customer"
                hint="On average. Used for wait times."
                type="number"
                required
                min={1}
                max={120}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
              <TextField
                id="queue-limit"
                label="Daily token limit"
                optional
                hint="Leave empty for no limit."
                type="number"
                min={1}
                max={1000}
                value={dailyLimit}
                onChange={(event) => setDailyLimit(event.target.value)}
              />
              <Button type="submit" className={styles.submit} disabled={busy}>
                {busy ? 'Creating…' : 'Create queue'}
              </Button>
            </form>
          </section>
        )}
      </div>
    </AppShell>
  );
}
