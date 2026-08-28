import { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { WatchmanLayout } from './layouts/WatchmanLayout';
import { GuestRoute, ProtectedRoute } from './routes/guards';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { PeopleInside } from './pages/PeopleInside';
import { History } from './pages/History';
import { Profile } from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    return this.state.hasError ? <div className="error-state full"><h2>Something went wrong</h2><p>Reload the portal to continue.</p><button className="action-btn" onClick={() => window.location.reload()}>Reload portal</button></div> : this.props.children;
  }
}

export function App() {
  return <QueryClientProvider client={queryClient}><ErrorBoundary><AuthProvider><BrowserRouter><Routes>
    <Route element={<GuestRoute/>}>
      <Route path="/login" element={<Login/>}/>
    </Route>
    <Route element={<ProtectedRoute/>}>
      <Route element={<WatchmanLayout/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/check-in" element={<CheckIn/>}/>
        <Route path="/people-inside" element={<PeopleInside/>}/>
        <Route path="/history" element={<History/>}/>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
  </Routes></BrowserRouter><Toaster position="top-center" richColors/></AuthProvider></ErrorBoundary></QueryClientProvider>;
}
