import type { LiveStatus } from '../useQueueUpdates';

interface ConnectionNoticeProps {
  liveStatus: LiveStatus;
}

export default function ConnectionNotice({ liveStatus }: ConnectionNoticeProps) {
  if (liveStatus === 'reconnecting') {
    return <p className="connection" role="status">Reconnecting…</p>;
  }

  if (liveStatus === 'offline') {
    return (
      <p className="connection" role="status">
        Live updates are off. This page will still check for changes every few seconds.
      </p>
    );
  }

  return null;
}
