import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getDisplay, type DisplayInfo } from '../api';

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
    return (
      <main className="page">
        {error ? <p className="error" role="alert">{error}</p> : <p className="muted">Loading…</p>}
      </main>
    );
  }

  const joinUrl = `${window.location.origin}/q/${queueId}`;

  return (
    <main className="poster">
      <p className="no-print">
        <button type="button" onClick={() => window.print()}>
          Print poster
        </button>
      </p>

      <p className="poster-business">{info.businessName}</p>
      <h1 className="poster-queue">{info.queueName}</h1>
      <QRCodeSVG value={joinUrl} size={320} marginSize={4} title={`QR code to join ${info.queueName}`} />
      <p className="poster-call">Scan to join the queue</p>
      <p className="poster-steps">No app, no sign-up. Open your phone camera and point it at the code.</p>
      <p className="poster-url">{joinUrl}</p>
    </main>
  );
}
