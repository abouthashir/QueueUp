import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { login } from '../api';
import AuthLayout from '../auth/AuthLayout';
import { loadAuth, saveAuth } from '../authStorage';
import { Button } from '../ui/Button';
import TextField from '../ui/TextField';
import styles from '../auth/AuthForm.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      saveAuth(await login(email, password));
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (loadAuth()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Log in"
      footer={
        <>
          New to QueueUp? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      {searchParams.has('expired') && <p className={styles.notice}>Your session has ended. Please log in again.</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" size="lg" block disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </AuthLayout>
  );
}
