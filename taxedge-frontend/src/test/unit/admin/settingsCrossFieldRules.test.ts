import { describe, expect, it } from 'vitest';
import { buildDefaultSettings } from '@/modules/admin/components/settings/config/settingsSections';
import { addressFormat } from '@/modules/admin/validation/indianFormats';
import { CROSS_FIELD_RULES } from '@/modules/admin/validation/settingsCrossFieldRules';

const defaults = buildDefaultSettings();

function organizationErrors(overrides: Record<string, string>) {
  const values = {
    ...defaults.organization,
    pan: 'AAAFT1234F',
    gstin: '27AAAFT1234F1Z5',
    state: 'Maharashtra',
    ...overrides
  };
  return CROSS_FIELD_RULES.organization?.(values) ?? {};
}

describe('organization cross-field rules', () => {
  it('accepts a consistent profile', () => {
    expect(organizationErrors({})).toEqual({});
  });

  it('requires the GSTIN state code to match the address state', () => {
    expect(organizationErrors({ state: 'Karnataka' }).gstin).toMatch(/not registered in Karnataka \(state code 29\)/);
  });
});

describe('billing cross-field rules', () => {
  const billing = (overrides: Record<string, string>) => CROSS_FIELD_RULES.billing?.({ ...defaults.billing, ...overrides }) ?? {};

  it('requires bank details to be all filled or all empty', () => {
    expect(billing({})).toEqual({});
    const errors = billing({ bankAccountNumber: '123456789012' });
    expect(Object.keys(errors).sort()).toEqual(['bankAccountName', 'ifsc']);
  });
});

describe('workflow rules', () => {
  it('escalates before the shortest turnaround', () => {
    const errors = CROSS_FIELD_RULES.workflow?.({ ...defaults.workflow, caFilingSlaDays: '1', escalationThresholdHours: '24' }) ?? {};
    expect(errors.escalationThresholdHours).toMatch(/under 24 hours/);
  });
});

describe('address format', () => {
  it('accepts typical Indian addresses and rejects stray symbols', () => {
    expect(addressFormat('Flat 4B, Tower-2, Peninsula Park (Lower Parel)')).toBeNull();
    expect(addressFormat('Shop #12/3, M.G. Road')).toBeNull();
    expect(addressFormat('<script>')).not.toBeNull();
  });
});
