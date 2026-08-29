import { useQuery } from '@tanstack/react-query';
import { ChevronRight, History, LogIn, LogOut, Scan, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/queries';
import { Loading } from '../components/Loading';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { Visitor } from '../types';

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' }).format(new Date(value));
}

export function Dashboard() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ['watch-dashboard'], queryFn: getDashboard, refetchInterval: 30_000 });

  if (query.isLoading) return <Loading label="Loading your gate overview..." />;
  if (query.isError || !query.data) return <div className="error-state"><h2>Could not load overview</h2><button className="outline-btn" onClick={() => void query.refetch()}>Try again</button></div>;

  const d = query.data;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return <>
    <section className="hero-banner">
      <div className="hero-content">
        <p className="hero-greeting">{user?.blockName ?? 'Your assigned block'} <span className="hero-dot" /> Gate overview</p>
        <h1>Welcome back, {firstName}.</h1>
        <p className="hero-desc">Keep your gate secure and every visitor accounted for.</p>
        <div className="system-secure-badge"><div className="badge-icon"><ShieldCheck size={16} /></div><div><strong>System secure</strong><span>All systems active</span></div></div>
      </div>
      <div className="hero-image"><img src="/images/guard-banner.jpg" alt="Security guard at the gate" /></div>
    </section>

    <section className="stats-row" aria-label="Today's visitor summary">
      <div className="stat-box blue"><div className="stat-icon"><Users size={22} /></div><div className="stat-data"><strong>{d.inside}</strong><span>People inside</span><small><i className="pulse" /> Right now</small></div></div>
      <div className="stat-divider" />
      <div className="stat-box green"><div className="stat-icon"><LogIn size={22} /></div><div className="stat-data"><strong>{d.visitorsToday}</strong><span>Visitors today</span><small>Total entries</small></div></div>
      <div className="stat-divider" />
      <div className="stat-box purple"><div className="stat-icon"><LogOut size={22} /></div><div className="stat-data"><strong>{d.exitedToday}</strong><span>Exited today</span><small>Total exits</small></div></div>
    </section>

    <Link to="/check-in" className="primary-action-card"><div className="action-left"><div className="action-icon"><UserPlus size={26} /></div><div className="action-text"><strong>Add new visitor</strong><span>Record a new arrival at the gate</span></div></div><div className="action-right"><ChevronRight size={24} /></div></Link>

    <div className="dashboard-lower">
      <section className="quick-access">
        <div className="qa-header"><div><p className="section-kicker">SHORTCUTS</p><h2>Quick access</h2></div><span className="section-note">Keep moving</span></div>
        <div className="qa-list">
          <Link to="/check-in" className="qa-item"><div className="qa-icon green"><Scan size={24} /></div><div className="qa-text"><strong>Check in visitor</strong><span>Add a new arrival to the gate log</span></div><ChevronRight size={20} className="qa-chevron" /></Link>
          <Link to="/people-inside" className="qa-item"><div className="qa-icon orange"><Users size={24} /></div><div className="qa-text"><strong>People inside</strong><span>View and manage active visitors</span></div><ChevronRight size={20} className="qa-chevron" /></Link>
          <Link to="/history" className="qa-item"><div className="qa-icon purple"><History size={24} /></div><div className="qa-text"><strong>Visitor history</strong><span>Review previous entries and exits</span></div><ChevronRight size={20} className="qa-chevron" /></Link>
        </div>
      </section>

      <section className="recent-section dashboard-recent">
        <div className="section-heading"><div><p className="section-kicker">LATEST ACTIVITY</p><h2>Recent visitors</h2></div><Link to="/history">View history <ChevronRight size={14} /></Link></div>
        {d.recentVisitors.length ? <div className="recent-list">{d.recentVisitors.slice(0, 5).map((visitor: Visitor) => <div className="recent-row" key={visitor.id}><span className="person-avatar">{visitor.visitorName.slice(0, 1).toUpperCase()}</span><div className="recent-person"><strong>{visitor.visitorName}</strong><small>{visitor.reasonForVisit} · {formatDate(visitor.checkInAt)}</small></div><div className="recent-time"><span>{formatTime(visitor.checkInAt)}</span><StatusBadge status={visitor.status} /></div></div>)}</div> : <div className="compact-empty"><Users size={18} /><span>No visitor activity yet today.</span></div>}
      </section>
    </div>
  </>;
}
