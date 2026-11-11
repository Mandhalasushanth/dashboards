import { useCallback, useState } from 'react';
import { workflowApi } from '../api/workflowApi';
import { emitWorkflowChanged } from '../api/workflowEvents';
import type { CaseMutation, WorkflowCase } from '../shared/workflow.types';
import { messageOf, useWorkflowResource, type WorkflowResource } from './useWorkflowResource';

export interface CaseDetailController {
  readonly resource: WorkflowResource<WorkflowCase>;
  /** True while a write is in flight; buttons disable so a double click cannot submit twice. */
  readonly busy: boolean;
  readonly actionError: string | null;
  readonly clearActionError: () => void;
  readonly mutate: (mutation: CaseMutation) => Promise<boolean>;
  readonly upload: (documentId: string, file: File) => Promise<boolean>;
  readonly uploadOutput: (file: File) => Promise<boolean>;
}

/** One case plus its writes. Every write sends the loaded version; on success all views refresh. */
export function useCaseDetail(caseId: string): CaseDetailController {
  const load = useCallback(() => workflowApi.getCase(caseId), [caseId]);
  const resource = useWorkflowResource(load, 'Unable to load this application.');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const execute = useCallback(
    async (write: (current: WorkflowCase) => Promise<WorkflowCase>): Promise<boolean> => {
      const current = resource.data;
      if (!current || busy) {
        return false;
      }
      try {
        setBusy(true);
        setActionError(null);
        await write(current);
        emitWorkflowChanged();
        return true;
      } catch (error) {
        setActionError(messageOf(error, 'The change could not be saved. Please try again.'));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [resource.data, busy]
  );

  const mutate = useCallback(
    (mutation: CaseMutation) => execute((current) => workflowApi.mutate(current.id, current.version, mutation)),
    [execute]
  );

  const upload = useCallback(
    (documentId: string, file: File) => execute((current) => workflowApi.uploadDocument(current.id, current.version, documentId, file)),
    [execute]
  );

  const uploadOutput = useCallback(
    (file: File) => execute((current) => workflowApi.uploadOutput(current.id, current.version, file)),
    [execute]
  );

  return { resource, busy, actionError, clearActionError: () => setActionError(null), mutate, upload, uploadOutput };
}
