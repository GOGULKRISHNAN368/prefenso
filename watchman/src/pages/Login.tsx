import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { apiError } from '../api/client';

export function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Enter your username and password');
    setLoading(true);
    try {
      await signIn(username, password);
      toast.success('You are signed in');
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  };

  return <div className="security-login">
    <div className="security-login-card">
      <div className="login-brand"><div className="brand-mark large"><ShieldCheck size={27} /></div><p className="kicker">GATEWISE SECURITY <span className="kicker-rule" /></p><h1>Welcome back.</h1><p>Sign in to manage visitor access at your assigned block.</p></div>
      <form className="form-stack" onSubmit={submit}>
        <label>Watchman username<div className="input-wrap"><UserRound size={18} /><input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="Enter your username" /></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={18} /><input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" /><button type="button" className="input-action" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        <button className="action-btn full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in securely'}<span>→</span></button>
      </form>
      <div className="secure-footer"><ShieldCheck size={15} /> Your session is encrypted and stays active on this device.</div>
    </div>
    <div className="security-login-art"><div className="art-label">GATEWISE <span>OPERATIONS</span></div><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="gate-card"><ShieldCheck size={27} /><strong>ACCESS CONTROL</strong><span>Campus operations online</span><div className="online"><i /> All gates operational</div></div><div className="art-footer">SECURE · SIMPLE · ACCOUNTABLE</div></div>
  </div>;
}
