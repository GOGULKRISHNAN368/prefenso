import { useQuery } from '@tanstack/react-query'; import { ChevronRight, History, LogIn, LogOut, Scan, ShieldCheck, UserPlus, Users } from 'lucide-react'; import { Link } from 'react-router-dom'; import { getDashboard } from '../api/queries'; import { Loading } from '../components/Loading'; import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ['watch-dashboard'], queryFn: getDashboard, refetchInterval: 30_000 });
  if (query.isLoading) return <Loading label="Loading your gate overview..." />;
  if (query.isError || !query.data) return <div className="error-state"><h2>Could not load overview</h2><button className="outline-btn" onClick={() => void query.refetch()}>Try again</button></div>;
  const d = query.data;
  return <>
    <section className="hero-banner">
      <div className="hero-content">
        <p className="hero-greeting">Good morning, {user?.blockName ?? 'block1'} 👋</p>
        <h1>Welcome back!</h1>
        <p className="hero-desc">Let's keep your gate secure and your visitors logged.</p>
        <div className="system-secure-badge"><div className="badge-icon"><ShieldCheck size={16} /></div><div><strong>System Secure</strong><span>All systems active</span></div></div>
      </div>
      <div className="hero-image"><img src="/images/guard-banner.jpg" alt="Security Guard" /></div>
    </section>

    <section className="stats-row">
      <div className="stat-box blue">
        <div className="stat-icon"><Users size={22} /></div>
        <div className="stat-data"><strong>{d.inside}</strong><span>People inside</span><small><i className="pulse"></i> Right now</small></div>
      </div>
      <div className="stat-divider" />
      <div className="stat-box green">
        <div className="stat-icon"><LogIn size={22} /></div>
        <div className="stat-data"><strong>{d.visitorsToday}</strong><span>Visitors today</span><small>Total entries</small></div>
      </div>
      <div className="stat-divider" />
      <div className="stat-box purple">
        <div className="stat-icon"><LogOut size={22} /></div>
        <div className="stat-data"><strong>{d.exitedToday}</strong><span>Exited today</span><small>Total exits</small></div>
      </div>
    </section>

    <Link to="/check-in" className="primary-action-card">
      <div className="action-left">
        <div className="action-icon"><UserPlus size={26} /></div>
        <div className="action-text"><strong>Add New Visitor</strong><span>Record a new arrival at the gate</span></div>
      </div>
      <div className="action-right"><ChevronRight size={24} /></div>
    </Link>

    <section className="quick-access">
      <div className="qa-header">
        <h2>Quick Access</h2>
        <Link to="/history">View all</Link>
      </div>
      <div className="qa-list">
        <Link to="/check-in" className="qa-item">
          <div className="qa-icon green"><Scan size={24} /></div>
          <div className="qa-text"><strong>Check In Visitor</strong><span>Scan ID or add visitor manually</span></div>
          <ChevronRight size={20} className="qa-chevron" />
        </Link>
        <Link to="/people-inside" className="qa-item">
          <div className="qa-icon orange"><Users size={24} /></div>
          <div className="qa-text"><strong>People Inside</strong><span>View and manage active visitors</span></div>
          <ChevronRight size={20} className="qa-chevron" />
        </Link>
        <Link to="/history" className="qa-item">
          <div className="qa-icon purple"><History size={24} /></div>
          <div className="qa-text"><strong>Visitor History</strong><span>See all previous entries and exits</span></div>
          <ChevronRight size={20} className="qa-chevron" />
        </Link>
      </div>
    </section>
  </>;
}
