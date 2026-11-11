import { formatDateTime } from '@/core/utils/dateUtils';
import { useCurrentUser } from '@/modules/authentication';
import { Icon } from '@/shared';
import { isOverdue } from '../../services/caseQueries';
import { DEFAULT_PRIORITY, PRIORITIES } from '../../services/casePriority';
import { isTaken, isTakenBy } from '../../services/managerClaims';
import { getServiceType } from '../../shared/serviceTypes';
import type { CasePriority, WorkflowCase } from '../../shared/workflow.types';
import { CaseStatusBadge, ServiceBadge } from '../badges/CaseBadges';
import './CaseTable.css';

export interface CaseTableProps {
  readonly cases: readonly WorkflowCase[];
  readonly onOpen: (id: string) => void;
  readonly caption: string;
  /**
   * Admin and manager views (true) show the assigned agent; agents only see their own cases, so that
   * column is left out for them. The due date shows for everyone.
   */
  readonly showAgent?: boolean;
  /**
   * Manager queues: a row offers "Take application" (View is only in My Applications). Called with the case
   * when Take (or Take over) is pressed.
   */
  readonly onTake?: (item: WorkflowCase) => void;
  /** Manager queues: takes an application the manager holds back out of their cart (the bin button next to "Taken"). */
  readonly onRelease?: (item: WorkflowCase) => void;
  /** Agents: shows the priority the manager chose when assigning (Urgent first in their queues). */
  readonly showPriority?: boolean;
  /** Shown in a row under the column headings when there are no cases. */
  readonly emptyMessage?: string;
}

function PriorityBadge({ priority }: { readonly priority: CasePriority }) {
  const label = PRIORITIES.find((entry) => entry.value === priority)?.label ?? priority;
  return <span className={`tx-case-table__priority tx-case-table__priority--${priority.toLowerCase()}`}>{label}</span>;
}

const DATE_ONLY = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const TIME_ONLY = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' });

function formatDue(item: WorkflowCase): string {
  return item.dueDate ? DATE_ONLY.format(Date.parse(item.dueDate)) : '—';
}

/** Responsive work queue: a table on desktop, stacked cards (labels from data-label) on small screens. */
export function CaseTable({ cases, onOpen, onTake, onRelease, caption, showAgent = true, showPriority = !showAgent, emptyMessage = 'No applications yet.' }: CaseTableProps) {
  const myId = String(useCurrentUser()?.id ?? '');
  const columnCount = (showAgent ? 8 : 7) + (showPriority ? 1 : 0);
  const viewButton = (item: WorkflowCase) => (
    <button type="button" className="tx-case-table__open" onClick={() => onOpen(item.id)} aria-label={`View ${item.referenceNumber}`}>
      <Icon name="eye" size="sm" />
      View
    </button>
  );
  const takenBy = (item: WorkflowCase) => (
    <span className="tx-case-table__taken" title={`Taken ${formatDateTime(item.assignment.managerTakenAt ?? '')}`}>
      Taken by <strong>{item.assignment.managerName}</strong>
    </span>
  );
  /**
   * Manager queues: "Take application"; once taken, "Taken by you", or the other manager's name with "Take over".
   * View lives only in My Applications. Admin: "Taken by <name>" above View. Agents: View.
   */
  const renderAction = (item: WorkflowCase) => {
    if (!onTake) {
      return showAgent && isTaken(item) && item.assignment.managerName ? (
        <div className="tx-case-table__stack">
          {takenBy(item)}
          {viewButton(item)}
        </div>
      ) : (
        viewButton(item)
      );
    }
    if (!isTaken(item)) {
      return (
        <button type="button" className="tx-case-table__open tx-case-table__take" onClick={() => onTake(item)} aria-label={`Take ${item.referenceNumber}`}>
          <Icon name="user-check" size="sm" />
          Take application
        </button>
      );
    }
    if (isTakenBy(item, myId || null)) {
      return (
        <div className="tx-case-table__cart">
          <span className="tx-case-table__taken-pill" title={`Taken ${formatDateTime(item.assignment.managerTakenAt ?? '')}`}>
            <Icon name="check" size="sm" />
            Taken
          </span>
          {onRelease ? (
            <button
              type="button"
              className="tx-case-table__release"
              onClick={() => onRelease(item)}
              aria-label={`Remove ${item.referenceNumber} from your applications`}
              title="Remove from my applications"
            >
              <Icon name="trash" size="sm" />
            </button>
          ) : null}
        </div>
      );
    }
    return (
      <div className="tx-case-table__stack">
        {takenBy(item)}
        <button type="button" className="tx-case-table__takeover" onClick={() => onTake(item)} aria-label={`Take over ${item.referenceNumber}`}>
          Take over
        </button>
      </div>
    );
  };
  const renderRow = (item: WorkflowCase) => {
    const overdue = isOverdue(item);
    return (
      <tr key={item.id} className={overdue ? 'tx-case-table__row--overdue' : undefined}>
        <td data-label="Application ID">
          <span className="tx-case-table__ref" title={item.referenceNumber}>{item.referenceNumber}</span>
        </td>
        <td data-label="Client">
          <span className="tx-case-table__strong tx-case-table__clip" title={item.client.name}>{item.client.name}</span>
        </td>
        <td data-label="Service">
          <div className="tx-case-table__stack">
            <ServiceBadge service={item.service} />
            <span className="tx-case-table__muted">{getServiceType(item.serviceType, item.service).label}</span>
          </div>
        </td>
        <td data-label="Status">
          <CaseStatusBadge status={item.status} />
        </td>
        {showAgent ? (
          <td data-label="Agent">
            {item.assignment.agentName ? (
              <span className="tx-case-table__strong tx-case-table__clip" title={item.assignment.agentName}>{item.assignment.agentName}</span>
            ) : (
              <span className="tx-case-table__unassigned">Unassigned</span>
            )}
          </td>
        ) : null}
        {showPriority ? (
          <td data-label="Priority">
            <PriorityBadge priority={item.assignment.priority ?? DEFAULT_PRIORITY} />
          </td>
        ) : null}
        <td data-label="Submitted" className="tx-case-table__nowrap">
          <span className="tx-case-table__stack" title={formatDateTime(item.submittedAt)}>
            <span>{DATE_ONLY.format(Date.parse(item.submittedAt))}</span>
            <span className="tx-case-table__muted">{TIME_ONLY.format(Date.parse(item.submittedAt))}</span>
          </span>
        </td>
        <td data-label="Due Date" className="tx-case-table__nowrap">
          <span className={overdue ? 'tx-case-table__overdue' : undefined}>
            {overdue ? <Icon name="alert-triangle" size="sm" /> : null}
            {formatDue(item)}
          </span>
        </td>
        <td data-label={onTake ? 'Cart' : 'Actions'} className="tx-case-table__actions-cell">
          {renderAction(item)}
        </td>
      </tr>
    );
  };

  return (
    <div className="tx-case-table-card">
      <div className="tx-case-table-scroll">
        <table className={showAgent ? 'tx-case-table' : 'tx-case-table tx-case-table--no-agent'}>
          <caption className="tx-sr-only">{caption}</caption>
          {/* Fixed column widths: every queue has the same shape and never scrolls sideways. */}
          <colgroup>
            <col className="tx-case-table__col-id" />
            <col className="tx-case-table__col-client" />
            <col className="tx-case-table__col-service" />
            <col className="tx-case-table__col-status" />
            {showAgent ? <col className="tx-case-table__col-agent" /> : null}
            {showPriority ? <col className="tx-case-table__col-priority" /> : null}
            <col className="tx-case-table__col-date" />
            <col className="tx-case-table__col-date" />
            <col className="tx-case-table__col-action" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Application ID</th>
              <th scope="col">Client</th>
              <th scope="col">Service</th>
              <th scope="col">Status</th>
              {showAgent ? <th scope="col">Agent</th> : null}
              {showPriority ? <th scope="col">Priority</th> : null}
              <th scope="col">Submitted</th>
              <th scope="col">Due Date</th>
              <th scope="col">{onTake ? 'Cart' : <span className="tx-sr-only">Actions</span>}</th>
            </tr>
          </thead>
          <tbody>
            {cases.length > 0 ? (
              cases.map(renderRow)
            ) : (
              <tr>
                <td colSpan={columnCount} className="tx-case-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
