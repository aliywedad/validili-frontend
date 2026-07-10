import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChild, faCircleCheck, faCircleXmark, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { isExpired, isMinor } from '../lib/idCardStatus';

const BADGE_CLASS = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium';

export function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const expired = isExpired(expiryDate);
  if (expired === null) return null;

  return expired ? (
    <span className={`${BADGE_CLASS} bg-red-100 text-red-700`}>
      <FontAwesomeIcon icon={faCircleXmark} className="h-3 w-3" />
      Expiree
    </span>
  ) : (
    <span className={`${BADGE_CLASS} bg-emerald-100 text-emerald-700`}>
      <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
      Valide
    </span>
  );
}

export function MinorBadge({ dateOfBirth }: { dateOfBirth: string }) {
  const minor = isMinor(dateOfBirth);
  if (minor === null) return null;

  return minor ? (
    <span className={`${BADGE_CLASS} bg-amber-100 text-amber-800`}>
      <FontAwesomeIcon icon={faChild} className="h-3 w-3" />
      Mineur
    </span>
  ) : (
    <span className={`${BADGE_CLASS} bg-slate-100 text-slate-600`}>
      <FontAwesomeIcon icon={faUserCheck} className="h-3 w-3" />
      Majeur
    </span>
  );
}
