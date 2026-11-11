import { describe, expect, it } from 'vitest';
import { formatFieldValue } from '@/modules/workflow/shared/fieldFormat';
import { getServiceType, requiredDocumentsFor, SERVICE_TYPES, serviceTypesFor } from '@/modules/workflow/shared/serviceTypes';
import { pastDateFormat, validateFieldValue } from '@/modules/workflow/validation/intakeValidation';

describe('service types mirror the customer mobile app', () => {
  it('keeps every mobile catalogue service id, each owned by one service', () => {
    const ids = SERVICE_TYPES.map((type) => type.id);
    ['gst-registration', 'gst-filing', 'gst-compliance', 'itr-filing', 'tds-refund', 'business-loan', 'personal-loan', 'working-capital', 'home-loan', 'property-loan', 'vehicle-loan', 'machinery-loan', 'msme-loan', 'health-insurance', 'life-insurance', 'company-registration', 'accounting-bookkeeping'].forEach((id) => expect(ids).toContain(id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(serviceTypesFor('LOAN').map((type) => type.id)).toContain('home-loan');
    expect(getServiceType('company-registration').service).toBe('INCORPORATION');
  });

  it('uses the backend DTO keys, sections and dropdown options of the mobile app', () => {
    const registration = getServiceType('gst-registration');
    expect(registration.fields.filter((field) => field.section === 'Business Identity').slice(0, 5).map((field) => field.id)).toEqual(['legalName', 'tradeName', 'constitutionOfBusiness', 'natureOfBusiness', 'dateOfCommencement']);
    expect([...new Set(registration.fields.map((field) => field.section))]).toEqual(['Personal Details', 'Business Identity', 'Registration & Scheme', 'Principal Place of Business', 'Bank Details', 'Authorised Signatory', 'Application Record']);
    expect(registration.fields.find((field) => field.id === 'constitutionOfBusiness')?.options).toContain('Limited Liability Partnership (LLP)');
    expect(registration.documents.map((doc) => doc.label)).toEqual(['PAN Card', 'Aadhaar Card', 'Business Registration Proof', 'Principal Place Address Proof', 'Bank Passbook / Cancelled Cheque', 'Passport Size Photograph']);
    expect(getServiceType('life-insurance').fields.map((field) => field.kind)).toEqual(['number', 'dropdown', 'dropdown']);
  });

  it('matches the mobile flows for GST, ITR, loans and incorporation', () => {
    const ids = (type: string) => getServiceType(type).fields.map((entry) => entry.id);
    expect(ids('gst-filing')).toEqual(expect.arrayContaining(['gstin', 'financialYear', 'filingFrequency', 'returnType', 'taxCalculationMethod', 'estimatedEligibleItc']));
    expect(ids('gst-cancellation')).toEqual(expect.arrayContaining(['reasonForCancellation', 'dateCancellationIsSought', 'closingStockAndInputTaxReversal']));
    expect(ids('itr-filing')).toEqual(expect.arrayContaining(['pan', 'assessmentYear', 'employerLegalName', 'grossSalary', 'sec80c']));
    expect(ids('tds-refund')).toEqual(expect.arrayContaining(['panNumber', 'deductorTan', 'tdsAmount', 'deductedSection']));
    expect(ids('vehicle-loan')).toEqual(expect.arrayContaining(['fullName', 'currentAddress.pincode', 'requestedLoanAmount', 'vehicleCondition']));
    expect(ids('company-registration')).toEqual(expect.arrayContaining(['companyType', 'proposedName1', 'registeredPincode', 'authorizedCapital', 'directors.0.pan']));
    expect(getServiceType('gst-filing').documents).toHaveLength(12);
  });

  it('marks documents the app asks for only in some cases as optional', () => {
    const itrDocs = getServiceType('itr-filing').documents;
    expect(itrDocs.find((doc) => doc.label === 'Form 16 (Part A & B)')?.required).toBe(false);
    expect(getServiceType('machinery-loan').documents).toEqual([{ label: 'Machinery Quotation / Proforma Invoice', required: true }]);
  });

  it('falls back to the owning service for an unknown type id', () => {
    expect(getServiceType('new-mobile-service', 'LOAN').service).toBe('LOAN');
  });

  it('lists optional "(if any)" documents as optional', () => {
    const health = getServiceType('health-insurance').documents;
    expect(health.find((doc) => doc.label.startsWith('Previous Insurance'))?.required).toBe(false);
    expect(requiredDocumentsFor('INSURANCE')).not.toContain('Previous Insurance Policy (if any)');
  });
});

describe('field rules for mobile field types', () => {
  const constitution = getServiceType('gst-registration').fields.find((field) => field.id === 'constitutionOfBusiness')!;
  const shares = getServiceType('company-registration').fields.find((field) => field.id === 'numberOfShares')!;
  const field = (type: string, id: string) => getServiceType(type).fields.find((entry) => entry.id === id)!;

  it('accepts only the dropdown options the app offers', () => {
    expect(validateFieldValue(constitution, 'Limited Liability Partnership (LLP)')).toBeNull();
    expect(validateFieldValue(constitution, 'LLP')).toMatch(/from the list/);
    expect(validateFieldValue(constitution, 'Trust')).toMatch(/from the list/);
  });

  it('checks whole-number counts against their bounds', () => {
    expect(validateFieldValue(shares, '10000')).toBeNull();
    expect(validateFieldValue(shares, '0')).toMatch(/1 to/);
    expect(validateFieldValue(shares, '2.5')).not.toBeNull();
  });

  it('validates the identifiers the app collects', () => {
    expect(validateFieldValue(field('gst-registration', 'ifscCode'), 'HDFC0001234')).toBeNull();
    expect(validateFieldValue(field('gst-registration', 'ifscCode'), 'HDFC1234')).not.toBeNull();
    expect(validateFieldValue(field('gst-registration', 'pinCode'), '011001')).not.toBeNull();
    expect(validateFieldValue(field('itr-filing', 'aadhaar'), '234567890123')).toBeNull();
    expect(validateFieldValue(field('itr-filing', 'aadhaar'), '123456789012')).not.toBeNull();
    expect(validateFieldValue(field('itr-filing', 'grossSalary'), '0')).toBeNull();
    expect(validateFieldValue(field('home-loan', 'loanAmount'), '0')).not.toBeNull();
    expect(validateFieldValue(field('tax-notice-assistance', 'responseDueDate'), '2999-01-01')).toBeNull();
  });

  it('rejects impossible and future dates', () => {
    expect(pastDateFormat('2026-01-15')).toBeNull();
    expect(pastDateFormat('2026-02-31')).toMatch(/valid date/);
    expect(pastDateFormat('2999-01-01')).toMatch(/future/);
  });

  it('formats amounts and dates for staff', () => {
    expect(formatFieldValue(field('home-loan', 'loanAmount'), '4500000')).toBe('₹45,00,000');
    expect(formatFieldValue(field('itr-filing', 'grossSalary'), '0')).toBe('₹0');
    expect(formatFieldValue(field('gst-registration', 'dateOfCommencement'), '2026-09-01')).toBe('1 Sept 2026');
  });
});
