const MINOR_AGE_THRESHOLD = 18;

export function parseDDMMYYYY(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Returns null when the date can't be parsed (status unknown). */
export function isMinor(dateOfBirth: string | null | undefined): boolean | null {
  const birthDate = parseDDMMYYYY(dateOfBirth);
  if (!birthDate) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < MINOR_AGE_THRESHOLD;
}

/** Returns null when the date can't be parsed (status unknown). */
export function isExpired(expiryDate: string | null | undefined): boolean | null {
  const date = parseDDMMYYYY(expiryDate);
  if (!date) return null;
  return date.getTime() < Date.now();
}
