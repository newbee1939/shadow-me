const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the timestamp (ms) of 24 hours ago from now.
 * Uses millisecond arithmetic to avoid DST-related drift.
 */
export const get24HoursAgo = (): number => Date.now() - MS_PER_DAY;

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
