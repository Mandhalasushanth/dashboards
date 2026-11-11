import { Navigate, type RouteObject } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_PAGE_LOADERS,
  ADMIN_SIDEBAR_ID,
  AdminHeaderActions,
  AdminSidebar,
  resolveAdminPageTitle,
  type AdminNavItem
} from '@/modules/admin';
import { ADMIN_ROLES, AREA_ACCESS } from '@/modules/authentication';
import { lazyWithPreload, type PreloadableComponent } from '@/shared';
import { AuthenticationGuard } from '../guards/AuthenticationGuard';
import { PermissionGuard } from '../guards/PermissionGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { WorkspaceLayout, type SidebarControls } from '../layouts/WorkspaceLayout';

const renderAdminSidebar = (controls: SidebarControls) => <AdminSidebar {...controls} />;
const renderAdminHeaderActions = () => <AdminHeaderActions />;
const ProfileSectionPage = lazyWithPreload(() => import('@/modules/admin/components/profile/ProfileSection'));

/** One preloadable page per sidebar entry, created once when this module loads. */
const ADMIN_PAGES: ReadonlyArray<{ item: AdminNavItem; Page: PreloadableComponent }> = ADMIN_NAV_ITEMS.map((item) => ({
  item,
  Page: lazyWithPreload(ADMIN_PAGE_LOADERS[item.id])
}));

/** Fetches every admin page's code while the browser is idle, so switching pages never shows a loader. */
const preloadAdminPages = () => {
  ADMIN_PAGES.forEach(({ Page }) => {
    void Page.preload();
  });
  void ProfileSectionPage.preload();
};

function toSectionRoute({ item, Page }: { item: AdminNavItem; Page: PreloadableComponent }): RouteObject {
  return { path: item.path, element: <Page /> };
}

export const adminRoutes: RouteObject = {
  path: ROUTE_PATHS.adminRoot,
  element: <AuthenticationGuard />,
  children: [
    {
      element: <RoleGuard allowedRoles={ADMIN_ROLES} />,
      children: [
        {
          element: <PermissionGuard permission={AREA_ACCESS.admin.permission} />,
          children: [
            {
              element: (
                <WorkspaceLayout
                  renderSidebar={renderAdminSidebar}
                  sidebarId={ADMIN_SIDEBAR_ID}
                  renderHeaderActions={renderAdminHeaderActions}
                  resolvePageTitle={resolveAdminPageTitle}
                  onIdle={preloadAdminPages}
                />
              ),
              children: [
                { index: true, element: <Navigate to={ROUTE_PATHS.adminDashboard} replace /> },
                ...ADMIN_PAGES.map(toSectionRoute),
                { path: ROUTE_PATHS.adminProfile, element: <ProfileSectionPage /> }
              ]
            }
          ]
        }
      ]
    }
  ]
};
