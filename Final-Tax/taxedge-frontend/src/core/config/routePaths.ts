/** Application route table. Modules import paths from here instead of repeating string literals. */
export const ROUTE_PATHS = Object.freeze({
  root: '/',
  login: '/login',
  adminRoot: '/admin',
  adminDashboard: '/admin/dashboard',
  adminApplications: '/admin/applications',
  adminCustomers: '/admin/customers',
  adminManagers: '/admin/employees/managers',
  adminAgents: '/admin/employees/agents',
  adminServices: '/admin/services',
  adminRevenue: '/admin/revenue',
  adminReports: '/admin/reports',
  adminCommunication: '/admin/communication',
  adminNotifications: '/admin/notifications',
  adminSettings: '/admin/settings',
  adminProfile: '/admin/profile',
  staffRoot: '/staff',
  /** Legacy shared staff entry points; they redirect to the signed-in role's own workspace. */
  staffDashboard: '/staff/dashboard',
  staffProfile: '/staff/profile',
  caManagerRoot: '/staff/ca-manager',
  caAgentRoot: '/staff/ca-agent',
  loanManagerRoot: '/staff/loan-manager',
  loanAgentRoot: '/staff/loan-agent',
  unauthorized: '/unauthorized'
});
