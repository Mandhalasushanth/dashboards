import { describe, expect, it } from 'vitest';
import { resolveLandingRoute, resolvePostLoginRoute } from '@/modules/authentication/services/landingRouteService';
import type { SessionUser } from '@/modules/authentication/shared/types/session.types';
import type { Role } from '@/modules/authentication';

function userWith(role: Role, permissions: string[]): SessionUser {
  return { id: '1', username: 'user', displayName: 'User', role, permissions, lastLoginAt: null };
}

const admin = userWith('ADMIN', ['ADMIN_DASHBOARD_VIEW']);

describe('landingRouteService', () => {
  it('sends admins to the admin dashboard', () => {
    expect(resolveLandingRoute(admin)).toBe('/admin/dashboard');
  });

  it.each([
    ['CA_MANAGER', '/staff/ca-manager/dashboard'],
    ['CA_AGENT', '/staff/ca-agent/dashboard'],
    ['LOAN_MANAGER', '/staff/loan-manager/dashboard'],
    ['LOAN_AGENT', '/staff/loan-agent/dashboard']
  ] as const)('sends %s to its own workspace dashboard', (role, path) => {
    expect(resolveLandingRoute(userWith(role, ['STAFF_DASHBOARD_VIEW']))).toBe(path);
  });

  it('returns to the requested page only inside the user’s own workspace', () => {
    const agent = userWith('CA_AGENT', ['STAFF_DASHBOARD_VIEW']);
    expect(resolvePostLoginRoute(agent, '/staff/ca-agent/tasks?case=CASE-1001')).toBe('/staff/ca-agent/tasks?case=CASE-1001');
    expect(resolvePostLoginRoute(agent, '/staff/ca-manager/review')).toBe('/staff/ca-agent/dashboard');
    expect(resolvePostLoginRoute(agent, '/admin/dashboard')).toBe('/staff/ca-agent/dashboard');
    expect(resolvePostLoginRoute(admin, '/staff/ca-manager/dashboard')).toBe('/admin/dashboard');
  });

  it('ignores off-site redirect targets', () => {
    expect(resolvePostLoginRoute(admin, '//evil.example/admin')).toBe('/admin/dashboard');
    expect(resolvePostLoginRoute(admin, 'https://evil.example')).toBe('/admin/dashboard');
    expect(resolvePostLoginRoute(admin, '/\\evil.example')).toBe('/admin/dashboard');
  });

  it('does not reopen an area the server did not grant', () => {
    const noPermission = userWith('ADMIN', []);
    expect(resolvePostLoginRoute(noPermission, '/admin/dashboard')).toBe('/admin/dashboard');
    expect(resolvePostLoginRoute(noPermission, '/admin/users')).toBe('/admin/dashboard');
  });
});
