import { SAMPLE_WAITING } from '../marketing/samples';
import TokenCard from '../token/TokenCard';
import Logo from '../ui/Logo';
import styles from './ShareCard.module.css';

// The picture LinkedIn, WhatsApp and X show when someone shares a QueueUp link.
export default function ShareCard() {
  return (
    <main className={styles.card}>
      <div>
        <div className={styles.brand}>
          <Logo />
        </div>
        <h1 className={styles.title}>
          Wait anywhere.
          <span className={styles.muted}>Arrive on time.</span>
        </h1>
        <p className={styles.lead}>Digital queue tokens for clinics, banks and salons. No app, no sign-up.</p>
      </div>
      <TokenCard token={SAMPLE_WAITING} />
    </main>
  );
}
