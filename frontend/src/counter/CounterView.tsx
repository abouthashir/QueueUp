import type { Dashboard, TokenSummary } from '../api';
import type { LiveStatus } from '../useQueueUpdates';
import { Button } from '../ui/Button';
import Icon from '../ui/Icon';
import LiveLabel from '../ui/LiveLabel';
import QueueStatusBadge from '../ui/QueueStatusBadge';
import styles from './CounterView.module.css';

interface CounterViewProps {
  dashboard: Dashboard;
  liveStatus: LiveStatus;
  busy: boolean;
  notice: string | null;
  errors: string[];
  onCallNext: () => void;
  onServe: (tokenId: string) => void;
  onSkip: (tokenId: string) => void;
  onRecall: (tokenId: string) => void;
  onWalkIn: () => void;
  onPause: () => void;
  onOpen: () => void;
  onClose: () => void;
}

export default function CounterView(props: CounterViewProps) {
  const { dashboard, liveStatus, busy, notice, errors } = props;
  const serving = dashboard.nowServing;
  const status = dashboard.queue.status;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={`label ${styles.counterLabel}`}>{dashboard.counterName}</p>
          <h1 className={styles.title}>{dashboard.queue.name}</h1>
        </div>
        <div className={styles.headMeta}>
          <LiveLabel status={liveStatus} />
          <QueueStatusBadge status={status} />
        </div>
      </header>

      <dl className={styles.stats}>
        <div>
          <dt>Waiting</dt>
          <dd className="num">{dashboard.waiting.length}</dd>
        </div>
        <div>
          <dt>Served today</dt>
          <dd className="num">{dashboard.servedToday}</dd>
        </div>
        <div>
          <dt>Skipped</dt>
          <dd className="num">{dashboard.skipped.length}</dd>
        </div>
      </dl>

      <div className={styles.grid}>
        <section className={styles.stage} aria-labelledby="now-serving">
          <p id="now-serving" className={`label ${styles.stageLabel}`}>
            Now serving
          </p>

          {serving ? (
            <>
              <p className={`${styles.number} num`}>{serving.displayNumber}</p>
              <p className={styles.name}>{serving.customerName ?? 'No name given'}</p>
              <div className={styles.stageActions}>
                <Button variant="light" size="lg" disabled={busy} onClick={() => props.onServe(serving.id)}>
                  Served
                </Button>
                <Button variant="ghost" size="lg" className={styles.onNight} disabled={busy} onClick={() => props.onSkip(serving.id)}>
                  Skip
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className={`${styles.number} ${styles.empty} num`}>—</p>
              <p className={styles.name}>Nobody at your counter.</p>
            </>
          )}

          <div className={styles.callBar}>
            <Button variant="signal" size="lg" block disabled={busy || serving !== null} onClick={props.onCallNext}>
              Call next
              <Icon name="arrow" />
            </Button>
          </div>
        </section>

        <div className={styles.side}>
          <TokenColumn title="Waiting" tokens={dashboard.waiting} emptyText="No one is waiting." />
          <TokenColumn
            title="Skipped"
            tokens={dashboard.skipped}
            emptyText="No skipped tokens."
            actionLabel="Recall"
            disabled={busy || serving !== null}
            onAction={props.onRecall}
          />
        </div>
      </div>

      <div aria-live="polite" className={styles.messages}>
        {notice && <p className={styles.notice}>{notice}</p>}
        {errors.map((error) => (
          <p key={error} className={styles.error} role="alert">
            {error}
          </p>
        ))}
      </div>

      <section className={styles.controls} aria-label="Queue controls">
        <Button variant="outline" disabled={busy || status !== 'Open'} onClick={props.onWalkIn}>
          <Icon name="plus" size={18} />
          Walk-in token
        </Button>
        {status === 'Open' ? (
          <Button variant="outline" disabled={busy} onClick={props.onPause}>
            <Icon name="pause" size={18} />
            Pause
          </Button>
        ) : (
          <Button variant="outline" disabled={busy} onClick={props.onOpen}>
            <Icon name="play" size={18} />
            Open
          </Button>
        )}
        {status !== 'Closed' && (
          <Button variant="ghost" className={styles.danger} disabled={busy} onClick={props.onClose}>
            <Icon name="stop" size={18} />
            Close for today
          </Button>
        )}
      </section>
    </div>
  );
}

interface TokenColumnProps {
  title: string;
  tokens: TokenSummary[];
  emptyText: string;
  actionLabel?: string;
  disabled?: boolean;
  onAction?: (tokenId: string) => void;
}

function TokenColumn({ title, tokens, emptyText, actionLabel, disabled, onAction }: TokenColumnProps) {
  return (
    <section className={styles.column}>
      <h2 className={styles.columnTitle}>
        {title}
        <span className="num">{tokens.length}</span>
      </h2>

      {tokens.length === 0 ? (
        <p className={styles.columnEmpty}>{emptyText}</p>
      ) : (
        <ol className={styles.list}>
          {tokens.map((token) => (
            <li key={token.id}>
              <span className={`${styles.listNumber} num`}>{token.displayNumber}</span>
              <span className={styles.listName}>{token.customerName ?? 'No name'}</span>
              {actionLabel && onAction && (
                <Button variant="outline" disabled={disabled} onClick={() => onAction(token.id)}>
                  {actionLabel}
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
