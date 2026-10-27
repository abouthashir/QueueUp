import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { forgetAuth, loadAuth } from '../authStorage';
import Icon, { type IconName } from '../ui/Icon';
import Logo from '../ui/Logo';
import styles from './AppShell.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  ownerOnly: boolean;
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Queues', icon: 'grid', ownerOnly: false },
  { to: '/staff', label: 'Staff', icon: 'users', ownerOnly: true },
  { to: '/business', label: 'Business', icon: 'building', ownerOnly: true },
];

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const auth = loadAuth();

  function handleLogout() {
    forgetAuth();
    navigate('/login', { replace: true });
  }

  const items = NAV.filter((item) => !item.ownerOnly || auth?.role === 'Owner');

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <div className={styles.brand}>
          <Link to="/dashboard" aria-label="QueueUp home">
            <Logo />
          </Link>
          {auth && <p className={styles.business}>{auth.businessName}</p>}
        </div>

        <nav className={styles.nav} aria-label="Main">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? styles.active : undefined)}>
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {auth && (
          <div className={styles.user}>
            <span className={styles.avatar} aria-hidden="true">
              {auth.name.slice(0, 1).toUpperCase()}
            </span>
            <span className={styles.who}>
              <strong>{auth.name}</strong>
              <span>{auth.counterName}</span>
            </span>
            <button type="button" className={styles.logout} onClick={handleLogout} aria-label="Log out">
              <Icon name="logout" />
            </button>
          </div>
        )}
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}

interface ShellMessageProps {
  message: string;
  error?: boolean;
}

// Loading and error text inside the app frame.
export function ShellMessage({ message, error = false }: ShellMessageProps) {
  return (
    <p className={error ? styles.error : styles.message} role={error ? 'alert' : 'status'}>
      {message}
    </p>
  );
}
