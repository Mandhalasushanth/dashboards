import type { IconName } from '@/shared';
import type { ServiceKind, WorkflowTeam } from './workflow.types';

/** Validation rule names an intake field can declare; resolved in validation/intakeValidation. */
export type FieldRule =
  | 'pan' | 'gstin' | 'email' | 'mobile' | 'amount' | 'financialYear' | 'name' | 'text' | 'option' | 'date' | 'count'
  | 'pinCode' | 'ifsc' | 'bankAccount' | 'hsn' | 'address' | 'aadhaar' | 'rupees' | 'anyDate';

export interface IntakeField {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly rule: FieldRule;
  readonly required: boolean;
  readonly inputMode?: 'text' | 'numeric' | 'email' | 'tel';
  readonly uppercase?: boolean;
  readonly maxLength?: number;
  /** How the field is entered; matches the mobile app's form field types. Defaults to text. */
  readonly kind?: 'text' | 'number' | 'date' | 'dropdown';
  /** Dropdown choices, exactly as the mobile app offers them. */
  readonly options?: readonly string[];
  /** Bounds for whole-number counts (rule "count"). */
  readonly min?: number;
  readonly max?: number;
  /** Heading the field is grouped under, matching the mobile app's form sections. */
  readonly section?: string;
}

/**
 * Owning service and team for a group of service types (see serviceTypes.ts). Form fields and required
 * documents belong to the service type, exactly as the customer mobile app defines them.
 */
export interface ServiceDefinition {
  readonly kind: ServiceKind;
  readonly label: string;
  readonly shortLabel: string;
  readonly team: WorkflowTeam;
  readonly iconName: IconName;
  readonly slaDays: number;
  /** Where the agent does the work, shown on the "Start Portal Work" step. */
  readonly portal: string;
  /** What the agent uploads when the work is done. */
  readonly outputHint: string;
}

export const SERVICE_DEFINITIONS: Readonly<Record<ServiceKind, ServiceDefinition>> = Object.freeze({
  GST: {
    kind: 'GST',
    label: 'GST Registration & Returns',
    shortLabel: 'GST',
    team: 'CA',
    iconName: 'receipt',
    slaDays: 5,
    portal: 'GST portal (gst.gov.in)',
    outputHint: 'GST acknowledgement (ARN), filed return or registration certificate'
  },
  ITR: {
    kind: 'ITR',
    label: 'Income Tax Return',
    shortLabel: 'ITR',
    team: 'CA',
    iconName: 'file-text',
    slaDays: 4,
    portal: 'Income Tax e-filing portal',
    outputHint: 'ITR-V acknowledgement or refund status'
  },
  INCORPORATION: {
    kind: 'INCORPORATION',
    label: 'Company Registration & Business Services',
    shortLabel: 'Incorporation',
    team: 'CA',
    iconName: 'building',
    slaDays: 15,
    portal: 'MCA portal (SPICe+)',
    outputHint: 'Certificate of Incorporation, SRN receipt or company documents'
  },
  LOAN: {
    kind: 'LOAN',
    label: 'Loan Facilitation',
    shortLabel: 'Loan',
    team: 'LOAN',
    iconName: 'landmark',
    slaDays: 10,
    portal: 'Lender’s portal',
    outputHint: 'Lender application receipt, sanction letter or disbursement advice'
  },
  INSURANCE: {
    kind: 'INSURANCE',
    label: 'Insurance',
    shortLabel: 'Insurance',
    team: 'LOAN',
    iconName: 'shield-check',
    slaDays: 7,
    portal: 'Insurer’s portal',
    outputHint: 'Proposal receipt or issued policy document'
  }
});

export const SERVICE_KINDS = Object.freeze(Object.keys(SERVICE_DEFINITIONS) as ServiceKind[]);

export const TEAM_LABELS: Readonly<Record<WorkflowTeam, string>> = Object.freeze({ CA: 'CA team', LOAN: 'Loan team' });

export function getServiceDefinition(kind: ServiceKind): ServiceDefinition {
  return SERVICE_DEFINITIONS[kind];
}

export function servicesForTeam(team: WorkflowTeam): readonly ServiceKind[] {
  return SERVICE_KINDS.filter((kind) => SERVICE_DEFINITIONS[kind].team === team);
}
