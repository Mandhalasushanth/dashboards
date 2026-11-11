import { Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { getRoleProfile, startIdleTimeout, useAuthentication } from '@/modules/authentication';
import { DeferredContent, LoadingSpinner, Topbar, useIdleCallback } from '@/shared';
import './WorkspaceLayout.css';

/** Below this width the sidebar is an off-canvas drawer; above it, the menu button collapses it. */
const DRAWER_MEDIA_QUERY = '(max-width: 1024px)';
const DEFAULT_PAGE_TITLE = 'Dashboard';

/** State a workspace sidebar needs. */
export interface SidebarControls {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

export interface WorkspaceLayoutProps {
  readonly renderSidebar?: (controls: SidebarControls) => ReactNode;
  /** id of the sidebar element, so the menu button can reference it for assistive technology. */
  readonly sidebarId?: string;
  readonly renderHeaderActions?: () => ReactNode;
  readonly resolvePageTitle?: (pathname: string) => string;
  /** Background work to run once the workspace is idle, e.g. prefetching page code. */
  readonly onIdle?: () => void;
  readonly renderProfileModal?: (controls: { open: boolean; onClose: () => void }) => ReactNode;
  /** Where "My profile" leads inside this workspace; defaults to the area's profile page. */
  readonly profilePath?: string;
}

function isDrawerViewport(): boolean {
  return window.matchMedia(DRAWER_MEDIA_QUERY).matches;
}

/** Authenticated shell shared by the admin and staff areas. Owns the idle sign-out timer. */
export function WorkspaceLayout({
  renderSidebar,
  sidebarId = '',
  renderHeaderActions,
  resolvePageTitle,
  onIdle,
  renderProfileModal,
  profilePath
}: WorkspaceLayoutProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const closeDrawer = useCallback(() => setMobileOpen(false), []);
  const toggleNavigation = useCallback(() => {
    if (isDrawerViewport()) {
      setMobileOpen((open) => !open);
    } else {
      setCollapsed((value) => !value);
    }
  }, []);

  useEffect(() => startIdleTimeout(environment.sessionIdleTimeoutMs), []);
  useIdleCallback(onIdle);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, closeDrawer]);

  const navigate = useNavigate();
  const handleOpenProfile = useCallback(() => {
    if (renderProfileModal) {
      setProfileOpen(true);
      return;
    }
    const target = profilePath ?? (user?.role === 'ADMIN' ? ROUTE_PATHS.adminProfile : ROUTE_PATHS.staffProfile);
    navigate(target);
  }, [renderProfileModal, profilePath, user?.role, navigate]);

  if (!user) {
    return null;
  }

  const sidebar = renderSidebar
    ? renderSidebar({ collapsed, mobileOpen, onNavigate: closeDrawer, onOpenProfile: handleOpenProfile })
    : null;

  return (
    <div className={sidebar ? 'tx-workspace tx-workspace--with-sidebar' : 'tx-workspace'}>
      {sidebar}
      {sidebar && mobileOpen ? <div className="tx-workspace__backdrop" onClick={closeDrawer} aria-hidden="true" /> : null}
      <div className="tx-workspace__main">
        <Topbar
          appName={environment.appName}
          tagline={environment.appTagline}
          logoSrc={BRAND_ASSETS.logo}
          title={resolvePageTitle ? resolvePageTitle(pathname) : DEFAULT_PAGE_TITLE}
          userName={user.displayName}
          roleLabel={getRoleProfile(user.role).label}
          onSignOut={() => void signOut()}
          signingOut={signingOut}
          actions={renderHeaderActions ? renderHeaderActions() : null}
          menu={sidebar ? { open: mobileOpen || !collapsed, controlsId: sidebarId, onToggle: toggleNavigation } : undefined}
          onOpenProfile={handleOpenProfile}
        />
        <main className="tx-workspace__content">
          <Suspense
            fallback={
              <DeferredContent>
                <div className="tx-workspace__loading">
                  <LoadingSpinner size="lg" label="Loading page" />
                </div>
              </DeferredContent>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      {renderProfileModal ? renderProfileModal({ open: profileOpen, onClose: () => setProfileOpen(false) }) : null}
    </div>
  );
}
