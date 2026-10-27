import { ButtonLink } from '../ui/Button';

export default function NotFoundPage() {
  return (
    <main className="page">
      <h1>Page not found</h1>
      <p>This link doesn't lead anywhere. If you scanned a QR code, ask the staff for a fresh one.</p>
      <p>
        <ButtonLink to="/" variant="outline">
          Go to the QueueUp home page
        </ButtonLink>
      </p>
    </main>
  );
}
