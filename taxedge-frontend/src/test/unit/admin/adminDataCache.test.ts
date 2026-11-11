import { describe, expect, it } from 'vitest';
import { createDataCache } from '@/modules/admin/api/adminDataCache';
import { lazyWithPreload } from '@/shared/utils/lazyWithPreload';
import { authStore } from '@/store';

const user = { id: '1', username: 'admin@gmail.com', displayName: 'Admin', role: 'ADMIN' as const, permissions: [], lastLoginAt: null };

describe('admin data cache', () => {
  it('remembers data while signed in and forgets it on sign-out', () => {
    authStore.setAuthenticated(user);
    const cache = createDataCache<string[]>();
    expect(cache.peek()).toBeNull();
    cache.remember(['a']);
    expect(cache.peek()).toEqual(['a']);

    authStore.setUnauthenticated('signed-out');
    expect(cache.peek()).toBeNull();
  });
});

describe('lazyWithPreload', () => {
  it('fetches page code once, however often it is preloaded', async () => {
    let calls = 0;
    const Page = lazyWithPreload(async () => {
      calls += 1;
      return { default: () => null };
    });
    await Page.preload();
    await Page.preload();
    expect(calls).toBe(1);
  });

  it('allows a retry after a failed preload', async () => {
    let calls = 0;
    const Page = lazyWithPreload(async () => {
      calls += 1;
      if (calls === 1) {
        throw new Error('offline');
      }
      return { default: () => null };
    });
    await Page.preload();
    await Page.preload();
    expect(calls).toBe(2);
  });
});
