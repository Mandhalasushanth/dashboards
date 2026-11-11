import { useCallback, useMemo, useState } from 'react';
import { workflowApi } from '../api/workflowApi';
import { emitWorkflowChanged } from '../api/workflowEvents';
import type { AgentWorkload, CaseSummary, StaffOption, WorkflowNotification } from '../shared/workflow.types';
import { messageOf, useWorkflowResource, type WorkflowResource } from './useWorkflowResource';

const loadSummary = () => workflowApi.summary();
const loadAgents = () => workflowApi.listAgents();
const loadWorkload = () => workflowApi.workload();
const loadNotifications = () => workflowApi.notifications();

export function useCaseSummary(): WorkflowResource<CaseSummary> {
  return useWorkflowResource(loadSummary, 'Unable to load dashboard counts.');
}

export function useEligibleAgents(): WorkflowResource<StaffOption[]> {
  return useWorkflowResource(loadAgents, 'Unable to load agents.');
}

export function useTeamWorkload(): WorkflowResource<AgentWorkload[]> {
  return useWorkflowResource(loadWorkload, 'Unable to load team workload.');
}

export interface NotificationsController {
  readonly resource: WorkflowResource<WorkflowNotification[]>;
  readonly unreadCount: number;
  readonly error: string | null;
  readonly markRead: (id: string) => Promise<void>;
  readonly markAllRead: () => Promise<void>;
}

export function useWorkflowNotifications(): NotificationsController {
  const resource = useWorkflowResource(loadNotifications, 'Unable to load notifications.');
  const [error, setError] = useState<string | null>(null);
  const unreadCount = useMemo(() => (resource.data ?? []).filter((entry) => !entry.read).length, [resource.data]);

  const run = useCallback(async (write: () => Promise<void>) => {
    try {
      setError(null);
      await write();
      emitWorkflowChanged();
    } catch (cause) {
      setError(messageOf(cause, 'Unable to update notifications.'));
    }
  }, []);

  return {
    resource,
    unreadCount,
    error,
    markRead: (id) => run(() => workflowApi.markNotificationRead(id)),
    markAllRead: () => run(() => workflowApi.markAllNotificationsRead())
  };
}
