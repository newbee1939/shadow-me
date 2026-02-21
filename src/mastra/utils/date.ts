/**
 * Returns the timestamp (ms) of 24 hours ago from now.
 */
export const get24HoursAgo = (): number => {
  const now = new Date();
  now.setHours(now.getHours() - 24);
  return now.getTime();
};

/**
 * Parses a date string and returns the timestamp in ms, or null if invalid/undefined.
 */
export const parseDate = (dateStr: string | undefined): number | null => {
  if (!dateStr) {
    return null;
  }
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};
