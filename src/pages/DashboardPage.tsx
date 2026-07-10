import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faFilterCircleXmark,
  faListUl,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import type { Company, PaginatedRecords } from '../types';
import { apiGet } from '../lib/api';
import RecordsList from '../components/RecordsList';

const COMPACT_SIZE = 10;
const FULL_PAGE_SIZE = 30;

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mine = searchParams.get('mine') === 'true';
  const showAll = searchParams.get('view') === 'all';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedRecords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Company[]>('/companies').then(setCompanies);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [mine, showAll, companyId, phoneNumber, dateFrom, dateTo]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('mine', String(mine));
    params.set('page', String(page));
    params.set('pageSize', String(showAll ? FULL_PAGE_SIZE : COMPACT_SIZE));
    if (showAll) {
      if (companyId) params.set('companyId', companyId);
      if (phoneNumber.trim()) params.set('phoneNumber', phoneNumber.trim());
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
    }
    apiGet<PaginatedRecords>(`/records?${params.toString()}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [mine, showAll, page, companyId, phoneNumber, dateFrom, dateTo]);

  function setMine(value: boolean) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('mine', 'true');
    else next.delete('mine');
    setSearchParams(next);
  }

  function handleShowAll() {
    const next = new URLSearchParams(searchParams);
    next.set('view', 'all');
    setSearchParams(next);
  }

  function clearFilters() {
    setCompanyId('');
    setPhoneNumber('');
    setDateFrom('');
    setDateTo('');
  }

  const hasFilters = !!companyId || !!phoneNumber.trim() || !!dateFrom || !!dateTo;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / FULL_PAGE_SIZE)) : 1;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Enregistrements</h1>
        <Link
          to="/records/new"
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
          Nouveau
        </Link>
      </div>

      <div className="mb-4 inline-flex rounded-md border border-slate-200 bg-white p-1 text-sm">
        <button
          onClick={() => setMine(false)}
          className={`rounded px-3 py-1 ${!mine ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'}`}
        >
          Tous
        </button>
        <button
          onClick={() => setMine(true)}
          className={`rounded px-3 py-1 ${mine ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'}`}
        >
          Les miens
        </button>
      </div>

      {showAll && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Entreprise</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="">Toutes</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Telephone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Recherche..."
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Du</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Au</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              <FontAwesomeIcon icon={faFilterCircleXmark} className="h-3.5 w-3.5" />
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {loading || !data ? (
        <p className="py-8 text-center text-slate-500">Chargement...</p>
      ) : (
        <>
          <RecordsList records={data.records} />

          {!showAll && data.total > data.records.length && (
            <button
              onClick={handleShowAll}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faListUl} className="h-4 w-4" />
              Voir tout ({data.total})
            </button>
          )}

          {showAll && data.total > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
                Precedent
              </button>
              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Suivant
                <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
