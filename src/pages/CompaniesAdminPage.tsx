import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import type { Company } from '../types';
import { apiGet, apiForm, ApiError, uploadUrl } from '../lib/api';

const EMPTY_NEW_COMPANY = { name: '', isAcceptMinor: false, isAcceptExpired: false };

export default function CompaniesAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCompany, setNewCompany] = useState(EMPTY_NEW_COMPANY);
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function loadCompanies() {
    setLoading(true);
    return apiGet<Company[]>('/companies')
      .then(setCompanies)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', newCompany.name);
      formData.append('isAcceptMinor', String(newCompany.isAcceptMinor));
      formData.append('isAcceptExpired', String(newCompany.isAcceptExpired));
      if (logo) formData.append('logo', logo);
      await apiForm('/companies', 'POST', formData);
      setNewCompany(EMPTY_NEW_COMPANY);
      setLogo(null);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'La creation a echoue');
    } finally {
      setCreating(false);
    }
  }

  async function toggleFlag(company: Company, flag: 'isAcceptMinor' | 'isAcceptExpired') {
    setError(null);
    try {
      const formData = new FormData();
      formData.append(flag, String(!company[flag]));
      await apiForm(`/companies/${company.id}`, 'PATCH', formData);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'La mise a jour a echoue');
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Entreprises</h1>

      <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-700">Creer une entreprise</h2>
        <input
          type="text"
          required
          placeholder="Nom de l'entreprise"
          value={newCompany.name}
          onChange={(e) => setNewCompany((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={newCompany.isAcceptMinor}
            onChange={(e) => setNewCompany((prev) => ({ ...prev, isAcceptMinor: e.target.checked }))}
          />
          Accepte les mineurs
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={newCompany.isAcceptExpired}
            onChange={(e) => setNewCompany((prev) => ({ ...prev, isAcceptExpired: e.target.checked }))}
          />
          Accepte les cartes expirees
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faBuilding} className="h-4 w-4" />
          {creating ? 'Creation...' : 'Creer'}
        </button>
      </form>

      {loading ? (
        <p className="py-8 text-center text-slate-500">Chargement...</p>
      ) : (
        <ul className="space-y-2">
          {companies.map((company) => (
            <li
              key={company.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              {company.logoPath ? (
                <img
                  src={uploadUrl(company.logoPath)}
                  alt={company.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  ?
                </div>
              )}
              <span className="min-w-0 flex-1 font-medium text-slate-800">{company.name}</span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={company.isAcceptMinor}
                  onChange={() => toggleFlag(company, 'isAcceptMinor')}
                />
                Mineurs
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={company.isAcceptExpired}
                  onChange={() => toggleFlag(company, 'isAcceptExpired')}
                />
                Cartes expirees
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
