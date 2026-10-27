import { useEffect, useState, type FormEvent } from 'react';
import { getBusiness, updateBusiness, type BusinessProfile, type BusinessType } from '../api';
import AppShell, { ShellMessage } from '../app/AppShell';
import { Button } from '../ui/Button';
import SelectField from '../ui/SelectField';
import TextField from '../ui/TextField';
import styles from '../app/OwnerPage.module.css';
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

  if (!profile) {
    return (
      <AppShell>
        <ShellMessage message={error ?? 'Loading…'} error={error !== null} />
      </AppShell>
    );
  }

  const details = [profile.address, profile.openingHours && `Open ${profile.openingHours}`].filter(Boolean);

  return (
    <AppShell>
      <div className={styles.page}>
        <header>
          <h1 className={styles.title}>Business</h1>
          <p className={styles.intro}>Customers see these details at the top of every join page.</p>
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
          <section className={styles.panel} aria-labelledby="profile-title">
            <h2 id="profile-title" className={styles.panelTitle}>
              Profile
            </h2>
            <form onSubmit={handleSubmit} className={`${styles.form} ${styles.columns}`}>
              <TextField
                id="business-name"
                label="Business name"
                className={styles.wide}
                required
                maxLength={100}
                value={profile.name}
                onChange={(event) => update('name', event.target.value)}
              />
              <SelectField
                id="business-type"
                label="Type"
                options={BUSINESS_TYPES}
                value={profile.type}
                onChange={(event) => update('type', event.target.value)}
              />
              <TextField
                id="business-hours"
                label="Opening hours"
                optional
                maxLength={100}
                placeholder="Mon to Sat, 9 am to 5 pm"
                value={profile.openingHours}
                onChange={(event) => update('openingHours', event.target.value)}
              />
              <TextField
                id="business-address"
                label="Address"
                optional
                className={styles.wide}
                autoComplete="street-address"
                maxLength={200}
                value={profile.address}
                onChange={(event) => update('address', event.target.value)}
              />
              <div className={styles.formActions}>
                <Button type="submit" disabled={busy}>
                  {busy ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </section>

          <aside className={styles.panel} aria-labelledby="preview-title">
            <h2 id="preview-title" className={styles.panelTitle}>
              On the join page
            </h2>
            <p className={styles.panelIntro}>A preview that updates as you type.</p>
            <div className={styles.preview}>
              <p className="label">{profile.name || 'Your business'}</p>
              <p className={styles.previewQueue}>Your queue</p>
              {details.length > 0 && <p className={styles.previewMeta}>{details.join(' · ')}</p>}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
