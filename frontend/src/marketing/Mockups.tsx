import type { TokenInfo } from '../api';
import TokenCard from '../token/TokenCard';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import { SAMPLE_WAITING } from './samples';
import styles from './Mockups.module.css';

// Product pieces drawn with sample data. They mirror the real screens; they are illustrations, not live data.

const BOARD_ROWS = [
  { number: 'A-039', counter: 'Counter 2' },
  { number: 'A-038', counter: 'Counter 1' },
];

interface BoardMockupProps {
  large?: boolean;
}

export function BoardMockup({ large = false }: BoardMockupProps) {
  return (
    <div className={`${styles.board} ${large ? styles.boardLarge : ''}`} role="img" aria-label="The TV board: A-039 at Counter 2, A-038 at Counter 1">
      <div aria-hidden="true">
        <div className={styles.boardHead}>
          <span className="label">Now serving</span>
          <span className={styles.boardQueue}>General OPD</span>
        </div>
        <ul className={styles.boardRows}>
          {BOARD_ROWS.map((row) => (
            <li key={row.number}>
              <span className="num">{row.number}</span>
              <span>{row.counter}</span>
            </li>
          ))}
        </ul>
        <p className={styles.boardNext}>
          <span className="label">Next</span>
          <span className="num">A-040 · A-041 · A-042</span>
        </p>
      </div>
    </div>
  );
}

interface PhoneMockupProps {
  token?: TokenInfo;
}

// The customer's token page, as it looks on a phone.
export function PhoneMockup({ token = SAMPLE_WAITING }: PhoneMockupProps) {
  return (
    <div className={styles.phone} role="img" aria-label={`A phone showing token ${token.displayNumber}, ${token.peopleAhead} people ahead`}>
      <div className={styles.phoneScreen} aria-hidden="true">
        <div className={styles.phoneBar}>
          <Logo />
          <span className={styles.phoneLive}>Live</span>
        </div>
        <TokenCard token={token} compact />
        <span className={styles.phoneButton}>
          <Icon name="bell" size={16} />
          Turn on alerts
        </span>
        <span className={styles.phoneLink}>Leave queue</span>
      </div>
    </div>
  );
}

// The notification QueueUp shows when a customer becomes next in line.
export function AlertToast() {
  return (
    <div className={styles.toast} role="img" aria-label="Notification: You're next! Token A-042 is first in line.">
      <span className={styles.toastIcon} aria-hidden="true">
        <Icon name="bell" size={18} />
      </span>
      <span aria-hidden="true">
        <strong>You're next!</strong>
        <span>Token A-042 is first in line.</span>
      </span>
    </div>
  );
}
