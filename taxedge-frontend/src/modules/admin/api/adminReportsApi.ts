import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import {
  REPORT_CATEGORIES,
  type AdminReport,
  type AdminReportsData,
  type FinancialYear,
  type ReportColumn,
  type ReportKpi
} from '../shared/reports.types';

type RawRecord = Record<string, unknown>;

const FORMATS = ['text', 'number', 'currency', 'percent', 'days'];

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCell = (value: unknown): value is string | number =>
  typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));

function parseColumn(raw: unknown): ReportColumn | null {
  if (!isRecord(raw) || typeof raw.label !== 'string') return null;
  return {
    label: raw.label,
    format: FORMATS.includes(raw.format as string) ? (raw.format as ReportColumn['format']) : 'text',
    exportOnly: raw.exportOnly === true
  };
}

/** Validates one report; malformed reports or rows are skipped rather than rendered. */
function parseReport(raw: unknown): AdminReport | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.title !== 'string') return null;
  if (!(REPORT_CATEGORIES as readonly unknown[]).includes(raw.category) || !Array.isArray(raw.columns)) return null;
  const columns = raw.columns.map(parseColumn).filter((column): column is ReportColumn => column !== null);
  const rows = Array.isArray(raw.rows)
    ? raw.rows.filter((row): row is (string | number)[] => Array.isArray(row) && row.length === columns.length && row.every(isCell))
    : [];
  return {
    id: raw.id,
    category: raw.category as AdminReport['category'],
    title: raw.title,
    description: typeof raw.description === 'string' ? raw.description : '',
    columns,
    rows
  };
}

function parseKpi(raw: unknown): ReportKpi | null {
  if (!isRecord(raw) || typeof raw.label !== 'string' || typeof raw.value !== 'number') return null;
  const column = parseColumn(raw);
  return { label: raw.label, value: raw.value, format: column?.format ?? 'number', hint: typeof raw.hint === 'string' ? raw.hint : '' };
}

function parseReports(raw: unknown, financialYear: FinancialYear): AdminReportsData {
  const record = isRecord(raw) ? raw : {};
  const list = <T>(value: unknown, parse: (item: unknown) => T | null) =>
    (Array.isArray(value) ? value : []).map(parse).filter((item): item is T => item !== null);
  return {
    financialYear,
    generatedAt: typeof record.generatedAt === 'string' ? record.generatedAt : new Date().toISOString(),
    kpis: list(record.kpis, parseKpi),
    reports: list(record.reports, parseReport)
  };
}

export async function fetchAdminReports(financialYear: FinancialYear): Promise<AdminReportsData> {
  // Statically removed from production builds, like the other admin demo stores.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoReportsStore } = await import('../dev/demoReportsStore');
    return parseReports(await demoReportsStore.fetch(financialYear), financialYear);
  }
  const query = `?financialYear=${encodeURIComponent(financialYear)}`;
  return parseReports(await apiClient.get<unknown>(`${API_ENDPOINTS.admin.reports}${query}`), financialYear);
}
