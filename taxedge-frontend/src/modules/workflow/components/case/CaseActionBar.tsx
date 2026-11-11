import { formatDateTime } from '@/core/utils/dateUtils';
import { Button, Icon } from '@/shared';
import { actionBlockers } from '../../services/transitionRules';
import { ACTION_RULES, STATUS_META } from '../../shared/workflowStatuses';
import type { CaseAction, WorkflowCase } from '../../shared/workflow.types';
import { CaseStatusBadge } from '../badges/CaseBadges';
import './CaseActionBar.css';

export interface CaseActionBarProps {
  readonly item: WorkflowCase;
  readonly busy: boolean;
  readonly onAction: (action: CaseAction) => void;
  readonly onDownloadAll: () => void;
  readonly onOpenDocuments: () => void;
}

/** Actions that close a case: shown apart from the forward step so they are never clicked by habit. */
const DESTRUCTIVE: ReadonlySet<CaseAction> = new Set<CaseAction>(['REJECT', 'CANCEL']);

/** The step that moves the case forward comes first and is the primary button. */
const PRIMARY_ORDER: readonly CaseAction[] = Object.freeze([
  'REQUEST_PAYMENT',
  'RECHECK',
  'MARK_PAID',
  'FORWARD_TO_CUSTOMER',
  'DOCS_UPDATED',
  'ASSIGN',
  'START_PORTAL_WORK',
  'SUBMIT_OUTPUT',
  'SEND_BACK',
  'REPORT_MISSING'
]);

/** Blockers that must be fixed outside the dialog; the result upload happens inside the submit dialog. */
const BLOCKS_BUTTON: ReadonlySet<CaseAction> = new Set<CaseAction>(['REQUEST_PAYMENT', 'RECHECK', 'DOCS_UPDATED', 'START_PORTAL_WORK']);

/** A document marked wrong makes "send back" the natural next step instead of the payment request. */
function rank(item: WorkflowCase, action: CaseAction): number {
  const wrongDocument = item.documents.some((doc) => doc.state === 'REJECTED');
  if (action === 'SEND_BACK' && wrongDocument) return -1;
  // Once the customer has been asked, checking their new copies and returning the case comes first.
  if (action === 'DOCS_UPDATED' && item.openIssue?.waitingOn === 'CUSTOMER') return -1;
  const index = PRIMARY_ORDER.indexOf(action);
  return index === -1 ? PRIMARY_ORDER.length : index;
}

const ISSUE_TITLES: Readonly<Record<'CUSTOMER' | 'MANAGER', string>> = Object.freeze({
  CUSTOMER: 'Waiting for the customer to send these documents',
  MANAGER: 'Agent reported missing documents — ask the customer for them'
});

function IssuePanel({ item }: { readonly item: WorkflowCase }) {
  const issue = item.openIssue;
  if (!issue) return null;
  return (
    <div className="tx-case-actions__issue" role="status">
      <p className="tx-case-actions__issue-title">
        <Icon name="alert-triangle" size="sm" />
        {ISSUE_TITLES[issue.waitingOn]}
      </p>
      {issue.documentLabels.length > 0 ? (
        <ul className="tx-case-actions__issue-docs">
          {issue.documentLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}
      <p className="tx-case-actions__issue-message">“{issue.message}”</p>
      <p className="tx-case-actions__issue-meta">
        {issue.raisedBy} · {formatDateTime(issue.createdAt)}
      </p>
    </div>
  );
}

/** "What happens now" card: status, open issue, what still blocks the next step, and only the permitted buttons. */
export function CaseActionBar({ item, busy, onAction, onDownloadAll, onOpenDocuments }: CaseActionBarProps) {
  const actions = item.access?.actions ?? [];
  const forward = actions.filter((action) => !DESTRUCTIVE.has(action)).sort((a, b) => rank(item, a) - rank(item, b));
  const destructive = actions.filter((action) => DESTRUCTIVE.has(action));
  const primary = forward[0];
  const blockers = primary ? actionBlockers(item, primary) : [];
  const blocked = primary !== undefined && BLOCKS_BUTTON.has(primary) && blockers.length > 0;
  const canDownload = item.access?.canDownloadDocuments ?? false;
  // The download row below already asks for the download, so it is not repeated in the blocker list.
  const listed = canDownload ? blockers.filter((text) => !text.startsWith('Download')) : blockers;

  const labelFor = (action: CaseAction) => (action === 'ASSIGN' && item.assignment.agentId ? 'Reassign / Reschedule' : ACTION_RULES[action].label);

  return (
    <section className="tx-case-actions" aria-label="Next step">
      <div className="tx-case-actions__head">
        <CaseStatusBadge status={item.status} />
        <p className="tx-case-actions__next">{STATUS_META[item.status].nextStep}</p>
      </div>

      <IssuePanel item={item} />

      {blocked && listed.length > 0 ? (
        <div className="tx-case-actions__blockers" role="alert">
          <p className="tx-case-actions__blockers-title">Before you can “{labelFor(primary)}”:</p>
          <ul>
            {listed.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          {listed.length > 0 ? (
            <Button variant="secondary" iconName="file-text" onClick={onOpenDocuments}>
              Open Documents
            </Button>
          ) : null}
        </div>
      ) : null}

      {canDownload ? (
        <div className="tx-case-actions__download">
          <span>
            {item.documentsDownloadedAt ? (
              <>
                <Icon name="check" size="sm" /> Downloaded {formatDateTime(item.documentsDownloadedAt)}
              </>
            ) : (
              'Download every document before you start on the portal.'
            )}
          </span>
          <Button variant={item.documentsDownloadedAt ? 'secondary' : 'primary'} iconName="download" onClick={onDownloadAll} disabled={busy}>
            {item.documentsDownloadedAt ? 'Download Again' : 'Download All Documents'}
          </Button>
        </div>
      ) : null}

      {actions.length === 0 ? (
        <p className="tx-case-actions__none">Nothing for you to do at this stage.</p>
      ) : (
        <div className="tx-case-actions__row" role="group" aria-label="Application actions">
          <div className="tx-case-actions__forward">
            {forward.map((action, index) => (
              <Button
                key={action}
                variant={index === 0 ? 'primary' : 'secondary'}
                iconName={ACTION_RULES[action].iconName}
                disabled={busy || (index === 0 && blocked)}
                onClick={() => onAction(action)}
              >
                {labelFor(action)}
              </Button>
            ))}
          </div>
          {destructive.length > 0 ? (
            <div className="tx-case-actions__destructive">
              {destructive.map((action) => (
                <button key={action} type="button" className="tx-case-actions__danger" disabled={busy} onClick={() => onAction(action)}>
                  <Icon name={ACTION_RULES[action].iconName} size="sm" />
                  {labelFor(action)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
