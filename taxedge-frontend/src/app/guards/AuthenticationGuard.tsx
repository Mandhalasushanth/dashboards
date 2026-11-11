import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { useAuthentication } from '@/modules/authentication';

/**
 * Sends anonymous visitors to the sign-in page, remembering where they were going unless they
 * signed out on purpose. Guards only shape navigation; the API enforces authorization.
 */
export function AuthenticationGuard() {
  const { status, endReason } = useAuthentication();
  const location = useLocation();

  if (status !== 'authenticated') {
    const state = endReason === 'signed-out' ? undefined : { from: location };
    return <Navigate to={ROUTE_PATHS.login} replace state={state} />;
  }
  return <Outlet />;
}
