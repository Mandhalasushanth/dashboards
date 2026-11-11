import { beforeEach, describe, expect, it } from 'vitest';
import { forgetStaffPassword, recallStaffPassword, rememberStaffPassword } from '@/modules/admin/api/staffPasswordVault';
import { installMemoryBrowser } from '../workflow/workflowFixtures';

describe('staff password vault', () => {
  beforeEach(() => installMemoryBrowser());

  it('shows the last password the administrator set, and only for that account', async () => {
    await rememberStaffPassword('AGENT', '7', 'First@123');
    await rememberStaffPassword('AGENT', '7', 'Second@456');
    expect(await recallStaffPassword('AGENT', '7')).toBe('Second@456');
    expect(await recallStaffPassword('MANAGER', '7')).toBeNull();
    expect(await recallStaffPassword('AGENT', '8')).toBeNull();
  });

  it('never stores the password in readable form, and forgets it when the account is deleted', async () => {
    await rememberStaffPassword('MANAGER', '3', 'Secret@789');
    expect(window.localStorage.getItem('finsolz.staffPasswords')).not.toContain('Secret@789');
    forgetStaffPassword('MANAGER', '3');
    expect(await recallStaffPassword('MANAGER', '3')).toBeNull();
  });
});
