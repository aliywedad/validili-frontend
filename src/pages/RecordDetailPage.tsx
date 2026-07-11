import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLocationDot, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { IdCardRecord } from '../types';
import { apiGet, apiDelete, ApiError, uploadUrl } from '../lib/api';
import { confirmDelete, showErrorAlert, showSuccessToast } from '../lib/alerts';
import { useAuth } from '../context/AuthContext';
import { DOCUMENT_TYPE_CONFIG } from '../lib/documentTypes';
import { ExpiryBadge, MinorBadge } from '../components/StatusBadges';
import LoadingOverlay from '../components/LoadingOverlay';

const USER_DELETE_WINDOW_MS = 24 * 60 * 60 * 1000;

interface FieldRow {
  label: string;
  value: string | null;
  ar?: string | null;
}

const DOCUMENT_NUMBER_LABELS: Record<IdCardRecord['documentType'], string> = {
  CNI: 'NNI',
  PASSPORT: 'Numero de passeport',
  SEJOUR: 'NNI',
};

const SINGLE_FACE_LABELS: Partial<Record<IdCardRecord['documentType'], string>> = {
  PASSPORT: 'Page biographique',
  SEJOUR: 'Photo de la carte',
};

function buildRows(record: IdCardRecord): FieldRow[] {
  const rows: FieldRow[] = [{ label: 'Telephone', value: record.phoneNumber }];

  rows.push({ label: 'Date de naissance', value: record.dateOfBirth });
  rows.push({ label: 'Sexe', value: record.sex });

  if (record.placeOfBirth) {
    rows.push({ label: 'Lieu de naissance', value: record.placeOfBirth, ar: record.placeOfBirthAr });
  }
  rows.push({ label: 'Nationalite', value: record.nationality, ar: record.nationalityAr });
  rows.push({ label: DOCUMENT_NUMBER_LABELS[record.documentType], value: record.documentNumber });

  if (record.documentType === 'PASSPORT' && record.issuingAuthority) {
    rows.push({ label: 'Autorite de delivrance', value: record.issuingAuthority });
  }

  // Carte de Sejour cards don't print issue/expiry dates.
  if (record.documentType !== 'SEJOUR') {
    rows.push({ label: 'Date de delivrance', value: record.issueDate });
    rows.push({ label: "Date d'expiration", value: record.expiryDate });
  }

  return rows;
}

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState<IdCardRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiGet<IdCardRecord>(`/records/${id}`)
      .then(setRecord)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Enregistrement introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!record) return;
    const confirmed = await confirmDelete({
      title: 'Supprimer cet enregistrement ?',
      text: `${record.fullName || 'Cet enregistrement'} sera definitivement supprime. Cette action est irreversible.`,
    });
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/records/${record.id}`);
      showSuccessToast('Enregistrement supprime');
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'La suppression a echoue';
      setDeleteError(message);
      showErrorAlert(message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-slate-500">Chargement...</p>;
  }

  if (error || !record) {
    return (
      <div>
        <BackLink />
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? 'Enregistrement introuvable'}
        </p>
      </div>
    );
  }

  const docConfig = DOCUMENT_TYPE_CONFIG[record.documentType];
  const rows = buildRows(record);
  const isOwner = user?.id === record.collectedById;
  const withinWindow = Date.now() - new Date(record.createdAt).getTime() <= USER_DELETE_WINDOW_MS;
  const canDelete = user?.role === 'ADMIN' || (isOwner && withinWindow);

  return (
    <div>
      {deleting && <LoadingOverlay message="Suppression en cours..." />}

      <div className="mb-4 flex items-center justify-between">
        <BackLink />
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
            Supprimer
          </button>
        )}
      </div>

      {deleteError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>
      )}

      <div className="mb-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {record.personImagePath ? (
          <img
            src={uploadUrl(record.personImagePath)}
            alt={record.fullName}
            className="h-20 w-20 flex-shrink-0 rounded-full object-cover ring-2 ring-slate-100"
          />
        ) : (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-400">
            {record.fullName?.[0] ?? '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-slate-800">{record.fullName || '(nom manquant)'}</h1>
          {record.fullNameAr && (
            <p className="truncate text-sm text-slate-500" dir="rtl">
              {record.fullNameAr}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <FontAwesomeIcon icon={docConfig.icon} className="h-3 w-3" />
              {docConfig.label}
            </span>
            <ExpiryBadge expiryDate={record.expiryDate} />
            <MinorBadge dateOfBirth={record.dateOfBirth} />
          </div>
        </div>
      </div>

      {record.company && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          {record.company.logoPath ? (
            <img
              src={uploadUrl(record.company.logoPath)}
              alt={record.company.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">?</div>
          )}
          <div>
            <p className="text-xs text-slate-400">Entreprise</p>
            <p className="font-medium text-slate-800">{record.company.name}</p>
          </div>
        </div>
      )}

      <div className="mb-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-slate-500">{row.label}</span>
            <span className="text-right font-medium text-slate-800">
              {row.value || '-'}
              {row.ar && (
                <span className="ml-2 font-normal text-slate-500" dir="rtl">
                  {row.ar}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className={`mb-4 grid gap-3 ${record.backImagePath ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <a href={uploadUrl(record.frontImagePath)} target="_blank" rel="noopener noreferrer">
          <p className="mb-1 text-xs font-medium text-slate-500">
            {record.backImagePath ? 'Recto' : SINGLE_FACE_LABELS[record.documentType] ?? 'Photo du document'}
          </p>
          <img
            src={uploadUrl(record.frontImagePath)}
            alt="Recto du document"
            className="aspect-[3/2] w-full rounded-lg border border-slate-200 object-cover"
          />
        </a>
        {record.backImagePath && (
          <a href={uploadUrl(record.backImagePath)} target="_blank" rel="noopener noreferrer">
            <p className="mb-1 text-xs font-medium text-slate-500">Verso</p>
            <img
              src={uploadUrl(record.backImagePath)}
              alt="Verso du document"
              className="aspect-[3/2] w-full rounded-lg border border-slate-200 object-cover"
            />
          </a>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-sm">
        <p>Collecte par {record.collectedBy?.fullName ?? '-'}</p>
        <p>{new Date(record.createdAt).toLocaleString('fr-FR')}</p>
        {record.latitude != null && record.longitude != null && (
          <a
            href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-emerald-700 hover:underline"
          >
            <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
            Voir sur la carte
          </a>
        )}
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">
      <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
      Retour
    </Link>
  );
}
