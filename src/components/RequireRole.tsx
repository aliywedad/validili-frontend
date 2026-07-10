import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../types';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth();

  if (user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
