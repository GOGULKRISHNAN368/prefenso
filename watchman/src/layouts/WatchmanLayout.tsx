import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { History, Home, LogIn, LogOut, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/check-in', label: 'Check in', icon: LogIn },
  { to: '/people-inside', label: 'Inside', icon: Users },
  { to: '/history', label: 'History', icon: History },
];

export function WatchmanLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const title = location.pathname === '/profile' ? 'Profile' : links.find((link) => location.pathname.startsWith(link.to))?.label ?? 'Home';

  return <div className="watch-shell">
    <header className="watch-header">
      <div className="watch-brand"><div className="brand-mark"><ShieldCheck size={20}/></div><div><strong>Gatewise</strong><small>SECURITY PORTAL</small></div></div>
      <div className="block-identity"><span>ON DUTY AT</span><strong>{user?.blockName ?? 'Assigned block'}</strong></div>
      <div className="watch-user">
        <Link className="watch-profile-link" to="/profile" aria-label="Open profile">
          <div className="avatar">{user?.name.slice(0, 1).toUpperCase()}</div>
          <div><strong>{user?.name}</strong><span>{user?.username}</span></div>
        </Link>
        <button className="icon-btn" onClick={() => void signOut()} aria-label="Sign out"><LogOut size={18}/></button>
      </div>
    </header>
    <main className="watch-main"><div className="mobile-page-title"><span>{title}</span><span className="secure-chip"><i/>Secure</span></div><Outlet/></main>
    <nav className="bottom-nav">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}><Icon size={20}/><span>{label}</span></NavLink>)}</nav>
  </div>;
}
