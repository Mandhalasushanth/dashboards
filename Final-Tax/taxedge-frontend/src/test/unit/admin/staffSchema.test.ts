import { describe, expect, it } from 'vitest';
import { validateNewStaff } from '@/modules/admin/validation/staffSchema';
import type { NewStaffInput } from '@/modules/admin/shared/staff.types';

const base = (over: Partial<NewStaffInput>): NewStaffInput =>
  ({ fullName: 'Priya Sharma', username: 'priya.manager@gmail.com', password: 'Str0ng!Passw0rd', role: 'CA_MANAGER', managerId: null, ...over }) as NewStaffInput;

describe('new staff validation', () => {
  it('accepts a manager whose email ends the way the login page expects', () => {
    expect(validateNewStaff(base({}), false, [])).toEqual({});
  });

  it('refuses an email the login page could never sign in', () => {
    expect(validateNewStaff(base({ username: 'priya@example.com' }), false, []).username).toMatch(/manager@gmail\.com/);
    expect(validateNewStaff(base({ username: 'priya.manager@gmail.com', managerId: '1' }), true, []).username).toMatch(/agent@gmail\.com/);
  });

  it('refuses duplicate, over-long and weak entries', () => {
    expect(validateNewStaff(base({}), false, ['priya.manager@gmail.com']).username).toMatch(/already exists/);
    expect(validateNewStaff(base({ fullName: 'A'.repeat(81) }), false, []).fullName).toMatch(/80/);
    expect(validateNewStaff(base({ password: 'short' }), false, []).password).toBeTruthy();
  });
});
