import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useEffect, useState } from 'react';
import { API_URL } from './api';

export type LiveStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

const RETRY_EVERY_MS = 5_000;

export function useQueueUpdates(queueId: string | undefined) {
  const [changeCount, setChangeCount] = useState(0);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('connecting');

  useEffect(() => {
    if (!queueId) {
      return;
    }

    const id = queueId;
    let stopped = false;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/queue`)
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: () => RETRY_EVERY_MS })
      .configureLogging(LogLevel.Warning)
      .build();

    async function watchQueue() {
      try {
        await connection.invoke('WatchQueue', id);

        if (!stopped) {
          setLiveStatus('live');
        }
      } catch {
        if (!stopped) {
          setLiveStatus('offline');
        }
      }
    }

    async function start() {
      try {
        await connection.start();
        await watchQueue();
      } catch {
        if (!stopped) {
          setLiveStatus('offline');
        }
      }
    }

    connection.on('QueueChanged', () => setChangeCount((count) => count + 1));
    connection.onreconnecting(() => setLiveStatus('reconnecting'));
    connection.onreconnected(() => watchQueue());
    connection.onclose(() => {
      if (!stopped) {
        setLiveStatus('offline');
      }
    });

    start();

    return () => {
      stopped = true;
      connection.stop();
    };
  }, [queueId]);

  return { changeCount, liveStatus };
}
