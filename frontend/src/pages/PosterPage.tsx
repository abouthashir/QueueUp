import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getDisplay, type DisplayInfo } from '../api';
import { Button, ButtonLink } from '../ui/Button';
import Logo from '../ui/Logo';
import StatusScreen from '../ui/StatusScreen';
import styles from './PosterPage.module.css';

const STEPS = ['Open your phone camera', 'Point it at the code', 'Get a token and wait anywhere'];

export default function PosterPage() {
  const { queueId } = useParams();

  const [info, setInfo] = useState<DisplayInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queueId) {
      return;
    }

    let stopped = false;

    getDisplay(queueId)
      .then((loaded) => {
        if (!stopped) {
          setInfo(loaded);
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
  }, [queueId]);

  if (!info) {
    return error ? <StatusScreen message={error} error /> : <StatusScreen message="Loading…" />;
  }

  const joinUrl = `${window.location.origin}/q/${queueId}`;

  return (
    <div className={styles.desk}>
      <div className={styles.toolbar}>
        <ButtonLink to={`/queues/${queueId}`} variant="ghost">
          Back to queue settings
        </ButtonLink>
        <Button onClick={() => window.print()}>Print poster</Button>
      </div>

      <main className={styles.sheet}>
        <div className={styles.top}>
          <Logo />
          <span className="label">Digital queue tokens</span>
        </div>

        <p className={styles.business}>{info.businessName}</p>
        <h1 className={styles.queue}>{info.queueName}</h1>

        <div className={styles.code}>
          <QRCodeSVG value={joinUrl} size={512} marginSize={2} title={`QR code to join ${info.queueName}`} />
        </div>

        <h2 className={styles.call}>Scan to join the queue</h2>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step}>
              <span className="num">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <div className={styles.footer}>
          <span>No app. No sign-up.</span>
          <span className={styles.url}>{joinUrl}</span>
        </div>
      </main>
    </div>
  );
}
