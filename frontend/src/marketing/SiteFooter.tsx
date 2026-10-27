import { Link } from 'react-router';
import Logo from '../ui/Logo';
import styles from './SiteFooter.module.css';

const YEAR = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container grid-12 ${styles.top}`}>
        <div className={styles.brand}>
          <Logo />
          <p>Digital queue tokens for clinics, banks and salons.</p>
        </div>

        <nav aria-label="Product" className={styles.column}>
          <h2 className="label">Product</h2>
          <a href="#customers">For customers</a>
          <a href="#staff">For staff</a>
          <a href="#how">How it works</a>
          <a href="#fair">Fair &amp; private</a>
        </nav>

        <nav aria-label="Account" className={styles.column}>
          <h2 className="label">Account</h2>
          <Link to="/signup">Create an account</Link>
          <Link to="/login">Log in</Link>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {YEAR} QueueUp</p>
        <p>Free to start. No card needed.</p>
      </div>

      <p className={styles.wordmark} aria-hidden="true">
        QueueUp
      </p>
    </footer>
  );
} 
