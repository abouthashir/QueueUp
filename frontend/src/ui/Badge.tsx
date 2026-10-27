import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'live' | 'turn' | 'paused' | 'closed';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  pulse?: boolean;
}

export default function Badge({ children, tone = 'neutral', pulse = false }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <span className={`${styles.dot} ${pulse ? styles.pulse : ''}`} aria-hidden="true" />
      {children}
    </span>
  );
}
