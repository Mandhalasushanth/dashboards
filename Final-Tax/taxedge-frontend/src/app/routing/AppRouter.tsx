import { Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { PageLoader } from '@/shared';
import { NotFoundPage } from '../pages/NotFoundPage';
import { adminRoutes } from './adminRoutes';
import { publicRoutes } from './publicRoutes';
import { staffRoutes } from './staffRoutes';
import { useHomeRoute } from './useHomeRoute';

function RootRedirect() {
  const home = useHomeRoute();
  return <Navigate to={home.path} replace />;
}

export function AppRouter() {
  const element = useRoutes([
    { path: '/', element: <RootRedirect /> },
    ...publicRoutes,
    adminRoutes,
    staffRoutes,
    { path: '*', element: <NotFoundPage /> }
  ]);

  return <Suspense fallback={<PageLoader message="Loading…" />}>{element}</Suspense>;
}
