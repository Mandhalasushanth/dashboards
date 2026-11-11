import type { IconName } from '@/shared';

export type SettingsSectionId = 'organization' | 'billing' | 'security' | 'workflow' | 'notifications';

/** digits: 0-9 only; phone: digits, +, space, hyphen; alphanumeric: letters and digits; code: letters, digits, / and -. */
export type SettingsInputFilter = 'digits' | 'phone' | 'alphanumeric' | 'code';

export type SettingsFieldType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'time' | 'select' | 'textarea' | 'toggle';

/** Form values are strings (inputs) or booleans (toggles); numbers are converted at the API boundary. */
export type SettingsValue = string | boolean;

export type SectionValues = Readonly<Record<string, SettingsValue>>;

export type AdminSettings = Readonly<Record<SettingsSectionId, SectionValues>>;

export type SectionErrors = Readonly<Record<string, string>>;

export type SettingsErrors = Partial<Record<SettingsSectionId, SectionErrors>>;

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

/** Declarative description of one settings field; the page renders and validates from this. */
export interface SettingsFieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type: SettingsFieldType;
  readonly defaultValue: SettingsValue;
  readonly placeholder?: string;
  readonly hint?: string;
  readonly required?: boolean;
  readonly options?: readonly SelectOption[];
  readonly min?: number;
  readonly max?: number;
  readonly unit?: string;
  readonly maxLength?: number;
  /** Drops characters the field can never contain, as the user types. */
  readonly inputFilter?: SettingsInputFilter;
  /** Converts input to upper case as the user types (PAN, GSTIN, IFSC…). */
  readonly uppercase?: boolean;
  /** Format rule applied after the required check; returns an error message or null. */
  readonly format?: (value: string) => string | null;
  readonly inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'url';
  readonly autoComplete?: string;
  /** Spans both grid columns on wide screens. */
  readonly fullWidth?: boolean;
}

export interface SettingsSectionConfig {
  readonly id: SettingsSectionId;
  readonly label: string;
  readonly description: string;
  readonly iconName: IconName;
  readonly fields: readonly SettingsFieldConfig[];
}
