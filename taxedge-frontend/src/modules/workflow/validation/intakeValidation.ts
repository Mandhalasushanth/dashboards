import {
  addressFormat,
  bankAccountFormat,
  cityFormat,
  emailFormat,
  gstinFormat,
  ifscFormat,
  indianMobileFormat,
  panFormat,
  pinCodeFormat,
  personOrBusinessNameFormat
} from '@/shared/validation/indianFormats';
import { getServiceType } from '../shared/serviceTypes';
import type { FieldRule, IntakeField } from '../shared/workflowServices';
import type { CaseIntakeInput } from '../shared/workflow.types';

type Check = (value: string) => string | null;

const MAX_AMOUNT = 100_000_000_000;

/** "2025-26": a four-digit start year followed by the next year's last two digits. */
export const financialYearFormat: Check = (value) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  const valid = match !== null && (Number(match[1]) + 1) % 100 === Number(match[2]);
  return value === '' || valid ? null : 'Use the format YYYY-YY, e.g. 2025-26.';
};

export const amountFormat: Check = (value) => {
  if (value === '') {
    return null;
  }
  const amount = Number(value);
  return /^\d+$/.test(value) && amount > 0 && amount <= MAX_AMOUNT ? null : 'Enter a whole rupee amount greater than zero.';
};

const freeTextFormat: Check = (value) =>
  value === '' || /^[A-Za-z0-9][A-Za-z0-9 ,./&()'+-]{1,159}$/.test(value) ? null : 'Use letters, digits and basic punctuation only.';

/** Calendar date (YYYY-MM-DD from a date input) that is real and not in the future. */
export const pastDateFormat: Check = (value) => {
  if (value === '') {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return 'Enter a valid date.';
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const parsed = new Date(year, month - 1, day);
  // Rejects impossible dates such as 31 February, which Date would silently roll over.
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return 'Enter a valid date.';
  }
  return parsed.getTime() > Date.now() ? 'The date cannot be in the future.' : null;
};

/** HSN (goods) or SAC (services) code: 4 to 8 digits, as the GST portal accepts. */
const hsnFormat: Check = (value) => (value === '' || /^\d{4,8}$/.test(value) ? null : 'Enter a 4 to 8 digit HSN / SAC code.');

/** Aadhaar: 12 digits, never starting with 0 or 1. */
const aadhaarFormat: Check = (value) => (value === '' || /^[2-9]\d{11}$/.test(value) ? null : 'Enter a valid 12-digit Aadhaar number.');

/** Income, tax or deduction figure: whole rupees, zero allowed. */
const rupeesFormat: Check = (value) => (value === '' || (/^\d{1,12}$/.test(value) && Number(value) <= MAX_AMOUNT) ? null : 'Enter a whole rupee amount (0 if none).');

/** A real calendar date that may lie ahead, e.g. a reply due date. */
const anyDateFormat: Check = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsed = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  const real = parsed !== null && parsed.getDate() === Number(match?.[3]) && parsed.getMonth() === Number(match?.[2]) - 1;
  return value === '' || real ? null : 'Enter a valid date.';
};

const RULE_CHECKS: Readonly<Record<Exclude<FieldRule, 'option' | 'count'>, Check>> = Object.freeze({
  pan: panFormat,
  gstin: gstinFormat,
  email: emailFormat,
  mobile: indianMobileFormat,
  amount: amountFormat,
  financialYear: financialYearFormat,
  name: personOrBusinessNameFormat,
  text: freeTextFormat,
  date: pastDateFormat,
  pinCode: pinCodeFormat,
  ifsc: ifscFormat,
  bankAccount: bankAccountFormat,
  hsn: hsnFormat,
  address: addressFormat,
  aadhaar: aadhaarFormat,
  rupees: rupeesFormat,
  anyDate: anyDateFormat
});

/** Dropdowns accept only their own options; counts are whole numbers within the field's bounds. */
function checkField(field: Pick<IntakeField, 'label' | 'rule' | 'options' | 'min' | 'max'>, value: string): string | null {
  if (field.rule === 'option') {
    return field.options?.includes(value) ? null : `Choose a ${field.label.toLowerCase()} from the list.`;
  }
  if (field.rule === 'count') {
    const number = Number(value);
    const min = field.min ?? 0;
    const max = field.max ?? 1_000_000;
    return /^\d+$/.test(value) && number >= min && number <= max ? null : `Enter a whole number from ${min} to ${max.toLocaleString('en-IN')}.`;
  }
  return RULE_CHECKS[field.rule](value);
}

export function validateFieldValue(field: Pick<IntakeField, 'label' | 'rule' | 'required' | 'options' | 'min' | 'max'>, raw: string): string | null {
  const value = raw.trim();
  if (value === '') {
    return field.required ? `${field.label} is required.` : null;
  }
  return checkField(field, value);
}

/** Client fields every intake collects, validated by the same rule table as service fields. */
export const CLIENT_FIELDS: readonly (IntakeField & { readonly id: Exclude<keyof CaseIntakeInput['client'], 'custId'> })[] = Object.freeze([
  { id: 'name', label: 'Client Name', placeholder: 'Full name as per PAN', rule: 'name', required: true, maxLength: 120 },
  { id: 'email', label: 'Email', placeholder: 'name@example.com', rule: 'email', required: true, inputMode: 'email', maxLength: 120 },
  { id: 'mobile', label: 'Mobile Number', placeholder: '10-digit mobile, e.g. 9876543210', rule: 'mobile', required: true, inputMode: 'tel', maxLength: 14 },
  { id: 'pan', label: 'PAN', placeholder: 'e.g. ABCPK1234L', rule: 'pan', required: true, uppercase: true, maxLength: 10 },
  { id: 'city', label: 'City', placeholder: 'e.g. Pune', rule: 'name', required: true, maxLength: 60 }
]);

/** Returns field id → message for every invalid field; an empty object means the intake is valid. */
export function validateIntake(raw: CaseIntakeInput): Record<string, string> {
  const input = normalizeIntake(raw);
  const clientErrors = CLIENT_FIELDS.map((field) => {
    const value = input.client[field.id] ?? '';
    const message = field.id === 'city' ? validateFieldValue(field, value) ?? cityFormat(value.trim()) : validateFieldValue(field, value);
    return [`client.${field.id}`, message] as [string, string | null];
  });
  const detailErrors = getServiceType(input.serviceType, input.service).fields.map(
    (field) => [`details.${field.id}`, validateFieldValue(field, input.details[field.id] ?? '')] as [string, string | null]
  );
  return Object.fromEntries([...clientErrors, ...detailErrors].filter((entry): entry is [string, string] => entry[1] !== null));
}

/** Upper-cases identifier fields and trims everything, so stored values are canonical. */
export function normalizeIntake(input: CaseIntakeInput): CaseIntakeInput {
  const fields = getServiceType(input.serviceType, input.service).fields;
  const details = Object.fromEntries(
    fields.map((field) => {
      const value = (input.details[field.id] ?? '').trim();
      return [field.id, field.uppercase ? value.toUpperCase() : value];
    })
  );
  return {
    ...input,
    client: {
      ...(input.client.custId ? { custId: input.client.custId } : {}),
      name: input.client.name.trim(),
      email: input.client.email.trim().toLowerCase(),
      mobile: input.client.mobile.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''),
      pan: input.client.pan.trim().toUpperCase(),
      city: input.client.city.trim()
    },
    details
  };
}
