import { useState } from 'react';
import { Link } from 'react-router';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import styles from './SiteHeader.module.css';

const SECTIONS = [
  { href: '#customers', label: 'Customers' },
  { href: '#staff', label: 'Staff' },
  { href: '#how', label: 'How it works' },
  { href: '#fair', label: 'Fair & private' },
];

interface SiteHeaderProps {
  loggedIn: boolean;
}

export default function SiteHeader({ loggedIn }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.home} aria-label="QueueUp home">
        <Logo />
      </Link>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close' : 'Menu'}
        <Icon name={open ? 'close' : 'menu'} size={18} />
      </button>

      <nav id="site-menu" className={`${styles.menu} ${open ? styles.open : ''}`} aria-label="Main">
        {SECTIONS.map((section) => (
          <a key={section.href} href={section.href} onClick={close}>
            {section.label}
          </a>
        ))}
        {!loggedIn && (
          <Link to="/login" onClick={close}>
            Log in
          </Link>
        )}
        <Link to={loggedIn ? '/dashboard' : '/signup'} className={styles.cta} onClick={close}>
          {loggedIn ? 'Your queues' : 'Start free'}
        </Link>
      </nav>
    </header>
  );
}
