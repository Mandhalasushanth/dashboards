import type { SettingsSectionConfig } from '../../../shared/settings.types';
import {
  bankAccountFormat,
  ifscFormat,
  invoicePrefixFormat,
  personOrBusinessNameFormat,
  sacFormat,
  upiFormat
} from '../../../validation/indianFormats';

/** GST invoicing defaults and where customers pay. */
export const BILLING_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'billing',
  label: 'Billing & Invoicing',
  description: 'GST invoice numbering, tax defaults and the bank details printed on invoices.',
  iconName: 'receipt',
  fields: [
    {
      key: 'invoicePrefix',
      inputFilter: 'code',
      label: 'Invoice number prefix',
      type: 'text',
      defaultValue: '',
      placeholder: 'TE/INV-',
      hint: 'GST invoice numbers may be at most 16 characters including this prefix.',
      required: true,
      uppercase: true,
      maxLength: 10,
      format: invoicePrefixFormat
    },
    {
      key: 'defaultGstRate',
      label: 'Default GST rate',
      type: 'select',
      defaultValue: '18',
      required: true,
      hint: 'Professional services are generally taxed at 18%.',
      options: [
        { value: '0', label: '0% (exempt)' },
        { value: '5', label: '5%' },
        { value: '12', label: '12%' },
        { value: '18', label: '18%' },
        { value: '28', label: '28%' }
      ]
    },
    {
      key: 'sacCode',
      inputFilter: 'digits',
      label: 'Default SAC code',
      type: 'text',
      defaultValue: '',
      placeholder: '998221',
      hint: '998221 covers financial auditing; 998231 covers tax consultancy.',
      required: true,
      maxLength: 6,
      format: sacFormat,
      inputMode: 'numeric'
    },
    {
      key: 'bankAccountName',
      label: 'Bank account holder name',
      type: 'text',
      defaultValue: '',
      placeholder: 'As per bank records',
      maxLength: 120,
      format: personOrBusinessNameFormat
    },
    {
      key: 'bankAccountNumber',
      inputFilter: 'digits',
      label: 'Bank account number',
      type: 'text',
      defaultValue: '',
      placeholder: '9–18 digits',
      maxLength: 18,
      format: bankAccountFormat,
      inputMode: 'numeric',
      autoComplete: 'off'
    },
    {
      key: 'ifsc',
      inputFilter: 'alphanumeric',
      label: 'IFSC',
      type: 'text',
      defaultValue: '',
      placeholder: 'HDFC0001234',
      uppercase: true,
      maxLength: 11,
      format: ifscFormat
    },
    {
      key: 'upiId',
      label: 'UPI ID',
      type: 'text',
      defaultValue: '',
      placeholder: 'yourfirm@hdfcbank',
      maxLength: 80,
      format: upiFormat,
      autoComplete: 'off'
    }
  ]
});
