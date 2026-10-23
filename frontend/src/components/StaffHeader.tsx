import { Link, useNavigate } from 'react-router';
import { forgetAuth, loadAuth } from '../authStorage';

export default function StaffHeader() {
  const navigate = useNavigate();
  const auth = loadAuth();

  function handleLogout() {
    forgetAuth();
    navigate('/login', { replace: true });
  }

  if (!auth) {
    return null;
  }

  return (
    <header className="staff-header">
      <Link to="/dashboard">{auth.businessName}</Link>
      <span className="muted">
        {auth.name} · {auth.counterName}
      </span>
      <button type="button" className="link" onClick={handleLogout}>
        Log out
      </button>
    </header>
  );
}
