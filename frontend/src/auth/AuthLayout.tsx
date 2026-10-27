import type { ReactNode } from 'react';
import { Link } from 'react-router';
import Logo from '../ui/Logo';
import styles from './AuthLayout.module.css';

const FACTS = [
  'Every phone and the TV board update within 2 seconds.',
  'Two counters never call the same person.',
  'Customer names are erased after 30 days.',
];

interface AuthLayoutProps {
  title: string;
  footer: ReactNode;
  children: ReactNode;
}

export default function AuthLayout({ title, footer, children }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Link to="/" className={styles.home} aria-label="QueueUp home">
          <Logo />
        </Link>

        <div className={styles.body}>
          <h1 className={styles.title}>{title}</h1>
          {children}
          <p className={styles.footer}>{footer}</p>
        </div>
      </main>

      <aside className={styles.panel} aria-label="About QueueUp">
        <p className="label">For the people at the counter</p>
        <p className={styles.statement}>One click calls the next person.</p>
        <ul className={styles.facts}>
          {FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
