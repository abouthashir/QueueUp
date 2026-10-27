import type { LiveStatus } from '../useQueueUpdates';
import styles from './LiveLabel.module.css';

const LABELS: Record<LiveStatus, string> = {
  connecting: 'Connecting',
  live: 'Live',
  reconnecting: 'Reconnecting',
  offline: 'Checking every few seconds',
};

interface LiveLabelProps {
  status: LiveStatus;
}

// A green breathing dot while updates arrive live; amber while reconnecting or polling.
export default function LiveLabel({ status }: LiveLabelProps) {
  return (
    <span className={`${styles.live} ${status === 'live' ? styles.on : ''}`} role="status">
      <span className={styles.dot} aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
