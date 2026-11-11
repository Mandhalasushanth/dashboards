import { useState } from 'react';
import { Button, Icon, type IconName } from '@/shared';
import type { CaseAction, CaseDocument } from '../../shared/workflow.types';
import type { CaseTabProps } from './CaseDrawer';
import { CaseDetailGrid } from './CaseDetailGrid';
import { CaseDetailsTab } from './CaseDetailsTab';
import { CaseDocumentsTab } from './CaseDocumentsTab';
import './VerifyWizard.css';

export interface VerifyWizardProps extends CaseTabProps {
  readonly onAction: (action: CaseAction) => void;
}

interface WizardStep {
  readonly title: string;
  readonly hint: string;
  readonly iconName: IconName;
}

const STEPS: readonly WizardStep[] = Object.freeze([
  { title: 'Check details', hint: 'Read what the customer filled in.', iconName: 'file-text' },
  { title: 'Check documents', hint: 'Open each document and mark it Correct or Wrong.', iconName: 'file-up' },
  { title: 'Send request', hint: 'Ask for payment, or ask the customer to fix something.', iconName: 'send' }
]);

/** Why a required document is holding the application up, in the words the customer will read. */
const problemOf = (doc: CaseDocument): string | null =>
  !doc.required || doc.state === 'VERIFIED' ? null : doc.state === 'MISSING' ? 'Not uploaded' : doc.state === 'REJECTED' ? doc.rejectionReason ?? 'Marked wrong' : 'Not checked yet';

/**
 * The manager's verification, one step at a time: details → documents → one decision.
 * Everything correct → payment request; anything wrong or missing → request to the customer.
 */
export function VerifyWizard({ item, controller, onAction }: VerifyWizardProps) {
  const [step, setStep] = useState(0);
  const problems = item.documents.map((doc) => ({ doc, problem: problemOf(doc) })).filter((entry) => entry.problem !== null);
  const unchecked = item.documents.filter((doc) => doc.state === 'UPLOADED').length;
  const allCorrect = problems.length === 0;
  const actions = item.access?.actions ?? [];

  const renderStepper = () => (
    <ol className="tx-verify__steps">
      {STEPS.map((entry, index) => (
        <li key={entry.title}>
          <button
            type="button"
            className={`tx-verify__step ${index === step ? 'tx-verify__step--current' : ''} ${index < step ? 'tx-verify__step--done' : ''}`}
            onClick={() => setStep(index)}
            aria-current={index === step ? 'step' : undefined}
          >
            <span className="tx-verify__step-marker">{index < step ? <Icon name="check" size="sm" /> : index + 1}</span>
            <span className="tx-verify__step-title">{entry.title}</span>
          </button>
        </li>
      ))}
    </ol>
  );

  const renderDecision = () => (
    <div className={`tx-verify__decision tx-verify__decision--${allCorrect ? 'ok' : 'fix'}`}>
      <p className="tx-verify__decision-title">
        <Icon name={allCorrect ? 'circle-check' : 'alert-triangle'} />
        {allCorrect ? 'Everything is correct' : `${problems.length} document${problems.length === 1 ? '' : 's'} need${problems.length === 1 ? 's' : ''} attention`}
      </p>
      {allCorrect ? (
        <p className="tx-verify__decision-text">Send the payment request. The customer pays in the mobile app, then you can assign an agent.</p>
      ) : (
        <ul className="tx-verify__problems">
          {problems.map(({ doc, problem }) => (
            <li key={doc.id}>
              <strong>{doc.label}</strong> — {problem}
            </li>
          ))}
        </ul>
      )}
      <div className="tx-verify__decision-actions">
        {allCorrect && actions.includes('REQUEST_PAYMENT') ? (
          <Button iconName="credit-card" onClick={() => onAction('REQUEST_PAYMENT')} disabled={controller.busy}>
            Send Payment Request
          </Button>
        ) : null}
        {!allCorrect && unchecked > 0 ? (
          <Button variant="secondary" iconName="file-up" onClick={() => setStep(1)}>
            Finish Checking Documents
          </Button>
        ) : null}
        {actions.includes('SEND_BACK') ? (
          <Button variant={allCorrect ? 'secondary' : 'primary'} iconName="rotate-ccw" onClick={() => onAction('SEND_BACK')} disabled={controller.busy}>
            Request from Customer
          </Button>
        ) : null}
        {actions.includes('REJECT') ? (
          <button type="button" className="tx-verify__reject" onClick={() => onAction('REJECT')} disabled={controller.busy}>
            Reject Application
          </button>
        ) : null}
      </div>
    </div>
  );

  const PANELS: readonly (() => JSX.Element)[] = [
    () => (
      <>
        <CaseDetailsTab item={item} />
        <CaseDetailGrid
          title="Customer"
          entries={[
            { label: 'Name', value: item.client.name },
            { label: 'PAN', value: item.client.pan },
            { label: 'Mobile', value: item.client.mobile },
            { label: 'Email', value: item.client.email },
            { label: 'City', value: item.client.city }
          ]}
        />
      </>
    ),
    () => <CaseDocumentsTab item={item} controller={controller} />,
    renderDecision
  ];

  return (
    <section className="tx-verify" aria-label="Verify application">
      {renderStepper()}
      <div className="tx-verify__panel">
        <p className="tx-verify__hint">
          <Icon name={STEPS[step].iconName} size="sm" />
          Step {step + 1} of {STEPS.length}: {STEPS[step].hint}
        </p>
        {PANELS[step]()}
      </div>
      <div className="tx-verify__nav">
        <Button variant="secondary" iconName="chevron-left" onClick={() => setStep(step - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button iconName="arrow-right" onClick={() => setStep(step + 1)}>
            {step === 1 && unchecked > 0 ? `Next (${unchecked} still to check)` : 'Next'}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
