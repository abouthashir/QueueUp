import { useEffect, useState, type FormEvent } from 'react';
import { createStaff, getStaff, removeStaff, updateStaff, type NewStaff, type StaffMember } from '../api';
import AppShell, { ShellMessage } from '../app/AppShell';
import StaffRow from '../staff/StaffRow';
import { Button } from '../ui/Button';
import TextField from '../ui/TextField';
import styles from '../app/OwnerPage.module.css';

const EMPTY_STAFF: NewStaff = { name: '', email: '', password: '', counterName: '' };

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [newStaff, setNewStaff] = useState<NewStaff>(EMPTY_STAFF);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let stopped = false;

    getStaff()
      .then((loaded) => {
        if (!stopped) {
          setStaff(loaded);
        }
      })
      .catch((e: Error) => {
        if (!stopped) {
          setError(e.message);
        }
      });

    return () => {
      stopped = true;
    };
  }, [reloadCount]);

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      await action();
      setNotice(success);
    } catch (e) {
      setError((e as Error).message);
    }

    setBusy(false);
    setReloadCount((count) => count + 1);
  }

  function update(field: keyof NewStaff, value: string) {
    setNewStaff((current) => ({ ...current, [field]: value }));
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(() => createStaff(newStaff), `${newStaff.name} can now log in with their email and password.`);
    setNewStaff(EMPTY_STAFF);
  }

  function handleSave(staffId: string, name: string, counterName: string) {
    runAction(() => updateStaff(staffId, name, counterName), 'Saved. The change applies the next time they log in.');
  }

  function handleRemove(member: StaffMember) {
    if (!window.confirm(`Remove ${member.name}? They will be logged out and can no longer sign in.`)) {
      return;
    }

    runAction(() => removeStaff(member.id), `${member.name} was removed.`);
  }

  if (!staff) {
    return (
      <AppShell>
        <ShellMessage message={error ?? 'Loading…'} error={error !== null} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <header>
          <h1 className={styles.title}>Staff</h1>
          <p className={styles.intro}>
            Staff can log in, call tokens and run the queue from their counter. Only you can change settings.
          </p>
        </header>

        <div aria-live="polite" className={styles.messages}>
          {notice && <p className={styles.notice}>{notice}</p>}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.panels}>
          <section className={styles.panel} aria-labelledby="team-title">
            <h2 id="team-title" className={styles.panelTitle}>
              Your team
            </h2>
            {staff.length === 0 ? (
              <p className={styles.empty}>No staff yet. Add your first team member here.</p>
            ) : (
              <ul className={styles.list}>
                {staff.map((member) => (
                  <StaffRow key={member.id} staff={member} busy={busy} onSave={handleSave} onRemove={handleRemove} />
                ))}
              </ul>
            )}
          </section>

          <section className={styles.panel} aria-labelledby="add-title">
            <h2 id="add-title" className={styles.panelTitle}>
              Add staff
            </h2>
            <form onSubmit={handleAdd} className={styles.form}>
              <TextField
                id="staff-name"
                label="Name"
                required
                maxLength={100}
                value={newStaff.name}
                onChange={(event) => update('name', event.target.value)}
              />
              <TextField
                id="staff-email"
                label="Email"
                type="email"
                required
                maxLength={200}
                value={newStaff.email}
                onChange={(event) => update('email', event.target.value)}
              />
              <TextField
                id="staff-password"
                label="Starting password"
                hint="At least 8 characters. Share it with them in person."
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newStaff.password}
                onChange={(event) => update('password', event.target.value)}
              />
              <TextField
                id="staff-counter"
                label="Counter"
                required
                maxLength={50}
                placeholder="Counter 2"
                value={newStaff.counterName}
                onChange={(event) => update('counterName', event.target.value)}
              />
              <div className={styles.formActions}>
                <Button type="submit" disabled={busy}>
                  {busy ? 'Adding…' : 'Add staff'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
