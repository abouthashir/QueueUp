import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { login } from '../api';
import { loadAuth, saveAuth } from '../authStorage';

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
    <main className="page">
      <h1>Log in</h1>
      {searchParams.has('expired') && <p className="notice">Your session has ended. Please log in again.</p>}

      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <p>
        New to QueueUp? <Link to="/signup">Create an account</Link>
      </p>
    </main>
  );
}
