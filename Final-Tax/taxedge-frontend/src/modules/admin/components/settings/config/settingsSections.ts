import type { AdminSettings, SettingsSectionConfig, SettingsSectionId } from '../../../shared/settings.types';
import { BILLING_SETTINGS } from './billingSettings';
import { NOTIFICATION_SETTINGS } from './notificationSettings';
import { ORGANIZATION_SETTINGS } from './organizationSettings';
import { SECURITY_SETTINGS } from './securitySettings';
import { WORKFLOW_SETTINGS } from './workflowSettings';

/** Settings tabs, in display order. */
export const SETTINGS_SECTIONS: readonly SettingsSectionConfig[] = Object.freeze([
  ORGANIZATION_SETTINGS,
  BILLING_SETTINGS,
  SECURITY_SETTINGS,
  WORKFLOW_SETTINGS,
  NOTIFICATION_SETTINGS
]);

export function isSettingsSectionId(value: string | null): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

/** Every field at its configured default; the server's saved values are merged over this. */
export function buildDefaultSettings(): AdminSettings {
  return Object.fromEntries(
    SETTINGS_SECTIONS.map((section) => [
      section.id,
      Object.fromEntries(section.fields.map((field) => [field.key, field.defaultValue]))
    ])
  ) as AdminSettings;
}
