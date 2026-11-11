/** How the reports are grouped on the page, in tab order. */
export const REPORT_CATEGORIES = ['CUSTOMERS', 'SERVICES', 'LOANS', 'PAYMENTS', 'TEAM', 'BUSINESS'] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportCategoryFilter = ReportCategory | 'ALL';

/** How a column's values are formatted: ₹ amounts use Indian digit grouping. */
export type ReportColumnFormat = 'text' | 'number' | 'currency' | 'percent' | 'days';

export interface ReportColumn {
  readonly label: string;
  readonly format: ReportColumnFormat;
  /** In the Excel, PDF and CSV downloads only; left off the on-screen table to keep it readable. */
  readonly exportOnly?: boolean;
}

export type ReportCell = string | number;

export interface AdminReport {
  readonly id: string;
  readonly category: ReportCategory;
  readonly title: string;
  readonly description: string;
  readonly columns: readonly ReportColumn[];
  readonly rows: readonly (readonly ReportCell[])[];
}

export interface ReportKpi {
  readonly label: string;
  readonly value: number;
  readonly format: ReportColumnFormat;
  readonly hint: string;
}

export interface AdminReportsData {
  readonly financialYear: string;
  readonly generatedAt: string;
  readonly kpis: readonly ReportKpi[];
  readonly reports: readonly AdminReport[];
}

/** Indian financial years run April to March, e.g. "2026-27". */
export type FinancialYear = string;

/** The financial year a date falls in: April 2026 to March 2027 is "2026-27". */
export function financialYearOf(date: Date): FinancialYear {
  const start = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

/** The current financial year first, then the two before it. */
export const FINANCIAL_YEARS: readonly FinancialYear[] = Object.freeze(
  [0, 1, 2].map((back) => {
    const start = Number(financialYearOf(new Date()).slice(0, 4)) - back;
    return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
  })
);

export const REPORT_CATEGORY_LABELS: Readonly<Record<ReportCategoryFilter, string>> = Object.freeze({
  ALL: 'All reports',
  CUSTOMERS: 'Customers',
  SERVICES: 'GST & ITR',
  LOANS: 'Loans',
  PAYMENTS: 'Payments & Revenue',
  TEAM: 'Team & Pending',
  BUSINESS: 'Monthly'
});
