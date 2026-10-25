import { Link } from 'react-router';
import { loadAuth } from '../authStorage';

export default function LandingPage() {
  const loggedIn = loadAuth() !== null;

  return (
    <main className="page landing">
      <h1>QueueUp</h1>
      <p className="summary">Digital queue tokens for clinics, banks and salons. No app, no sign-up for your customers.</p>

      <ol className="steps">
        <li>
          <strong>Print your QR poster.</strong> Customers scan it and get a token in their browser.
        </li>
        <li>
          <strong>Let them step away.</strong> Their phone shows their place live and alerts them when it's their turn.
        </li>
        <li>
          <strong>Call the next person with one click.</strong> A TV board shows who is being served.
        </li>
      </ol>

      {loggedIn ? (
        <Link className="button-link" to="/dashboard">
          Go to your queues
        </Link>
      ) : (
        <div className="actions landing-actions">
          <Link className="button-link" to="/signup">
            Create a free account
          </Link>
          <Link className="button-link secondary" to="/login">
            Log in
          </Link>
        </div>
      )}
    </main>
  );
}
