import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

export default function MobileTopBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Validily" className="h-8 w-8 rounded-lg object-cover" />
        <span className="text-lg font-semibold text-slate-800">Validily</span>
      </div>
      <button
        onClick={handleLogout}
        aria-label="Deconnexion"
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5" />
      </button>
    </header>
  );
}
