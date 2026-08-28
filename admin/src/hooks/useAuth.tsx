import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { login as loginApi, logout as logoutApi, refresh } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { User } from '../types';

type AuthContextValue = { user: User | null; ready: boolean; signIn: (username: string, password: string) => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { setUnauthorizedHandler(() => setUser(null)); void refresh().then(setUser).finally(() => setReady(true)); }, []);
  const value = useMemo(() => ({ user, ready, signIn: async (username: string, password: string) => { setUser(await loginApi(username, password)); }, signOut: async () => { await logoutApi(); setUser(null); } }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
