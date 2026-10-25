import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <main className="page">
      <h1>Page not found</h1>
      <p>This link doesn't lead anywhere. If you scanned a QR code, ask the staff for a fresh one.</p>
      <p>
        <Link to="/">Go to the QueueUp home page</Link>
      </p>
    </main>
  );
}
