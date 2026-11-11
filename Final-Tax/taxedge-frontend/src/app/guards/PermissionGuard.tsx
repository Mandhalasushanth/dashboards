import { Navigate, Outlet } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { hasPermission, useCurrentUser, type Permission } from '@/modules/authentication';

export interface PermissionGuardProps {
  readonly permission: Permission;
}

export function PermissionGuard({ permission }: PermissionGuardProps) {
  const user = useCurrentUser();
  return hasPermission(user, permission) ? <Outlet /> : <Navigate to={ROUTE_PATHS.unauthorized} replace />;
}
