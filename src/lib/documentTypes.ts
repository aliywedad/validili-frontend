import { faIdCard, faIdCardClip, faPassport } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { DocumentType, IdCardFieldKey, OptionalIdCardFieldKey } from '../types';

export interface DocumentTypeConfig {
  label: string;
  icon: IconDefinition;
  requiredFields: IdCardFieldKey[];
  optionalFields: OptionalIdCardFieldKey[];
  requiresBack: boolean;
}

export const DOCUMENT_TYPES: DocumentType[] = ['CNI', 'PASSPORT', 'SEJOUR'];

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, DocumentTypeConfig> = {
  CNI: {
    label: "Carte Nationale d'Identite",
    icon: faIdCard,
    requiredFields: [
      'fullName',
      'dateOfBirth',
      'placeOfBirth',
      'sex',
      'nationality',
      'documentNumber',
      'issueDate',
      'expiryDate',
    ],
    optionalFields: ['fullNameAr', 'placeOfBirthAr', 'nationalityAr'],
    requiresBack: true,
  },
  PASSPORT: {
    label: 'Passeport',
    icon: faPassport,
    requiredFields: [
      'fullName',
      'dateOfBirth',
      'placeOfBirth',
      'sex',
      'nationality',
      'documentNumber',
      'issueDate',
      'expiryDate',
    ],
    optionalFields: ['fullNameAr', 'placeOfBirthAr', 'nationalityAr', 'issuingAuthority'],
    requiresBack: false,
  },
  SEJOUR: {
    label: 'Carte de Sejour',
    icon: faIdCardClip,
    // Real "Carte de Resident" cards show only fullName, dateOfBirth, placeOfBirth, sex,
    // nationality and a "Numero National d'Identification" on the front, bilingual FR/AR.
    // No issue/expiry date, passport number, category or address are printed on the card.
    requiredFields: ['fullName', 'dateOfBirth', 'placeOfBirth', 'sex', 'nationality', 'documentNumber'],
    optionalFields: ['fullNameAr', 'placeOfBirthAr', 'nationalityAr'],
    requiresBack: false,
  },
};
