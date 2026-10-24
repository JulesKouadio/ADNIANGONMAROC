/**
 * Format date to standard French format DD/MM/YYYY (ex: 24/10/2026)
 */
export const formatDateFr = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  
  // If already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // If YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.slice(0, 10).split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Get current date in DD/MM/YYYY format (ex: 24/10/2026)
 */
export const getTodayDateFr = (): string => {
  return formatDateFr(new Date().toISOString());
};
