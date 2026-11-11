import type { SettingsSectionConfig } from '../../../shared/settings.types';

/** Which events alert staff and customers, and through which channels. */
export const NOTIFICATION_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'notifications',
  label: 'Notifications',
  description: 'Which events send email alerts, and when clients are reminded of due dates.',
  iconName: 'bell',
  fields: [
    {
      key: 'emailNewApplication',
      label: 'Email on new application',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'emailDocumentUploaded',
      label: 'Email when a client uploads documents',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'emailPaymentReceived',
      label: 'Email on payment received',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'emailSlaBreach',
      label: 'Email managers on SLA breach',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'complianceReminderDays',
      label: 'Remind clients before due dates',
      type: 'number',
      defaultValue: '7',
      required: true,
      min: 1,
      max: 30,
      unit: 'days before',
      inputMode: 'numeric'
    }
  ]
});
