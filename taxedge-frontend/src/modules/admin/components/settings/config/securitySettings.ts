import type { SettingsSectionConfig } from '../../../shared/settings.types';

/** Password, lockout and session policy applied by the server to every staff account. */
export const SECURITY_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'security',
  label: 'Security & Access',
  description: 'Password rules, sign-in lockout and session limits enforced for all staff accounts.',
  iconName: 'shield',
  fields: [
    {
      key: 'sessionIdleTimeoutMinutes',
      label: 'Sign out after inactivity',
      type: 'number',
      defaultValue: '30',
      required: true,
      min: 5,
      max: 240,
      unit: 'minutes',
      inputMode: 'numeric'
    },
    {
      key: 'passwordMinLength',
      label: 'Minimum password length',
      type: 'number',
      defaultValue: '10',
      required: true,
      min: 8,
      max: 64,
      unit: 'characters',
      inputMode: 'numeric'
    },
    {
      key: 'maxFailedAttempts',
      label: 'Failed sign-ins before lockout',
      type: 'number',
      defaultValue: '5',
      required: true,
      min: 3,
      max: 10,
      unit: 'attempts',
      inputMode: 'numeric'
    },
    {
      key: 'lockoutMinutes',
      label: 'Lockout duration',
      type: 'number',
      defaultValue: '15',
      required: true,
      min: 5,
      max: 1440,
      unit: 'minutes',
      inputMode: 'numeric'
    }
  ]
});
