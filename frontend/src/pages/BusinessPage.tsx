import { useEffect, useState, type FormEvent } from 'react';
import { getBusiness, updateBusiness, type BusinessProfile, type BusinessType } from '../api';
import StaffHeader from '../components/StaffHeader';

const BUSINESS_TYPES: BusinessType[] = ['Clinic', 'Bank', 'Salon', 'Other'];

export default function BusinessPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stopped = false;

    getBusiness()
      .then((loaded) => {
        if (!stopped) {
          setProfile(loaded);
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
  }, []);

  function update(field: keyof BusinessProfile, value: string) {
    setProfile((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      setProfile(await updateBusiness(profile));
      setNotice('Saved. Customers see these details on the join page.');
    } catch (e) {
      setError((e as Error).message);
    }

    setBusy(false);
  }

  return (
    <main className="page page-wide">
      <StaffHeader />
      <h1>Business profile</h1>

      {!profile && !error && <p className="muted">Loading…</p>}

      {profile && (
        <form onSubmit={handleSubmit} className="form panel">
          <label htmlFor="business-name">Business name</label>
          <input
            id="business-name"
            type="text"
            required
            maxLength={100}
            value={profile.name}
            onChange={(event) => update('name', event.target.value)}
          />

          <label htmlFor="business-type">Type</label>
          <select id="business-type" value={profile.type} onChange={(event) => update('type', event.target.value)}>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label htmlFor="business-address">Address</label>
          <input
            id="business-address"
            type="text"
            autoComplete="street-address"
            maxLength={200}
            value={profile.address}
            onChange={(event) => update('address', event.target.value)}
          />

          <label htmlFor="business-hours">Opening hours</label>
          <input
            id="business-hours"
            type="text"
            maxLength={100}
            placeholder="Mon to Sat, 9 am to 5 pm"
            value={profile.openingHours}
            onChange={(event) => update('openingHours', event.target.value)}
          />

          <button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      <div aria-live="polite">
        {notice && <p className="notice">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </main>
  );
}
