import { ButtonLink } from '../ui/Button';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';

export default function NotFoundPage() {
  return (
    <main className="page">
      <p>
        <Logo />
      </p>
      <h1>Page not found</h1>
      <p>This link doesn't lead anywhere. If you scanned a QR code, ask the staff for a fresh one.</p>
      <p>
        <ButtonLink to="/" variant="outline">
          Go to the QueueUp home page
          <Icon name="arrow" size={18} />
        </ButtonLink>
      </p>
    </main>
  );
}
