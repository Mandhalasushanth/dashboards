import { workflowApi } from '@/modules/workflow';
import type { AdminReportsData, FinancialYear } from '../shared/reports.types';
import {
  customerReport,
  gstReport,
  itrReport,
  loanConversionReport,
  loanLeadReport,
  monthlyBusinessReport,
  paymentReport,
  pendingDocumentsReport,
  pendingPaymentsReport,
  reportKpis,
  revenueReport,
  staffPerformanceReport
} from './reportBuilders';

/**
 * DEVELOPMENT ONLY. The admin reports for one financial year (April to March, by submission date), built
 * from the real applications, customers and agents the dashboard loads from the backend.
 * Loaded through a dynamic import guarded by `import.meta.env.DEV`; excluded from production bundles.
 */
const ALL_CASES_PAGE = 1000;

/** "2026-27" -> 1 Apr 2026 up to (not including) 1 Apr 2027. */
function yearRange(financialYear: FinancialYear): readonly [number, number] {
  const start = Number(financialYear.slice(0, 4));
  return [new Date(start, 3, 1).getTime(), new Date(start + 1, 3, 1).getTime()];
}

export const demoReportsStore = Object.freeze({
  async fetch(financialYear: FinancialYear): Promise<AdminReportsData> {
    const [from, to] = yearRange(financialYear);
    const inYear = (iso: string) => {
      const at = Date.parse(iso);
      return at >= from && at < to;
    };
    const { demoCustomersStore } = await import('./demoCustomersStore');
    const [{ items }, workload, allCustomers] = await Promise.all([
      workflowApi.listCases({ pageSize: ALL_CASES_PAGE }),
      workflowApi.workload(),
      demoCustomersStore.list()
    ]);
    const cases = items.filter((item) => inYear(item.submittedAt));
    const customers = allCustomers.filter((customer) => customer.applications.some((application) => inYear(application.submittedAt)));
    return {
      financialYear,
      generatedAt: new Date().toISOString(),
      kpis: reportKpis(cases),
      // In the order the client listed them.
      reports: [
        customerReport(customers),
        gstReport(cases),
        itrReport(cases),
        loanLeadReport(cases),
        loanConversionReport(cases),
        paymentReport(cases),
        revenueReport(cases),
        staffPerformanceReport(workload),
        pendingDocumentsReport(cases),
        pendingPaymentsReport(cases),
        monthlyBusinessReport(cases, from)
      ]
    };
  }
});
