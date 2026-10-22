import type { TokenInfo } from '../api';

interface NowServingProps {
  token: TokenInfo | null;
  busy: boolean;
  onServe: (tokenId: string) => void;
  onSkip: (tokenId: string) => void;
}

export default function NowServing({ token, busy, onServe, onSkip }: NowServingProps) {
  if (!token) {
    return (
      <section className="panel">
        <h2>Now serving</h2>
        <p className="muted">Nobody at your counter. Press Call next.</p>
      </section>
    );
  }

  return (
    <section className="panel now-serving">
      <h2>Now serving</h2>
      <p className="now-serving-number">{token.displayNumber}</p>
      {token.customerName && <p>{token.customerName}</p>}

      <div className="actions">
        <button type="button" disabled={busy} onClick={() => onServe(token.id)}>
          Served
        </button>
        <button type="button" className="secondary" disabled={busy} onClick={() => onSkip(token.id)}>
          Skip
        </button>
      </div>
    </section>
  );
}
