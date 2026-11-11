import { useState } from 'react';
import { formatRelativeTime } from '@/core/utils/dateUtils';
import { Button, EmptyState, Icon, InlineAlert, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useWorkflowNotifications } from '../../hooks/useWorkflowData';
import type { WorkflowNotification } from '../../shared/workflow.types';
import { CaseDrawer } from '../case/CaseDrawer';
import './WorkflowNotificationsView.css';

export interface WorkflowNotificationsViewProps {
  readonly title: string;
}

type ReadFilter = 'ALL' | 'UNREAD';

/** In-app notifications for workflow events. Each links to its application; delivery is in-app only. */
export function WorkflowNotificationsView({ title }: WorkflowNotificationsViewProps) {
  useDocumentTitle(title);
  const controller = useWorkflowNotifications();
  const [filter, setFilter] = useState<ReadFilter>('ALL');
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const items = (controller.resource.data ?? []).filter((entry) => filter === 'ALL' || !entry.read);

  const open = (entry: WorkflowNotification) => {
    setOpenCaseId(entry.caseId);
    if (!entry.read) {
      void controller.markRead(entry.id);
    }
  };

  const renderItem = (entry: WorkflowNotification) => (
    <li key={entry.id}>
      <button type="button" className={`tx-wf-notice ${entry.read ? '' : 'tx-wf-notice--unread'}`.trim()} onClick={() => open(entry)}>
        <span className="tx-wf-notice__icon">
          <Icon name="bell" size="sm" />
        </span>
        <span className="tx-wf-notice__body">
          <span className="tx-wf-notice__message">{entry.message}</span>
          <span className="tx-wf-notice__meta">
            {entry.referenceNumber} · {formatRelativeTime(entry.createdAt)} · In-app
          </span>
        </span>
        {!entry.read ? <span className="tx-wf-notice__dot" aria-label="Unread" /> : null}
      </button>
    </li>
  );

  const renderBody = () => {
    if (controller.resource.status === 'loading' && !controller.resource.data) return <LoadingSpinner size="lg" label="Loading notifications" />;
    if (!controller.resource.data) return <InlineAlert tone="error">{controller.resource.error ?? 'Unable to load notifications.'}</InlineAlert>;
    if (items.length === 0) {
      return <EmptyState title={filter === 'UNREAD' ? 'All caught up' : 'No notifications yet'} message="New applications, payments, assignments and missing documents appear here." iconName="bell" />;
    }
    return <ul className="tx-wf-notices__list">{items.map(renderItem)}</ul>;
  };

  return (
    <div className="tx-wf-notices">
      <div className="tx-wf-notices__toolbar">
        <div className="tx-wf-notices__filters" role="group" aria-label="Filter notifications">
          {(['ALL', 'UNREAD'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={`tx-wf-notices__chip ${filter === value ? 'tx-wf-notices__chip--active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {value === 'ALL' ? 'All' : `Unread (${controller.unreadCount})`}
            </button>
          ))}
        </div>
        <Button variant="secondary" iconName="check-check" onClick={() => void controller.markAllRead()} disabled={controller.unreadCount === 0}>
          Mark all as read
        </Button>
      </div>
      {controller.error ? <InlineAlert tone="error">{controller.error}</InlineAlert> : null}
      <section className="tx-wf-notices__panel">{renderBody()}</section>
      {openCaseId ? <CaseDrawer caseId={openCaseId} onClose={() => setOpenCaseId(null)} /> : null}
    </div>
  );
}
