import { describe, expect, it } from 'vitest';
import { isApiError } from '@/core/api';
import { parseSessionUser } from '@/modules/authentication/api/sessionUserParser';

function parseError(raw: unknown): string | null {
  try {
    parseSessionUser(raw);
    return null;
  } catch (error) {
    return isApiError(error) ? error.code : 'NOT_API_ERROR';
  }
}

describe('parseSessionUser', () => {
  it('accepts a valid server payload', () => {
    const user = parseSessionUser({
      id: 42,
      username: 'ca.agent.demo',
      displayName: 'Rahul Verma',
      role: 'CA_AGENT',
      permissions: ['STAFF_DASHBOARD_VIEW', 7],
      lastLoginAt: '2026-10-13T09:00:00Z'
    });
    expect(user).toEqual({
      id: '42',
      username: 'ca.agent.demo',
      displayName: 'Rahul Verma',
      role: 'CA_AGENT',
      permissions: ['STAFF_DASHBOARD_VIEW'],
      lastLoginAt: '2026-10-13T09:00:00Z'
    });
  });

  it('falls back to the username when no display name is sent', () => {
    expect(parseSessionUser({ id: 'a', username: 'admin.demo', role: 'ADMIN' }).displayName).toBe('admin.demo');
  });

  it('rejects unknown roles instead of guessing', () => {
    expect(parseError({ id: 'a', username: 'x', role: 'SUPER_ADMIN' })).toBe('INVALID_RESPONSE');
  });

  it('rejects malformed payloads', () => {
    expect(parseError(null)).toBe('INVALID_RESPONSE');
    expect(parseError([])).toBe('INVALID_RESPONSE');
    expect(parseError({ username: 'x', role: 'ADMIN' })).toBe('INVALID_RESPONSE');
  });
});
