import { useRef, useState, type ChangeEvent } from 'react';
import { formatDateTime } from '@/core/utils/dateUtils';
import { Button, Icon, InlineAlert } from '@/shared';
import { getServiceDefinition } from '../../shared/workflowServices';
import { DOCUMENT_UPLOAD_RULES, validateDocumentFile } from '../../validation/documentValidation';
import type { CaseOutput } from '../../shared/workflow.types';
import type { CaseTabProps } from './CaseDrawer';
import { downloadFiles, openFileInNewTab } from './downloadFiles';
import './CaseOutputs.css';

const ACCEPTED = `${DOCUMENT_UPLOAD_RULES.extensions.join(', ').toUpperCase()} up to ${Math.round(DOCUMENT_UPLOAD_RULES.maxBytes / (1024 * 1024))} MB`;

/** The finished result the agent delivers: upload while doing portal work, visible to the manager and customer. */
export function CaseOutputs({ item, controller }: CaseTabProps) {
  const canUpload = item.access?.canUploadOutput ?? false;
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    const problem = validateDocumentFile(file);
    setError(problem);
    if (!problem && file) {
      await controller.uploadOutput(file);
    }
  };

  const renderOutput = (output: CaseOutput) => (
    <li key={output.id} className="tx-case-output">
      <Icon name="file-text" />
      <span className="tx-case-output__info">
        <span className="tx-case-output__name">{output.fileName}</span>
        <span className="tx-case-output__meta">
          {output.uploadedBy} · {formatDateTime(output.uploadedAt)}
        </span>
      </span>
      <span className="tx-case-output__actions">
        {output.fileUrl ? (
          <Button variant="secondary" iconName="eye" onClick={() => openFileInNewTab(output.fileUrl as string)}>
            View
          </Button>
        ) : null}
        {output.fileUrl ? (
          <Button variant="secondary" iconName="download" onClick={() => downloadFiles([{ url: output.fileUrl as string, name: output.fileName }])}>
            Download
          </Button>
        ) : null}
        {canUpload ? (
          <Button variant="secondary" iconName="trash" disabled={controller.busy} onClick={() => void controller.mutate({ type: 'REMOVE_OUTPUT', outputId: output.id })}>
            Remove
          </Button>
        ) : null}
      </span>
    </li>
  );

  return (
    <section className="tx-case-outputs" aria-label="Result files">
      {canUpload ? <p className="tx-case-outputs__hint">Upload: {getServiceDefinition(item.service).outputHint}.</p> : null}
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      {item.outputs.length > 0 ? (
        <ul className="tx-case-outputs__list">{item.outputs.map(renderOutput)}</ul>
      ) : (
        <p className="tx-case-outputs__empty">{canUpload ? 'No result uploaded yet.' : 'The agent has not delivered a result yet.'}</p>
      )}
      {canUpload ? (
        <>
          <input ref={fileInput} type="file" accept={DOCUMENT_UPLOAD_RULES.accept} className="tx-sr-only" tabIndex={-1} aria-hidden="true" onChange={handleFile} />
          <Button variant="secondary" iconName="file-up" onClick={() => fileInput.current?.click()} loading={controller.busy} loadingLabel="Uploading…">
            Add Result File
          </Button>
          <p className="tx-case-outputs__rules">{ACCEPTED}</p>
        </>
      ) : null}
    </section>
  );
}
