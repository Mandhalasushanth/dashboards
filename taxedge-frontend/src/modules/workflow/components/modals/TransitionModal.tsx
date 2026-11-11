import { useState } from 'react';
import { Button, InlineAlert, InputField, TextAreaField } from '@/shared';
import type { CaseDetailController } from '../../hooks/useCaseDetail';
import { actionBlockers, validateFee, validateNote, validateReference } from '../../services/transitionRules';
import { getServiceDefinition } from '../../shared/workflowServices';
import { ACTION_RULES, MAX_NOTE_LENGTH, MIN_NOTE_LENGTH, STATUS_META } from '../../shared/workflowStatuses';
import type { CaseDocument, TransitionInput, WorkflowCase } from '../../shared/workflow.types';
import { CaseOutputs } from '../case/CaseOutputs';
import { PaymentAmountField } from './PaymentAmountField';
import { WorkflowModal } from './WorkflowModal';
import './TransitionModal.css';

export interface TransitionModalProps {
  readonly item: WorkflowCase;
  readonly action: TransitionInput['action'];
  readonly controller: CaseDetailController;
  readonly onClose: () => void;
}

type Action = TransitionInput['action'];

/** Which extra field each action asks for; everything else only takes the note. */
const REFERENCE_FIELD: Readonly<Partial<Record<Action, { readonly label: string; readonly required: boolean; readonly placeholder: string }>>> = Object.freeze({
  MARK_PAID: { label: 'Payment reference (UTR / transaction ID) *', required: true, placeholder: 'e.g. UTR123456789' },
  SUBMIT_OUTPUT: { label: 'Portal acknowledgement number', required: false, placeholder: 'e.g. ARN or SRN' }
});

/** Actions where the user ticks which documents the issue is about. */
const PICKS_DOCUMENTS: ReadonlySet<Action> = new Set<Action>(['SEND_BACK', 'REPORT_MISSING']);
const IRREVERSIBLE: ReadonlySet<Action> = new Set<Action>(['REJECT', 'CANCEL']);

/** Confirmation dialog for one workflow step, with only the fields that step needs. */
export function TransitionModal({ item, action, controller, onClose }: TransitionModalProps) {
  const rule = ACTION_RULES[action];
  const reference = REFERENCE_FIELD[action];
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [minimumAmount, setMinimumAmount] = useState<number | null>(null);
  const [referenceValue, setReferenceValue] = useState('');
  const [picked, setPicked] = useState<readonly string[]>(action === 'SEND_BACK' ? item.documents.filter((doc) => doc.state === 'REJECTED' || (doc.required && doc.state === 'MISSING')).map((doc) => doc.id) : []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const blockers = actionBlockers(item, action);

  const toggle = (id: string) => setPicked((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));

  const validate = (): Record<string, string> => {
    const checks: readonly [string, string | null][] = [
      ['note', validateNote(note, rule.requiresNote, 'A reason')],
      [
        'amount',
        action === 'REQUEST_PAYMENT'
          ? validateFee(amount ? Number(amount) : undefined) ??
            (minimumAmount !== null && Number(amount) < minimumAmount ? `This service has a minimum price of ₹${minimumAmount.toLocaleString('en-IN')} including GST.` : null)
          : null
      ],
      ['reference', reference ? validateReference(referenceValue, reference.required, 'This reference') : null],
      ['documents', action === 'REPORT_MISSING' && picked.length === 0 && note.trim().length < MIN_NOTE_LENGTH ? 'Tick the missing documents or describe what is missing.' : null]
    ];
    return Object.fromEntries(checks.filter((entry): entry is [string, string] => entry[1] !== null));
  };

  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || blockers.length > 0) {
      return;
    }
    const input: TransitionInput = {
      action,
      note: note.trim(),
      reference: reference ? referenceValue.trim() || undefined : undefined,
      amount: action === 'REQUEST_PAYMENT' ? Number(amount) : undefined,
      documentIds: PICKS_DOCUMENTS.has(action) ? picked : undefined
    };
    if (await controller.mutate({ type: 'TRANSITION', input })) {
      onClose();
    }
  };

  const renderDocumentChoice = (doc: CaseDocument) => (
    <li key={doc.id}>
      <label className="tx-transition__doc">
        <input type="checkbox" checked={picked.includes(doc.id)} onChange={() => toggle(doc.id)} />
        <span>{doc.label}</span>
        {doc.state === 'MISSING' ? <span className="tx-transition__doc-state">Not uploaded</span> : null}
        {doc.state === 'REJECTED' ? <span className="tx-transition__doc-state">Marked wrong</span> : null}
      </label>
    </li>
  );

  return (
    <WorkflowModal
      title={rule.label}
      subtitle={`${item.referenceNumber} · ${item.client.name} · ${STATUS_META[item.status].label}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={controller.busy}
      size={action === 'SUBMIT_OUTPUT' ? 'lg' : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={controller.busy}>
            Cancel
          </Button>
          <Button type="submit" variant={rule.variant === 'danger' ? 'danger' : 'primary'} iconName={rule.iconName} loading={controller.busy} loadingLabel="Saving…" disabled={blockers.length > 0}>
            {rule.label}
          </Button>
        </>
      }
    >
      {controller.actionError ? <InlineAlert tone="error">{controller.actionError}</InlineAlert> : null}
      <InlineAlert tone={IRREVERSIBLE.has(action) ? 'warning' : 'info'}>{rule.explain}</InlineAlert>

      {action === 'START_PORTAL_WORK' ? <p className="tx-transition__hint">Portal: {getServiceDefinition(item.service).portal}</p> : null}

      {action === 'SUBMIT_OUTPUT' ? <CaseOutputs item={item} controller={controller} /> : null}

      {blockers.length > 0 ? (
        <div className="tx-transition__blockers" role="alert">
          <p className="tx-transition__blockers-title">Still needed:</p>
          <ul>
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {action === 'REQUEST_PAYMENT' ? (
        <PaymentAmountField item={item} amount={amount} onAmountChange={setAmount} onMinimumChange={setMinimumAmount} error={errors.amount} />
      ) : null}

      {reference ? (
        <InputField id="tx-transition-reference" label={reference.label} value={referenceValue} onChange={setReferenceValue} placeholder={reference.placeholder} maxLength={40} autoComplete="off" error={errors.reference} />
      ) : null}

      {PICKS_DOCUMENTS.has(action) ? (
        <fieldset className="tx-transition__docs">
          <legend className="tx-transition__docs-title">{action === 'SEND_BACK' ? 'What should the customer send again?' : 'Which documents are missing or unclear?'}</legend>
          <ul>{item.documents.map(renderDocumentChoice)}</ul>
          {errors.documents ? <p className="tx-transition__error" role="alert">{errors.documents}</p> : null}
        </fieldset>
      ) : null}

      <TextAreaField id="tx-transition-note" label={`${rule.notePrompt}${rule.requiresNote ? ' *' : ''}`} value={note} onChange={setNote} rows={3} maxLength={MAX_NOTE_LENGTH} error={errors.note} />
    </WorkflowModal>
  );
}
