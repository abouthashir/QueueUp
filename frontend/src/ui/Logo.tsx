import styles from './Logo.module.css';

interface LogoProps {
  tone?: 'ink' | 'paper';
}

export default function Logo({ tone = 'ink' }: LogoProps) {
  return (
    <span className={`${styles.logo} ${styles[tone]}`}>
      <span className={styles.mark} aria-hidden="true" />
      QueueUp
    </span>
  );
}
