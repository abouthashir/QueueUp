import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { signup, type SignupDetails } from '../api';
import AuthLayout from '../auth/AuthLayout';
import { saveAuth } from '../authStorage';
import { Button } from '../ui/Button';
import TextField from '../ui/TextField';
import styles from '../auth/AuthForm.module.css';

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
    <AuthLayout
      title="Create your account"
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          id="business-name"
          label="Business name"
          autoComplete="organization"
          required
          maxLength={100}
          value={details.businessName}
          onChange={(event) => update('businessName', event.target.value)}
        />
        <TextField
          id="name"
          label="Your name"
          autoComplete="name"
          required
          maxLength={100}
          value={details.name}
          onChange={(event) => update('name', event.target.value)}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          value={details.email}
          onChange={(event) => update('email', event.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          hint="At least 8 characters."
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={details.password}
          onChange={(event) => update('password', event.target.value)}
        />
        <TextField
          id="counter-name"
          label="Your counter name"
          hint="Customers see it when you call them, for example Counter 1 or Room 2."
          required
          maxLength={50}
          value={details.counterName}
          onChange={(event) => update('counterName', event.target.value)}
        />
        <Button type="submit" size="lg" block disabled={busy}>
          {busy ? 'Creating your account…' : 'Create account'}
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
