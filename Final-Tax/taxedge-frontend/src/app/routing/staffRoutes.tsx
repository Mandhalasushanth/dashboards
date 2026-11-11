import type { ComponentType, ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { AREA_ACCESS, STAFF_ROLES, resolveLandingRoute, useCurrentUser, type StaffRole } from '@/modules/authentication';
import * as caAgent from '@/modules/ca-agent';
import * as caManager from '@/modules/ca-manager';
import * as loanAgent from '@/modules/loan-agent';
import * as loanManager from '@/modules/loan-manager';
import { lazyWithPreload, type PreloadableComponent } from '@/shared';
import { AuthenticationGuard } from '../guards/AuthenticationGuard';
import { PermissionGuard } from '../guards/PermissionGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { WorkspaceLayout, type SidebarControls } from '../layouts/WorkspaceLayout';

type PageLoader = () => Promise<{ default: ComponentType }>;

/** What each staff module exports for routing, mirroring the admin module's exports. */
interface StaffWorkspace {
  readonly role: StaffRole;
  readonly rootPath: string;
  readonly profilePath: string;
  readonly sidebarId: string;
  readonly navItems: readonly { readonly id: string; readonly path: string }[];
  readonly pageLoaders: Readonly<Record<string, PageLoader>>;
  readonly loadProfilePage: PageLoader;
  readonly renderSidebar: (controls: SidebarControls) => ReactNode;
  readonly renderHeaderActions: () => ReactNode;
  readonly resolvePageTitle: (pathname: string) => string;
}

const STAFF_WORKSPACES: readonly StaffWorkspace[] = Object.freeze([
  {
    role: caManager.CA_MANAGER_MODULE_ROLE,
    rootPath: caManager.CA_MANAGER_ROOT_PATH,
    profilePath: caManager.CA_MANAGER_PROFILE_PATH,
    sidebarId: caManager.CA_MANAGER_SIDEBAR_ID,
    navItems: caManager.CA_MANAGER_NAV_ITEMS,
    pageLoaders: caManager.CA_MANAGER_PAGE_LOADERS,
    loadProfilePage: caManager.loadCaManagerProfilePage,
    renderSidebar: (controls: SidebarControls) => <caManager.CaManagerSidebar {...controls} />,
    renderHeaderActions: () => <caManager.CaManagerHeaderActions />,
    resolvePageTitle: caManager.resolveCaManagerPageTitle
  },
  {
    role: caAgent.CA_AGENT_MODULE_ROLE,
    rootPath: caAgent.CA_AGENT_ROOT_PATH,
    profilePath: caAgent.CA_AGENT_PROFILE_PATH,
    sidebarId: caAgent.CA_AGENT_SIDEBAR_ID,
    navItems: caAgent.CA_AGENT_NAV_ITEMS,
    pageLoaders: caAgent.CA_AGENT_PAGE_LOADERS,
    loadProfilePage: caAgent.loadCaAgentProfilePage,
    renderSidebar: (controls: SidebarControls) => <caAgent.CaAgentSidebar {...controls} />,
    renderHeaderActions: () => <caAgent.CaAgentHeaderActions />,
    resolvePageTitle: caAgent.resolveCaAgentPageTitle
  },
  {
    role: loanManager.LOAN_MANAGER_MODULE_ROLE,
    rootPath: loanManager.LOAN_MANAGER_ROOT_PATH,
    profilePath: loanManager.LOAN_MANAGER_PROFILE_PATH,
    sidebarId: loanManager.LOAN_MANAGER_SIDEBAR_ID,
    navItems: loanManager.LOAN_MANAGER_NAV_ITEMS,
    pageLoaders: loanManager.LOAN_MANAGER_PAGE_LOADERS,
    loadProfilePage: loanManager.loadLoanManagerProfilePage,
    renderSidebar: (controls: SidebarControls) => <loanManager.LoanManagerSidebar {...controls} />,
    renderHeaderActions: () => <loanManager.LoanManagerHeaderActions />,
    resolvePageTitle: loanManager.resolveLoanManagerPageTitle
  },
  {
    role: loanAgent.LOAN_AGENT_MODULE_ROLE,
    rootPath: loanAgent.LOAN_AGENT_ROOT_PATH,
    profilePath: loanAgent.LOAN_AGENT_PROFILE_PATH,
    sidebarId: loanAgent.LOAN_AGENT_SIDEBAR_ID,
    navItems: loanAgent.LOAN_AGENT_NAV_ITEMS,
    pageLoaders: loanAgent.LOAN_AGENT_PAGE_LOADERS,
    loadProfilePage: loanAgent.loadLoanAgentProfilePage,
    renderSidebar: (controls: SidebarControls) => <loanAgent.LoanAgentSidebar {...controls} />,
    renderHeaderActions: () => <loanAgent.LoanAgentHeaderActions />,
    resolvePageTitle: loanAgent.resolveLoanAgentPageTitle
  }
]);

/** Legacy "/staff", "/staff/dashboard" and "/staff/profile" links lead to the signed-in role's own workspace. */
function StaffHomeRedirect({ to }: { readonly to: 'dashboard' | 'profile' }) {
  const user = useCurrentUser();
  const workspace = STAFF_WORKSPACES.find((entry) => entry.role === user?.role);
  if (!user || !workspace) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />;
  }
  return <Navigate to={to === 'profile' ? workspace.profilePath : resolveLandingRoute(user)} replace />;
}

function buildWorkspaceRoute(workspace: StaffWorkspace): RouteObject {
  /** One preloadable page per sidebar entry, created once when this module loads. */
  const pages: readonly { readonly path: string; readonly Page: PreloadableComponent }[] = workspace.navItems.map((item) => ({
    path: item.path,
    Page: lazyWithPreload(workspace.pageLoaders[item.id])
  }));
  const ProfilePage = lazyWithPreload(workspace.loadProfilePage);

  /** Fetches every page's code while the browser is idle, so switching pages never shows a loader. */
  const preloadPages = () => {
    pages.forEach(({ Page }) => {
      void Page.preload();
    });
    void ProfilePage.preload();
  };

  return {
    element: <RoleGuard allowedRoles={[workspace.role]} />,
    children: [
      {
        element: (
          <WorkspaceLayout
            renderSidebar={workspace.renderSidebar}
            sidebarId={workspace.sidebarId}
            renderHeaderActions={workspace.renderHeaderActions}
            resolvePageTitle={workspace.resolvePageTitle}
            onIdle={preloadPages}
            profilePath={workspace.profilePath}
          />
        ),
        children: [
          { path: workspace.rootPath, element: <Navigate to={workspace.navItems[0].path} replace /> },
          ...pages.map(({ path, Page }) => ({ path, element: <Page /> })),
          { path: workspace.profilePath, element: <ProfilePage /> }
        ]
      }
    ]
  };
}

/** CA Manager, CA Agent, Loan Manager and Loan Agent each get a guarded workspace under /staff/<role>. */
export const staffRoutes: RouteObject = {
  path: ROUTE_PATHS.staffRoot,
  element: <AuthenticationGuard />,
  children: [
    {
      element: <RoleGuard allowedRoles={STAFF_ROLES} />,
      children: [
        {
          element: <PermissionGuard permission={AREA_ACCESS.staff.permission} />,
          children: [
            { index: true, element: <StaffHomeRedirect to="dashboard" /> },
            { path: ROUTE_PATHS.staffDashboard, element: <StaffHomeRedirect to="dashboard" /> },
            { path: ROUTE_PATHS.staffProfile, element: <StaffHomeRedirect to="profile" /> },
            ...STAFF_WORKSPACES.map(buildWorkspaceRoute)
          ]
        }
      ]
    }
  ]
};
