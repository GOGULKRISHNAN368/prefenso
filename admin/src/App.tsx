import { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { GuestRoute, ProtectedRoute } from './routes/guards';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Blocks } from './pages/Blocks';
import { Visitors } from './pages/Visitors';
import { PeopleInside } from './pages/PeopleInside';
import { Reports } from './pages/Reports';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> { state = { hasError: false }; static getDerivedStateFromError() { return { hasError: true }; } componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info); } render() { return this.state.hasError ? <div className="error-state full-page-error"><h2>Something went wrong</h2><p>Reload the page to continue using Gatewise.</p><button className="primary-btn" onClick={() => window.location.reload()}>Reload application</button></div> : this.props.children; } }
export function App() { return <QueryClientProvider client={queryClient}><ErrorBoundary><AuthProvider><BrowserRouter><Routes><Route element={<GuestRoute/>}><Route path="/login" element={<Login/>}/></Route><Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/blocks" element={<Blocks/>}/><Route path="/visitors" element={<Visitors/>}/><Route path="/people-inside" element={<PeopleInside/>}/><Route path="/reports" element={<Reports/>}/></Route></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></BrowserRouter><Toaster position="top-right" richColors/></AuthProvider></ErrorBoundary></QueryClientProvider>; }
