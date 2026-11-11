import { InputField, SelectField } from '@/shared';
import type { IntakeField } from '../../shared/workflowServices';

export interface ServiceFieldInputProps {
  readonly field: IntakeField;
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Keeps typed input consistent with the field: digits only for numbers, capitals for identifiers. */
export function sanitizeFieldInput(field: IntakeField, value: string): string {
  if (field.kind === 'number' || field.inputMode === 'numeric') return value.replace(/\D/g, '');
  if (field.inputMode === 'tel') return value.replace(/[^\d+\s-]/g, '');
  return field.uppercase ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : value;
}

/**
 * One service form field, entered the same way as in the customer mobile app: text, number,
 * a date picker (no future dates) or a dropdown limited to the app's options.
 */
export function ServiceFieldInput({ field, id, value, onChange, error }: ServiceFieldInputProps) {
  const label = `${field.label}${field.required ? ' *' : ''}`;

  if (field.kind === 'dropdown') {
    return (
      <SelectField
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder || 'Select an option'}
        options={(field.options ?? []).map((option) => ({ value: option, label: option }))}
        error={error}
      />
    );
  }

  if (field.kind === 'date') {
    return <InputField id={id} label={label} type="date" value={value} onChange={onChange} max={field.rule === 'anyDate' ? undefined : todayIso()} required={field.required} error={error} />;
  }

  return (
    <InputField
      id={id}
      label={label}
      type={field.inputMode === 'email' ? 'email' : field.inputMode === 'tel' ? 'tel' : 'text'}
      value={value}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      inputMode={field.kind === 'number' ? 'numeric' : field.inputMode}
      required={field.required}
      onChange={(next) => onChange(sanitizeFieldInput(field, next))}
      error={error}
    />
  );
}
