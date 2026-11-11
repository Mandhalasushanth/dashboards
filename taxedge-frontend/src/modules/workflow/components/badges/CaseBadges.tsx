import { Icon } from '@/shared';
import { getServiceDefinition } from '../../shared/workflowServices';
import { STATUS_META } from '../../shared/workflowStatuses';
import type { CaseStatus, ServiceKind } from '../../shared/workflow.types';
import './CaseBadges.css';

/** Status always shows its text label as well as its colour, so status is never colour-only. */
export function CaseStatusBadge({ status }: { readonly status: CaseStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`tx-case-status tx-case-status--${meta.tone}`}>
      <span className="tx-case-status__dot" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function ServiceBadge({ service }: { readonly service: ServiceKind }) {
  const definition = getServiceDefinition(service);
  return (
    <span className={`tx-service-badge tx-service-badge--${definition.team.toLowerCase()}`} title={definition.label}>
      <Icon name={definition.iconName} size="sm" />
      {definition.shortLabel}
    </span>
  );
}
