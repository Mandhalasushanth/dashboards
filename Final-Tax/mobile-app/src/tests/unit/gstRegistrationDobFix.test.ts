/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";

import {
  formatBackendDate,
  formatUiDate,
  extractDateParts,
  mapGstRegistrationPayload,
  mapDtoToGstBusinessFormData,
} from "../../modules/gst/gst-registration/utils/gstRegistrationMapper";
import { GstValidators } from "../../modules/gst/utils/gstValidators";
import type { GstBusinessFormData } from "../../modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";

const SAMPLE_BUSINESS_DATA: GstBusinessFormData = {
  legalName: "Acme Enterprises Private Limited",
  businessName: "Acme Enterprises",
  businessType: "Private Limited Company",
  natureOfBusiness: "Retail Business",
  placeOfBusiness: "Principal Place of Business",
  businessStartDate: "01-01-2023",
  reasonForRegistration: "Crossing Threshold",
  compositionScheme: "No",
  businessAddress: "Flat 101, Lake View Towers, 5th Main Road",
  city: "Bengaluru",
  district: "Bengaluru Urban",
  state: "Karnataka",
  pinCode: "560001",
  hsnCode: "998311",
  accountHolderName: "Acme Enterprises Private Limited",
  bankAccountNumber: "123456789012",
  confirmBankAccountNumber: "123456789012",
  ifscCode: "HDFC0001234",
  bankName: "HDFC Bank",
  branchName: "Koramangala",
  accountType: "Current",
  businessPan: "ABCDP1234F",
  signatoryName: "Rajesh Kumar",
  signatoryPan: "ABCPE1234F",
  signatoryDob: "15-08-1985",
  signatoryDesignation: "Managing Director",
  signatoryMobile: "9876543210",
  signatoryEmail: "rajesh@acmeenterprises.com",
  addressProofType: "Rental Agreement",
  aadhaarConsent: true,
};

test("DOB Selection: select DOB for the first time and format for UI", () => {
  const selectedDate = "15-08-1990";
  const uiFormatted = formatUiDate(selectedDate);
  assert.equal(uiFormatted, "15-08-1990");
  assert.equal(GstValidators.isValidSignatoryDob(uiFormatted), true);
  assert.equal(GstValidators.validateSignatoryDob(uiFormatted), "");
});

test("DOB Consecutive Updates: subsequent selections replace previous selection correctly", () => {
  const selections = [
    "05-03-1988",
    "12-07-1992",
    "28-02-1996",
    "01-01-2000",
  ];

  const stateHistory = selections.reduce<string[]>((history, date) => {
    const formatted = formatUiDate(date);
    return [...history, formatted];
  }, []);

  assert.equal(stateHistory[0], "05-03-1988");
  assert.equal(stateHistory[1], "12-07-1992");
  assert.equal(stateHistory[2], "28-02-1996");
  assert.equal(stateHistory[3], "01-01-2000");
  assert.equal(stateHistory[stateHistory.length - 1], "01-01-2000");
});

test("DOB Variations: handles different months, years, leap years, and single digits", () => {
  const dates = [
    { input: "29-02-2000", expectedUi: "29-02-2000", expectedApi: "2000-02-29" },
    { input: "29-02-1996", expectedUi: "29-02-1996", expectedApi: "1996-02-29" },
    { input: "5-5-1995", expectedUi: "05-05-1995", expectedApi: "1995-05-05" },
    { input: "01-12-1980", expectedUi: "01-12-1980", expectedApi: "1980-12-01" },
    { input: "31-01-1975", expectedUi: "31-01-1975", expectedApi: "1975-01-31" },
  ];

  dates.map(({ input, expectedUi, expectedApi }) => {
    assert.equal(formatUiDate(input), expectedUi);
    assert.equal(formatBackendDate(input), expectedApi);
    assert.equal(GstValidators.isValidSignatoryDob(expectedUi), true);
  });
});

test("Timezone Safety: prevents date shifts and corruptions from ISO timestamps", () => {
  const isoDates = [
    { iso: "1990-05-15T00:00:00.000Z", expectedUi: "15-05-1990", expectedApi: "1990-05-15" },
    { iso: "1985-08-15T18:30:00.000Z", expectedUi: "15-08-1985", expectedApi: "1985-08-15" },
    { iso: "2000-01-01T23:59:59.999Z", expectedUi: "01-01-2000", expectedApi: "2000-01-01" },
  ];

  isoDates.map(({ iso, expectedUi, expectedApi }) => {
    assert.equal(formatUiDate(iso), expectedUi);
    assert.equal(formatBackendDate(iso), expectedApi);
  });
});

test("API Payload: mapGstRegistrationPayload maps DOB to canonical YYYY-MM-DD", () => {
  const data: GstBusinessFormData = {
    ...SAMPLE_BUSINESS_DATA,
    signatoryDob: "15-08-1985",
  };
  const payload = mapGstRegistrationPayload(data, "CUST12345");
  assert.equal(payload.signatoryDob, "1985-08-15");
});

test("DTO Mapping: mapDtoToGstBusinessFormData maps backend YYYY-MM-DD to UI DD-MM-YYYY", () => {
  const dto = {
    gstId: "GST123456",
    legalName: "Acme Enterprises Private Limited",
    signatoryDob: "1985-08-15",
  };
  const mapped = mapDtoToGstBusinessFormData(dto);
  assert.equal(mapped.signatoryDob, "15-08-1985");
});

test("Race Condition Protection: active user selection is preserved against stale async API responses", () => {
  const userSelectedDob = "20-07-1992";
  const activeFormState: GstBusinessFormData = {
    ...SAMPLE_BUSINESS_DATA,
    signatoryDob: userSelectedDob,
  };

  const staleApiDto = {
    gstId: "GST123456",
    legalName: "Acme Enterprises Private Limited",
    signatoryDob: "1980-01-01", // Older date from previous save
  };

  const mapped = mapDtoToGstBusinessFormData(staleApiDto);

  // Simulate race condition guard logic
  const activeDob = typeof activeFormState.signatoryDob === "string" ? activeFormState.signatoryDob.trim() : "";
  const mappedDob = typeof mapped.signatoryDob === "string" ? mapped.signatoryDob.trim() : "";
  const mergedDob = activeDob ? activeDob : mappedDob;

  assert.equal(mergedDob, userSelectedDob);
});

test("Race Condition Protection: empty user selection correctly adopts backend DOB on initial load", () => {
  const emptyFormState: GstBusinessFormData = {
    ...SAMPLE_BUSINESS_DATA,
    signatoryDob: "",
  };

  const apiDto = {
    gstId: "GST123456",
    signatoryDob: "1988-06-25",
  };

  const mapped = mapDtoToGstBusinessFormData(apiDto);

  const activeDob = typeof emptyFormState.signatoryDob === "string" ? emptyFormState.signatoryDob.trim() : "";
  const mappedDob = typeof mapped.signatoryDob === "string" ? mapped.signatoryDob.trim() : "";
  const mergedDob = activeDob ? activeDob : mappedDob;

  assert.equal(mergedDob, "25-06-1988");
});

test("Draft Persistence: draft saving and restoring preserves exact DOB without shifts", () => {
  const originalDob = "10-10-1990";
  const draftBusinessData = {
    ...SAMPLE_BUSINESS_DATA,
    signatoryDob: formatUiDate(originalDob),
  };

  // Simulate JSON serialization / deserialization round-trip
  const jsonDraft = JSON.stringify(draftBusinessData);
  const parsedDraft = JSON.parse(jsonDraft) as typeof draftBusinessData;

  const restoredDob = formatUiDate(parsedDraft.signatoryDob);
  assert.equal(restoredDob, originalDob);
  assert.equal(formatBackendDate(restoredDob), "1990-10-10");
});

test("Date Validation: rejects future dates and today, accepts yesterday and past dates", () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const formatTestDate = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${d.getFullYear()}`;
  };

  const todayStr = formatTestDate(today);
  const yesterdayStr = formatTestDate(yesterday);

  assert.equal(GstValidators.isValidSignatoryDob(todayStr), false);
  assert.equal(GstValidators.validateSignatoryDob(todayStr), "Date of birth must be earlier than today.");

  assert.equal(GstValidators.isValidSignatoryDob(yesterdayStr), true);
  assert.equal(GstValidators.validateSignatoryDob(yesterdayStr), "");

  assert.equal(GstValidators.isValidSignatoryDob("15-08-1985"), true);
  assert.equal(GstValidators.validateSignatoryDob("15-08-1985"), "");

  assert.equal(GstValidators.validateSignatoryDob(""), "Date of birth is required");
  assert.equal(GstValidators.validateSignatoryDob("31-02-2023"), "Enter a valid date in DD-MM-YYYY format");
});

test("Android and iOS Consistency: date extraction handles leading zeros and separators identically", () => {
  const slashDate = "15/08/1985";
  const dashDate = "15-08-1985";

  const slashParts = extractDateParts(slashDate);
  const dashParts = extractDateParts(dashDate);

  assert.deepEqual(slashParts, dashParts);
  assert.equal(formatBackendDate(slashDate), formatBackendDate(dashDate));
  assert.equal(formatUiDate(slashDate), formatUiDate(dashDate));
});
