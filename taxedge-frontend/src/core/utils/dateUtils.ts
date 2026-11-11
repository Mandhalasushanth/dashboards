const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const RELATIVE_FORMAT = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Formats an ISO timestamp in the user's locale; returns the fallback for missing or invalid input. */
export function formatDateTime(isoTimestamp: string | null, fallback = '—'): string {
  if (!isoTimestamp) {
    return fallback;
  }
  const date = new Date(isoTimestamp);
  return Number.isNaN(date.getTime()) ? fallback : DATE_TIME_FORMAT.format(date);
}

/** "just now", "12 minutes ago", "3 hours ago"; older than a day falls back to the full date and time. */
export function formatRelativeTime(isoTimestamp: string, now: number = Date.now()): string {
  const elapsed = now - Date.parse(isoTimestamp);
  if (Number.isNaN(elapsed)) {
    return '—';
  }
  if (elapsed < MINUTE_MS) {
    return 'just now';
  }
  if (elapsed < HOUR_MS) {
    return RELATIVE_FORMAT.format(-Math.floor(elapsed / MINUTE_MS), 'minute');
  }
  if (elapsed < DAY_MS) {
    return RELATIVE_FORMAT.format(-Math.floor(elapsed / HOUR_MS), 'hour');
  }
  return formatDateTime(isoTimestamp);
}

export type DayGroup = 'Today' | 'Yesterday' | 'Earlier';

/** Calendar-day bucket in the user's time zone. */
export function getDayGroup(isoTimestamp: string, now: Date = new Date()): DayGroup {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const time = Date.parse(isoTimestamp);
  if (time >= startOfToday) {
    return 'Today';
  }
  return time >= startOfToday - DAY_MS ? 'Yesterday' : 'Earlier';
}

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const DAY_FORMAT = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const SHORT_DAY_FORMAT = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

/** "12:45 pm" in the user's locale. */
export function formatTime(isoTimestamp: string): string {
  const time = Date.parse(isoTimestamp);
  return Number.isNaN(time) ? '' : TIME_FORMAT.format(time);
}

/** Chat day separator: "Today", "Yesterday", or a full date. */
export function formatDayLabel(isoTimestamp: string, now: Date = new Date()): string {
  const group = getDayGroup(isoTimestamp, now);
  return group === 'Earlier' ? DAY_FORMAT.format(Date.parse(isoTimestamp)) : group;
}

/** Compact list timestamp: time today, "Yesterday", otherwise "13 Oct". */
export function formatListTimestamp(isoTimestamp: string, now: Date = new Date()): string {
  const group = getDayGroup(isoTimestamp, now);
  if (group === 'Today') {
    return formatTime(isoTimestamp);
  }
  return group === 'Yesterday' ? 'Yesterday' : SHORT_DAY_FORMAT.format(Date.parse(isoTimestamp));
}
