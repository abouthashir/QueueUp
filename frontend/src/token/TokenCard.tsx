import type { TokenInfo } from '../api';
import { describeToken, isNext } from '../tokenMessages';
import Badge, { type BadgeTone } from '../ui/Badge';
import styles from './TokenCard.module.css';

interface TokenCardProps {
  token: TokenInfo;
  compact?: boolean;
}

function badgeFor(token: TokenInfo): { label: string; tone: BadgeTone } {
  switch (token.status) {
    case 'Waiting':
      return isNext(token) ? { label: "You're next", tone: 'turn' } : { label: 'Waiting', tone: 'live' };
    case 'Called':
      return { label: 'Your turn', tone: 'turn' };
    case 'Served':
      return { label: 'Done', tone: 'neutral' };
    default:
      return { label: 'Not active', tone: 'closed' };
  }
}

// The token as a printed slip: number on top, a torn perforation, details below.
export default function TokenCard({ token, compact = false }: TokenCardProps) {
  const badge = badgeFor(token);
  const called = token.status === 'Called';
  const waiting = token.status === 'Waiting';
  const next = isNext(token);
  // While waiting, the facts below say it all; the sentence is only for "You're next" and the end states.
  const showMessage = !called && (!waiting || next);

  return (
    <article className={`${styles.slip} ${compact ? styles.compact : ''}`}>
      <div className={styles.top}>
        <div className={styles.head}>
          <span className="label">Token</span>
          <Badge tone={badge.tone} pulse={waiting || called}>
            {badge.label}
          </Badge>
        </div>
        <p className={`${styles.number} num`} aria-label={`Your token number is ${token.displayNumber}`}>
          {token.displayNumber}
        </p>
        <p className={styles.queue}>{token.queueName}</p>
      </div>

      <div className={styles.bottom}>
        {called && (
          <p className={styles.callout} aria-live="polite">
            Please go to <strong>{token.counterName}</strong>
          </p>
        )}

        {showMessage && (
          <p className={styles.message} aria-live="polite">
            {describeToken(token)}
          </p>
        )}

        {waiting && (
          <dl className={styles.facts} aria-live="polite">
            {!next && (
              <>
                <div>
                  <dt>Ahead of you</dt>
                  <dd className="num">{token.peopleAhead}</dd>
                </div>
                <div>
                  <dt>About</dt>
                  <dd className="num">{token.estimatedWaitMinutes} min</dd>
                </div>
              </>
            )}
            <div>
              <dt>Now serving</dt>
              <dd className="num">{token.nowServing.length > 0 ? token.nowServing.join(', ') : '—'}</dd>
            </div>
          </dl>
        )}
      </div>
    </article>
  );
}
