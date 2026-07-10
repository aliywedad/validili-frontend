export type Role = 'USER' | 'ADMIN';

export type DocumentType = 'CNI' | 'PASSPORT' | 'SEJOUR';

export interface AuthUser {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: Role;
  profileImagePath: string | null;
}

export interface Company {
  id: string;
  name: string;
  logoPath: string | null;
  isAcceptMinor: boolean;
  isAcceptExpired: boolean;
  createdAt: string;
}

export interface IdCardRecord {
  id: string;
  documentType: DocumentType;
  fullName: string;
  fullNameAr: string | null;
  phoneNumber: string | null;
  dateOfBirth: string;
  placeOfBirth: string | null;
  placeOfBirthAr: string | null;
  sex: string;
  nationality: string;
  nationalityAr: string | null;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  frontImagePath: string;
  backImagePath: string | null;
  personImagePath: string | null;
  issuingAuthority: string | null;
  passportNumber: string | null;
  sejourCategory: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  companyId: string | null;
  collectedById: string;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    logoPath: string | null;
  } | null;
  collectedBy?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
}

export interface PaginatedRecords {
  records: IdCardRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export type IdCardFieldKey =
  | 'fullName'
  | 'dateOfBirth'
  | 'placeOfBirth'
  | 'sex'
  | 'nationality'
  | 'documentNumber'
  | 'issueDate'
  | 'expiryDate';

export type OptionalIdCardFieldKey =
  | 'fullNameAr'
  | 'placeOfBirthAr'
  | 'nationalityAr'
  | 'issuingAuthority'
  | 'passportNumber'
  | 'sejourCategory'
  | 'address';

export type AllIdCardFieldKey = IdCardFieldKey | OptionalIdCardFieldKey;

export type NewIdCardRecordInput = Record<IdCardFieldKey, string> & Partial<Record<OptionalIdCardFieldKey, string>>;

export interface OcrExtractionResult {
  fields: Partial<Record<AllIdCardFieldKey, string>>;
  warnings?: string[];
}
