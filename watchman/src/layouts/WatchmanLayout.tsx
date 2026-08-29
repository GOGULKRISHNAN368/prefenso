import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, History, Home, LogIn, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/check-in', label: 'Check in', icon: LogIn },
  { to: '/people-inside', label: 'Inside', icon: Users },
  { to: '/history', label: 'History', icon: History },
];

export function WatchmanLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = location.pathname === '/profile' ? 'Profile' : links.find((link) => location.pathname.startsWith(link.to))?.label ?? 'Home';

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  return <div className={`watch-shell ${isDashboard ? 'is-dashboard' : ''}`}>
    <header className="watch-header">
      <Link className="watch-brand" to="/dashboard" aria-label="Gatewise home"><div className="brand-mark"><ShieldCheck size={20}/></div><div><strong>Gatewise</strong><small>SECURITY PORTAL</small></div></Link>
      <div className="block-identity"><span>ASSIGNED GATE</span><strong>{user?.blockName ?? 'Unassigned block'}</strong></div>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'desktop-nav-link active' : 'desktop-nav-link'}><Icon size={16}/><span>{label}</span></NavLink>)}</nav>
      <div className="watch-user">
        <span className="header-status"><i/>Operational</span>
        <Link className="watch-profile-link" to="/profile" aria-label={`Open ${user?.name ?? 'profile'} profile`}>
          <div className="avatar">{user?.name.slice(0, 1).toUpperCase()}</div>
          <div className="header-user-copy"><strong>{user?.name}</strong><span>Watchman</span></div>
          <ChevronDown size={16} />
        </Link>
      </div>
    </header>
    <main className="watch-main"><div className="mobile-page-title"><span>{title}</span><span className="secure-chip"><i/>Secure</span></div><Outlet/></main>
    <footer className="watch-footer"><span><ShieldCheck size={14}/> Gatewise Security Portal</span><span>Access logs are protected and available to authorized staff.</span></footer>
    <nav className="bottom-nav">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}><Icon size={20}/><span>{label}</span></NavLink>)}</nav>
  </div>;
}
