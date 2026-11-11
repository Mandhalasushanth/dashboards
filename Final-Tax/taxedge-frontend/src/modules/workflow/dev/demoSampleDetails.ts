import type { ServiceTypeDefinition } from '../shared/serviceTypes';
import type { FieldRule, IntakeField } from '../shared/workflowServices';
import { validateFieldValue } from '../validation/intakeValidation';

/**
 * DEVELOPMENT ONLY. Fills every field of a demo case with a valid sample value, built from the field's own
 * rule, so demo applications look like full submissions from the mobile app. A value the seed row gives is
 * kept when it is valid for the field.
 */
interface SampleClient {
  readonly name: string;
  readonly pan: string;
  readonly city: string;
}

const DAY = 86_400_000;
const isoDay = (time: number) => new Date(time).toISOString().slice(0, 10);

const BY_RULE: Readonly<Record<Exclude<FieldRule, 'option' | 'count' | 'name'>, (client: SampleClient) => string>> = Object.freeze({
  pan: (client) => client.pan,
  gstin: (client) => `27${client.pan}1Z5`,
  email: (client) => `${client.name.split(' ')[0].toLowerCase()}@example.com`,
  mobile: () => '9876543210',
  amount: () => '500000',
  rupees: () => '25000',
  financialYear: () => '2025-26',
  text: () => 'As entered in the app',
  date: () => '2025-04-01',
  anyDate: () => isoDay(Date.now() + 10 * DAY),
  pinCode: () => '411001',
  ifsc: () => 'HDFC0001234',
  bankAccount: () => '50100234567812',
  hsn: () => '9983',
  address: (client) => `12, MG Road, ${client.city}`,
  aadhaar: () => '234567890123'
});

const PLACE_WORDS = /city|district/i;

function sampleValue(field: IntakeField, client: SampleClient): string {
  if (field.rule === 'option') {
    const options = field.options ?? [];
    return options.includes('Maharashtra') ? 'Maharashtra' : (options[0] ?? '');
  }
  if (field.rule === 'count') {
    return String(Math.min(field.max ?? 10, Math.max(field.min ?? 0, 2)));
  }
  if (field.rule === 'name') {
    return PLACE_WORDS.test(field.id) ? client.city : client.name;
  }
  return BY_RULE[field.rule](client);
}

export function sampleDetails(type: ServiceTypeDefinition, given: Readonly<Record<string, string>>, client: SampleClient): Record<string, string> {
  return Object.fromEntries(
    type.fields.map((field) => {
      const seeded = given[field.id];
      const keep = seeded !== undefined && seeded !== '' && validateFieldValue(field, seeded) === null;
      return [field.id, keep ? seeded : sampleValue(field, client)];
    })
  );
}
