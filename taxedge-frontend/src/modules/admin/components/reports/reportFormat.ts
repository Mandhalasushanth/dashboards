import type { ReportCell, ReportColumnFormat } from '../../shared/reports.types';

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const NUMBER = new Intl.NumberFormat('en-IN');

/** ₹ amounts of a lakh or more are shortened to L / Cr, the way Indian finance reports read. */
export function formatCompactInr(value: number): string {
  if (Math.abs(value) >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (Math.abs(value) >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`;
  return INR.format(value);
}

export function formatCell(value: ReportCell, format: ReportColumnFormat, compact = false): string {
  if (typeof value === 'string') return value;
  switch (format) {
    case 'currency':
      return compact ? formatCompactInr(value) : INR.format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'days':
      return `${value.toFixed(1)} days`;
    case 'number':
      return NUMBER.format(value);
    default:
      return String(value);
  }
}

/** Quotes every field and neutralises spreadsheet formula prefixes (CSV injection). */
function csvField(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function downloadReportCsv(
  fileName: string,
  headers: readonly string[],
  rows: readonly (readonly ReportCell[])[]
): void {
  const lines = [headers, ...rows].map((row) => row.map((cell) => csvField(String(cell))).join(','));
  // The BOM makes Excel read the ₹ sign and other UTF-8 text correctly.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
