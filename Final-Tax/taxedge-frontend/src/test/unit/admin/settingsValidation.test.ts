import { describe, expect, it } from 'vitest';
import { SETTINGS_SECTIONS, buildDefaultSettings } from '@/modules/admin/components/settings/config/settingsSections';
import {
  cinOrLlpinFormat,
  gstinFormat,
  icaiFrnFormat,
  ifscFormat,
  indianMobileFormat,
  ipAllowListFormat,
  panFormat,
  pinCodeFormat,
  upiFormat
} from '@/modules/admin/validation/indianFormats';
import { validateSettings, validateSettingsSection } from '@/modules/admin/validation/settingsSchema';

const organization = SETTINGS_SECTIONS.find((section) => section.id === 'organization');
const security = SETTINGS_SECTIONS.find((section) => section.id === 'security');

const validOrganization = {
  legalName: 'TaxEdge Fin Solutions LLP',
  tradeName: 'TaxEdge',
  pan: 'AAAFT1234F',
  gstin: '27AAAFT1234F1Z5',
  supportEmail: 'accounts@taxedge.in',
  supportPhone: '+91 98200 12345',
  addressLine1: 'Level 14, Tower B',
  city: 'Mumbai',
  state: 'Maharashtra',
  pinCode: '400013'
};

describe('Indian format checks', () => {
  it('accepts valid identifiers', () => {
    expect(panFormat('AAACT1234F')).toBeNull();
    expect(gstinFormat('27AAACT1234F1Z5')).toBeNull();
    expect(cinOrLlpinFormat('U74999MH2021PTC355201')).toBeNull();
    expect(cinOrLlpinFormat('AAB-1234')).toBeNull();
    expect(icaiFrnFormat('123456W')).toBeNull();
    expect(ifscFormat('HDFC0001234')).toBeNull();
    expect(pinCodeFormat('400013')).toBeNull();
    expect(upiFormat('taxedge@hdfcbank')).toBeNull();
    expect(indianMobileFormat('+91 98200-12345')).toBeNull();
    expect(ipAllowListFormat('203.0.113.0/24\n10.0.0.1')).toBeNull();
  });

  it('rejects malformed identifiers', () => {
    expect(panFormat('AAAXT1234F')).not.toBeNull();
    expect(gstinFormat('99AAACT1234F1Z5')).not.toBeNull();
    expect(icaiFrnFormat('123456X')).not.toBeNull();
    expect(ifscFormat('HDFC1001234')).not.toBeNull();
    expect(pinCodeFormat('012345')).not.toBeNull();
    expect(indianMobileFormat('5820012345')).not.toBeNull();
    expect(ipAllowListFormat('10.0.0.256')).toMatch(/not a valid/);
  });

  it('lets optional fields stay empty', () => {
    expect(gstinFormat('')).toBeNull();
    expect(upiFormat('')).toBeNull();
  });
});

describe('settings validation', () => {
  it('reports every required organization field when empty', () => {
    const errors = validateSettings(SETTINGS_SECTIONS, buildDefaultSettings());
    expect(Object.keys(errors.organization ?? {})).toEqual(
      expect.arrayContaining(['legalName', 'pan', 'supportEmail', 'supportPhone', 'addressLine1', 'city', 'state', 'pinCode'])
    );
  });

  it('accepts a complete organization profile', () => {
    expect(organization && validateSettingsSection(organization, validOrganization)).toEqual({});
  });

  it('requires the GSTIN to contain the firm PAN', () => {
    const errors = organization && validateSettingsSection(organization, { ...validOrganization, gstin: '27AABFT1234F1Z5' });
    expect(errors?.gstin).toMatch(/must match the firm PAN/);
  });

  it('enforces numeric ranges', () => {
    const values = { ...buildDefaultSettings().security, sessionIdleTimeoutMinutes: '2' };
    const errors = security && validateSettingsSection(security, values);
    expect(errors?.sessionIdleTimeoutMinutes).toMatch(/at least 5/);
  });
});
