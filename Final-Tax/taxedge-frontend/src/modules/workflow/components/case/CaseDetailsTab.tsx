import { formatFieldValue } from '../../shared/fieldFormat';
import { getServiceType } from '../../shared/serviceTypes';
import type { IntakeField } from '../../shared/workflowServices';
import type { CaseTabProps } from './CaseDrawer';
import { CaseDetailGrid } from './CaseDetailGrid';

/** Service form exactly as the customer filled it in the mobile app, grouped under the app's own section headings. */
export function CaseDetailsTab({ item }: Pick<CaseTabProps, 'item'>) {
  const type = getServiceType(item.serviceType, item.service);
  const sectionOf = (field: IntakeField) => field.section ?? `What the customer submitted · ${type.label}`;
  // A section the app only shows in some cases (an income type not declared, a section not amended) is left
  // out when the customer filled none of it; sections with a required field always show, so gaps stay visible.
  const isShown = (section: string) =>
    type.fields.some((field) => sectionOf(field) === section && (field.required || Boolean(item.details[field.id]?.trim())));
  const sections = [...new Set(type.fields.map(sectionOf))].filter(isShown);
  const entriesOf = (section: string) =>
    type.fields.filter((field) => sectionOf(field) === section).map((field) => ({ label: field.label, value: formatFieldValue(field, item.details[field.id]) }));
  return <>{sections.map((section) => <CaseDetailGrid key={section} title={section} entries={entriesOf(section)} />)}</>;
}
