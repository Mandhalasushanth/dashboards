import { formatDateTime } from '@/core/utils/dateUtils';
import { Icon } from '@/shared';
import type { WorkflowCase } from '../../shared/workflow.types';
import './CaseManagerNote.css';

/** What the manager wrote when assigning. Shown only to the assigned agent, below the steps of the work. */
export function CaseManagerNote({ item }: { readonly item: WorkflowCase }) {
  const { instructions, instructionsBy, instructionsAt, managerName, priority } = item.assignment;
  if (!instructions || !item.assignment.agentId) return null;
  const author = instructionsBy ?? managerName ?? 'Your manager';
  return (
    <div className="tx-case-note" role="note">
      <p className="tx-case-note-title">
        <Icon name="message-square" size="sm" />
        Note from {author}
        {priority && priority !== 'NORMAL' ? <span className="tx-case-note-priority">{priority.charAt(0) + priority.slice(1).toLowerCase()} priority</span> : null}
      </p>
      <p className="tx-case-note-text">{instructions}</p>
      {instructionsAt ? <p className="tx-case-note-meta">{formatDateTime(instructionsAt)}</p> : null}
    </div>
  );
}
