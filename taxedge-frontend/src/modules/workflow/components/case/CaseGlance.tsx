import { useCurrentUser } from '@/modules/authentication';
import { Icon, type IconName } from '@/shared';
import { isOverdue } from '../../services/caseQueries';
import { tierOf } from '../../services/transitionRules';
import { formatRupees } from '../../shared/fieldFormat';
import type { WorkflowCase } from '../../shared/workflow.types';
import './CaseGlance.css';

const DATE = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const DAY_MS = 86_400_000;

interface Fact {
  readonly iconName: IconName;
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly tone: 'ok' | 'warn' | 'danger' | 'neutral';
}

function dueFact(item: WorkflowCase): Fact {
  if (!item.dueDate) return { iconName: 'calendar', label: 'Due date', value: 'Not set', hint: 'No deadline yet', tone: 'neutral' };
  const days = Math.ceil((Date.parse(item.dueDate) - Date.now()) / DAY_MS);
  const value = DATE.format(Date.parse(item.dueDate));
  if (isOverdue(item)) return { iconName: 'alert-triangle', label: 'Due date', value, hint: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`, tone: 'danger' };
  return { iconName: 'calendar', label: 'Due date', value, hint: days <= 0 ? 'Due today' : `${days} day${days === 1 ? '' : 's'} left`, tone: days <= 2 ? 'warn' : 'ok' };
}

function progressFact(iconName: IconName, label: string, done: number, total: number, pendingHint: string): Fact {
  return {
    iconName,
    label,
    value: `${done} of ${total}`,
    hint: total === 0 ? 'None required' : done === total ? 'All complete' : pendingHint.replace('{n}', String(total - done)),
    tone: total === 0 || done === total ? 'ok' : 'warn'
  };
}

const PAYMENT_FACTS: Readonly<Record<WorkflowCase['payment']['state'], Pick<Fact, 'hint' | 'tone'>>> = Object.freeze({
  NOT_REQUESTED: { hint: 'Request it after verifying', tone: 'neutral' },
  PENDING: { hint: 'Waiting for the customer', tone: 'warn' },
  PAID: { hint: 'Received', tone: 'ok' }
});

function paymentFact(item: WorkflowCase): Fact {
  return { iconName: 'credit-card', label: 'Payment', value: item.payment.state === 'NOT_REQUESTED' ? 'Not requested' : formatRupees(item.payment.amount), ...PAYMENT_FACTS[item.payment.state] };
}

/** The answers needed before anything else: who has it, when it is due (admin and managers only), documents and payment. */
export function CaseGlance({ item }: { readonly item: WorkflowCase }) {
  const user = useCurrentUser();
  const showDue = user !== null && tierOf(user.role) !== 'AGENT';
  const required = item.documents.filter((doc) => doc.required);
  const facts: readonly Fact[] = [
    {
      iconName: 'user-check',
      label: 'Assigned to',
      value: item.assignment.agentName ?? 'Not assigned',
      hint: item.assignment.agentName ? '' : 'Assign after payment',
      tone: item.assignment.agentName ? 'ok' : 'warn'
    },
    ...(showDue ? [dueFact(item)] : []),
    progressFact('file-up', 'Documents correct', required.filter((doc) => doc.state === 'VERIFIED').length, required.length, '{n} still needed'),
    paymentFact(item)
  ];

  return (
    <dl className={showDue ? 'tx-case-glance tx-case-glance--four' : 'tx-case-glance'}>
      {facts.map((fact) => (
        <div key={fact.label} className={`tx-case-glance__fact tx-case-glance__fact--${fact.tone}`}>
          <dt className="tx-case-glance__label">
            <Icon name={fact.iconName} size="sm" />
            {fact.label}
          </dt>
          <dd className="tx-case-glance__value">{fact.value}</dd>
          {fact.hint ? <dd className="tx-case-glance__hint">{fact.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
