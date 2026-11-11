import type { SettingsSectionConfig } from '../../../shared/settings.types';
import {
  addressFormat,
  cityFormat,
  emailFormat,
  gstinFormat,
  indianMobileFormat,
  panFormat,
  personOrBusinessNameFormat,
  pinCodeFormat
} from '../../../validation/indianFormats';
import { INDIAN_STATE_OPTIONS } from '../../../shared/indianStates';

/** Legal identity printed on invoices, engagement letters and filings. */
export const ORGANIZATION_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'organization',
  label: 'Organization Profile',
  description: 'Registered firm details used on invoices, engagement letters and statutory filings.',
  iconName: 'building',
  fields: [
    {
      key: 'legalName',
      label: 'Registered legal name',
      type: 'text',
      defaultValue: '',
      placeholder: 'e.g. Finsolz Fin Solutions LLP',
      required: true,
      maxLength: 120,
      format: personOrBusinessNameFormat,
      autoComplete: 'organization'
    },
    {
      key: 'tradeName',
      label: 'Trade / brand name',
      type: 'text',
      defaultValue: '',
      placeholder: 'e.g. Finsolz',
      maxLength: 80,
      format: personOrBusinessNameFormat
    },
    {
      key: 'pan',
      inputFilter: 'alphanumeric',
      label: 'PAN',
      type: 'text',
      defaultValue: '',
      placeholder: 'AAACT1234F',
      required: true,
      uppercase: true,
      maxLength: 10,
      format: panFormat
    },
    {
      key: 'gstin',
      inputFilter: 'alphanumeric',
      label: 'GSTIN',
      type: 'text',
      defaultValue: '',
      placeholder: '27AAACT1234F1Z5',
      hint: 'Must contain the firm PAN in characters 3–12.',
      uppercase: true,
      maxLength: 15,
      format: gstinFormat
    },
    {
      key: 'supportEmail',
      label: 'Official email',
      type: 'email',
      defaultValue: '',
      placeholder: 'accounts@yourfirm.in',
      required: true,
      maxLength: 120,
      format: emailFormat,
      inputMode: 'email',
      autoComplete: 'email'
    },
    {
      key: 'supportPhone',
      inputFilter: 'phone',
      label: 'Official mobile number',
      type: 'tel',
      defaultValue: '',
      placeholder: '+91 98200 12345',
      required: true,
      maxLength: 16,
      format: indianMobileFormat,
      inputMode: 'tel',
      autoComplete: 'tel'
    },
    {
      key: 'addressLine1',
      format: addressFormat,
      label: 'Address line 1',
      type: 'text',
      defaultValue: '',
      placeholder: 'Building, floor, street',
      required: true,
      maxLength: 120,
      autoComplete: 'address-line1',
      fullWidth: true
    },
    {
      key: 'city',
      label: 'City',
      type: 'text',
      defaultValue: '',
      placeholder: 'e.g. Mumbai',
      required: true,
      maxLength: 60,
      format: cityFormat,
      autoComplete: 'address-level2'
    },
    {
      key: 'state',
      label: 'State / UT',
      type: 'select',
      defaultValue: '',
      required: true,
      options: INDIAN_STATE_OPTIONS
    },
    {
      key: 'pinCode',
      inputFilter: 'digits',
      label: 'PIN code',
      type: 'text',
      defaultValue: '',
      placeholder: '400013',
      required: true,
      maxLength: 6,
      format: pinCodeFormat,
      inputMode: 'numeric',
      autoComplete: 'postal-code'
    }
  ]
});
