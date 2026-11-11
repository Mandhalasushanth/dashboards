import type { IntakeField } from './workflowServices';

const RUPEES = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const DATE = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Shows a submitted value the way staff read it: "₹45,00,000", "1 Sep 2026", or the text as entered. */
export function formatFieldValue(field: IntakeField, raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) {
    return '';
  }
  if ((field.rule === 'amount' || field.rule === 'rupees') && /^\d+$/.test(value)) {
    return RUPEES.format(Number(value));
  }
  if ((field.rule === 'date' || field.rule === 'anyDate') && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return DATE.format(new Date(year, month - 1, day));
  }
  return value;
}

/** Whole rupees in Indian grouping, e.g. ₹1,49,900; a dash when not set. */
export const formatRupees = (amount: number | null): string => (amount === null ? '—' : RUPEES.format(amount));
