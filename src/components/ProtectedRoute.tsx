import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';
import BottomBar from './BottomBar';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />
      <div className="flex-1 md:pl-60">
        <MobileTopBar />
        <main className="mx-auto max-w-3xl px-4 py-6 pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
