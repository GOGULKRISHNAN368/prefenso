import { Navigate, Outlet } from 'react-router-dom'; import { useAuth } from '../hooks/useAuth'; import { Loading } from '../components/Loading';
export function ProtectedRoute() { const { user, ready } = useAuth(); if (!ready) return <Loading label="Restoring session..."/>; return user ? <Outlet/> : <Navigate to="/login" replace/>; }
export function GuestRoute() { const { user, ready } = useAuth(); if (!ready) return <Loading/>; return user ? <Navigate to="/dashboard" replace/> : <Outlet/>; }
