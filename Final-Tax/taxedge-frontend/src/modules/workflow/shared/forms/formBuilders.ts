import type { IntakeField } from '../workflowServices';

/**
 * Small builders for the service forms copied from the customer mobile app. A field is required unless
 * the app only asks for it in some cases (then `optional` marks it), and each field belongs to the
 * section heading it sits under in the app.
 */
export type FieldSpec = Omit<IntakeField, 'section' | 'required' | 'placeholder'> & { readonly placeholder?: string; readonly required?: boolean };

export const group = (section: string, specs: readonly FieldSpec[]): IntakeField[] =>
  specs.map((spec) => ({ placeholder: '', required: true, ...spec, section }));

export const optional = (spec: FieldSpec): FieldSpec => ({ ...spec, required: false });

export const choice = (id: string, label: string, options: readonly string[]): FieldSpec => ({
  id,
  label,
  rule: 'option',
  kind: 'dropdown',
  options,
  placeholder: `Select ${label.toLowerCase()}`
});

export const name = (id: string, label: string, placeholder = '', maxLength = 100): FieldSpec => ({ id, label, placeholder, rule: 'name', maxLength });

export const note = (id: string, label: string, placeholder = ''): FieldSpec => ({ id, label, placeholder, rule: 'text', maxLength: 160 });

export const address = (id: string, label: string): FieldSpec => ({ id, label, rule: 'address', placeholder: 'Building, street, area', maxLength: 120 });

/** Loan amounts and prices: whole rupees above zero. */
export const amount = (id: string, label: string, placeholder = 'e.g. 500000'): FieldSpec => ({ id, label, placeholder, rule: 'amount', kind: 'number', inputMode: 'numeric', maxLength: 12 });

/** Income, tax and deduction figures: whole rupees, zero allowed (the app sends "0" when nothing applies). */
export const rupees = (id: string, label: string): FieldSpec => ({ id, label, placeholder: '0', rule: 'rupees', kind: 'number', inputMode: 'numeric', maxLength: 12 });

export const count = (id: string, label: string, min: number, max: number): FieldSpec => ({ id, label, rule: 'count', kind: 'number', inputMode: 'numeric', min, max, maxLength: String(max).length });

export const day = (id: string, label: string): FieldSpec => ({ id, label, rule: 'date', kind: 'date', placeholder: 'DD-MM-YYYY' });

/** A date that may be in the future, e.g. a due date. */
export const dueDay = (id: string, label: string): FieldSpec => ({ id, label, rule: 'anyDate', kind: 'date', placeholder: 'DD-MM-YYYY' });

export const pan = (id: string, label: string): FieldSpec => ({ id, label, rule: 'pan', uppercase: true, placeholder: 'ABCDE1234F', maxLength: 10 });

export const gstin = (id = 'gstin', label = 'GSTIN'): FieldSpec => ({ id, label, rule: 'gstin', uppercase: true, placeholder: '22AAAAA1111A1Z1', maxLength: 15 });

export const aadhaar = (id: string, label: string): FieldSpec => ({ id, label, rule: 'aadhaar', inputMode: 'numeric', placeholder: '12-digit Aadhaar', maxLength: 12 });

export const mobile = (id: string, label: string): FieldSpec => ({ id, label, rule: 'mobile', inputMode: 'tel', placeholder: '10-digit mobile', maxLength: 10 });

export const email = (id: string, label: string): FieldSpec => ({ id, label, rule: 'email', inputMode: 'email', placeholder: 'name@example.com', maxLength: 120 });

export const pinCode = (id: string, label = 'PIN Code'): FieldSpec => ({ id, label, rule: 'pinCode', inputMode: 'numeric', placeholder: '6-digit PIN code', maxLength: 6 });

export const ifsc = (id: string, label = 'IFSC Code'): FieldSpec => ({ id, label, rule: 'ifsc', uppercase: true, placeholder: 'e.g. HDFC0001234', maxLength: 11 });

export const bankAccount = (id: string, label = 'Bank Account Number'): FieldSpec => ({ id, label, rule: 'bankAccount', inputMode: 'numeric', placeholder: '9 to 18 digits', maxLength: 18 });

export const YES_NO = ['Yes', 'No'] as const;

/** Documents as the app lists them; `optional` names are the ones it marks optional or asks for only in some cases. */
export const documents = (required: readonly string[], optionalDocs: readonly string[] = []) => [
  ...required.map((label) => ({ label, required: true })),
  ...optionalDocs.map((label) => ({ label, required: false }))
];

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
] as const;
