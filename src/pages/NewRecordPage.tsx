import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuildingCircleArrowRight,
  faChevronRight,
  faCircleCheck,
  faLocationDot,
  faPhone,
  faTriangleExclamation,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import type { AllIdCardFieldKey, Company, DocumentType, NewIdCardRecordInput, OcrExtractionResult } from '../types';
import { apiForm, apiGet, ApiError, uploadUrl } from '../lib/api';
import { DOCUMENT_TYPE_CONFIG, DOCUMENT_TYPES } from '../lib/documentTypes';
import ImagePickerField from '../components/ImagePickerField';
import LoadingOverlay from '../components/LoadingOverlay';

const BASE_LABELS: Partial<Record<AllIdCardFieldKey, string>> = {
  fullName: 'Nom et prenom (FR)',
  fullNameAr: 'الاسم الكامل (AR)',
  dateOfBirth: 'Date de naissance (JJ/MM/AAAA)',
  placeOfBirth: 'Lieu de naissance (FR)',
  placeOfBirthAr: 'مكان الازدياد (AR)',
  sex: 'Sexe',
  nationality: 'Nationalite (FR)',
  nationalityAr: 'الجنسية (AR)',
  issueDate: 'Date de delivrance (JJ/MM/AAAA)',
  expiryDate: "Date d'expiration (JJ/MM/AAAA)",
  issuingAuthority: 'Autorite de delivrance',
  passportNumber: 'Numero de passeport',
  sejourCategory: 'Categorie de sejour',
  address: 'Adresse',
};

const DOCUMENT_NUMBER_LABELS: Record<DocumentType, string> = {
  CNI: 'NNI',
  PASSPORT: 'Numero de passeport',
  SEJOUR: 'NNI',
};

const SINGLE_FACE_LABELS: Partial<Record<DocumentType, string>> = {
  PASSPORT: 'Page biographique',
  SEJOUR: 'Photo de la carte',
};

const ARABIC_FIELDS = new Set<AllIdCardFieldKey>(['fullNameAr', 'placeOfBirthAr', 'nationalityAr']);

const FORM_ROWS_BY_TYPE: Record<DocumentType, [AllIdCardFieldKey, AllIdCardFieldKey | null][]> = {
  CNI: [
    ['fullName', 'fullNameAr'],
    ['dateOfBirth', 'sex'],
    ['placeOfBirth', 'placeOfBirthAr'],
    ['nationality', 'nationalityAr'],
    ['documentNumber', null],
    ['issueDate', 'expiryDate'],
  ],
  PASSPORT: [
    ['fullName', 'fullNameAr'],
    ['dateOfBirth', 'sex'],
    ['placeOfBirth', 'placeOfBirthAr'],
    ['nationality', 'nationalityAr'],
    ['documentNumber', null],
    ['issueDate', 'expiryDate'],
    ['issuingAuthority', null],
  ],
  SEJOUR: [
    ['fullName', 'fullNameAr'],
    ['dateOfBirth', 'sex'],
    ['placeOfBirth', 'placeOfBirthAr'],
    ['nationality', 'nationalityAr'],
    ['documentNumber', null],
  ],
};

const EMPTY_FORM: NewIdCardRecordInput = {
  fullName: '',
  fullNameAr: '',
  dateOfBirth: '',
  placeOfBirth: '',
  placeOfBirthAr: '',
  sex: '',
  nationality: '',
  nationalityAr: '',
  documentNumber: '',
  issueDate: '',
  expiryDate: '',
  issuingAuthority: '',
  passportNumber: '',
  sejourCategory: '',
  address: '',
};

type LocationStatus = 'pending' | 'granted' | 'denied' | 'unavailable';

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function NewRecordPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);

  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [person, setPerson] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [form, setForm] = useState<NewIdCardRecordInput>(EMPTY_FORM);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('pending');

  useEffect(() => {
    apiGet<Company[]>('/companies/mine')
      .then(setCompanies)
      .finally(() => setCompaniesLoading(false));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const selectedCompany = companies.find((c) => c.id === companyId) ?? null;
  const config = documentType ? DOCUMENT_TYPE_CONFIG[documentType] : null;

  function resetDocumentState() {
    setFront(null);
    setBack(null);
    setPerson(null);
    setPhoneNumber('');
    setForm(EMPTY_FORM);
    setWarnings([]);
    setError(null);
  }

  async function handleAnalyze() {
    if (!front || !documentType || !config) return;
    if (config.requiresBack && !back) return;
    setAnalyzing(true);
    setError(null);
    setWarnings([]);
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('front', front);
      if (back) formData.append('back', back);
      const result = await apiForm<OcrExtractionResult>('/ocr', 'POST', formData);
      setForm((prev) => ({ ...prev, ...result.fields }));
      setWarnings(result.warnings ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "L'analyse a echoue, vous pouvez remplir manuellement");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !companyId ||
      !documentType ||
      !config ||
      !front ||
      !person ||
      !phoneNumber.trim() ||
      (config.requiresBack && !back)
    ) {
      setError('Merci de completer tous les elements requis (entreprise, type de document, telephone, images).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('companyId', companyId);
      formData.append('documentType', documentType);
      formData.append('phoneNumber', phoneNumber.trim());
      for (const key of Object.keys(form) as AllIdCardFieldKey[]) {
        formData.append(key, form[key] ?? '');
      }
      formData.append('front', front);
      if (back) formData.append('back', back);
      formData.append('person', person);
      if (location) {
        formData.append('latitude', String(location.latitude));
        formData.append('longitude', String(location.longitude));
        formData.append('locationAccuracy', String(location.accuracy));
      }
      await apiForm('/records', 'POST', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "L'enregistrement a echoue");
    } finally {
      setSaving(false);
    }
  }

  const canAnalyze = !!front && !!config && (!config.requiresBack || !!back) && !analyzing;

  const missingRequirements: string[] = [];
  if (config) {
    if (!phoneNumber.trim()) missingRequirements.push('Telephone');
    if (!front) {
      missingRequirements.push(config.requiresBack ? 'Recto de la carte' : 'Photo du document');
    }
    if (config.requiresBack && !back) missingRequirements.push('Verso de la carte');
    if (!person) missingRequirements.push('Photo de la personne');
    for (const key of config.requiredFields) {
      if (!(form[key] ?? '').trim()) {
        missingRequirements.push(key === 'documentNumber' ? DOCUMENT_NUMBER_LABELS[documentType!] : BASE_LABELS[key] ?? key);
      }
    }
  }

  const canSubmit = !!companyId && !!config && missingRequirements.length === 0 && !saving;

  if (companiesLoading) {
    return <p className="py-8 text-center text-slate-500">Chargement...</p>;
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>Aucune entreprise ne vous est assignee. Contactez un administrateur pour pouvoir collecter des donnees.</span>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Choisir une entreprise</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => setCompanyId(company.id)}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              {company.logoPath ? (
                <img
                  src={uploadUrl(company.logoPath)}
                  alt={company.name}
                  className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  ?
                </div>
              )}
              <span className="flex-1 font-medium text-slate-800">{company.name}</span>
              <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!documentType) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Type de document</h1>
          <button
            type="button"
            onClick={() => setCompanyId(null)}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
          >
            <FontAwesomeIcon icon={faBuildingCircleArrowRight} className="h-3.5 w-3.5" />
            Changer d'entreprise
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Entreprise : <span className="font-medium text-slate-700">{selectedCompany?.name}</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setDocumentType(type)}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <FontAwesomeIcon icon={DOCUMENT_TYPE_CONFIG[type].icon} className="h-8 w-8 text-emerald-600" />
              <span className="font-medium text-slate-800">{DOCUMENT_TYPE_CONFIG[type].label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {analyzing && <LoadingOverlay message="Analyse en cours..." />}
      {saving && <LoadingOverlay message="Enregistrement en cours..." />}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Nouvel enregistrement</h1>
        <button
          type="button"
          onClick={() => {
            setDocumentType(null);
            resetDocumentState();
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          <FontAwesomeIcon icon={faBuildingCircleArrowRight} className="h-3.5 w-3.5" />
          Changer de type
        </button>
      </div>
      <p className="mb-2 text-sm text-slate-500">
        Entreprise : <span className="font-medium text-slate-700">{selectedCompany?.name}</span>
        {' · '}
        Document : <span className="font-medium text-slate-700">{config?.label}</span>
      </p>

      <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
        {locationStatus === 'pending' && 'Localisation en cours...'}
        {locationStatus === 'granted' && 'Position enregistree avec cet enregistrement'}
        {locationStatus === 'denied' && 'Position non autorisee (facultatif)'}
        {locationStatus === 'unavailable' && 'Localisation indisponible sur cet appareil'}
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <ImagePickerField
          label={
            config?.requiresBack
              ? 'Recto de la carte'
              : (documentType && SINGLE_FACE_LABELS[documentType]) || 'Photo du document'
          }
          file={front}
          onChange={setFront}
        />
        {config?.requiresBack && <ImagePickerField label="Verso de la carte" file={back} onChange={setBack} />}
        <div className={config?.requiresBack ? 'sm:col-span-2' : ''}>
          <ImagePickerField label="Photo de la personne" file={person} onChange={setPerson} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
        {analyzing ? 'Analyse en cours...' : 'Analyser (remplissage automatique)'}
      </button>

      {warnings.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Certains champs n'ont pas pu etre lus automatiquement :</p>
            <ul className="mt-1 list-inside list-disc">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Telephone</label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faPhone}
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="tel"
              inputMode="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {FORM_ROWS_BY_TYPE[documentType].map(([left, right]) => (
          <div key={left} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {left === 'documentNumber' ? DOCUMENT_NUMBER_LABELS[documentType] : BASE_LABELS[left]}
              </label>
              <input
                type="text"
                dir={ARABIC_FIELDS.has(left) ? 'rtl' : 'ltr'}
                value={form[left] ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, [left]: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {right && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {right === 'documentNumber' ? DOCUMENT_NUMBER_LABELS[documentType] : BASE_LABELS[right]}
                </label>
                <input
                  type="text"
                  dir={ARABIC_FIELDS.has(right) ? 'rtl' : 'ltr'}
                  value={form[right] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [right]: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        ))}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!canSubmit && !saving && missingRequirements.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Il manque : {missingRequirements.join(', ')}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Valider et enregistrer'}
        </button>
      </form>
    </div>
  );
}
