import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS } from './navItems';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-10 md:flex md:w-60 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <img src="/logo.png" alt="Validily" className="h-15 w-15 rounded-lg object-cover" />
        <span className="text-lg font-semibold text-slate-800">Validily</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <FontAwesomeIcon icon={icon} className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 px-3 text-xs">
          <p className="font-medium text-slate-700">{user?.fullName}</p>
          <p className="text-slate-500">{user?.phoneNumber}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
