import type { ChangeEvent, ReactNode } from 'react';
import { Icon } from '@/shared';
import type { SettingsFieldConfig, SettingsInputFilter, SettingsValue } from '../../shared/settings.types';
import './SettingsField.css';

export interface SettingsFieldProps {
  readonly field: SettingsFieldConfig;
  readonly value: SettingsValue;
  readonly error?: string;
  readonly disabled: boolean;
  readonly idPrefix: string;
  readonly onChange: (value: SettingsValue) => void;
}

type ControlRenderer = (props: SettingsFieldProps, inputId: string, describedBy: string | undefined) => ReactNode;

function textValue(value: SettingsValue): string {
  return typeof value === 'string' ? value : '';
}

/** Characters each input filter removes as the user types or pastes. */
const INPUT_FILTERS: Readonly<Record<SettingsInputFilter, RegExp>> = Object.freeze({
  digits: /\D/g,
  phone: /[^\d+\s-]/g,
  alphanumeric: /[^A-Za-z0-9]/g,
  code: /[^A-Za-z0-9/-]/g
});

function cleanInput(field: SettingsFieldConfig, raw: string): string {
  const filtered = field.inputFilter ? raw.replace(INPUT_FILTERS[field.inputFilter], '') : raw;
  return field.uppercase ? filtered.toUpperCase() : filtered;
}

function handleText(props: SettingsFieldProps) {
  return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    props.onChange(cleanInput(props.field, event.target.value));
  };
}

const renderInput: ControlRenderer = (props, inputId, describedBy) => {
  const { field, value, error, disabled } = props;
  return (
    <div className={field.unit ? 'tx-setting-field__affix' : undefined}>
      <input
        id={inputId}
        name={field.key}
        type={field.type}
        className="tx-setting-field__input"
        value={textValue(value)}
        onChange={handleText(props)}
        placeholder={field.placeholder}
        required={field.required}
        maxLength={field.type === 'number' ? undefined : field.maxLength}
        min={field.min}
        max={field.max}
        step={field.type === 'number' ? 1 : undefined}
        inputMode={field.inputMode}
        autoComplete={field.autoComplete ?? 'off'}
        spellCheck={false}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {field.unit ? <span className="tx-setting-field__unit">{field.unit}</span> : null}
    </div>
  );
};

const renderSelect: ControlRenderer = (props, inputId, describedBy) => {
  const { field, value, error, disabled } = props;
  return (
    <select
      id={inputId}
      name={field.key}
      className="tx-setting-field__input tx-setting-field__select"
      value={textValue(value)}
      onChange={handleText(props)}
      required={field.required}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    >
      {field.defaultValue === '' ? <option value="">Select…</option> : null}
      {(field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const renderTextarea: ControlRenderer = (props, inputId, describedBy) => {
  const { field, value, error, disabled } = props;
  return (
    <textarea
      id={inputId}
      name={field.key}
      className="tx-setting-field__input tx-setting-field__textarea"
      value={textValue(value)}
      onChange={handleText(props)}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      rows={3}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    />
  );
};

const CONTROL_RENDERERS: Partial<Record<SettingsFieldConfig['type'], ControlRenderer>> = Object.freeze({
  select: renderSelect,
  textarea: renderTextarea
});

function ToggleRow({ field, value, disabled, idPrefix, onChange }: SettingsFieldProps) {
  const checked = value === true;
  const inputId = `${idPrefix}-${field.key}`;
  return (
    <div className="tx-setting-toggle">
      <span className="tx-setting-toggle__text">
        <label className="tx-setting-toggle__label" htmlFor={inputId}>
          {field.label}
        </label>
        {field.hint ? <span className="tx-setting-field__hint">{field.hint}</span> : null}
      </span>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        className={checked ? 'tx-switch tx-switch--on' : 'tx-switch'}
        onClick={() => onChange(!checked)}
        disabled={disabled}
      >
        <span className="tx-switch__thumb" />
      </button>
    </div>
  );
}

/** Renders one configured settings field with its label, hint and validation message. */
export function SettingsField(props: SettingsFieldProps) {
  const { field, error, idPrefix } = props;
  if (field.type === 'toggle') {
    return <ToggleRow {...props} />;
  }
  const inputId = `${idPrefix}-${field.key}`;
  const hintId = field.hint ? `${inputId}-hint` : '';
  const errorId = error ? `${inputId}-error` : '';
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const renderControl = CONTROL_RENDERERS[field.type] ?? renderInput;

  return (
    <div className={field.fullWidth ? 'tx-setting-field tx-setting-field--full' : 'tx-setting-field'}>
      <label className="tx-setting-field__label" htmlFor={inputId}>
        {field.label}
        {field.required ? <span className="tx-setting-field__required" aria-hidden="true"> *</span> : null}
      </label>
      {renderControl(props, inputId, describedBy)}
      {error ? (
        <p id={errorId} className="tx-setting-field__error">
          <Icon name="alert-circle" size="sm" />
          <span>{error}</span>
        </p>
      ) : field.hint ? (
        <p id={hintId} className="tx-setting-field__hint">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}
