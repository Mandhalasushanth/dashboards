import type { Role } from '@/modules/authentication';

/** The five client-facing services. Each is owned by exactly one team. */
export type ServiceKind = 'GST' | 'ITR' | 'INCORPORATION' | 'LOAN' | 'INSURANCE';

/** CA team handles tax and incorporation; LOAN team handles loans and insurance. */
export type WorkflowTeam = 'CA' | 'LOAN';

/**
 * One lifecycle for every service, in the order the work happens:
 * manager verifies → payment → agent checks documents → portal work → output delivered.
 */
export type CaseStatus =
  | 'SUBMITTED'
  | 'CORRECTION_NEEDED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'ASSIGNED'
  | 'DOCS_MISSING'
  | 'PORTAL_WORK'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';


/** Every state-changing operation a user can request; the server decides whether it is allowed. */
export type CaseAction =
  | 'REQUEST_PAYMENT'
  | 'SEND_BACK'
  | 'RECHECK'
  | 'MARK_PAID'
  | 'ASSIGN'
  | 'REPORT_MISSING'
  | 'FORWARD_TO_CUSTOMER'
  | 'DOCS_UPDATED'
  | 'START_PORTAL_WORK'
  | 'SUBMIT_OUTPUT'
  | 'REJECT'
  | 'CANCEL';

export type DocumentState = 'MISSING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export interface CaseDocument {
  readonly id: string;
  readonly typeId: string;
  readonly label: string;
  readonly required: boolean;
  readonly state: DocumentState;
  readonly fileName: string | null;
  /**
   * Short-lived, access-checked link to the stored file, issued by the server for the signed-in staff
   * member. Null until a file is uploaded.
   */
  readonly fileUrl?: string | null;
  readonly uploadedBy: string | null;
  readonly uploadedAt: string | null;
  readonly version: number;
  readonly rejectionReason: string | null;
}

export interface InternalNote {
  readonly id: string;
  readonly authorName: string;
  readonly authorRole: Role;
  readonly text: string;
  readonly createdAt: string;
}

export type PaymentState = 'NOT_REQUESTED' | 'PENDING' | 'PAID';

/** The service fee: requested by the manager after verification, paid by the customer in the mobile app. */
export interface CasePayment {
  readonly state: PaymentState;
  /** Whole rupees. */
  readonly amount: number | null;
  readonly requestedAt: string | null;
  readonly paidAt: string | null;
  /** Gateway transaction id, UTR or receipt number. */
  readonly reference: string | null;
}

/** A finished result the agent uploads (acknowledgement, filed return, certificate); shown to the manager and customer. */
export interface CaseOutput {
  readonly id: string;
  readonly fileName: string;
  readonly uploadedBy: string;
  readonly uploadedAt: string;
  /** Short-lived link issued per request, like document links. */
  readonly fileUrl?: string | null;
}

/** What is holding the application up, shown as a banner until it is resolved. */
export interface OpenIssue {
  /** CUSTOMER: the manager sent documents back to the customer. MANAGER: the agent reported missing documents. */
  readonly waitingOn: 'CUSTOMER' | 'MANAGER';
  readonly message: string;
  readonly documentLabels: readonly string[];
  readonly raisedBy: string;
  readonly createdAt: string;
}

/** One immutable audit record; the history tab, audit log and timelines are all built from these. */
export interface CaseEvent {
  readonly id: string;
  readonly caseId: string;
  /** Filled in audit-log responses, which list events from many cases. */
  readonly referenceNumber?: string;
  readonly action: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly actorRole: Role | 'CLIENT' | 'SYSTEM';
  readonly fromStatus: CaseStatus | null;
  readonly toStatus: CaseStatus | null;
  readonly note: string | null;
  readonly reference: string | null;
  /** Internal notes and staff-only steps are never shown to the client. */
  readonly clientVisible: boolean;
  readonly createdAt: string;
}

export interface CaseClient {
  /** The customer's id in the backend; the address for a message to them. */
  readonly custId?: string;
  readonly name: string;
  readonly email: string;
  readonly mobile: string;
  readonly pan: string;
  readonly city: string;
}

/** How soon the assigned agent should pick the application up. */
export type CasePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface CaseAssignment {
  readonly managerId: string | null;
  readonly managerName: string | null;
  /** Set when a manager has taken the application ("Taken by"); null while it is open to every manager. */
  readonly managerTakenAt?: string | null;
  /** Chosen when the application was assigned; absent until then. */
  readonly priority?: CasePriority;
  /** Who wrote the instructions and when, for the note the agent sees. */
  readonly instructionsBy?: string | null;
  readonly instructionsAt?: string | null;
  readonly agentId: string | null;
  readonly agentName: string | null;
  readonly assignedAt: string | null;
  readonly instructions: string | null;
}

/** What the signed-in user may do with this case, computed by the server for each response. */
export interface CaseAccess {
  readonly actions: readonly CaseAction[];
  readonly canAddNote: boolean;
  /** Manager marks each document verified or wrong. */
  readonly canReviewDocuments: boolean;
  /** Manager uploads a document on the customer's behalf (the customer normally uploads in the app). */
  readonly canUploadDocuments: boolean;
  /** Assigned agent records that the documents were downloaded. */
  readonly canDownloadDocuments: boolean;
  /** Assigned agent uploads the finished output while doing portal work. */
  readonly canUploadOutput: boolean;
}

export interface WorkflowCase {
  readonly id: string;
  readonly referenceNumber: string;
  readonly service: ServiceKind;
  /** The customer app's service id (e.g. "gst-filing", "home-loan"); decides the form fields and documents. */
  readonly serviceType: string;
  readonly team: WorkflowTeam;
  readonly client: CaseClient;
  /** Service-specific form values keyed by the field ids configured for the service. */
  readonly details: Readonly<Record<string, string>>;
  readonly status: CaseStatus;
  readonly assignment: CaseAssignment;
  readonly dueDate: string | null;
  readonly submittedAt: string;
  readonly updatedAt: string;
  /** Optimistic-concurrency token: the server rejects writes made against a stale version. */
  readonly version: number;
  readonly documents: readonly CaseDocument[];
  readonly payment: CasePayment;
  /** Set when the assigned agent downloads the documents; portal work cannot start before it. */
  readonly documentsDownloadedAt: string | null;
  readonly outputs: readonly CaseOutput[];
  readonly openIssue: OpenIssue | null;
  readonly notes: readonly InternalNote[];
  readonly history: readonly CaseEvent[];
  /** Absent means "no actions": the UI never assumes a permission the server did not grant. */
  readonly access?: CaseAccess;
}

export interface StaffOption {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly team: WorkflowTeam;
  readonly active: boolean;
  /** Sign-in email, so the manager can tell which login receives the work. */
  readonly email?: string;
  /** For an agent: the manager the administrator placed them under. */
  readonly managerId?: string | null;
}

export interface AgentWorkload {
  readonly agent: StaffOption;
  readonly activeCases: number;
  readonly portalWork: number;
  readonly overdue: number;
  readonly completed: number;
}

export interface WorkflowNotification {
  readonly id: string;
  readonly caseId: string;
  readonly referenceNumber: string;
  readonly message: string;
  readonly createdAt: string;
  readonly read: boolean;
}

/** Counts used by KPI cards, dashboards and sidebar badges; all derived from the same case records. */
export interface CaseSummary {
  readonly total: number;
  readonly submitted: number;
  readonly correctionNeeded: number;
  readonly paymentPending: number;
  readonly readyToAssign: number;
  readonly assigned: number;
  readonly docsMissing: number;
  readonly portalWork: number;
  readonly completed: number;
  readonly closed: number;
  readonly unassigned: number;
  readonly overdue: number;
  readonly dueSoon: number;
  /** Paid but still without an agent for longer than the assignment target. */
  readonly staleUnassigned: number;
  readonly byService: Readonly<Record<ServiceKind, number>>;
}

export type SummaryKey = Exclude<keyof CaseSummary, 'byService'>;

/** 'priority': Urgent first, then earliest due date, then oldest submission. */
export type SortKey = 'updatedAt' | 'submittedAt' | 'dueDate' | 'priority';

export interface CaseQuery {
  readonly statuses?: readonly CaseStatus[];
  readonly services?: readonly ServiceKind[];
  /** Customer app service ids, e.g. ["gst-filing"]. */
  readonly serviceTypes?: readonly string[];
  readonly agentId?: string | 'ALL';
  readonly unassignedOnly?: boolean;
  readonly overdueOnly?: boolean;
  /** Managers' "My Applications": only the ones the signed-in manager has taken. */
  readonly claim?: 'MINE';
  readonly search?: string;
  readonly sort?: SortKey;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface CasePage {
  readonly items: readonly WorkflowCase[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface CaseIntakeInput {
  readonly service: ServiceKind;
  readonly serviceType: string;
  readonly client: CaseClient;
  readonly details: Readonly<Record<string, string>>;
}

export interface AssignInput {
  readonly agentId: string;
  readonly instructions: string;
  readonly dueDate: string | null;
  readonly priority?: CasePriority;
}

export interface TransitionInput {
  readonly action: Exclude<CaseAction, 'ASSIGN'>;
  readonly note: string;
  /** Payment reference (MARK_PAID) or portal acknowledgement number (SUBMIT_OUTPUT). */
  readonly reference?: string;
  /** Fee in whole rupees (REQUEST_PAYMENT). */
  readonly amount?: number;
  /** Documents the issue is about (SEND_BACK, REPORT_MISSING). */
  readonly documentIds?: readonly string[];
}

/** Every write is sent with the case version it was based on, so concurrent edits are rejected, not lost. */
export type CaseMutation =
  | { readonly type: 'ASSIGN'; readonly input: AssignInput }
  | { readonly type: 'TRANSITION'; readonly input: TransitionInput }
  | { readonly type: 'NOTE'; readonly text: string }
  | { readonly type: 'DOCUMENT_REVIEW'; readonly documentId: string; readonly decision: 'VERIFIED' | 'REJECTED'; readonly reason: string }
  | { readonly type: 'DOCUMENTS_DOWNLOADED' }
  | { readonly type: 'REMOVE_OUTPUT'; readonly outputId: string };

export interface AuditQuery {
  readonly search?: string;
  readonly service?: ServiceKind | 'ALL';
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AuditPage {
  readonly items: readonly CaseEvent[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/** The signed-in staff member as the server resolves them from the session. */
export interface WorkflowActor {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
}
