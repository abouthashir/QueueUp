import type { TokenInfo } from '../api';
import type { LiveStatus } from '../useQueueUpdates';
import { Button } from '../ui/Button';
import Icon from '../ui/Icon';
import LiveLabel from '../ui/LiveLabel';
import Logo from '../ui/Logo';
import TokenCard from './TokenCard';
import styles from './TokenView.module.css';

interface TokenViewProps {
  token: TokenInfo;
  liveStatus: LiveStatus;
  alertsOn: boolean;
  error: string | null;
  onEnableAlerts: () => void;
  onLeave: () => void;
}

export default function TokenView({ token, liveStatus, alertsOn, error, onEnableAlerts, onLeave }: TokenViewProps) {
  const waiting = token.status === 'Waiting';
  const called = token.status === 'Called';

  return (
    <div className={`${styles.screen} ${called ? styles.turn : ''}`}>
      <header className={styles.bar}>
        <Logo />
        <LiveLabel status={liveStatus} />
      </header>

      <main className={styles.main}>
        <TokenCard token={token} />

        {waiting && alertsOn && (
          <p className={styles.note}>
            <Icon name="bell" size={18} />
            Alerts are on. Keep this page open and we'll chime when it's your turn.
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </main>

      {waiting && (
        <footer className={styles.actions}>
          {!alertsOn && (
            <Button size="lg" block onClick={onEnableAlerts}>
              <Icon name="bell" size={18} />
              Turn on alerts
            </Button>
          )}
          <Button variant="ghost" block onClick={onLeave}>
            Leave queue
          </Button>
        </footer>
      )}
    </div>
  );
}
