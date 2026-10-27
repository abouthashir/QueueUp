import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router';
import { getMyQueues, updateQueue, type QueueOverview } from '../api';
import AppShell, { ShellMessage } from '../app/AppShell';
import { parseDailyLimit } from '../limits';
import { Button, ButtonLink } from '../ui/Button';
import Icon from '../ui/Icon';
import QueueStatusBadge from '../ui/QueueStatusBadge';
import TextField from '../ui/TextField';
import styles from '../app/OwnerPage.module.css';

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

  if (!queue) {
    return (
      <AppShell>
        <ShellMessage message={error ?? 'Loading…'} error={error !== null} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <header>
          <p className={`label ${styles.kicker}`}>Queue settings</p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{queue.name}</h1>
            <QueueStatusBadge status={queue.status} />
          </div>
          <p className={styles.intro}>Tokens in this queue start with the letter {queue.prefix}.</p>
        </header>

        <div aria-live="polite" className={styles.messages}>
          {notice && <p className={styles.notice}>{notice}</p>}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.panels}>
          <section className={styles.panel} aria-labelledby="details-title">
            <h2 id="details-title" className={styles.panelTitle}>
              Details
            </h2>
            <form onSubmit={handleSubmit} className={`${styles.form} ${styles.columns}`}>
              <TextField
                id="queue-name"
                label="Name"
                className={styles.wide}
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
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
              <div className={styles.formActions}>
                <Button type="submit" disabled={busy}>
                  {busy ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </section>

          <section className={styles.panel} aria-labelledby="share-title">
            <h2 id="share-title" className={styles.panelTitle}>
              Share this queue
            </h2>
            <ul className={styles.list}>
              <li className={styles.share}>
                <div>
                  <h3>QR poster</h3>
                  <p>Print it and put it where people arrive.</p>
                </div>
                <ButtonLink to={`/queues/${queue.id}/poster`} variant="outline">
                  Open
                  <Icon name="arrow" size={18} />
                </ButtonLink>
              </li>
              <li className={styles.share}>
                <div>
                  <h3>TV display</h3>
                  <p>Open it on the screen in your waiting room.</p>
                </div>
                <ButtonLink to={`/display/${queue.id}`} variant="outline">
                  Open
                  <Icon name="arrow" size={18} />
                </ButtonLink>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
