import type { QueueStatus } from '../api';
import Badge, { type BadgeTone } from './Badge';

const TONES: Record<QueueStatus, BadgeTone> = { Open: 'live', Paused: 'paused', Closed: 'closed' };

interface QueueStatusBadgeProps {
  status: QueueStatus;
}

// Open pulses green, Paused is amber, Closed is grey, and the word is always there too.
export default function QueueStatusBadge({ status }: QueueStatusBadgeProps) {
  return (
    <Badge tone={TONES[status]} pulse={status === 'Open'}>
      {status}
    </Badge>
  );
}
