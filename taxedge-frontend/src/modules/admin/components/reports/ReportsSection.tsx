import { useState } from 'react';
import { Button, DeferredContent, Icon, LoadingSpinner, useDocumentTitle, type IconName } from '@/shared';
import { useAdminReports } from '../../hooks/useAdminReports';
import { FINANCIAL_YEARS, REPORT_CATEGORIES, REPORT_CATEGORY_LABELS, type AdminReport } from '../../shared/reports.types';
import { ReportTable } from './ReportTable';
import { exportAllReports } from './reportExport';
import { formatCell } from './reportFormat';
import './ReportsSection.css';

type KpiTone = 'blue' | 'orange' | 'green' | 'purple' | 'red';

/** Icon and colour for each key figure, matching the manager and agent dashboards' tinted cards. */
const KPI_LOOKS: readonly (readonly [RegExp, IconName, KpiTone])[] = [
  [/received/i, 'file-text', 'blue'],
  [/progress/i, 'clock', 'orange'],
  [/completed/i, 'circle-check', 'green'],
  [/revenue/i, 'trending-up', 'purple'],
  [/overdue/i, 'alert-triangle', 'red']
];

const kpiLook = (label: string): { readonly icon: IconName; readonly tone: KpiTone } => {
  const match = KPI_LOOKS.find(([pattern]) => pattern.test(label));
  return match ? { icon: match[1], tone: match[2] } : { icon: 'bar-chart', tone: 'blue' };
};

/**
 * Admin "Reports": one toolbar (which report, which financial year, download everything), the year's key
 * figures, then the chosen report at full width with its own Excel, PDF and CSV downloads.
 */
export default function ReportsSection() {
  useDocumentTitle('Reports');
  const reports = useAdminReports();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const all = reports.data?.reports ?? [];
  const selected: AdminReport | undefined = all.find((report) => report.id === selectedId) ?? all[0];
  const groups = REPORT_CATEGORIES.map((category) => ({ category, items: all.filter((report) => report.category === category) })).filter((group) => group.items.length > 0);

  const reportPicker = selected ? (
    <label className="tx-reports__field tx-reports__report">
      <span className="tx-reports__field-label">Report</span>
      <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>
        {groups.map((group) => (
          <optgroup key={group.category} label={REPORT_CATEGORY_LABELS[group.category]}>
            {group.items.map((report) => (
              <option key={report.id} value={report.id}>
                {report.title} ({report.rows.length})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  ) : null;

  const header = (
    <header className="tx-reports__header">
      {reportPicker}
      <label className="tx-reports__field tx-reports__year">
        <span className="tx-reports__field-label">
          <Icon name="calendar" size="sm" />
          Financial year
        </span>
        <select value={reports.financialYear} onChange={(event) => reports.setFinancialYear(event.target.value)}>
          {FINANCIAL_YEARS.map((year) => (
            <option key={year} value={year}>
              FY {year}
            </option>
          ))}
        </select>
      </label>
      {all.some((report) => report.rows.length > 0) ? (
        <div className="tx-reports__download-all" role="group" aria-label="Download every report">
          <span className="tx-reports__download-label">Download all reports:</span>
          <Button variant="secondary" iconName="download" onClick={() => exportAllReports(all, 'excel', reports.financialYear)}>
            Excel (.xlsx)
          </Button>
          <Button variant="secondary" iconName="download" onClick={() => exportAllReports(all, 'pdf', reports.financialYear)}>
            PDF
          </Button>
        </div>
      ) : null}
    </header>
  );

  if (reports.status === 'loading') {
    return (
      <div className="tx-reports">
        {header}
        <DeferredContent>
          <div className="tx-reports__state">
            <LoadingSpinner size="lg" label="Loading reports" />
          </div>
        </DeferredContent>
      </div>
    );
  }

  if (reports.status === 'error' || !reports.data || !selected) {
    return (
      <div className="tx-reports">
        {header}
        <div className="tx-reports__state" role="alert">
          <p>{reports.error ?? 'No reports are available.'}</p>
          <Button variant="secondary" iconName="rotate-ccw" onClick={reports.reload}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-reports">
      {header}

      <section className="tx-reports__kpis" aria-label={`Key figures for FY ${reports.financialYear}`}>
        {reports.data.kpis.map((kpi) => (
          <div key={kpi.label} className={`tx-reports__kpi tx-reports__kpi--${kpiLook(kpi.label).tone}`}>
            <span className="tx-reports__kpi-icon" aria-hidden="true">
              <Icon name={kpiLook(kpi.label).icon} size="sm" />
            </span>
            <span className="tx-reports__kpi-body">
              <span className="tx-reports__kpi-label">{kpi.label}</span>
              <span className="tx-reports__kpi-value">{formatCell(kpi.value, kpi.format, true)}</span>
              <span className="tx-reports__kpi-hint">{kpi.hint}</span>
            </span>
          </div>
        ))}
      </section>

      <div className="tx-reports__body">
        <ReportTable report={selected} financialYear={reports.financialYear} />
      </div>

      <p className="tx-reports__generated">Generated {new Date(reports.data.generatedAt).toLocaleString('en-IN')}</p>
    </div>
  );
}
