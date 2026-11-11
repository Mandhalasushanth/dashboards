import { toInitials } from '@/core/utils/stringUtils';
import { EmptyState, InlineAlert, LoadingSpinner } from '@/shared';
import { useTeamWorkload } from '../../hooks/useWorkflowData';
import { TEAM_LABELS } from '../../shared/workflowServices';
import type { AgentWorkload } from '../../shared/workflow.types';
import './TeamWorkloadPanel.css';

/** Active load per agent ("high" at this many active cases) so managers can balance assignments. */
const HIGH_WORKLOAD = 5;
const COMPACT_LIMIT = 4;

const byLoad = (a: AgentWorkload, b: AgentWorkload) => b.activeCases + b.overdue - (a.activeCases + a.overdue);

export function TeamWorkloadPanel({ compact = false }: { readonly compact?: boolean }) {
  const workload = useTeamWorkload();

  if (workload.status === 'loading' && !workload.data) return <LoadingSpinner label="Loading team workload" />;
  if (!workload.data) return <InlineAlert tone="error">{workload.error ?? 'Unable to load team workload.'}</InlineAlert>;
  if (workload.data.length === 0) return <EmptyState title="No agents yet" message="Agents provisioned by the administrator will appear here." iconName="users" />;

  const rows = [...workload.data].sort(byLoad).slice(0, compact ? COMPACT_LIMIT : undefined);

  const renderRow = (entry: AgentWorkload) => {
    const high = entry.activeCases >= HIGH_WORKLOAD || entry.overdue > 0;
    return (
      <li key={entry.agent.id} className={`tx-workload__row ${entry.agent.active ? '' : 'tx-workload__row--inactive'}`.trim()}>
        <span className="tx-workload__avatar" aria-hidden="true">
          {toInitials(entry.agent.name)}
        </span>
        <span className="tx-workload__who">
          <span className="tx-workload__name">{entry.agent.name}</span>
          <span className="tx-workload__team">
            {TEAM_LABELS[entry.agent.team]}
            {entry.agent.active ? '' : ' · Inactive'}
          </span>
        </span>
        <span className="tx-workload__stats">
          <span className={`tx-workload__stat ${high ? 'tx-workload__stat--high' : ''}`.trim()} title="Active cases">
            <strong>{entry.activeCases}</strong> active
          </span>
          {!compact ? (
            <>
              <span className="tx-workload__stat" title="Working on the portal">
                <strong>{entry.portalWork}</strong> on portal
              </span>
              <span className="tx-workload__stat" title="Completed">
                <strong>{entry.completed}</strong> done
              </span>
            </>
          ) : null}
          {entry.overdue > 0 ? (
            <span className="tx-workload__stat tx-workload__stat--overdue">
              <strong>{entry.overdue}</strong> overdue
            </span>
          ) : null}
        </span>
      </li>
    );
  };

  return <ul className="tx-workload">{rows.map(renderRow)}</ul>;
}
