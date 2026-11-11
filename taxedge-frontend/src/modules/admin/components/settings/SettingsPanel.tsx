import { Icon } from '@/shared';
import type { SectionErrors, SectionValues, SettingsFieldConfig, SettingsSectionConfig, SettingsValue } from '../../shared/settings.types';
import { SettingsField } from './SettingsField';
import './SettingsPanel.css';

export interface SettingsPanelProps {
  readonly section: SettingsSectionConfig;
  readonly values: SectionValues;
  readonly errors: SectionErrors;
  readonly disabled: boolean;
  readonly onChange: (key: string, value: SettingsValue) => void;
}

/** One settings tab: header plus its input fields, followed by its on/off switches. */
export function SettingsPanel({ section, values, errors, disabled, onChange }: SettingsPanelProps) {
  const inputs = section.fields.filter((field) => field.type !== 'toggle');
  const toggles = section.fields.filter((field) => field.type === 'toggle');

  const renderField = (field: SettingsFieldConfig) => (
    <SettingsField
      key={field.key}
      field={field}
      value={values[field.key] ?? field.defaultValue}
      error={errors[field.key]}
      disabled={disabled}
      idPrefix={`tx-setting-${section.id}`}
      onChange={(value) => onChange(field.key, value)}
    />
  );

  return (
    <section
      id={`tx-settings-panel-${section.id}`}
      role="tabpanel"
      aria-labelledby={`tx-settings-tab-${section.id}`}
      className="tx-settings-panel"
    >
      <header className="tx-settings-panel__header">
        <span className="tx-settings-panel__icon">
          <Icon name={section.iconName} />
        </span>
        <div>
          <h2 className="tx-settings-panel__title">{section.label}</h2>
          <p className="tx-settings-panel__description">{section.description}</p>
        </div>
      </header>
      {inputs.length > 0 ? <div className="tx-settings-panel__grid">{inputs.map(renderField)}</div> : null}
      {toggles.length > 0 ? <div className="tx-settings-panel__toggles">{toggles.map(renderField)}</div> : null}
    </section>
  );
}
