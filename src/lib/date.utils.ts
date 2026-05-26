/**
 * Utility functions for precise Asia/Jakarta (WIB) timezone handling.
 * This prevents the Next.js server (which runs in UTC) from miscalculating
 * date boundaries for Indonesian users.
 */

// WIB is UTC+7
const WIB_OFFSET_HOURS = 7;
const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Returns a new Date object representing the current time in WIB,
 * but shifted so that its UTC methods (e.g. getUTCHours) match local WIB time.
 * This is an internal helper.
 */
function getWibDate(date = new Date()): Date {
  return new Date(date.getTime() + WIB_OFFSET_MS);
}

/**
 * Get the current hour in WIB (0-23)
 */
export function getWibCurrentHour(): number {
  return getWibDate().getUTCHours();
}

/**
 * Get the start of the current day in WIB, formatted as ISO string (UTC).
 * E.g., if today is 2026-05-26 in WIB, returns "2026-05-25T17:00:00.000Z"
 */
export function getWibTodayStart(date = new Date()): string {
  const wib = getWibDate(date);
  // Create a UTC date representing 00:00:00 in WIB, then shift back to real UTC
  const wibStart = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate(), 0, 0, 0, 0));
  return new Date(wibStart.getTime() - WIB_OFFSET_MS).toISOString();
}

/**
 * Get the end of the current day in WIB, formatted as ISO string (UTC).
 * E.g., if today is 2026-05-26 in WIB, returns "2026-05-26T16:59:59.999Z"
 */
export function getWibTodayEnd(date = new Date()): string {
  const wib = getWibDate(date);
  const wibEnd = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate(), 23, 59, 59, 999));
  return new Date(wibEnd.getTime() - WIB_OFFSET_MS).toISOString();
}

/**
 * Get the start of the month in WIB, formatted as ISO string (UTC).
 */
export function getWibMonthStart(date = new Date()): string {
  const wib = getWibDate(date);
  const wibStart = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), 1, 0, 0, 0, 0));
  return new Date(wibStart.getTime() - WIB_OFFSET_MS).toISOString();
}

/**
 * Get the end of the month in WIB, formatted as ISO string (UTC).
 */
export function getWibMonthEnd(date = new Date()): string {
  const wib = getWibDate(date);
  // Next month, day 0 gives the last day of the current month
  const wibEnd = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return new Date(wibEnd.getTime() - WIB_OFFSET_MS).toISOString();
}

/**
 * Converts a specific YYYY-MM string to its WIB month boundaries in UTC ISO strings.
 */
export function getWibMonthBoundaries(yearMonth: string): { startDate: string, endDate: string } {
  const [year, month] = yearMonth.split('-').map(Number);
  // Note: Date.UTC months are 0-indexed.
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  
  return {
    startDate: new Date(start.getTime() - WIB_OFFSET_MS).toISOString(),
    endDate: new Date(end.getTime() - WIB_OFFSET_MS).toISOString()
  };
}
