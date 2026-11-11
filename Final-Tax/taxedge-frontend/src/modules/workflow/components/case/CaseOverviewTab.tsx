import { formatDateTime } from '@/core/utils/dateUtils';
import { formatRupees } from '../../shared/fieldFormat';
import type { CasePayment } from '../../shared/workflow.types';
import type { CaseTabProps } from './CaseDrawer';
import { CaseDetailGrid } from './CaseDetailGrid';
import { CaseDetailsTab } from './CaseDetailsTab';

const PAYMENT_LABELS: Readonly<Record<CasePayment['state'], string>> = Object.freeze({
  NOT_REQUESTED: 'Not requested yet',
  PENDING: 'Waiting for the customer to pay',
  PAID: 'Paid'
});

/** "Details": what the customer submitted, who they are, and the payment. */
export function CaseOverviewTab({ item }: CaseTabProps) {
  return (
    <>
      <CaseDetailsTab item={item} />

      <CaseDetailGrid
        title="Customer"
        entries={[
          { label: 'Name', value: item.client.name },
          { label: 'PAN', value: item.client.pan },
          { label: 'Mobile', value: item.client.mobile },
          { label: 'Email', value: item.client.email },
          { label: 'City', value: item.client.city }
        ]}
      />

      <CaseDetailGrid
        title="Payment"
        entries={[
          { label: 'Status', value: PAYMENT_LABELS[item.payment.state] },
          { label: 'Service fee', value: formatRupees(item.payment.amount) },
          { label: 'Requested on', value: item.payment.requestedAt ? formatDateTime(item.payment.requestedAt) : '—' },
          { label: 'Paid on', value: item.payment.paidAt ? formatDateTime(item.payment.paidAt) : '—' },
          { label: 'Payment reference', value: item.payment.reference ?? '—' }
        ]}
      />

      <CaseDetailGrid
        title="Application"
        entries={[
          { label: 'Submitted on', value: formatDateTime(item.submittedAt) },
          { label: 'Last updated', value: formatDateTime(item.updatedAt) }
        ]}
      />
    </>
  );
}
