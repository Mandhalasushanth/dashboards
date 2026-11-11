/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";

import { initialDraft, getInitialDraft } from "../../modules/company-registration/store/initialDraft";
import { getSuffixForType } from "../../modules/company-registration/validation/companySchema";
import { validateRegistrationStep } from "../../modules/company-registration/validation/companyStepValidation";

test("initialDraft has no preselected company structure and all initial fields start empty", () => {
  const draft = getInitialDraft();

  // Step 1 - Company structure must not be preselected
  assert.equal(draft.company.companyType, "");
  assert.equal(draft.company.companyCategory, "");
  assert.equal(draft.company.companySubCategory, "");

  // Proposed names and suffix must start empty
  assert.equal(draft.company.proposedName1, "");
  assert.equal(draft.company.proposedName2, "");
  assert.equal(draft.company.proposedName3, "");
  assert.equal(draft.company.nameSuffix, "");
  assert.equal(draft.company.nameAvailabilityStatus, undefined);

  // Business activities must start empty
  assert.equal(draft.company.primaryActivity, "");
  assert.equal(draft.company.nicCode, "");
  assert.equal(draft.company.secondaryActivity, "");

  // Registered office details must start empty
  assert.equal(draft.company.registeredAddressLine, "");
  assert.equal(draft.company.registeredCity, "");
  assert.equal(draft.company.registeredDistrict, "");
  assert.equal(draft.company.registeredState, "");
  assert.equal(draft.company.registeredPincode, "");
  assert.equal(draft.company.premisesOwnership, "");
  assert.equal(draft.company.companyEmail, "");
  assert.equal(draft.company.companyMobile, "");

  // Promoters and nominees must start empty
  assert.equal(draft.directors.length, 0);
  assert.equal(draft.opcNominee?.name, "");
  assert.equal(draft.opcNominee?.pan, "");
  assert.equal(draft.opcNominee?.aadhaar, "");
  assert.equal(draft.opcNominee?.email, "");
  assert.equal(draft.opcNominee?.phone, "");
  assert.equal(draft.opcNominee?.relationship, "");

  // Documents must be in Pending status (no fake uploads)
  assert.ok(draft.documents.length > 0);
  for (const doc of draft.documents) {
    assert.equal(doc.status, "Pending");
    assert.equal(doc.fileUri, undefined);
    assert.equal(doc.fileName, undefined);
  }
  const nocDoc = draft.documents.find((d) => d.id === "doc-noc");
  assert.ok(nocDoc);
  assert.equal(nocDoc.required, true);

  // Linked registrations must be unchecked initially
  assert.equal(draft.linkedRegistrations.pan, false);
  assert.equal(draft.linkedRegistrations.tan, false);
  assert.equal(draft.linkedRegistrations.gst, false);
  assert.equal(draft.linkedRegistrations.esic, false);
  assert.equal(draft.linkedRegistrations.epfo, false);
  assert.equal(draft.linkedRegistrations.bankAccount, false);
});

test("getSuffixForType returns empty string when no company type is selected", () => {
  assert.equal(getSuffixForType(""), "");
  assert.equal(getSuffixForType(undefined), "");
  assert.equal(getSuffixForType("Private Limited"), "Private Limited");
  assert.equal(getSuffixForType("One Person Company (OPC)"), "(OPC) Private Limited");
  assert.equal(getSuffixForType("Limited Liability Partnership (LLP)"), "LLP");
  assert.equal(getSuffixForType("Section 8 (NGO)"), "Foundation / Section 8");
  assert.equal(getSuffixForType("Public Limited"), "Limited");
});

test("Step 0 validation requires selecting a company structure before proceeding", () => {
  const freshDraft = getInitialDraft();

  // When no company type is selected, validation must fail
  const unselectedResult = validateRegistrationStep(0, freshDraft);
  assert.equal(unselectedResult.valid, false);
  assert.equal(unselectedResult.fieldErrors.companyType, "Please select a Company Type to proceed.");

  // When user explicitly selects Private Limited, validation succeeds
  const selectedDraft = {
    ...freshDraft,
    company: {
      ...freshDraft.company,
      companyType: "Private Limited" as const,
    },
  };
  const selectedResult = validateRegistrationStep(0, selectedDraft);
  assert.equal(selectedResult.valid, true);
  assert.deepEqual(selectedResult.fieldErrors, {});
});

test("Step 3 validation requires minimum promoters based on entity structure", () => {
  const freshDraft = getInitialDraft();

  // For Private Limited (requires at least 2)
  const pvtDraft = {
    ...freshDraft,
    company: { ...freshDraft.company, companyType: "Private Limited" as const },
    directors: [],
  };
  const pvtResult = validateRegistrationStep(3, pvtDraft);
  assert.equal(pvtResult.valid, false);
  assert.match(pvtResult.fieldErrors.directorsCount, /At least 2 promoter/);

  // For OPC (validates nominee fields, does not require promoters/directors)
  const opcDraft = {
    ...freshDraft,
    company: { ...freshDraft.company, companyType: "One Person Company (OPC)" as const },
    directors: [],
  };
  const opcResult = validateRegistrationStep(3, opcDraft);
  assert.equal(opcResult.valid, false);
  assert.equal(opcResult.fieldErrors.nominee_name, "Nominee full name is required.");
  assert.equal(opcResult.fieldErrors.directorsCount, undefined);
});
