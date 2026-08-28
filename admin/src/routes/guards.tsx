import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common/Loading';
export function ProtectedRoute() { const { user, ready } = useAuth(); if (!ready) return <Loading label="Restoring your session..."/>; return user ? <Outlet/> : <Navigate to="/login" replace/>; }
export function GuestRoute() { const { user, ready } = useAuth(); if (!ready) return <Loading label="Loading..."/>; return user ? <Navigate to="/dashboard" replace/> : <Outlet/>; }
