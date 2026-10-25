import { useState, type FormEvent } from 'react';
import type { StaffMember } from '../api';

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
      <li className="panel">
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor={`name-${staff.id}`}>Name</label>
          <input
            id={`name-${staff.id}`}
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor={`counter-${staff.id}`}>Counter</label>
          <input
            id={`counter-${staff.id}`}
            type="text"
            required
            maxLength={50}
            value={counterName}
            onChange={(event) => setCounterName(event.target.value)}
          />

          <div className="actions">
            <button type="submit" disabled={busy}>
              Save
            </button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="panel">
      <h2>{staff.name}</h2>
      <p className="muted">
        {staff.counterName} · {staff.email}
      </p>
      <div className="actions">
        <button type="button" className="secondary small" disabled={busy} onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className="secondary small" disabled={busy} onClick={() => onRemove(staff)}>
          Remove
        </button>
      </div>
    </li>
  );
}
