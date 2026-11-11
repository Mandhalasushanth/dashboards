import { useEffect, useId, useRef, useState } from 'react';
import { tierOf } from '../../services/transitionRules';
import { useAuthentication } from '@/modules/authentication';
import { Button, Icon, InlineAlert, LoadingSpinner, type IconName } from '@/shared';
import { useCaseDetail, type CaseDetailController } from '../../hooks/useCaseDetail';
import { getServiceType } from '../../shared/serviceTypes';
import { getServiceDefinition } from '../../shared/workflowServices';
import type { CaseAction, TransitionInput, WorkflowCase } from '../../shared/workflow.types';
import { ServiceBadge } from '../badges/CaseBadges';
import { AssignAgentModal } from '../modals/AssignAgentModal';
import { TransitionModal } from '../modals/TransitionModal';
import { AgentWizard } from './AgentWizard';
import { CaseActionBar } from './CaseActionBar';
import { CaseGlance } from './CaseGlance';
import { CaseManagerNote } from './CaseManagerNote';
import { CaseProgress } from './CaseProgress';
import { CaseDocumentsTab } from './CaseDocumentsTab';
import { CaseHistoryTab } from './CaseHistoryTab';
import { CaseNotesTab } from './CaseNotesTab';
import { CaseOutputs } from './CaseOutputs';
import { CaseOverviewTab } from './CaseOverviewTab';
import { downloadCaseDocuments } from './downloadFiles';
import { VerifyWizard } from './VerifyWizard';
import './CaseDrawer.css';

export interface CaseTabProps {
  readonly item: WorkflowCase;
  readonly controller: CaseDetailController;
}

type TabId = 'details' | 'documents' | 'result' | 'notes' | 'history';

interface TabDefinition {
  readonly id: TabId;
  readonly label: string;
  readonly iconName: IconName;
  readonly render: (props: CaseTabProps) => JSX.Element;
  readonly count?: (item: WorkflowCase) => number;
  /** Hidden until it has something to show. */
  readonly visible?: (item: WorkflowCase) => boolean;
}

/** Tabs in the order the work happens: read it, check the documents, deliver the result, talk, audit. */
const TABS: readonly TabDefinition[] = Object.freeze([
  { id: 'details', label: 'Details', iconName: 'file-text', render: (props) => <CaseOverviewTab {...props} /> },
  {
    id: 'documents',
    label: 'Documents',
    iconName: 'file-up',
    render: (props) => <CaseDocumentsTab {...props} />,
    count: (item) => item.documents.filter((doc) => doc.required && doc.state !== 'VERIFIED').length
  },
  {
    id: 'result',
    label: 'Result',
    iconName: 'check-check',
    render: (props) => <CaseOutputs {...props} />,
    count: (item) => item.outputs.length,
    visible: (item) => item.outputs.length > 0 || (item.access?.canUploadOutput ?? false)
  },
  { id: 'notes', label: 'Notes', iconName: 'message-square', render: (props) => <CaseNotesTab {...props} />, count: (item) => item.notes.length },
  { id: 'history', label: 'History', iconName: 'clock', render: (props) => <CaseHistoryTab {...props} /> }
]);

export interface CaseDrawerProps {
  readonly caseId: string;
  readonly onClose: () => void;
}

/** Case workspace shown in the page in place of the list: header, permitted actions and tabbed detail. */
export function CaseDrawer({ caseId, onClose }: CaseDrawerProps) {
  const controller = useCaseDetail(caseId);
  const { user } = useAuthentication();
  const titleId = useId();
  const [tab, setTab] = useState<TabId>('details');
  const [pendingAction, setPendingAction] = useState<CaseAction | null>(null);
  const item = controller.resource.data;
  const pageRef = useRef<HTMLDivElement>(null);

  // Opening a case from far down the list starts the reader at the top of the case.
  useEffect(() => {
    pageRef.current?.scrollIntoView({ block: 'start' });
  }, [caseId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && pendingAction === null) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, pendingAction]);

  const closeModal = () => {
    setPendingAction(null);
    controller.clearActionError();
  };

  const openAction = (action: CaseAction) => {
    controller.clearActionError();
    setPendingAction(action);
  };

  const renderBody = () => {
    if (controller.resource.status === 'loading' && !item) {
      return (
        <div className="tx-case-drawer__state">
          <LoadingSpinner size="lg" label="Loading application" />
        </div>
      );
    }
    if (!item) {
      return (
        <div className="tx-case-drawer__state">
          <InlineAlert tone="error">{controller.resource.error ?? 'This application could not be loaded.'}</InlineAlert>
          <Button variant="secondary" iconName="rotate-ccw" onClick={() => void controller.resource.reload()}>
            Retry
          </Button>
        </div>
      );
    }
    if (item.status === 'SUBMITTED' && item.access?.canReviewDocuments) {
      return (
        <>
          <div className="tx-case-drawer__meta">
            <ServiceBadge service={item.service} />
          </div>
          {controller.actionError && pendingAction === null ? <InlineAlert tone="error">{controller.actionError}</InlineAlert> : null}
          <VerifyWizard item={item} controller={controller} onAction={openAction} />
        </>
      );
    }
    const isAgent = user ? tierOf(user.role) === 'AGENT' : false;
    if (isAgent && (item.status === 'ASSIGNED' || item.status === 'PORTAL_WORK')) {
      return (
        <>
          <div className="tx-case-drawer__meta">
            <ServiceBadge service={item.service} />
          </div>
          {controller.actionError && pendingAction === null ? <InlineAlert tone="error">{controller.actionError}</InlineAlert> : null}
          <AgentWizard item={item} controller={controller} onAction={openAction} />
        </>
      );
    }
    const tabs = TABS.filter((entry) => entry.visible?.(item) ?? true);
    const activeTab = tabs.find((entry) => entry.id === tab) ?? tabs[0];
    return (
      <>
        <div className="tx-case-drawer__meta">
          <ServiceBadge service={item.service} />
        </div>
        <CaseProgress item={item} agentView={user ? tierOf(user.role) === 'AGENT' : false} />
        {user && tierOf(user.role) === 'AGENT' ? <CaseManagerNote item={item} /> : null}
        <CaseActionBar
          item={item}
          busy={controller.busy}
          onAction={openAction}
          onDownloadAll={() => void downloadCaseDocuments(item, controller)}
          onOpenDocuments={() => setTab('documents')}
        />
        <CaseGlance item={item} />
        {controller.actionError && pendingAction === null ? <InlineAlert tone="error">{controller.actionError}</InlineAlert> : null}
        <div className="tx-case-drawer__tabs" role="tablist" aria-label="Application sections">
          {tabs.map((entry) => {
            const count = entry.count?.(item) ?? 0;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`${titleId}-${entry.id}`}
                aria-selected={tab === entry.id}
                aria-controls={`${titleId}-panel`}
                className={`tx-case-drawer__tab ${tab === entry.id ? 'tx-case-drawer__tab--active' : ''}`}
                onClick={() => setTab(entry.id)}
              >
                <Icon name={entry.iconName} size="sm" />
                {entry.label}
                {count > 0 ? <span className="tx-case-drawer__tab-count">{count}</span> : null}
              </button>
            );
          })}
        </div>
        <div className="tx-case-drawer__panel" role="tabpanel" id={`${titleId}-panel`} aria-labelledby={`${titleId}-${activeTab.id}`}>
          {activeTab.render({ item, controller })}
        </div>
      </>
    );
  };

  const renderModal = () => {
    if (!item || pendingAction === null) return null;
    if (pendingAction === 'ASSIGN') {
      return (
        <AssignAgentModal
          item={item}
          busy={controller.busy}
          serverError={controller.actionError}
          requireReason={user ? tierOf(user.role) === 'ADMINISTRATOR' : false}
          onSubmit={(input) => controller.mutate({ type: 'ASSIGN', input })}
          onClose={closeModal}
        />
      );
    }
    return (
      <TransitionModal item={item} action={pendingAction as TransitionInput['action']} controller={controller} onClose={closeModal} />
    );
  };

  return (
    <div ref={pageRef} className="tx-case-drawer__page">
      <article className="tx-case-drawer" aria-labelledby={titleId}>
        <header className="tx-case-drawer__header">
          <div className="tx-case-drawer__heading">
            <p className="tx-case-drawer__eyebrow">{item ? `Application #${item.referenceNumber}` : 'Application'}</p>
            <h2 id={titleId} className="tx-case-drawer__title">
              {item ? getServiceType(item.serviceType, item.service).label : controller.resource.status === 'loading' ? 'Loading…' : 'Application not available'}
            </h2>
            {item ? (
              <p className="tx-case-drawer__subtitle">
                {item.client.name} · {getServiceDefinition(item.service).label}
              </p>
            ) : null}
          </div>
        </header>
        <div className="tx-case-drawer__body">{renderBody()}</div>
      </article>
      {renderModal()}
    </div>
  );
}
