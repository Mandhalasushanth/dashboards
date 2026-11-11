import { Navigate, Outlet } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { hasRole, useCurrentUser, type Role } from '@/modules/authentication';

export interface RoleGuardProps {
  readonly allowedRoles: readonly Role[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useCurrentUser();
  return hasRole(user, allowedRoles) ? <Outlet /> : <Navigate to={ROUTE_PATHS.unauthorized} replace />;
}
