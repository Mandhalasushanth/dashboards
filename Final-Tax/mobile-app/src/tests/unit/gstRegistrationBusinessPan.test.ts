/**
 * Regression tests — Business PAN in GST Registration
 * Verifies field presence, validation rules, state isolation, mapper output, and draft persistence.
 * Uses Node.js built-in test runner (node:test / node:assert/strict).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { INITIAL_BUSINESS_DATA } from "@/modules/gst/gst-registration/utils/gstDraftLifecycle";
import { mapGstRegistrationPayload, mapDtoToGstBusinessFormData } from "@/modules/gst/gst-registration/utils/gstRegistrationMapper";
import type { GstBusinessFormData } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseFormData = (): GstBusinessFormData => ({
  ...INITIAL_BUSINESS_DATA,
  legalName: "Acme Solutions",
  businessName: "Acme",
  businessType: "Proprietorship",
  natureOfBusiness: "Service Provider",
  placeOfBusiness: "Principal place of business",
  businessStartDate: "01-01-2020",
  reasonForRegistration: "Voluntary registration",
  compositionScheme: "No - regular scheme",
  businessAddress: "123 Main Street",
  city: "Mumbai",
  district: "Mumbai",
  state: "Maharashtra",
  pinCode: "400001",
  hsnCode: "998311",
  accountHolderName: "John Doe",
  bankAccountNumber: "123456789",
  confirmBankAccountNumber: "123456789",
  ifscCode: "HDFC0001234",
  bankName: "HDFC Bank",
  branchName: "Andheri",
  accountType: "Current",
  signatoryName: "John Doe",
  signatoryPan: "ABCPE1234F",
  signatoryDob: "01-01-1985",
  signatoryDesignation: "Proprietor",
  signatoryMobile: "9876543210",
  signatoryEmail: "john@acme.com",
  addressProofType: "Rental Agreement",
  aadhaarConsent: true,
  businessPan: "ABCPE1234F",
});

// ---------------------------------------------------------------------------
// 1. Interface / field existence
// ---------------------------------------------------------------------------

describe("Business PAN — field existence", () => {
  it("INITIAL_BUSINESS_DATA contains businessPan", () => {
    assert.ok(Object.prototype.hasOwnProperty.call(INITIAL_BUSINESS_DATA, "businessPan"));
    assert.equal(INITIAL_BUSINESS_DATA.businessPan, "");
  });

  it("GstBusinessFormData type accepts businessPan", () => {
    const data = baseFormData();
    assert.equal(typeof data.businessPan, "string");
    assert.equal(data.businessPan, "ABCPE1234F");
  });
});

// ---------------------------------------------------------------------------
// 2. Required validation
// ---------------------------------------------------------------------------

describe("Business PAN — required", () => {
  it("empty businessPan produces an error", () => {
    const err = GstValidators.validateBusinessField("businessPan", "");
    assert.notEqual(err, "");
  });

  it("whitespace businessPan produces an error", () => {
    const err = GstValidators.validateBusinessField("businessPan", "   ");
    assert.notEqual(err, "");
  });
});

// ---------------------------------------------------------------------------
// 3. Valid PAN accepted
// ---------------------------------------------------------------------------

describe("Business PAN — valid values accepted", () => {
  const VALID_PANS = [
    "ABCPE1234F",
    "AAAPZ1234A",
    "XYZAB5678C",
    "ABCFE1234F",
    "PQRPA9876Z",
  ];

  for (const pan of VALID_PANS) {
    it(`accepts valid PAN: ${pan}`, () => {
      const err = GstValidators.validateBusinessField("businessPan", pan);
      assert.equal(err, "", `Expected no error for ${pan}, got: ${err}`);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Invalid PAN rejected
// ---------------------------------------------------------------------------

describe("Business PAN — invalid values rejected", () => {
  const INVALID_PANS = [
    { pan: "ABCPE123F", desc: "9 chars (too short)" },
    { pan: "ABCPE12345F", desc: "11 chars (too long)" },
    { pan: "12345ABCDE", desc: "starts with digits" },
    { pan: "ABCDE12345", desc: "10th char not a letter" },
    { pan: "ABC1E1234F", desc: "4th char digit instead of letter" },
  ];

  for (const { pan, desc } of INVALID_PANS) {
    it(`rejects invalid PAN (${desc}): ${pan}`, () => {
      const err = GstValidators.validateBusinessField("businessPan", pan);
      assert.notEqual(err, "", `Expected error for ${pan} but got none`);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. Same validation as Signatory PAN
// ---------------------------------------------------------------------------

describe("Business PAN — same validation as Signatory PAN", () => {
  const TEST_CASES = [
    "ABCPE1234F", "XYZAB5678C", "", "ABCPE123F", "12345ABCDE",
  ];

  for (const pan of TEST_CASES) {
    it(`businessPan and signatoryPan produce same result for: "${pan}"`, () => {
      const businessErr = GstValidators.validateBusinessField("businessPan", pan);
      const signatoryErr = GstValidators.validateBusinessField("signatoryPan", pan);
      assert.equal(businessErr, signatoryErr, `Mismatch for "${pan}": business="${businessErr}" signatory="${signatoryErr}"`);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. Uppercase behavior (transform via sanitizeAlphanumericUpper in component)
// ---------------------------------------------------------------------------

describe("Business PAN — uppercase validation", () => {
  it("validator auto-uppercases: lowercase valid PAN is accepted", () => {
    const err = GstValidators.validateBusinessField("businessPan", "abcpe1234f");
    assert.equal(err, "");
  });

  it("pre-uppercased valid PAN passes", () => {
    const err = GstValidators.validateBusinessField("businessPan", "ABCPE1234F");
    assert.equal(err, "");
  });
});

// ---------------------------------------------------------------------------
// 7. Maximum length (enforced by component maxLength=10)
// ---------------------------------------------------------------------------

describe("Business PAN — max length", () => {
  it("PAN with exactly 10 chars passes validation", () => {
    const err = GstValidators.validateBusinessField("businessPan", "ABCPE1234F");
    assert.equal(err, "");
  });

  it("PAN with 11 chars fails validation", () => {
    const err = GstValidators.validateBusinessField("businessPan", "ABCPE1234FX");
    assert.notEqual(err, "");
  });
});

// ---------------------------------------------------------------------------
// 8. businessPan is separate from signatoryPan
// ---------------------------------------------------------------------------

describe("Business PAN — independent state", () => {
  it("setting businessPan does not change signatoryPan", () => {
    const data = baseFormData();
    const updated = { ...data, businessPan: "ZZZZZ9999Z" };
    assert.equal(updated.signatoryPan, "ABCPE1234F");
    assert.equal(updated.businessPan, "ZZZZZ9999Z");
  });

  it("setting signatoryPan does not change businessPan", () => {
    const data = baseFormData();
    const updated = { ...data, signatoryPan: "ZZZZZ9999Z" };
    assert.equal(updated.businessPan, "ABCPE1234F");
    assert.equal(updated.signatoryPan, "ZZZZZ9999Z");
  });

  it("businessPan and signatoryPan can hold different values simultaneously", () => {
    const data = baseFormData();
    data.businessPan = "FIRPX1234F";
    data.signatoryPan = "ABCPE5678G";
    assert.notEqual(data.businessPan, data.signatoryPan);
    assert.equal(data.businessPan, "FIRPX1234F");
    assert.equal(data.signatoryPan, "ABCPE5678G");
  });
});

// ---------------------------------------------------------------------------
// 9. businessPan appears in API payload
// ---------------------------------------------------------------------------

describe("Business PAN — API payload", () => {
  it("mapGstRegistrationPayload includes businessPan", () => {
    const data = baseFormData();
    const payload = mapGstRegistrationPayload(data, "CUST001");
    assert.ok(Object.prototype.hasOwnProperty.call(payload, "businessPan"));
    assert.equal(payload.businessPan, "ABCPE1234F");
  });

  it("payload businessPan is separate from signatoryPan", () => {
    const data = baseFormData();
    data.businessPan = "FIRPX1234F";
    data.signatoryPan = "ABCPE5678G";
    const payload = mapGstRegistrationPayload(data, "CUST001");
    assert.equal(payload.businessPan, "FIRPX1234F");
    assert.equal(payload.signatoryPan, "ABCPE5678G");
  });
});

// ---------------------------------------------------------------------------
// 10 & 11. Save-to-Draft preserves and restores businessPan
// ---------------------------------------------------------------------------

describe("Business PAN — draft persistence", () => {
  it("businessPan is preserved in draft round-trip via INITIAL_BUSINESS_DATA spread", () => {
    const data = baseFormData();
    const draft = { businessData: { ...data } };
    const restored = { ...INITIAL_BUSINESS_DATA, ...draft.businessData };
    assert.equal(restored.businessPan, "ABCPE1234F");
  });

  it("mapDtoToGstBusinessFormData restores businessPan from backend DTO", () => {
    const dto = { businessPan: "ABCPE1234F", signatoryPan: "XYZAB5678C", legalName: "Acme" };
    const result = mapDtoToGstBusinessFormData(dto);
    assert.equal(result.businessPan, "ABCPE1234F");
  });

  it("mapDtoToGstBusinessFormData defaults businessPan to empty string when absent", () => {
    const dto = { signatoryPan: "XYZAB5678C", legalName: "Acme" };
    const result = mapDtoToGstBusinessFormData(dto);
    assert.equal(result.businessPan, "");
  });

  it("mapDtoToGstBusinessFormData restores businessPan independently of signatoryPan", () => {
    const dto = { businessPan: "FIRPX1234F", signatoryPan: "ABCPE5678G" };
    const result = mapDtoToGstBusinessFormData(dto);
    assert.equal(result.businessPan, "FIRPX1234F");
    assert.equal(result.signatoryPan, "ABCPE5678G");
  });
});

// ---------------------------------------------------------------------------
// 12. Form-level validation includes businessPan
// ---------------------------------------------------------------------------

describe("Business PAN — form-level validation", () => {
  it("validateBusinessForm flags missing businessPan", () => {
    const data = baseFormData();
    data.businessPan = "";
    const errors = GstValidators.validateBusinessForm(data as unknown as Record<string, string>);
    assert.ok(
      Object.prototype.hasOwnProperty.call(errors, "businessPan"),
      `Expected businessPan error but errors were: ${JSON.stringify(Object.keys(errors))}`,
    );
  });

  it("validateBusinessForm does not flag valid businessPan", () => {
    const data = baseFormData();
    data.businessPan = "ABCPE1234F";
    const errors = GstValidators.validateBusinessForm(data as unknown as Record<string, string>);
    assert.ok(
      !Object.prototype.hasOwnProperty.call(errors, "businessPan"),
      `Unexpected businessPan error: ${errors.businessPan}`,
    );
  });
});
