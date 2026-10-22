import type { TokenSummary } from '../api';

interface TokenListProps {
  title: string;
  tokens: TokenSummary[];
  emptyText: string;
  actionLabel?: string;
  busy?: boolean;
  onAction?: (tokenId: string) => void;
}

export default function TokenList({ title, tokens, emptyText, actionLabel, busy, onAction }: TokenListProps) {
  return (
    <section className="panel">
      <h2>
        {title} ({tokens.length})
      </h2>

      {tokens.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ul className="token-list">
          {tokens.map((token) => (
            <li key={token.id}>
              <span className="token-list-number">{token.displayNumber}</span>
              <span className="token-list-name">{token.customerName ?? 'No name'}</span>
              {actionLabel && onAction && (
                <button type="button" className="secondary small" disabled={busy} onClick={() => onAction(token.id)}>
                  {actionLabel}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
