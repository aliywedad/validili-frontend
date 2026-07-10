import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import type { Company, Role } from '../types';
import { apiGet, apiJson, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface AdminUser {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: Role;
  createdAt: string;
  companies: { id: string; name: string }[];
}

const EMPTY_NEW_USER = { phoneNumber: '', password: '', fullName: '', role: 'USER' as Role };

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function loadUsers() {
    return apiGet<AdminUser[]>('/users').then(setUsers);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadUsers(), apiGet<Company[]>('/companies').then(setCompanies)]).finally(() =>
      setLoading(false),
    );
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiJson('/users', 'POST', newUser);
      setNewUser(EMPTY_NEW_USER);
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "La creation a echoue");
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(id: string, role: Role) {
    setError(null);
    try {
      await apiJson(`/users/${id}/role`, 'PATCH', { role });
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Le changement de role a echoue');
    }
  }

  async function toggleCompany(u: AdminUser, companyId: string) {
    setError(null);
    const current = new Set(u.companies.map((c) => c.id));
    if (current.has(companyId)) {
      current.delete(companyId);
    } else {
      current.add(companyId);
    }
    try {
      await apiJson(`/users/${u.id}/companies`, 'PATCH', { companyIds: Array.from(current) });
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "La mise a jour des entreprises a echoue");
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Utilisateurs</h1>

      <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-700">Creer un utilisateur</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Nom complet"
            value={newUser.fullName}
            onChange={(e) => setNewUser((prev) => ({ ...prev, fullName: e.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{8}"
            maxLength={8}
            required
            placeholder="Numero de telephone (8 chiffres)"
            value={newUser.phoneNumber}
            onChange={(e) =>
              setNewUser((prev) => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 8) }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={newUser.password}
            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value as Role }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
          {creating ? 'Creation...' : 'Creer'}
        </button>
      </form>

      {loading ? (
        <p className="py-8 text-center text-slate-500">Chargement...</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => {
            const assigned = new Set(u.companies.map((c) => c.id));
            return (
              <li key={u.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{u.fullName}</p>
                    <p className="text-sm text-slate-500">{u.phoneNumber}</p>
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    disabled={u.id === currentUser?.id}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                {companies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-2">
                    {companies.map((company) => (
                      <label key={company.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={assigned.has(company.id)}
                          onChange={() => toggleCompany(u, company.id)}
                        />
                        {company.name}
                      </label>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
