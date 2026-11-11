import { useState } from 'react';
import { Button, Icon, InlineAlert, InputField, SelectField } from '@/shared';
import { workflowApi } from '../../api/workflowApi';
import { emitWorkflowChanged } from '../../api/workflowEvents';
import { messageOf } from '../../hooks/useWorkflowResource';
import { getServiceType, serviceTypesFor } from '../../shared/serviceTypes';
import { getServiceDefinition, TEAM_LABELS } from '../../shared/workflowServices';
import { CLIENT_FIELDS, validateIntake } from '../../validation/intakeValidation';
import type { CaseClient, CaseIntakeInput, ServiceKind, WorkflowCase } from '../../shared/workflow.types';
import { sanitizeFieldInput, ServiceFieldInput } from '../forms/ServiceFieldInput';
import { WorkflowModal } from './WorkflowModal';
import './IntakeModal.css';

export interface IntakeModalProps {
  readonly services: readonly ServiceKind[];
  readonly onClose: () => void;
}

const EMPTY_CLIENT: CaseClient = { name: '', email: '', mobile: '', pan: '', city: '' };

/**
 * Assisted intake: staff record an application on a customer's behalf, choosing the category and
 * service exactly as the customer would in the mobile app. The server routes it to the owning team.
 */
export function IntakeModal({ services, onClose }: IntakeModalProps) {
  const [service, setService] = useState<ServiceKind | ''>(services.length === 1 ? services[0] : '');
  const [serviceType, setServiceType] = useState('');
  const [client, setClient] = useState<CaseClient>(EMPTY_CLIENT);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<WorkflowCase | null>(null);
  const type = service && serviceType ? getServiceType(serviceType, service) : null;

  const changeService = (next: ServiceKind) => {
    setService(next);
    const types = serviceTypesFor(next);
    setServiceType(types.length === 1 ? types[0].id : '');
    setDetails({});
    setErrors({});
  };

  const changeServiceType = (next: string) => {
    setServiceType(next);
    setDetails({});
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key.startsWith('client.'))));
  };

  const handleSubmit = async () => {
    // Client fields are checked even before a service is chosen, so every problem shows at once.
    const fallback = service || services[0];
    const clientErrors = Object.fromEntries(
      Object.entries(validateIntake({ service: fallback, serviceType: serviceTypesFor(fallback)[0]?.id ?? '', client, details: {} })).filter(([key]) => key.startsWith('client.'))
    );
    if (!service || !serviceType) {
      setErrors({ ...(service ? { serviceType: 'Select a service.' } : { service: 'Select a category.' }), ...clientErrors });
      return;
    }
    const input: CaseIntakeInput = { service, serviceType, client, details };
    const found = validateIntake(input);
    setErrors(found);
    if (Object.keys(found).length > 0 || busy) {
      return;
    }
    try {
      setBusy(true);
      setServerError(null);
      setCreated(await workflowApi.submitCase(input));
      emitWorkflowChanged();
    } catch (error) {
      setServerError(messageOf(error, 'The application could not be recorded.'));
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <WorkflowModal title="Application Recorded" onClose={onClose} onSubmit={onClose} footer={<Button type="submit">Done</Button>}>
        <div className="tx-intake__success" role="status">
          <span className="tx-intake__success-icon">
            <Icon name="circle-check" size="lg" />
          </span>
          <p className="tx-intake__success-ref">{created.referenceNumber}</p>
          <p className="tx-intake__success-text">
            {getServiceType(created.serviceType, created.service).label} routed to the {TEAM_LABELS[created.team]} manager queue with status “Submitted”.
            Share this reference number with the customer to track progress.
          </p>
        </div>
      </WorkflowModal>
    );
  }

  return (
    <WorkflowModal
      title="Record Client Application"
      subtitle="The application is routed to the owning manager automatically; it is not assigned to an agent."
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" iconName="send" loading={busy} loadingLabel="Submitting…">
            Submit Application
          </Button>
        </>
      }
    >
      {serverError ? <InlineAlert tone="error">{serverError}</InlineAlert> : null}
      <div className="tx-intake__grid">
        <SelectField
          id="tx-intake-service"
          label="Category *"
          value={service}
          onChange={changeService}
          placeholder="Select category"
          options={services.map((kind) => ({ value: kind, label: getServiceDefinition(kind).label }))}
          error={errors.service}
        />
        <SelectField
          id="tx-intake-service-type"
          label="Service *"
          value={serviceType}
          onChange={changeServiceType}
          placeholder={service ? 'Select service' : 'Choose a category first'}
          options={service ? serviceTypesFor(service).map((entry) => ({ value: entry.id, label: entry.label })) : []}
          error={errors.serviceType}
        />
      </div>

      <h3 className="tx-intake__section">Customer details</h3>
      <div className="tx-intake__grid">
        {CLIENT_FIELDS.map((field) => (
          <InputField
            key={field.id}
            id={`tx-intake-client-${field.id}`}
            label={`${field.label}${field.required ? ' *' : ''}`}
            type={field.inputMode === 'email' ? 'email' : field.inputMode === 'tel' ? 'tel' : 'text'}
            value={client[field.id]}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            inputMode={field.inputMode}
            required={field.required}
            onChange={(value) => setClient((current) => ({ ...current, [field.id]: sanitizeFieldInput(field, value) }))}
            error={errors[`client.${field.id}`]}
          />
        ))}
      </div>

      {type ? (
        <>
          <h3 className="tx-intake__section">{type.label} details</h3>
          <div className="tx-intake__grid">
            {type.fields.map((field) => (
              <ServiceFieldInput
                key={field.id}
                field={field}
                id={`tx-intake-detail-${field.id}`}
                value={details[field.id] ?? ''}
                onChange={(value) => setDetails((current) => ({ ...current, [field.id]: value }))}
                error={errors[`details.${field.id}`]}
              />
            ))}
          </div>
          <p className="tx-intake__hint">Documents the customer will be asked for: {type.documents.map((doc) => (doc.required ? doc.label : `${doc.label} (optional)`)).join(', ')}.</p>
        </>
      ) : null}
    </WorkflowModal>
  );
}
