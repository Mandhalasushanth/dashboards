import { useRef, useState, type ChangeEvent } from 'react';
import { formatDateTime } from '@/core/utils/dateUtils';
import { Button, InlineAlert, TextAreaField } from '@/shared';
import { validateNote } from '../../services/transitionRules';
import { DOCUMENT_UPLOAD_RULES, validateDocumentFile } from '../../validation/documentValidation';
import type { CaseDocument, DocumentState } from '../../shared/workflow.types';
import type { CaseTabProps } from './CaseDrawer';
import { downloadCaseDocuments, openFileInNewTab } from './downloadFiles';
import './CaseDocumentsTab.css';

const STATE_LABELS: Readonly<Record<DocumentState, string>> = Object.freeze({
  MISSING: 'Not uploaded',
  UPLOADED: 'To check',
  VERIFIED: 'Correct',
  REJECTED: 'Wrong'
});

/**
 * Documents the customer uploaded. The manager opens each one and marks it Correct or Wrong (and can
 * upload on the customer's behalf); the assigned agent views and downloads them.
 */
export function CaseDocumentsTab({ item, controller }: CaseTabProps) {
  const canUpload = item.access?.canUploadDocuments ?? false;
  const canReview = item.access?.canReviewDocuments ?? false;
  const canDownload = item.access?.canDownloadDocuments ?? false;
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const required = item.documents.filter((doc) => doc.required);
  const correct = required.filter((doc) => doc.state === 'VERIFIED').length;
  const toCheck = item.documents.filter((doc) => doc.state === 'UPLOADED').length;

  const chooseFile = (documentId: string) => {
    setLocalError(null);
    setUploadTarget(documentId);
    fileInput.current?.click();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    const error = validateDocumentFile(file);
    if (error || !file || !uploadTarget) {
      setLocalError(error);
      return;
    }
    await controller.upload(uploadTarget, file);
    setUploadTarget(null);
  };

  const markCorrect = (doc: CaseDocument) => void controller.mutate({ type: 'DOCUMENT_REVIEW', documentId: doc.id, decision: 'VERIFIED', reason: '' });

  const confirmWrong = async (doc: CaseDocument) => {
    const error = validateNote(reason, true, 'A reason');
    setLocalError(error);
    if (!error && (await controller.mutate({ type: 'DOCUMENT_REVIEW', documentId: doc.id, decision: 'REJECTED', reason }))) {
      setRejecting(null);
      setReason('');
    }
  };

  const renderDocument = (doc: CaseDocument) => (
    <li key={doc.id} className={`tx-case-doc tx-case-doc--${doc.state.toLowerCase()}`}>
      <div className="tx-case-doc__main">
        <div className="tx-case-doc__info">
          <span className="tx-case-doc__name">
            {doc.label}
            {doc.required ? <span className="tx-case-doc__required">Required</span> : null}
          </span>
          <span className="tx-case-doc__meta">{doc.fileName ? `${doc.fileName} · v${doc.version} · ${doc.uploadedBy ?? 'Unknown'} · ${formatDateTime(doc.uploadedAt)}` : 'The customer has not uploaded this yet'}</span>
          {doc.rejectionReason ? <span className="tx-case-doc__reason">Why it is wrong: {doc.rejectionReason}</span> : null}
        </div>
        <span className={`tx-case-doc__state tx-case-doc__state--${doc.state.toLowerCase()}`}>{STATE_LABELS[doc.state]}</span>
      </div>
      <div className="tx-case-doc__actions">
        {doc.fileUrl ? (
          <Button variant="secondary" iconName="eye" onClick={() => openFileInNewTab(doc.fileUrl as string)}>
            View
          </Button>
        ) : null}
        {canReview && doc.state !== 'MISSING' && doc.state !== 'VERIFIED' ? (
          <Button iconName="check" disabled={controller.busy} onClick={() => markCorrect(doc)}>
            Correct
          </Button>
        ) : null}
        {/* Once a document is marked Correct the decision stands; Wrong is offered only while it is still to be checked. */}
        {canReview && doc.state === 'UPLOADED' && rejecting !== doc.id ? (
          <Button variant="secondary" iconName="x" disabled={controller.busy} onClick={() => setRejecting(doc.id)}>
            Wrong
          </Button>
        ) : null}
        {canUpload ? (
          <Button variant="secondary" iconName="file-up" onClick={() => chooseFile(doc.id)} disabled={controller.busy}>
            {doc.state === 'MISSING' ? 'Upload copy received' : 'Replace with copy received'}
          </Button>
        ) : null}
      </div>
      {rejecting === doc.id ? (
        <div className="tx-case-doc__reject">
          <TextAreaField id={`tx-reject-${doc.id}`} label="What is wrong with it? *" value={reason} onChange={setReason} rows={2} maxLength={300} />
          <div className="tx-case-doc__reject-actions">
            <Button variant="secondary" onClick={() => setRejecting(null)} disabled={controller.busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void confirmWrong(doc)} loading={controller.busy}>
              Mark as Wrong
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );

  return (
    <section className="tx-case-docs">
      <div className="tx-case-docs__bar">
        <p className="tx-case-docs__summary">
          <strong>
            {correct} of {required.length}
          </strong>{' '}
          required documents correct
          {toCheck > 0 ? <span className="tx-case-docs__pill">{toCheck} to check</span> : null}
        </p>
        {canDownload ? (
          <Button iconName="download" onClick={() => void downloadCaseDocuments(item, controller)} disabled={controller.busy}>
            Download All
          </Button>
        ) : null}
      </div>
      {localError ? <InlineAlert tone="error">{localError}</InlineAlert> : null}
      {canReview && toCheck > 0 ? <p className="tx-case-docs__hint">Open each document with View, then mark it Correct or Wrong.</p> : null}
      {canUpload ? (
        <p className="tx-case-docs__hint">
          Accepted: {DOCUMENT_UPLOAD_RULES.extensions.join(', ').toUpperCase()} up to {Math.round(DOCUMENT_UPLOAD_RULES.maxBytes / (1024 * 1024))} MB.
        </p>
      ) : null}
      <input ref={fileInput} type="file" accept={DOCUMENT_UPLOAD_RULES.accept} className="tx-sr-only" tabIndex={-1} aria-hidden="true" onChange={handleFile} />
      <ul className="tx-case-docs__list">{item.documents.map(renderDocument)}</ul>
    </section>
  );
}
