import { useEffect, useState } from 'react';
import { Button, Icon, InlineAlert, type IconName } from '@/shared';
import type { CaseAction, CaseDocument, DocumentState } from '../../shared/workflow.types';
import type { CaseTabProps } from './CaseDrawer';
import { CaseDetailGrid } from './CaseDetailGrid';
import { CaseDetailsTab } from './CaseDetailsTab';
import { CaseManagerNote } from './CaseManagerNote';
import { CaseOutputs } from './CaseOutputs';
import { downloadOneFile, openFileInNewTab } from './downloadFiles';
import './VerifyWizard.css';
import './AgentWizard.css';

export interface AgentWizardProps extends CaseTabProps {
  readonly onAction: (action: CaseAction) => void;
}

interface WizardStep {
  readonly title: string;
  readonly hint: string;
  readonly iconName: IconName;
}

const STEPS: readonly WizardStep[] = Object.freeze([
  { title: 'Details', hint: "Read what the customer filled in and your manager's note.", iconName: 'file-text' },
  { title: 'Documents', hint: 'View and download every document the customer sent.', iconName: 'file-up' },
  { title: 'Start work', hint: 'Anything missing? Ask your manager. Otherwise start the portal work.', iconName: 'arrow-right' },
  { title: 'Submit', hint: 'Upload the result and submit the finished work.', iconName: 'check-check' }
]);

const STATE_LABELS: Readonly<Record<DocumentState, string>> = Object.freeze({
  MISSING: 'Not uploaded',
  UPLOADED: 'Uploaded',
  VERIFIED: 'Correct',
  REJECTED: 'Wrong'
});

/** A document the agent cannot work from: nothing was uploaded, or the manager marked it wrong. */
const isProblem = (doc: CaseDocument): boolean => doc.required && (!doc.fileUrl || doc.state === 'MISSING' || doc.state === 'REJECTED');

/**
 * The agent's work, one step at a time: details, documents (download each one), ask the manager or start
 * the portal work, then submit the result.
 */
export function AgentWizard({ item, controller, onAction }: AgentWizardProps) {
  const working = item.status === 'PORTAL_WORK';
  const [step, setStep] = useState(working ? 3 : 0);
  const [downloaded, setDownloaded] = useState<ReadonlySet<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);
  const [needDownload, setNeedDownload] = useState(false);
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const actions = item.access?.actions ?? [];
  const files = item.documents.filter((doc) => doc.fileUrl);
  const problems = item.documents.filter(isProblem);
  const everyFileSaved = files.length > 0 && files.every((doc) => downloaded.has(doc.id));
  const ready = Boolean(item.documentsDownloadedAt) || everyFileSaved;
  const required = item.documents.filter((doc) => doc.required);
  const requiredSaved = required.length > 0 && required.every((doc) => Boolean(item.documentsDownloadedAt) || downloaded.has(doc.id));

  /** Past the Documents step only once every required document has been downloaded (or portal work is under way). */
  const goTo = (target: number) => {
    if (!working && step <= 1 && target > 1 && required.length > 0 && !requiredSaved) {
      setStep(1);
      setNeedDownload(true);
      return;
    }
    setNeedDownload(false);
    setStep(target);
  };

  // Moving into portal work opens the last step; the case is then the agent's to finish.
  useEffect(() => {
    if (working) setStep(3);
  }, [working]);

  const recordDownloads = (saved: ReadonlySet<string>) => {
    if (!item.documentsDownloadedAt && files.length > 0 && files.every((doc) => saved.has(doc.id))) {
      void controller.mutate({ type: 'DOCUMENTS_DOWNLOADED' });
    }
  };

  const download = async (doc: CaseDocument): Promise<boolean> => {
    if (!doc.fileUrl) return false;
    setErrors((current) => ({ ...current, [doc.id]: '' }));
    try {
      await downloadOneFile({ url: doc.fileUrl, name: doc.fileName ?? `${doc.label}.pdf` });
      return true;
    } catch (error) {
      setErrors((current) => ({ ...current, [doc.id]: error instanceof Error ? error.message : 'The download failed.' }));
      return false;
    }
  };

  const downloadDocument = async (doc: CaseDocument) => {
    setDownloading(doc.id);
    const worked = await download(doc);
    setDownloading(null);
    if (worked) {
      const saved = new Set(downloaded).add(doc.id);
      setDownloaded(saved);
      recordDownloads(saved);
    }
  };

  const downloadAll = async () => {
    setDownloading('all');
    const saved = new Set(downloaded);
    for (const doc of files) {
      if (await download(doc)) saved.add(doc.id);
    }
    setDownloading(null);
    setDownloaded(saved);
    recordDownloads(saved);
  };

  const renderStepper = () => (
    <ol className="tx-verify__steps tx-verify__steps--four">
      {STEPS.map((entry, index) => (
        <li key={entry.title}>
          <button
            type="button"
            className={`tx-verify__step ${index === step ? 'tx-verify__step--current' : ''} ${index < step ? 'tx-verify__step--done' : ''}`}
            onClick={() => goTo(index)}
            aria-current={index === step ? 'step' : undefined}
          >
            <span className="tx-verify__step-marker">{index < step ? <Icon name="check" size="sm" /> : index + 1}</span>
            <span className="tx-verify__step-title">{entry.title}</span>
          </button>
        </li>
      ))}
    </ol>
  );

  const renderDetails = () => (
    <>
      <CaseManagerNote item={item} />
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
  );

  const renderDocument = (doc: CaseDocument) => (
    <li key={doc.id} className={`tx-agent-doc ${isProblem(doc) ? 'tx-agent-doc--problem' : ''}`}>
      <div className="tx-agent-doc__row">
        <div className="tx-agent-doc__info">
          <span className="tx-agent-doc__name">
            {doc.label}
            {doc.required ? <span className="tx-case-doc__required">Required</span> : null}
          </span>
          <span className="tx-agent-doc__meta">
            {doc.fileName ?? 'The customer has not uploaded this yet'}
            {doc.rejectionReason ? ` · Wrong: ${doc.rejectionReason}` : ''}
          </span>
        </div>
        <span className={`tx-case-doc__state tx-case-doc__state--${doc.state.toLowerCase()}`}>{STATE_LABELS[doc.state]}</span>
        <div className="tx-agent-doc__buttons">
          {doc.fileUrl ? (
            <>
              <Button variant="secondary" iconName="eye" onClick={() => openFileInNewTab(doc.fileUrl as string)}>
                View
              </Button>
              <Button
                variant={downloaded.has(doc.id) ? 'secondary' : 'primary'}
                iconName={downloaded.has(doc.id) ? 'check' : 'download'}
                loading={downloading === doc.id}
                disabled={downloading !== null || controller.busy}
                onClick={() => void downloadDocument(doc)}
              >
                {downloaded.has(doc.id) ? 'Downloaded' : 'Download'}
              </Button>
            </>
          ) : null}
        </div>
      </div>
      {errors[doc.id] ? (
        <InlineAlert tone="error">
          Could not download “{doc.label}”. {errors[doc.id]} Try again, or tell your manager if it keeps failing.
        </InlineAlert>
      ) : null}
    </li>
  );

  const renderDocuments = () => (
    <section className="tx-agent-docs">
      <div className="tx-case-docs__bar">
        <p className="tx-case-docs__summary">
          <strong>
            {item.documentsDownloadedAt || everyFileSaved ? files.length : files.filter((doc) => downloaded.has(doc.id)).length} of {files.length}
          </strong>{' '}
          documents downloaded
        </p>
        {files.length > 0 ? (
          <Button iconName="download" loading={downloading === 'all'} disabled={downloading !== null || controller.busy} onClick={() => void downloadAll()}>
            Download All
          </Button>
        ) : null}
      </div>
      {needDownload && !requiredSaved ? (
        <InlineAlert tone="warning">Download the required documents first. Use Download next to each document, or Download All, then click Next.</InlineAlert>
      ) : null}
      {requiredSaved ? (
        <InlineAlert tone="success">
          All {required.length} required documents are downloaded. Click Next to continue.
        </InlineAlert>
      ) : downloaded.size > 0 ? (
        <InlineAlert tone="info">
          {downloaded.size} downloaded. {required.filter((doc) => !downloaded.has(doc.id)).length} required document(s) still to download.
        </InlineAlert>
      ) : null}
      <ul className="tx-agent-docs__list">{item.documents.map(renderDocument)}</ul>
    </section>
  );

  const renderStart = () => {
    if (working) {
      return (
        <div className="tx-verify__decision tx-verify__decision--ok">
          <p className="tx-verify__decision-title">
            <Icon name="circle-check" />
            Portal work has started
          </p>
          <p className="tx-verify__decision-text">Do the work on the outside portal, then go to Submit to upload the result.</p>
          <div className="tx-verify__decision-actions">
            <Button iconName="arrow-right" onClick={() => setStep(3)}>
              Go to Submit
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className={`tx-verify__decision tx-verify__decision--${problems.length === 0 ? 'ok' : 'fix'}`}>
        <p className="tx-verify__decision-title">
          <Icon name={problems.length === 0 ? 'circle-check' : 'alert-triangle'} />
          {problems.length === 0 ? 'All required documents are here' : `${problems.length} document${problems.length === 1 ? '' : 's'} missing or wrong`}
        </p>
        {problems.length > 0 ? (
          <ul className="tx-verify__problems">
            {problems.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.label}</strong> — {doc.rejectionReason ?? 'Not uploaded'}
              </li>
            ))}
          </ul>
        ) : (
          <p className="tx-verify__decision-text">
            {ready ? 'The documents are downloaded. You can start the portal work.' : 'Download the documents in step 2, then start the portal work.'}
          </p>
        )}
        <div className="tx-verify__decision-actions">
          {problems.length === 0 && actions.includes('START_PORTAL_WORK') ? (
            ready ? (
              <Button iconName="arrow-right" onClick={() => onAction('START_PORTAL_WORK')} disabled={controller.busy}>
                Start Portal Work
              </Button>
            ) : (
              <Button iconName="download" onClick={() => setStep(1)}>
                Download Documents First
              </Button>
            )
          ) : null}
          {actions.includes('REPORT_MISSING') ? (
            <Button variant={problems.length > 0 ? 'primary' : 'secondary'} iconName="alert-triangle" onClick={() => onAction('REPORT_MISSING')} disabled={controller.busy}>
              Ask Manager for Missing Documents
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  const renderSubmit = () =>
    working ? (
      <>
        <CaseOutputs item={item} controller={controller} />
        <div className="tx-verify__decision-actions">
          <Button iconName="check-check" onClick={() => onAction('SUBMIT_OUTPUT')} disabled={controller.busy || item.outputs.length === 0}>
            Submit Completed Work
          </Button>
          {item.outputs.length === 0 ? <span className="tx-agent-wizard__note">Upload at least one result file first.</span> : null}
        </div>
      </>
    ) : (
      <p className="tx-case-docs__hint">
        <Icon name="clock" size="sm" /> This step opens once you start the portal work (step 3).
      </p>
    );

  const PANELS: readonly (() => JSX.Element)[] = [renderDetails, renderDocuments, renderStart, renderSubmit];

  return (
    <section className="tx-verify" aria-label="Work on application">
      {renderStepper()}
      <div className="tx-verify__panel">
        <p className="tx-verify__hint">
          <Icon name={STEPS[step].iconName} size="sm" />
          Step {step + 1} of {STEPS.length}: {STEPS[step].hint}
        </p>
        {PANELS[step]()}
      </div>
      <div className="tx-verify__nav">
        <Button variant="secondary" iconName="chevron-left" onClick={() => goTo(step - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button iconName="arrow-right" onClick={() => goTo(step + 1)}>
            Next
          </Button>
        ) : null}
      </div>
    </section>
  );
}
