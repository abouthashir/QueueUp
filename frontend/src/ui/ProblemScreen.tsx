import type { ReactNode } from 'react';
import Logo from './Logo';
import styles from './ProblemScreen.module.css';

interface ProblemScreenProps {
  title: string;
  message: string;
  children: ReactNode;
}

export default function ProblemScreen({ title, message, children }: ProblemScreenProps) {
  return (
    <main className={styles.screen}>
      <Logo />
      <div className={styles.body}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.action}>{children}</div>
      </div>
    </main>
  );
}
