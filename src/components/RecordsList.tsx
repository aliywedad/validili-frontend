import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import type { IdCardRecord } from '../types';
import { DOCUMENT_TYPE_CONFIG } from '../lib/documentTypes';
import { uploadUrl } from '../lib/api';
import { ExpiryBadge, MinorBadge } from './StatusBadges';

export default function RecordsList({ records }: { records: IdCardRecord[] }) {
  if (records.length === 0) {
    return <p className="py-8 text-center text-slate-500">Aucun enregistrement.</p>;
  }

  return (
    <ul className="space-y-3">
      {records.map((record) => {
        const docConfig = DOCUMENT_TYPE_CONFIG[record.documentType];
        return (
          <li key={record.id}>
            <Link
              to={`/records/${record.id}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:p-4"
            >
              {record.personImagePath ? (
                <img
                  src={uploadUrl(record.personImagePath)}
                  alt={record.fullName}
                  className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-400 ring-2 ring-slate-100">
                  {record.fullName?.[0] ?? '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate font-semibold text-slate-800">{record.fullName || '(nom manquant)'}</p>
                  <ExpiryBadge expiryDate={record.expiryDate} />
                  <MinorBadge dateOfBirth={record.dateOfBirth} />
                </div>
                {record.fullNameAr && (
                  <p className="truncate text-sm text-slate-500" dir="rtl">
                    {record.fullNameAr}
                  </p>
                )}
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <FontAwesomeIcon icon={docConfig.icon} className="h-3.5 w-3.5 text-slate-400" />
                  {docConfig.label} {record.documentNumber || '-'} &middot; Ne(e) le {record.dateOfBirth || '-'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                  {record.company && <span className="font-medium text-emerald-700">{record.company.name}</span>}
                  <span>Collecte par {record.collectedBy?.fullName ?? '-'}</span>
                  <span>{new Date(record.createdAt).toLocaleString('fr-FR')}</span>
                  {record.latitude != null && record.longitude != null && (
                    <span className="inline-flex items-center gap-1">
                      <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                      Localise
                    </span>
                  )}
                </div>
              </div>
              <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 flex-shrink-0 text-slate-300" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
