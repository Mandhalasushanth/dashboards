import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { fetchAdminReports } from '../api/adminReportsApi';
import { FINANCIAL_YEARS, type AdminReport, type AdminReportsData, type FinancialYear, type ReportCategoryFilter } from '../shared/reports.types';

export type ReportsStatus = 'loading' | 'ready' | 'error';

export interface AdminReportsController {
  readonly status: ReportsStatus;
  readonly error: string | null;
  readonly data: AdminReportsData | null;
  readonly visible: readonly AdminReport[];
  readonly financialYear: FinancialYear;
  readonly category: ReportCategoryFilter;
  readonly setFinancialYear: (year: FinancialYear) => void;
  readonly setCategory: (category: ReportCategoryFilter) => void;
  readonly reload: () => void;
}

function toMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  logger.error('Unexpected reports failure.', error);
  return defaultMessageFor('UNKNOWN');
}

/** Loads the admin reports for one financial year and filters them by category. */
export function useAdminReports(): AdminReportsController {
  const [financialYear, setFinancialYear] = useState<FinancialYear>(FINANCIAL_YEARS[0]);
  const [category, setCategory] = useState<ReportCategoryFilter>('ALL');
  const [data, setData] = useState<AdminReportsData | null>(null);
  const [status, setStatus] = useState<ReportsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fetchAdminReports(financialYear)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
        setStatus('ready');
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(toMessage(loadError));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [financialYear, loadCount]);

  const visible = useMemo(
    () => (data?.reports ?? []).filter((report) => category === 'ALL' || report.category === category),
    [data, category]
  );

  const reload = useCallback(() => setLoadCount((count) => count + 1), []);

  return { status, error, data, visible, financialYear, category, setFinancialYear, setCategory, reload };
}
