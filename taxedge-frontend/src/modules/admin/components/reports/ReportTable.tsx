import { Button } from '@/shared';
import type { AdminReport } from '../../shared/reports.types';
import { exportReport } from './reportExport';
import { formatCell } from './reportFormat';
import './ReportTable.css';

export interface ReportTableProps {
  readonly report: AdminReport;
  readonly financialYear: string;
}

/**
 * One report: title with its row count, the downloads, and a table that fits the page width (long values
 * wrap instead of the table scrolling sideways). Columns marked export-only are in the downloads alone.
 */
export function ReportTable({ report, financialYear }: ReportTableProps) {
  const empty = report.rows.length === 0;
  const shown = report.columns.map((column, index) => ({ column, index })).filter(({ column }) => !column.exportOnly);
  const extra = report.columns.length - shown.length;

  return (
    <article className="tx-report">
      <header className="tx-report__header">
        <div className="tx-report__heading">
          <h2 className="tx-report__title">
            {report.title}
            <span className={`tx-report__count ${empty ? 'tx-report__count--empty' : ''}`}>
              {report.rows.length} {report.rows.length === 1 ? 'row' : 'rows'}
            </span>
          </h2>
          <p className="tx-report__description">{report.description}</p>
        </div>
        <div className="tx-report__exports" role="group" aria-label={`Download ${report.title}`}>
          <span className="tx-report__exports-label" title={extra > 0 ? `Downloads include ${extra} more column${extra === 1 ? '' : 's'}` : undefined}>
            Download
          </span>
          <Button variant="secondary" iconName="download" onClick={() => exportReport(report, 'excel', financialYear)} disabled={empty}>
            Excel
          </Button>
          <Button variant="secondary" iconName="download" onClick={() => exportReport(report, 'pdf', financialYear)} disabled={empty}>
            PDF
          </Button>
          <Button variant="secondary" iconName="download" onClick={() => exportReport(report, 'csv', financialYear)} disabled={empty}>
            CSV
          </Button>
        </div>
      </header>

      {empty ? (
        <div className="tx-report__empty">
          <p className="tx-report__empty-title">No data for this period</p>
          <p className="tx-report__empty-text">Try another financial year, or check back once applications come in.</p>
        </div>
      ) : (
        <div className="tx-report__frame">
          <table className="tx-report__table">
            <thead>
              <tr>
                {shown.map(({ column }) => (
                  <th key={column.label} scope="col" className={column.format === 'text' ? '' : 'tx-report__num'}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {shown.map(({ column, index }) => (
                    <td key={column.label} data-label={column.label} className={column.format === 'text' ? '' : 'tx-report__num'}>
                      {formatCell(row[index], column.format)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
