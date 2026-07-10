import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBuilding,
  faGaugeHigh,
  faSquarePlus,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

export interface NavItem {
  to: string;
  label: string;
  icon: IconDefinition;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Accueil', icon: faGaugeHigh },
  { to: '/records/new', label: 'Nouveau', icon: faSquarePlus },
  { to: '/profile', label: 'Profil', icon: faUser },
  { to: '/admin/users', label: 'Utilisateurs', icon: faUsers, adminOnly: true },
  { to: '/admin/companies', label: 'Entreprises', icon: faBuilding, adminOnly: true },
];
