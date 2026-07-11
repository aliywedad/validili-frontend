import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCamera, faKey } from '@fortawesome/free-solid-svg-icons';
import type { AuthUser, PaginatedRecords } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiForm, apiJson, apiGet, ApiError, uploadUrl } from '../lib/api';
import RecordsList from '../components/RecordsList';

const RECENT_COUNT = 10;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState<PaginatedRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    apiGet<PaginatedRecords>(`/records?mine=true&page=1&pageSize=${RECENT_COUNT}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const updated = await apiForm<AuthUser>('/auth/avatar', 'POST', formData);
      updateUser(updated);
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : "L'envoi de la photo a echoue");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    setChangingPassword(true);
    try {
      await apiJson('/auth/password', 'PATCH', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Le changement de mot de passe a echoue');
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"
          disabled={avatarUploading}
        >
          {user?.profileImagePath ? (
            <img
              src={uploadUrl(user.profileImagePath)}
              alt={user.fullName}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-xl font-semibold">{user?.fullName?.[0] ?? '?'}</span>
          )}
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            <FontAwesomeIcon icon={faCamera} className="h-3 w-3" />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{user?.fullName}</h1>
          <p className="text-sm text-slate-500">{user?.phoneNumber}</p>
          <p className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {user?.role}
          </p>
        </div>
      </div>
      {avatarError && <p className="mb-4 text-sm text-red-600">{avatarError}</p>}

      <form
        onSubmit={handlePasswordSubmit}
        className="mb-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <h2 className="text-sm font-medium text-slate-700">Changer le mot de passe</h2>
        <input
          type="password"
          required
          placeholder="Mot de passe actuel"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Nouveau mot de passe"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Confirmer le nouveau mot de passe"
          value={passwordForm.confirmPassword}
          onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
        {passwordSuccess && <p className="text-sm text-emerald-700">Mot de passe mis a jour.</p>}
        <button
          type="submit"
          disabled={changingPassword}
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faKey} className="h-4 w-4" />
          {changingPassword ? 'Mise a jour...' : 'Mettre a jour'}
        </button>
      </form>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-800">Mes enregistrements</h2>
        {data && data.total > RECENT_COUNT && (
          <Link
            to="/dashboard?mine=true&view=all"
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
          >
            Voir tout ({data.total})
            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {loading || !data ? (
        <p className="py-8 text-center text-slate-500">Chargement...</p>
      ) : (
        <RecordsList records={data.records} />
      )}
    </div>
  );
}
