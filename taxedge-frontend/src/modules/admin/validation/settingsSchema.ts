import type {
  AdminSettings,
  SectionErrors,
  SectionValues,
  SettingsErrors,
  SettingsFieldConfig,
  SettingsSectionConfig
} from '../shared/settings.types';
import { CROSS_FIELD_RULES } from './settingsCrossFieldRules';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateNumber(field: SettingsFieldConfig, value: string): string | null {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    return `${field.label} must be a whole number.`;
  }
  if (field.min !== undefined && number < field.min) {
    return `${field.label} must be at least ${field.min}.`;
  }
  if (field.max !== undefined && number > field.max) {
    return `${field.label} must be at most ${field.max}.`;
  }
  return null;
}

/** Validates one field against its config: required, length, type rules, then its format rule. */
export function validateSettingsField(field: SettingsFieldConfig, rawValue: string | boolean): string | null {
  if (typeof rawValue === 'boolean') {
    return null;
  }
  const value = rawValue.trim();
  if (value === '') {
    return field.required ? `${field.label} is required.` : null;
  }
  if (field.maxLength !== undefined && value.length > field.maxLength) {
    return `${field.label} must be at most ${field.maxLength} characters.`;
  }
  if (field.type === 'number') {
    return validateNumber(field, value);
  }
  if (field.type === 'time' && !TIME_PATTERN.test(value)) {
    return `${field.label} must be a valid time (HH:MM).`;
  }
  if (field.type === 'select' && field.options && !field.options.some((option) => option.value === value)) {
    return `Choose a valid ${field.label.toLowerCase()}.`;
  }
  return field.format ? field.format(value) : null;
}

export function validateSettingsSection(section: SettingsSectionConfig, values: SectionValues): SectionErrors {
  const fieldErrors = section.fields.reduce<Record<string, string>>((errors, field) => {
    const message = validateSettingsField(field, values[field.key] ?? field.defaultValue);
    return message ? { ...errors, [field.key]: message } : errors;
  }, {});
  const crossErrors = CROSS_FIELD_RULES[section.id]?.(values) ?? {};
  // A field's own format error takes precedence over a cross-field message.
  return { ...crossErrors, ...fieldErrors };
}

/** Returns errors only for sections that have any. */
export function validateSettings(sections: readonly SettingsSectionConfig[], settings: AdminSettings): SettingsErrors {
  return sections.reduce<SettingsErrors>((all, section) => {
    const errors = validateSettingsSection(section, settings[section.id]);
    return Object.keys(errors).length > 0 ? { ...all, [section.id]: errors } : all;
  }, {});
}
