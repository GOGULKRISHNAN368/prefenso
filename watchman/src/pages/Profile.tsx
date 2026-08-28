import { ArrowLeft, Building2, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user, signOut } = useAuth();

  return <>
    <div className="page-intro">
      <Link className="page-back" to="/dashboard"><ArrowLeft size={16}/>Back to home</Link>
      <p className="kicker">ACCOUNT</p>
      <h1>My profile</h1>
      <p>View your Watchman account and assigned gate.</p>
    </div>
    <section className="profile-card">
      <div className="profile-card-heading"><span className="profile-avatar"><UserRound size={25}/></span><div><h2>{user?.name}</h2><p>{user?.username}</p></div></div>
      <div className="profile-details"><div><span><Building2 size={17}/>Assigned block</span><strong>{user?.blockName ?? 'Not assigned'}</strong></div><div><span><ShieldCheck size={17}/>Role</span><strong>Watchman</strong></div></div>
      <button className="outline-btn profile-signout" onClick={() => void signOut()}><LogOut size={16}/>Sign out</button>
    </section>
  </>;
}
