let audioContext: AudioContext | null = null;

export async function enableAlerts(): Promise<void> {
  audioContext ??= new AudioContext();

  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register('/sw.js');
  }
}

export function alertCustomer(title: string, body: string): void {
  playChime();
  navigator.vibrate?.([300, 150, 300]);
  showNotification(title, body);
}

function playChime(): void {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  beep(audioContext, now, 880);
  beep(audioContext, now + 0.3, 1320);
}

function beep(context: AudioContext, startAt: number, frequency: number): void {
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.frequency.value = frequency;
  volume.gain.setValueAtTime(0.3, startAt);
  volume.gain.exponentialRampToValueAtTime(0.001, startAt + 0.4);

  oscillator.connect(volume).connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + 0.4);
}

async function showNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const registration = await navigator.serviceWorker?.getRegistration();

    if (registration) {
      await registration.showNotification(title, { body, tag: 'queueup-token' });
    } else {
      new Notification(title, { body, tag: 'queueup-token' });
    }
  } catch {
    // The sound, vibration and on-screen text still reach the customer.
  }
}
