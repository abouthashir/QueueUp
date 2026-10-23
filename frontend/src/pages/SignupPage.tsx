import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { signup, type SignupDetails } from '../api';
import { saveAuth } from '../authStorage';

export default function SignupPage() {
  const navigate = useNavigate();

  const [details, setDetails] = useState<SignupDetails>({
    businessName: '',
    name: '',
    email: '',
    password: '',
    counterName: 'Counter 1',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update(field: keyof SignupDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      saveAuth(await signup(details));
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <h1>Create your QueueUp account</h1>

      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="business-name">Business name</label>
        <input
          id="business-name"
          type="text"
          autoComplete="organization"
          required
          maxLength={100}
          value={details.businessName}
          onChange={(event) => update('businessName', event.target.value)}
        />

        <label htmlFor="name">Your name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          value={details.name}
          onChange={(event) => update('name', event.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          value={details.email}
          onChange={(event) => update('email', event.target.value)}
        />

        <label htmlFor="password">Password (at least 8 characters)</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={details.password}
          onChange={(event) => update('password', event.target.value)}
        />

        <label htmlFor="counter-name">Your counter name</label>
        <input
          id="counter-name"
          type="text"
          required
          maxLength={50}
          value={details.counterName}
          onChange={(event) => update('counterName', event.target.value)}
        />

        <button type="submit" disabled={busy}>
          {busy ? 'Creating your account…' : 'Create account'}
        </button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
