import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { onWorkflowChanged } from '../api/workflowEvents';

export type LoadStatus = 'loading' | 'success' | 'error';

export interface WorkflowResource<T> {
  readonly status: LoadStatus;
  readonly data: T | null;
  readonly error: string | null;
  readonly reload: () => Promise<void>;
}

export function messageOf(error: unknown, fallback: string): string {
  return isApiError(error) || error instanceof Error ? error.message : fallback;
}

/**
 * Loads one workflow resource, keeps the last good data visible while refreshing, ignores responses
 * that arrive after a newer request, and reloads whenever workflow data changes anywhere in the app.
 */
export function useWorkflowResource<T>(load: () => Promise<T>, failureMessage: string): WorkflowResource<T> {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const current = ++requestId.current;
    try {
      setError(null);
      const result = await load();
      if (current === requestId.current) {
        setData(result);
        setStatus('success');
      }
    } catch (cause) {
      logger.warn(failureMessage, { cause });
      if (current === requestId.current) {
        setError(messageOf(cause, failureMessage));
        setStatus('error');
      }
    }
  }, [load, failureMessage]);

  useEffect(() => {
    void reload();
    return onWorkflowChanged(() => {
      void reload();
    });
  }, [reload]);

  return { status, data, error, reload };
}
