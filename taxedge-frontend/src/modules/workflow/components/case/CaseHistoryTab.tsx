import { useState } from 'react';
import { formatDateTime } from '@/core/utils/dateUtils';
import { ROLE_PROFILES } from '@/modules/authentication';
import { STATUS_META } from '../../shared/workflowStatuses';
import type { CaseEvent } from '../../shared/workflow.types';
import type { CaseTabProps } from './CaseDrawer';
import './CaseHistoryTab.css';

type HistoryFilter = 'ALL' | 'STATUS' | 'DOCUMENTS' | 'PAYMENT';

const FILTERS: readonly { readonly id: HistoryFilter; readonly label: string; readonly matches: (event: CaseEvent) => boolean }[] = Object.freeze([
  { id: 'ALL', label: 'All', matches: () => true },
  { id: 'STATUS', label: 'Status', matches: (event: CaseEvent) => event.toStatus !== null && event.toStatus !== event.fromStatus },
  { id: 'DOCUMENTS', label: 'Documents', matches: (event: CaseEvent) => event.action.startsWith('DOCUMENT') || ['SEND_BACK', 'REPORT_MISSING', 'DOCS_UPDATED'].includes(event.action) },
  { id: 'PAYMENT', label: 'Payment', matches: (event: CaseEvent) => event.action === 'REQUEST_PAYMENT' || event.action === 'MARK_PAID' }
]);

const ACTION_LABELS: Readonly<Record<string, string>> = Object.freeze({
  SUBMITTED: 'Application submitted',
  SEND_BACK: 'Sent back to customer',
  RECHECK: 'Customer resubmitted',
  REQUEST_PAYMENT: 'Payment requested',
  MARK_PAID: 'Payment received',
  ASSIGN: 'Agent assigned',
  REASSIGNED: 'Agent reassigned',
  REPORT_MISSING: 'Missing documents reported',
  FORWARD_TO_CUSTOMER: 'Missing documents requested from customer',
  DOCS_UPDATED: 'Documents updated for agent',
  DOCUMENTS_DOWNLOADED: 'Documents downloaded',
  START_PORTAL_WORK: 'Portal work started',
  OUTPUT_UPLOADED: 'Result file uploaded',
  OUTPUT_REMOVED: 'Result file removed',
  SUBMIT_OUTPUT: 'Work completed and delivered',
  REJECT: 'Application rejected',
  CANCEL: 'Application cancelled',
  DOCUMENT_UPLOADED: 'Document uploaded',
  DOCUMENT_VERIFIED: 'Document marked correct',
  DOCUMENT_REJECTED: 'Document marked wrong',
  NOTE_ADDED: 'Internal note added'
});

const roleLabel = (role: CaseEvent['actorRole']) => (role === 'CLIENT' ? 'Client' : role === 'SYSTEM' ? 'System' : ROLE_PROFILES[role].label);

/** Read-only audit timeline for this application, newest first. Records cannot be edited or deleted. */
export function CaseHistoryTab({ item }: CaseTabProps) {
  const [filter, setFilter] = useState<HistoryFilter>('ALL');
  const matcher = FILTERS.find((entry) => entry.id === filter) ?? FILTERS[0];
  const events = item.history.filter(matcher.matches).slice().reverse();

  const renderEvent = (event: CaseEvent) => (
    <li key={event.id} className="tx-case-event">
      <span className="tx-case-event__dot" aria-hidden="true" />
      <div className="tx-case-event__header">
        <span className="tx-case-event__title">{ACTION_LABELS[event.action] ?? event.action}</span>
        <time className="tx-case-event__time" dateTime={event.createdAt}>
          {formatDateTime(event.createdAt)}
        </time>
      </div>
      <p className="tx-case-event__actor">
        {event.actorName} · {roleLabel(event.actorRole)}
        {!event.clientVisible ? <span className="tx-case-event__internal">Internal</span> : null}
      </p>
      {event.toStatus && event.fromStatus && event.fromStatus !== event.toStatus ? (
        <p className="tx-case-event__change">
          {STATUS_META[event.fromStatus].label} → {STATUS_META[event.toStatus].label}
        </p>
      ) : null}
      {event.note ? <p className="tx-case-event__note">{event.note}</p> : null}
      {event.reference ? <p className="tx-case-event__reference">Reference: {event.reference}</p> : null}
    </li>
  );

  return (
    <section className="tx-case-history">
      <div className="tx-case-history__filters" role="group" aria-label="Filter history">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`tx-case-history__chip ${filter === entry.id ? 'tx-case-history__chip--active' : ''}`}
            aria-pressed={filter === entry.id}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      {events.length === 0 ? <p className="tx-case-history__empty">No events of this type yet.</p> : <ol className="tx-case-history__list">{events.map(renderEvent)}</ol>}
    </section>
  );
}
