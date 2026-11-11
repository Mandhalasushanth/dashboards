import { environment } from '@/core/config/environment';
import type { AdminReport, ReportCell } from '../../shared/reports.types';
import { downloadReportCsv, formatCell } from './reportFormat';

/**
 * Report downloads: CSV, Excel and PDF, all made in the browser with no extra libraries.
 * Excel is an Excel 2003 XML workbook (opens in Excel, LibreOffice and Google Sheets), one sheet per report.
 * PDF opens a print-ready copy of the report in a new window and the browser's "Save as PDF" dialog.
 */
export type ReportExportFormat = 'csv' | 'excel' | 'pdf';

const fileBase = (name: string, financialYear: string) =>
  `${environment.appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${name}-FY${financialYear}`;

const escapeXml = (value: string) =>
  value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char] ?? char);

/** Spreadsheet formulas typed by customers ("=…") are kept as text, never run (formula injection). */
const textCell = (value: string) => escapeXml(/^[=+\-@]/.test(value) ? `'${value}` : value);

function sheetXml(report: AdminReport, usedNames: Set<string>): string {
  // Sheet names: at most 31 characters, no []:*?/\ and unique within the workbook.
  let name = report.title.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31);
  for (let n = 2; usedNames.has(name); n += 1) name = `${report.title.slice(0, 27)} (${n})`;
  usedNames.add(name);
  const header = `<Row>${report.columns.map((column) => `<Cell ss:StyleID="h"><Data ss:Type="String">${escapeXml(column.label)}</Data></Cell>`).join('')}</Row>`;
  const rows = report.rows
    .map((row) => `<Row>${row.map((cell, index) => cellXml(cell, report.columns[index]?.format ?? 'text')).join('')}</Row>`)
    .join('');
  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${header}${rows}</Table></Worksheet>`;
}

function cellXml(cell: ReportCell, format: string): string {
  if (typeof cell === 'number') {
    const style = format === 'currency' ? ' ss:StyleID="inr"' : format === 'percent' || format === 'days' ? ' ss:StyleID="dec"' : '';
    return `<Cell${style}><Data ss:Type="Number">${Number.isFinite(cell) ? Math.round(cell * 100) / 100 : 0}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${textCell(cell)}</Data></Cell>`;
}

function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** One workbook; with several reports, each gets its own sheet. */
export function downloadReportsExcel(reports: readonly AdminReport[], fileName: string): void {
  const used = new Set<string>();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#E8EEF8" ss:Pattern="Solid"/></Style>
<Style ss:ID="inr"><NumberFormat ss:Format="&quot;₹&quot;#,##,##0"/></Style>
<Style ss:ID="dec"><NumberFormat ss:Format="0.0"/></Style>
</Styles>
${reports.map((report) => sheetXml(report, used)).join('\n')}
</Workbook>`;
  download(new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' }), fileName);
}

/** A print-ready page of one or more reports; the browser's print dialog saves it as a PDF. */
export function printReportsPdf(reports: readonly AdminReport[], title: string, financialYear: string): void {
  const page = window.open('', '_blank', 'width=1100,height=800');
  if (!page) {
    window.alert('Allow pop-ups for this site to save the report as a PDF.');
    return;
  }
  const tables = reports
    .map(
      (report) => `<section><h2>${escapeXml(report.title)}</h2><p class="d">${escapeXml(report.description)}</p>${
        report.rows.length === 0
          ? '<p class="e">No data for this period.</p>'
          : `<table><thead><tr>${report.columns.map((column) => `<th class="${column.format === 'text' ? '' : 'n'}">${escapeXml(column.label)}</th>`).join('')}</tr></thead><tbody>${report.rows
              .map((row) => `<tr>${row.map((cell, index) => `<td class="${report.columns[index]?.format === 'text' ? '' : 'n'}">${escapeXml(formatCell(cell, report.columns[index]?.format ?? 'text'))}</td>`).join('')}</tr>`)
              .join('')}</tbody></table>`
      }</section>`
    )
    .join('');
  page.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeXml(title)}</title><style>
    body{font:12px/1.45 'Segoe UI',Arial,sans-serif;color:#172033;margin:24px}
    header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #F97316;padding-bottom:8px;margin-bottom:16px}
    h1{font-size:18px;margin:0;color:#0B1A48} .m{color:#64748B;font-size:11px}
    section{margin-bottom:22px;page-break-inside:avoid} h2{font-size:14px;margin:0 0 2px;color:#0B1A48} .d{margin:0 0 8px;color:#64748B}
    table{width:100%;border-collapse:collapse} th{background:#E8EEF8;text-align:left;font-weight:600}
    th,td{padding:5px 7px;border-bottom:1px solid #E2E8F0;vertical-align:top} .n{text-align:right;white-space:nowrap} .e{color:#64748B;font-style:italic}
    @page{size:A4 landscape;margin:12mm}
  </style></head><body><header><h1>${escapeXml(environment.appName)} · ${escapeXml(title)}</h1><span class="m">FY ${escapeXml(financialYear)} · Generated ${escapeXml(new Date().toLocaleString('en-IN'))}</span></header>${tables}</body></html>`);
  page.document.close();
  page.focus();
  // Printing once the page has laid out; the dialog's "Save as PDF" gives the PDF file.
  setTimeout(() => page.print(), 300);
}

export function exportReport(report: AdminReport, format: ReportExportFormat, financialYear: string): void {
  const base = fileBase(report.id, financialYear);
  if (format === 'csv') {
    downloadReportCsv(`${base}.csv`, report.columns.map((column) => column.label), report.rows);
  } else if (format === 'excel') {
    downloadReportsExcel([report], `${base}.xls`);
  } else {
    printReportsPdf([report], report.title, financialYear);
  }
}

/** Every report on the page at once: Excel with a sheet per report, or one PDF. */
export function exportAllReports(reports: readonly AdminReport[], format: Exclude<ReportExportFormat, 'csv'>, financialYear: string): void {
  if (format === 'excel') downloadReportsExcel(reports, `${fileBase('reports', financialYear)}.xls`);
  else printReportsPdf(reports, 'Reports', financialYear);
}
