import { aadhaar, address, day, email, group, mobile, name, note, optional, pan } from './formBuilders';
import type { IntakeField } from '../workflowServices';

/**
 * Read-only sections filled from a backend record: the customer's own profile and the record's id, status
 * and submission time. Never asked for on the manual entry form, so every field is optional and appears
 * only when it has a value. Shared by GST registration, filing, compliance and amendments.
 */
export const PERSONAL_DETAILS_SECTION = 'Personal Details';
export const APPLICATION_RECORD_SECTION = 'Application Record';

export const PERSONAL_DETAILS_FIELDS: readonly IntakeField[] = group(PERSONAL_DETAILS_SECTION, [
  optional(note('customer.customerId', 'Customer ID')),
  optional(name('customer.name', 'Full Name')),
  optional(email('customer.email', 'Email')),
  optional(mobile('customer.mobileNumber', 'Mobile Number')),
  optional(pan('customer.pan', 'PAN')),
  optional(aadhaar('customer.aadhaar', 'Aadhaar Number')),
  optional(day('customer.dob', 'Date of Birth')),
  optional(note('customer.gender', 'Gender')),
  optional(note('customer.customerType', 'Customer Type')),
  optional(address('customer.address', 'Address')),
  optional(name('customer.city', 'City')),
  optional(name('customer.state', 'State')),
  optional(note('customer.pincode', 'PIN Code'))
]);

/** The record's own id, status and submission time; idLabel names the id the way that service calls it. */
export const applicationRecordFields = (idLabel: string): IntakeField[] =>
  group(APPLICATION_RECORD_SECTION, [
    optional(note('record.id', idLabel)),
    optional(note('record.documentId', 'Document ID')),
    optional(note('record.status', 'Status in Customer App')),
    optional(note('record.submittedAt', 'Submitted At'))
  ]);
