import { GST_STATE_CODES } from '../shared/indianStates';
import type { SectionErrors, SectionValues, SettingsSectionId } from '../shared/settings.types';

/** Rules that compare fields within one settings section. Each returns errors keyed by the field to highlight. */
type CrossFieldRule = (values: SectionValues) => SectionErrors;

function text(values: SectionValues, key: string): string {
  const value = values[key];
  return typeof value === 'string' ? value.trim() : '';
}

/** Merges rule results; earlier rules win when two flag the same field. */
function combine(...results: readonly SectionErrors[]): SectionErrors {
  return results.reduceRight<SectionErrors>((merged, result) => ({ ...merged, ...result }), {});
}

const organizationRules: CrossFieldRule = (values): SectionErrors => {
  const pan = text(values, 'pan');
  const gstin = text(values, 'gstin');
  const state = text(values, 'state');
  const stateCode = GST_STATE_CODES[state];

  return combine(
    pan && gstin && gstin.slice(2, 12) !== pan ? { gstin: 'GSTIN characters 3–12 must match the firm PAN.' } : {},
    gstin && stateCode && gstin.slice(0, 2) !== stateCode
      ? { gstin: `This GSTIN is not registered in ${state} (state code ${stateCode}).` }
      : {}
  );
};

const billingRules: CrossFieldRule = (values): SectionErrors => {
  const bankFields = ['bankAccountName', 'bankAccountNumber', 'ifsc'];
  const filledBankFields = bankFields.filter((key) => text(values, key) !== '');
  const missingBankFields = filledBankFields.length > 0 ? bankFields.filter((key) => text(values, key) === '') : [];

  return Object.fromEntries(missingBankFields.map((key) => [key, 'Complete all bank details, or leave all three empty.']));
};

const workflowRules: CrossFieldRule = (values): SectionErrors => {
  const escalationHours = Number(text(values, 'escalationThresholdHours'));
  const shortestSlaHours = Number(text(values, 'caFilingSlaDays')) * 24;
  return Number.isFinite(shortestSlaHours) && shortestSlaHours > 0 && escalationHours >= shortestSlaHours
    ? { escalationThresholdHours: `Escalate before the shortest turnaround (under ${shortestSlaHours} hours).` }
    : {};
};

export const CROSS_FIELD_RULES: Readonly<Partial<Record<SettingsSectionId, CrossFieldRule>>> = Object.freeze({
  organization: organizationRules,
  billing: billingRules,
  workflow: workflowRules
});
