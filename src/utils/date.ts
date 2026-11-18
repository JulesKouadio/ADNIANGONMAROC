const DAYS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

const parseDateObject = (input?: string | Date | null): Date | null => {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const trimmed = input.trim();

  // Match "Jour DD/MM/YYYY HHhMM" or "Jour DD/MM/YYYY" or "DD/MM/YYYY"
  const frMatch = trimmed.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2})h(\d{2}))?/);
  if (frMatch) {
    const day = Number(frMatch[1]);
    const month = Number(frMatch[2]) - 1;
    const year = Number(frMatch[3]);
    const hour = frMatch[4] ? Number(frMatch[4]) : 12;
    const minute = frMatch[5] ? Number(frMatch[5]) : 0;
    const d = new Date(year, month, day, hour, minute, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  // Match YYYY-MM-DD (avoid timezone shift by parsing locally)
  const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const year = Number(isoDateOnly[1]);
    const month = Number(isoDateOnly[2]) - 1;
    const day = Number(isoDateOnly[3]);
    const d = new Date(year, month, day, 12, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Format simple DD/MM/YYYY (ex: 24/10/2026)
 */
export const formatDateFr = (dateStr?: string | Date | null): string => {
  const d = parseDateObject(dateStr);
  if (!d) return typeof dateStr === 'string' && dateStr ? dateStr : '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Date courte : "Mardi 12/11/2026"
 */
export const formatShortDateFr = (dateInput?: string | Date | null): string => {
  const d = parseDateObject(dateInput);
  if (!d) return typeof dateInput === 'string' && dateInput ? dateInput : '-';
  const dayName = DAYS_FR[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${dayName} ${day}/${month}/${year}`;
};

/**
 * Date longue : "Mardi 12/11/2026 16h45"
 */
export const formatLongDateFr = (dateInput?: string | Date | null): string => {
  const d = parseDateObject(dateInput);
  if (!d) return typeof dateInput === 'string' && dateInput ? dateInput : '-';
  const dayName = DAYS_FR[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dayName} ${day}/${month}/${year} ${hours}h${minutes}`;
};

/**
 * Convertit une chaîne de date (ISO, DD/MM/YYYY, Jour DD/MM/YYYY) vers YYYY-MM-DD pour <input type="date">
 */
export const toIsoDateInput = (dateInput?: string | null): string => {
  const d = parseDateObject(dateInput);
  if (!d) return new Date().toISOString().split('T')[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Pour le tri chronologique fiable
 */
export const parseDateTimestamp = (dateInput?: string | null): number => {
  const d = parseDateObject(dateInput);
  return d ? d.getTime() : 0;
};

/**
 * Règle métier : Un délai limite de 7 jours après la fin du mois marque un retard ("Hors délai" = OUI)
 * si le rapport mensuel n'est toujours pas finalisé (ou a été finalisé après le 7 du mois suivant).
 */
export const isMonthlyReportLate = (
  year: number,
  month: number, // 1 à 12
  reportText?: string,
  reportUpdatedAtIso?: string,
  now: Date = new Date()
): boolean => {
  // Date limite : le 7 du mois suivant à 23:59:59
  // Ex: pour Novembre (month=11), new Date(year, 11, 7, 23, 59, 59) = 7 Décembre
  const deadline = new Date(year, month, 7, 23, 59, 59, 999);

  const hasReport = Boolean(reportText && reportText.trim().length > 0);
  if (hasReport && reportUpdatedAtIso) {
    const submitted = new Date(reportUpdatedAtIso);
    if (!isNaN(submitted.getTime())) {
      return submitted.getTime() > deadline.getTime();
    }
  }

  // Pas encore renseigné : hors délai uniquement si la date limite est dépassée
  return now.getTime() > deadline.getTime();
};
