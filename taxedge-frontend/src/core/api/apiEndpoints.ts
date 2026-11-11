/** Backend endpoint paths, relative to environment.apiBaseUrl. */
export const API_ENDPOINTS = Object.freeze({
  identity: Object.freeze({
    csrf: '/identity/csrf',
    login: '/auth/login',
    session: '/identity/session',
    logout: '/identity/logout'
  }),
  admin: Object.freeze({
    profile: '/admin/profile',
    /** AdminLoginController PUT /{id}: the admin's own email and password. */
    updateAdmin: '/admin',
    navigationCounters: '/admin/navigation/counters',
    settings: '/admin/settings',
    notifications: '/admin/notifications',
    notificationsReadAll: '/admin/notifications/read-all',
    reports: '/admin/reports',
    staff: '/admin/staff',
    managers: '/admin/managers',
    agents: '/admin/agents',
    communicationContacts: '/admin/communication/contacts',
    /** Push notifications the admin sends to every customer's mobile app. */
    pushNotifications: '/admin/push-notifications',
    revenue: '/admin/revenue',
    applications: '/admin/applications',
    customers: '/admin/customers',
    serviceCatalog: '/admin/service-catalog'
  }),
  /** CaManagerBucketController: the applications each CA manager has taken. */
  bucket: Object.freeze({
    add: '/bucket/add',
    byManager: (managerId: string) => `/bucket/manager/${encodeURIComponent(managerId)}`,
    item: (id: string) => `/bucket/${encodeURIComponent(id)}`
  }),
  /** Staff workspaces (managers and agents); the server scopes every list to the session's role and team. */
  staff: Object.freeze({
    communicationContacts: '/staff/communication/contacts',
    /** Push notifications a manager sends to chosen customers on their team's applications. */
    pushNotifications: '/staff/push-notifications'
  }),
  /** CA manager dashboard (GstDashboardController): the customer app's GST records as saved. */
  caManager: Object.freeze({
    gstRegistrations: '/ca-manager/gst-registrations',
    /**
     * AgentAssignmentController PUT /assign?registrationType=GST with { applicationId, agentId, applicationType }:
     * one endpoint for every GST service (registration, filing, compliance and the six amendments).
     */
    assignAgent: (registrationType: string) => `/ca-manager/assign?registrationType=${encodeURIComponent(registrationType)}`
  }),
  /** Agent dashboard (AgentDashboardController): the GST registrations assigned to one agent. */
  agent: Object.freeze({
    gstRegistrations: (agentId: string) => `/agent/gst-registrations/${encodeURIComponent(agentId)}`
  }),
  /** Application workflow shared by every role; the server scopes each response to the session's role. */
  workflow: Object.freeze({
    cases: '/workflow/cases',
    summary: '/workflow/cases/summary',
    agents: '/workflow/agents',
    workload: '/workflow/agents/workload',
    audit: '/workflow/audit-events',
    notifications: '/workflow/notifications',
    notificationsReadAll: '/workflow/notifications/read-all'
  })
});