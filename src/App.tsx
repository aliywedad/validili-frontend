import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewRecordPage from './pages/NewRecordPage';
import RecordDetailPage from './pages/RecordDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import CompaniesAdminPage from './pages/CompaniesAdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/records/new" element={<NewRecordPage />} />
        <Route path="/records/:id" element={<RecordDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<RequireRole role="ADMIN" />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/companies" element={<CompaniesAdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
