/** Admin module: dashboard (overview), menu sections, sidebar and header shortcuts. */
export { AdminHeaderActions } from './components/shared/AdminHeaderActions';
export { ADMIN_SIDEBAR_ID, AdminSidebar, type AdminSidebarProps } from './components/shared/AdminSidebar';
export { ADMIN_PAGE_LOADERS } from './pages/adminPages';
export { ADMIN_NAV_ITEMS, resolveAdminPageTitle, type AdminNavItem, type AdminSectionId } from './shared/adminNavigation';
export { ProfileModal, ProfileSection, type ProfileModalProps } from './components/profile';

/** Messaging shared by every workspace: same UI, each workspace supplies its own API and contact rules. */
export { MessagingWorkspace, type MessagingWorkspaceProps } from './components/communication/MessagingWorkspace';
export { createMessagingApi, type MessagingGateway } from './api/messagingClient';
export type { ContactRoleFilter, MessagingApi, MessagingPresentation, StaffContact } from './shared/communication.types';
