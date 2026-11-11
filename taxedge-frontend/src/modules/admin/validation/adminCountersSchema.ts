import type { AdminCounterKey, AdminNavCounters } from '../shared/adminNavigation';

const COUNTER_KEYS: readonly AdminCounterKey[] = Object.freeze(['applications', 'communication', 'notifications']);

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** Keeps only non-negative whole numbers, so a malformed response can never render a bogus badge. */
export function parseAdminNavCounters(raw: unknown): AdminNavCounters {
  if (typeof raw !== 'object' || raw === null) {
    return {};
  }
  const record = raw as Record<string, unknown>;
  return COUNTER_KEYS.reduce<AdminNavCounters>(
    (counters, key) => (isCount(record[key]) ? { ...counters, [key]: record[key] } : counters),
    {}
  );
}
