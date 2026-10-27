import Logo from './Logo';
import styles from './StatusScreen.module.css';

interface StatusScreenProps {
  message: string;
  error?: boolean;
  dark?: boolean;
}

export default function StatusScreen({ message, error = false, dark = false }: StatusScreenProps) {
  return (
    <main className={`${styles.screen} ${dark ? styles.dark : ''}`}>
      <Logo tone={dark ? 'paper' : 'ink'} />
      <p className={error ? styles.error : styles.message} role={error ? 'alert' : 'status'}>
        {message}
      </p>
    </main>
  );
}
