import { useEffect, useState, type FormEvent } from 'react';
import { createStaff, getStaff, removeStaff, updateStaff, type NewStaff, type StaffMember } from '../api';
import StaffHeader from '../components/StaffHeader';
import StaffRow from '../components/StaffRow';

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

  return (
    <main className="page page-wide">
      <StaffHeader />
      <h1>Staff</h1>

      {!staff && !error && <p className="muted">Loading…</p>}
      {staff && staff.length === 0 && <p className="muted">No staff yet. Add your first team member below.</p>}

      {staff && staff.length > 0 && (
        <ul className="queue-list">
          {staff.map((member) => (
            <StaffRow key={member.id} staff={member} busy={busy} onSave={handleSave} onRemove={handleRemove} />
          ))}
        </ul>
      )}

      <div aria-live="polite">
        {notice && <p className="notice">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>

      <section className="panel">
        <h2>Add staff</h2>
        <form onSubmit={handleAdd} className="form">
          <label htmlFor="staff-name">Name</label>
          <input
            id="staff-name"
            type="text"
            required
            maxLength={100}
            value={newStaff.name}
            onChange={(event) => update('name', event.target.value)}
          />

          <label htmlFor="staff-email">Email</label>
          <input
            id="staff-email"
            type="email"
            required
            maxLength={200}
            value={newStaff.email}
            onChange={(event) => update('email', event.target.value)}
          />

          <label htmlFor="staff-password">Starting password (at least 8 characters)</label>
          <input
            id="staff-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newStaff.password}
            onChange={(event) => update('password', event.target.value)}
          />

          <label htmlFor="staff-counter">Counter</label>
          <input
            id="staff-counter"
            type="text"
            required
            maxLength={50}
            placeholder="Counter 2"
            value={newStaff.counterName}
            onChange={(event) => update('counterName', event.target.value)}
          />

          <button type="submit" disabled={busy}>
            {busy ? 'Adding…' : 'Add staff'}
          </button>
        </form>
      </section>
    </main>
  );
}
