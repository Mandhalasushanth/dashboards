import { useMemo, useState } from 'react';
import { Button, InlineAlert, InputField, LoadingSpinner, SelectField, TextAreaField } from '@/shared';
import { useTeamWorkload } from '../../hooks/useWorkflowData';
import { DEFAULT_PRIORITY, PRIORITIES } from '../../services/casePriority';
import { TEAM_LABELS } from '../../shared/workflowServices';
import { MAX_NOTE_LENGTH } from '../../shared/workflowStatuses';
import type { AgentWorkload, AssignInput, CasePriority, WorkflowCase } from '../../shared/workflow.types';
import { WorkflowModal } from './WorkflowModal';
import './AssignAgentModal.css';

export interface AssignAgentModalProps {
  readonly item: WorkflowCase;
  readonly busy: boolean;
  readonly serverError: string | null;
  /** Administrators must give a reason, because their reassignment is an intervention. */
  readonly requireReason: boolean;
  readonly onSubmit: (input: AssignInput) => Promise<boolean>;
  readonly onClose: () => void;
}

/** Lower load first; inactive agents sink to the bottom and cannot be chosen. */
const byAvailability = (a: AgentWorkload, b: AgentWorkload) =>
  Number(b.agent.active) - Number(a.agent.active) || a.activeCases + a.overdue - (b.activeCases + b.overdue);

export function AssignAgentModal({ item, busy, serverError, requireReason, onSubmit, onClose }: AssignAgentModalProps) {
  const workload = useTeamWorkload();
  const [agentId, setAgentId] = useState<string | null>(item.assignment.agentId);
  const [instructions, setInstructions] = useState(item.assignment.instructions ?? '');
  const [dueDate, setDueDate] = useState(item.dueDate ? item.dueDate.slice(0, 10) : '');
  const [priority, setPriority] = useState<CasePriority>(item.assignment.priority ?? DEFAULT_PRIORITY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reassigning = item.assignment.agentId !== null;

  const agents = useMemo(
    () => (workload.data ?? []).filter((entry) => entry.agent.team === item.team).sort(byAvailability),
    [workload.data, item.team]
  );

  /** The agent the dropdown actually shows; a stale id that is not in the list counts as nothing chosen. */
  const chosenAgent = agents.find((entry) => entry.agent.id === agentId && (entry.agent.active || entry.agent.id === item.assignment.agentId));

  /** The only rule: every field must be filled in. */
  const validate = (): Record<string, string> => {
    const missing: Record<string, string> = {};
    if (!chosenAgent) missing.agent = 'Select an agent.';
    if (!dueDate) missing.dueDate = 'Choose a due date.';
    if (!priority) missing.priority = 'Choose a priority.';
    if (!instructions.trim()) missing.instructions = requireReason ? 'Enter the intervention reason.' : 'Enter the internal instructions.';
    return missing;
  };

  /** Clears the message under a field as soon as the user changes it. */
  const clearError = (field: string) => setErrors((current) => (field in current ? Object.fromEntries(Object.entries(current).filter(([key]) => key !== field)) : current));

  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !chosenAgent) {
      return;
    }
    const keptDate = item.dueDate && dueDate === item.dueDate.slice(0, 10) ? item.dueDate : null;
    const nextDue = keptDate ?? (dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : null);
    const saved = await onSubmit({ agentId: chosenAgent.agent.id, instructions: instructions.trim(), dueDate: nextDue, priority });
    if (saved) {
      onClose();
    }
  };

  /** One line per agent: "agent1 | Active: 2 | Overdue: 2" (the current agent is marked). */
  const agentLabel = (entry: AgentWorkload) =>
    `${entry.agent.name} | Active: ${entry.activeCases} | Overdue: ${entry.overdue}${entry.agent.id === item.assignment.agentId ? ' | Current' : ''}`;

  const renderAgents = () => {
    if (workload.status === 'loading') return <LoadingSpinner label="Loading eligible agents" />;
    if (workload.status === 'error') return <InlineAlert tone="error">{workload.error ?? 'Unable to load agents.'}</InlineAlert>;
    if (agents.length === 0) return <InlineAlert tone="warning">{`No agents exist in the ${TEAM_LABELS[item.team]} yet.`}</InlineAlert>;
    return (
      <SelectField
        id="tx-assign-agent"
        label={`Agent · ${TEAM_LABELS[item.team]}`}
        value={chosenAgent ? chosenAgent.agent.id : ''}
        onChange={(value) => { setAgentId(value); clearError('agent'); }}
        placeholder="Select an agent"
        options={agents.filter((entry) => entry.agent.active || entry.agent.id === agentId).map((entry) => ({ value: entry.agent.id, label: agentLabel(entry) }))}
        error={errors.agent}
      />
    );
  };

  return (
    <WorkflowModal
      title={reassigning ? 'Reassign or Reschedule' : 'Assign Agent'}
      subtitle={`${item.referenceNumber} · ${item.client.name}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" iconName="user-check" loading={busy} loadingLabel="Saving…">
            {reassigning ? 'Save Changes' : 'Confirm Assignment'}
          </Button>
        </>
      }
    >
      {serverError ? <InlineAlert tone="error">{serverError}</InlineAlert> : null}
      {renderAgents()}
      {workload.status !== 'success' || agents.length === 0 ? (
        errors.agent ? <p className="tx-form-field__error" role="alert">{errors.agent}</p> : null
      ) : null}
      <div className="tx-assign-agent__grid">
        <InputField id="tx-assign-due" label="Due Date" type="date" value={dueDate} onChange={(value) => { setDueDate(value); clearError('dueDate'); clearError('agent'); }} error={errors.dueDate} />
        <SelectField id="tx-assign-priority" label="Priority" value={priority} onChange={(value) => { setPriority(value); clearError('priority'); clearError('agent'); }} options={PRIORITIES} error={errors.priority} />
      </div>
      <TextAreaField
        id="tx-assign-instructions"
        label={requireReason ? 'Intervention Reason *' : 'Internal Instructions'}
        value={instructions}
        onChange={(value) => { setInstructions(value); clearError('instructions'); }}
        rows={3}
        maxLength={MAX_NOTE_LENGTH}
        error={errors.instructions}
      />
    </WorkflowModal>
  );
}
