import { useState, type FormEvent } from 'react';
import type { StaffMember } from '../api';
import { Button } from '../ui/Button';
import TextField from '../ui/TextField';
import styles from './StaffRow.module.css';

interface StaffRowProps {
  staff: StaffMember;
  busy: boolean;
  onSave: (staffId: string, name: string, counterName: string) => void;
  onRemove: (staff: StaffMember) => void;
}

export default function StaffRow({ staff, busy, onSave, onRemove }: StaffRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(staff.name);
  const [counterName, setCounterName] = useState(staff.counterName);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(staff.id, name, counterName);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className={styles.row}>
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <TextField
            id={`name-${staff.id}`}
            label="Name"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            id={`counter-${staff.id}`}
            label="Counter"
            required
            maxLength={50}
            value={counterName}
            onChange={(event) => setCounterName(event.target.value)}
          />
          <div className={styles.actions}>
            <Button type="submit" disabled={busy}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <span className={styles.avatar} aria-hidden="true">
        {staff.name.slice(0, 1).toUpperCase()}
      </span>
      <div className={styles.who}>
        <h3 className={styles.name}>{staff.name}</h3>
        <p className={styles.meta}>
          {staff.counterName} · {staff.email}
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="outline" disabled={busy} onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="ghost" className={styles.danger} disabled={busy} onClick={() => onRemove(staff)}>
          Remove
        </Button>
      </div>
    </li>
  );
}
