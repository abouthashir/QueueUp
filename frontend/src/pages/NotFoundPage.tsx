import { ButtonLink } from '../ui/Button';
import Icon from '../ui/Icon';
import ProblemScreen from '../ui/ProblemScreen';

export default function NotFoundPage() {
  return (
    <ProblemScreen
      title="Page not found"
      message="This link doesn't lead anywhere. If you scanned a QR code, ask the staff for a fresh one."
    >
      <ButtonLink to="/" variant="outline">
        Go to the QueueUp home page
        <Icon name="arrow" size={18} />
      </ButtonLink>
    </ProblemScreen>
  );
}
