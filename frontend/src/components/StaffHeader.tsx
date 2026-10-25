import { Link, NavLink, useNavigate } from 'react-router';
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
      {auth.role === 'Owner' && (
        <nav className="owner-nav" aria-label="Owner tools">
          <NavLink to="/dashboard">Queues</NavLink>
          <NavLink to="/staff">Staff</NavLink>
          <NavLink to="/business">Business</NavLink>
        </nav>
      )}
      <button type="button" className="link" onClick={handleLogout}>
        Log out
      </button>
    </header>
  );
}
