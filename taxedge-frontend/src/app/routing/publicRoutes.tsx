import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { loadLoginPage } from '@/modules/authentication';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

const LoginPage = lazy(loadLoginPage);

/** No registration or password-reset routes: credentials are provisioned by an administrator. */
export const publicRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.login, element: <LoginPage /> },
  { path: ROUTE_PATHS.unauthorized, element: <UnauthorizedPage /> }
];
