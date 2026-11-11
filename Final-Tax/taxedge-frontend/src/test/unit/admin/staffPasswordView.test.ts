import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_STAFF_STORAGE_KEY } from '@/modules/admin/dev/demoStaffStore';
import { installMemoryBrowser } from '../workflow/workflowFixtures';

/** The administrator can view a staff password; it is stored encrypted and never sent with the staff list. */
async function loadStore() {
  vi.resetModules();
  installMemoryBrowser();
  return (await import('@/modules/admin/dev/demoStaffStore')).demoStaffStore;
}

type Store = Awaited<ReturnType<typeof loadStore>>;

const manager = { fullName: 'Anil Rao', username: 'anil@firm.in', role: 'CA_MANAGER' as const, managerId: null, password: 'Strong#Pass123' };

describe('admin viewing staff passwords', () => {
  let store: Store;

  beforeEach(async () => {
    store = await loadStore();
  });

  it('shows the administrator the exact password that was set', async () => {
    const created = await store.create(manager);
    expect(await store.revealPassword(created.id)).toBe('Strong#Pass123');
  });

  it('shows the new password after a reset', async () => {
    const created = await store.create(manager);
    await store.update(created.id, { ...manager, password: 'Changed#Pass456' });
    expect(await store.revealPassword(created.id)).toBe('Changed#Pass456');
  });

  it('records when the password was viewed', async () => {
    const created = await store.create(manager);
    expect(created.passwordViewedAt).toBeUndefined();
    await store.revealPassword(created.id);
    const [listed] = await store.list('MANAGER');
    expect(listed.passwordViewedAt).toEqual(expect.any(String));
  });

  it('never stores or lists the password in readable form', async () => {
    const created = await store.create(manager);
    const raw = window.localStorage.getItem(DEMO_STAFF_STORAGE_KEY) ?? '';
    expect(raw).not.toContain('Strong#Pass123');
    const [listed] = await store.list('MANAGER');
    expect(Object.keys(listed)).not.toEqual(expect.arrayContaining(['passwordCipher', 'passwordHash', 'salt']));
    expect(listed.id).toBe(created.id);
  });

  it('returns nothing for an account without a viewable copy, and fails for an unknown account', async () => {
    const created = await store.create(manager);
    const stored = JSON.parse(window.localStorage.getItem(DEMO_STAFF_STORAGE_KEY) ?? '[]') as Record<string, unknown>[];
    window.localStorage.setItem(DEMO_STAFF_STORAGE_KEY, JSON.stringify(stored.map(({ passwordCipher: _cipher, ...rest }) => rest)));
    expect(await store.revealPassword(created.id)).toBeNull();
    await expect(store.revealPassword('MGR-NOPE')).rejects.toThrow(/no longer exists/);
  });
});
