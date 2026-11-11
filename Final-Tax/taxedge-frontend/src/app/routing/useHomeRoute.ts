import { ROUTE_PATHS } from '@/core/config/routePaths';
import { resolveLandingRoute, useAuthentication } from '@/modules/authentication';

/** The signed-in user's dashboard, or the sign-in page for visitors. */
export function useHomeRoute(): { path: string; label: string } {
  const { user } = useAuthentication();
  return user
    ? { path: resolveLandingRoute(user), label: 'Go to my dashboard' }
    : { path: ROUTE_PATHS.login, label: 'Go to sign in' };
}
