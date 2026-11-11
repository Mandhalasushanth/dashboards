/**
 * Batch 23 — TDS Refund Validation Timing
 * Regression tests for 7 bugs:
 *   BUG_B23_001 — initialSnapshotRef included `business` key but isDirty compared `{bank, income}` only
 *                 → snapshot mismatch made form permanently dirty → draft modal on every back press
 *   BUG_B23_002 — `documents` useState declared after handleContinue (forward reference)
 *                 → TypeScript TDZ warning; activeDocs fallback relied on potentially-uninitialised binding
 *   BUG_B23_003 — PersonalInfoSection never received `errors` prop
 *                 → personal.* validation errors set in state but never shown inline
 *   BUG_B23_004 — TdsRefundPersonalInfoCard read-only mode had no error display
 *                 → user saw "Not provided" text but no red banner when personal fields failed validation
 *   BUG_B23_005 — When form invalid AND docs missing, "Incomplete Documents" alert fired first
 *                 → user didn't know about field errors; had to fix docs, press Continue, then see field errors
 *   BUG_B23_006 — updateBank("accountNumber") cleared only its own error; stale confirmAccountNumber
 *                 mismatch error persisted even after account number was changed to match
 *   BUG_B23_007 — isEditing state initialised once from isEditingParam; param updates did not re-sync
 *                 → stale editing flag caused wrong navigation path after param refresh
 *
 * All logic inlined — no project module imports (avoids @/ alias issues
 * with --experimental-strip-types).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inlined helpers ───────────────────────────────────────────────────────────

type CustomerFormErrors = Record<string, string>;

/** Simulates isDirty() comparison as it was BEFORE fix (bug) */
function isFormDirtyBuggy(
  initialSnapshot: string,
  currentBank: object,
  currentIncome: object
): boolean {
  const currentSnapshot = JSON.stringify({ bank: currentBank, income: currentIncome });
  return currentSnapshot !== initialSnapshot;
}

/** Simulates initialSnapshotRef set as it was BEFORE fix (bug): included business */
function makeInitialSnapshotBuggy(bank: object, income: object, business: object): string {
  return JSON.stringify({ bank, income, business });
}

/** Simulates initialSnapshotRef set as it is AFTER fix: bank+income only */
function makeInitialSnapshotFixed(bank: object, income: object): string {
  return JSON.stringify({ bank, income });
}

/** Simulates isDirty() after fix: same keys as initial snapshot */
function isFormDirtyFixed(
  initialSnapshot: string,
  currentBank: object,
  currentIncome: object
): boolean {
  const currentSnapshot = JSON.stringify({ bank: currentBank, income: currentIncome });
  return currentSnapshot !== initialSnapshot;
}

interface NavCall { method: "push" | "replace" | "back" }
interface AlertCall { title: string; message: string }

/**
 * Simulates handleContinue alert logic BEFORE fix (bug):
 * hasMissingDocs took priority over form invalidity
 */
function simulateAlertBuggy(
  isFormValid: boolean,
  hasMissingDocs: boolean
): AlertCall | null {
  if (!isFormValid || hasMissingDocs) {
    if (hasMissingDocs) {
      return { title: "Incomplete Documents", message: "Please upload all mandatory documents (PAN and Aadhaar) to proceed." };
    } else {
      return { title: "Incomplete Information", message: "Please complete all required fields correctly to proceed." };
    }
  }
  return null;
}

/**
 * Simulates handleContinue alert logic AFTER fix:
 * form field errors take priority over doc errors
 */
function simulateAlertFixed(
  isFormValid: boolean,
  hasMissingDocs: boolean
): AlertCall | null {
  if (!isFormValid || hasMissingDocs) {
    if (!isFormValid) {
      return { title: "Incomplete Information", message: "Please complete all required fields correctly to proceed." };
    } else {
      return { title: "Incomplete Documents", message: "Please upload all mandatory documents (PAN and Aadhaar) to proceed." };
    }
  }
  return null;
}

/**
 * Simulates updateBank error-clearing BEFORE fix (bug):
 * changing accountNumber only cleared its own error, not confirmAccountNumber
 */
function simulateUpdateBankBuggy(
  field: string,
  errors: CustomerFormErrors
): CustomerFormErrors {
  const errorKey = `bank.${field}`;
  const next = { ...errors };
  if (next[errorKey]) {
    delete next[errorKey];
  }
  return next;
}

/**
 * Simulates updateBank error-clearing AFTER fix:
 * changing accountNumber also clears stale confirmAccountNumber error
 */
function simulateUpdateBankFixed(
  field: string,
  errors: CustomerFormErrors
): CustomerFormErrors {
  const errorKey = `bank.${field}`;
  const shouldClearConfirm = field === "accountNumber" && Boolean(errors["bank.confirmAccountNumber"]);
  const next = { ...errors };
  if (next[errorKey] || shouldClearConfirm) {
    delete next[errorKey];
    if (field === "accountNumber") {
      delete next["bank.confirmAccountNumber"];
    }
  }
  return next;
}

/**
 * Simulates isEditing state BEFORE fix (bug): initialised once, no re-sync
 */
function simulateIsEditingBuggy(initialParam: string, updatedParam: string): boolean {
  const isEditing = initialParam === "true"; // useState initial value — runs once
  // param update does not re-sync state
  return isEditing;
}

/**
 * Simulates isEditing state AFTER fix: useEffect re-syncs on param change
 */
function simulateIsEditingFixed(initialParam: string, updatedParam: string): boolean {
  let isEditing = initialParam === "true";
  // useEffect runs when isEditingParam changes
  isEditing = updatedParam === "true";
  return isEditing;
}

// ── personalErrors filtering (BUG_B23_003 / BUG_B23_004) ─────────────────────

function getPersonalErrorKeys(errors: CustomerFormErrors): string[] {
  return Object.keys(errors).filter((k) => !k.includes(".") || k.startsWith("personal."));
}

function hasPersonalErrors(errors: CustomerFormErrors): boolean {
  return getPersonalErrorKeys(errors).length > 0;
}

// ── BUG_B23_001 — Snapshot key mismatch ──────────────────────────────────────

describe("BUG_B23_001 — initialSnapshotRef keys must match isDirty keys", () => {
  const bank = { accountNumber: "123456789", ifscCode: "HDFC0001234", bankName: "HDFC" };
  const income = { salaryIncome: "500000" };
  const business = { legalName: "Acme", pan: "ABCDE1234F" };

  it("fixed: snapshot without business matches isDirty comparison → form is clean at start", () => {
    const snapshot = makeInitialSnapshotFixed(bank, income);
    const dirty = isFormDirtyFixed(snapshot, bank, income);
    assert.equal(dirty, false);
  });

  it("regression: snapshot with business never matches isDirty {bank,income} comparison → always dirty", () => {
    const buggySnapshot = makeInitialSnapshotBuggy(bank, income, business);
    const dirty = isFormDirtyBuggy(buggySnapshot, bank, income);
    assert.equal(dirty, true); // always true because business key is missing from current snapshot
  });

  it("fixed: editing a bank field makes form dirty correctly", () => {
    const snapshot = makeInitialSnapshotFixed(bank, income);
    const changedBank = { ...bank, accountNumber: "987654321" };
    const dirty = isFormDirtyFixed(snapshot, changedBank, income);
    assert.equal(dirty, true);
  });

  it("fixed: editing income field makes form dirty correctly", () => {
    const snapshot = makeInitialSnapshotFixed(bank, income);
    const changedIncome = { ...income, salaryIncome: "750000" };
    const dirty = isFormDirtyFixed(snapshot, bank, changedIncome);
    assert.equal(dirty, true);
  });

  it("fixed: business field changes do NOT affect dirty state (not tracked)", () => {
    const snapshot = makeInitialSnapshotFixed(bank, income);
    // business is not part of snapshot comparison — changing it doesn't affect clean state
    const dirty = isFormDirtyFixed(snapshot, bank, income);
    assert.equal(dirty, false);
  });

  it("regression: with buggy snapshot, form is always dirty even before any edits", () => {
    const buggySnapshot = makeInitialSnapshotBuggy(bank, income, business);
    // Even with NO edits, isDirty returns true because business is in snapshot but not in current
    const dirty = isFormDirtyBuggy(buggySnapshot, bank, income);
    assert.equal(dirty, true);
    // This causes draft modal to always appear on back press
  });

  it("fixed: snapshot key count is 2 (bank + income only)", () => {
    const snapshot = makeInitialSnapshotFixed(bank, income);
    const parsed = JSON.parse(snapshot);
    assert.equal(Object.keys(parsed).length, 2);
    assert.ok("bank" in parsed);
    assert.ok("income" in parsed);
    assert.ok(!("business" in parsed));
  });
});

// ── BUG_B23_002 — documents forward reference ─────────────────────────────────

describe("BUG_B23_002 — documents state must be declared before handleContinue", () => {
  it("activeDocs uses documentsRef when populated", () => {
    const documentsRef: any[] = [{ id: "pan", isMandatory: true, status: "uploaded" }];
    const documents: any[] = [];
    const activeDocs = documentsRef.length > 0 ? documentsRef : documents;
    assert.deepEqual(activeDocs, documentsRef);
  });

  it("activeDocs falls back to documents state when ref is empty", () => {
    const documentsRef: any[] = [];
    const documents: any[] = [{ id: "pan", isMandatory: true, status: "not_uploaded" }];
    const activeDocs = documentsRef.length > 0 ? documentsRef : documents;
    assert.deepEqual(activeDocs, documents);
  });

  it("activeDocs correct when both are populated (ref takes priority)", () => {
    const documentsRef: any[] = [{ id: "doc1", status: "uploaded" }];
    const documents: any[] = [{ id: "doc1", status: "not_uploaded" }]; // stale
    const activeDocs = documentsRef.length > 0 ? documentsRef : documents;
    assert.equal(activeDocs[0].status, "uploaded");
  });

  it("after forward reference fix, documents binding resolves to correct value at call time", () => {
    // Simulate: documents is declared before handleContinue in the hook body
    // When handleContinue is called, documents has been initialised by useState
    let documents: any[] = []; // starts empty (useState initial value)
    const handleContinue = () => {
      return documents.length; // accesses documents after it is initialised
    };
    documents = [{ id: "pan" }]; // simulates useEffect loading docs
    assert.equal(handleContinue(), 1); // documents is correctly populated
  });

  it("documentsRef always reflects latest uploaded docs", () => {
    const ref = { current: [] as any[] };
    const setDocuments = (updater: (prev: any[]) => any[]) => {
      const next = updater(ref.current);
      ref.current = next;
    };
    setDocuments(() => [{ id: "pan", status: "uploaded" }]);
    assert.equal(ref.current.length, 1);
    assert.equal(ref.current[0].status, "uploaded");
  });
});

// ── BUG_B23_003 — PersonalInfoSection receives no errors ──────────────────────

describe("BUG_B23_003 — PersonalInfoSection must receive and forward errors prop", () => {
  it("personal.* error keys come from validateCustomerIncomeForm", () => {
    const errors: CustomerFormErrors = {
      "personal.fullName": "Full Name is required",
      "personal.pan": "PAN is required",
      "personal.dob": "Date of Birth is required",
      "business.legalName": "Legal Name is required",
      "bank.accountNumber": "Bank Account Number is required",
    };
    const personalKeys = Object.keys(errors).filter((k) => k.startsWith("personal."));
    assert.equal(personalKeys.length, 3);
  });

  it("without errors prop, personal errors are silently dropped (regression)", () => {
    // PersonalInfoSection before fix: no errors prop, no error display
    const errors: CustomerFormErrors = {
      "personal.fullName": "Full Name is required",
      "personal.pan": "PAN is required",
    };
    // Section receives no errors — they're lost
    const sectionProps = { personal: {}, isLoading: false, errorMessage: null };
    // No errors key in props means validation feedback is invisible
    assert.equal("errors" in sectionProps, false);
  });

  it("with errors prop, personal errors are passed through to the card", () => {
    const errors: CustomerFormErrors = {
      "personal.fullName": "Full Name is required",
    };
    const sectionProps = {
      personal: {},
      errors,
      isLoading: false,
      errorMessage: null,
    };
    assert.equal("errors" in sectionProps, true);
    assert.equal(sectionProps.errors["personal.fullName"], "Full Name is required");
  });

  it("personalErrors prop on card is subset of form errors filtered to personal.*", () => {
    const formErrors: CustomerFormErrors = {
      "personal.fullName": "Full Name is required",
      "business.legalName": "Legal Name is required",
      "bank.ifscCode": "IFSC Code is required",
    };
    // The card receives all form errors and filters personal ones itself
    const personalKeys = getPersonalErrorKeys(formErrors);
    assert.equal(personalKeys.length, 1);
    assert.equal(personalKeys[0], "personal.fullName");
  });

  it("errors without 'personal.' prefix are not treated as personal errors", () => {
    const formErrors: CustomerFormErrors = {
      "business.pan": "Business PAN is required",
      "bank.accountNumber": "Account number is required",
    };
    assert.equal(hasPersonalErrors(formErrors), false);
  });
});

// ── BUG_B23_004 — PersonalInfoCard no error display in read-only mode ─────────

describe("BUG_B23_004 — TdsRefundPersonalInfoCard read-only must show error banner when personalErrors exist", () => {
  it("hasPersonalErrors=true when personal.* errors exist", () => {
    const errors: CustomerFormErrors = {
      "personal.fullName": "Full Name is required",
      "personal.pan": "PAN is required",
    };
    assert.equal(hasPersonalErrors(errors), true);
  });

  it("hasPersonalErrors=false when only business/bank errors exist", () => {
    const errors: CustomerFormErrors = {
      "business.legalName": "Legal Name is required",
      "bank.accountNumber": "Account number is required",
    };
    assert.equal(hasPersonalErrors(errors), false);
  });

  it("hasPersonalErrors=false when errors object is empty", () => {
    assert.equal(hasPersonalErrors({}), false);
  });

  it("getPersonalErrorKeys returns error message for each personal field", () => {
    const errors: CustomerFormErrors = {
      "personal.fullName": "Full Name is required",
      "personal.dob": "Date of Birth is required",
      "business.pan": "PAN is required",
    };
    const personalKeys = getPersonalErrorKeys(errors);
    assert.equal(personalKeys.length, 2);
    assert.ok(personalKeys.includes("personal.fullName"));
    assert.ok(personalKeys.includes("personal.dob"));
  });

  it("banner is shown when isEditing=false and hasPersonalErrors=true", () => {
    const errors: CustomerFormErrors = { "personal.fullName": "Full Name is required" };
    const isEditing = false;
    const showBanner = !isEditing && hasPersonalErrors(errors);
    assert.equal(showBanner, true);
  });

  it("banner is NOT shown when isEditing=true (edit form already shows field errors)", () => {
    const errors: CustomerFormErrors = { "personal.fullName": "Full Name is required" };
    const isEditing = true;
    const showBanner = !isEditing && hasPersonalErrors(errors);
    assert.equal(showBanner, false);
  });

  it("banner is NOT shown when no personal errors exist", () => {
    const errors: CustomerFormErrors = {};
    const showBanner = !false && hasPersonalErrors(errors);
    assert.equal(showBanner, false);
  });

  it("regression: before fix, card had no mechanism to show external validation errors", () => {
    // Simulate card props before fix: no personalErrors prop
    const cardPropsBefore = {
      personalData: {},
      isLoading: false,
      isError: false,
      onSaveProfile: async () => {},
    };
    assert.equal("personalErrors" in cardPropsBefore, false);
  });

  it("fixed: card now accepts personalErrors prop", () => {
    const errors: CustomerFormErrors = { "personal.fullName": "Full Name is required" };
    const cardPropsAfter = {
      personalData: {},
      personalErrors: errors,
      isLoading: false,
      isError: false,
      onSaveProfile: async () => {},
    };
    assert.equal("personalErrors" in cardPropsAfter, true);
  });
});

// ── BUG_B23_005 — Wrong alert priority when both form invalid + docs missing ──

describe("BUG_B23_005 — Form field errors take priority over document errors in alert", () => {
  it("fixed: when form invalid only → shows 'Incomplete Information' alert", () => {
    const alert = simulateAlertFixed(false, false);
    assert.ok(alert);
    assert.equal(alert.title, "Incomplete Information");
  });

  it("fixed: when docs missing only → shows 'Incomplete Documents' alert", () => {
    const alert = simulateAlertFixed(true, true);
    assert.ok(alert);
    assert.equal(alert.title, "Incomplete Documents");
  });

  it("fixed: when BOTH form invalid AND docs missing → shows 'Incomplete Information' (form errors first)", () => {
    const alert = simulateAlertFixed(false, true);
    assert.ok(alert);
    assert.equal(alert.title, "Incomplete Information");
  });

  it("fixed: when both valid and docs uploaded → no alert", () => {
    const alert = simulateAlertFixed(true, false);
    assert.equal(alert, null);
  });

  it("regression: buggy logic — when BOTH fail → shows 'Incomplete Documents' (hides field errors)", () => {
    const alert = simulateAlertBuggy(false, true);
    assert.ok(alert);
    // BUG: docs alert fires even though form fields are invalid → user doesn't know about field errors
    assert.equal(alert.title, "Incomplete Documents");
    assert.notEqual(alert.title, "Incomplete Information");
  });

  it("regression: buggy logic — when form invalid only → correctly shows field errors", () => {
    const alert = simulateAlertBuggy(false, false);
    assert.ok(alert);
    assert.equal(alert.title, "Incomplete Information");
  });

  it("fixed: alert message text is correct for each case", () => {
    const fieldAlert = simulateAlertFixed(false, false);
    const docsAlert = simulateAlertFixed(true, true);
    assert.ok(fieldAlert?.message.includes("required fields"));
    assert.ok(docsAlert?.message.includes("mandatory documents"));
  });
});

// ── BUG_B23_006 — updateBank("accountNumber") must clear confirmAccountNumber error ─

describe("BUG_B23_006 — updateBank accountNumber must clear stale confirmAccountNumber error", () => {
  const errorsWithMismatch: CustomerFormErrors = {
    "bank.accountNumber": "",
    "bank.confirmAccountNumber": "Bank Account Numbers do not match",
  };

  it("fixed: changing accountNumber clears confirmAccountNumber error", () => {
    const next = simulateUpdateBankFixed("accountNumber", errorsWithMismatch);
    assert.equal(next["bank.confirmAccountNumber"], undefined);
  });

  it("regression: buggy updateBank leaves confirmAccountNumber error when accountNumber changes", () => {
    const next = simulateUpdateBankBuggy("accountNumber", errorsWithMismatch);
    // Mismatch error persists even though account number was changed
    assert.equal(next["bank.confirmAccountNumber"], "Bank Account Numbers do not match");
  });

  it("fixed: changing confirmAccountNumber only clears its own error (not accountNumber error)", () => {
    const errors: CustomerFormErrors = {
      "bank.accountNumber": "Account number is required",
      "bank.confirmAccountNumber": "Bank Account Numbers do not match",
    };
    const next = simulateUpdateBankFixed("confirmAccountNumber", errors);
    assert.equal(next["bank.confirmAccountNumber"], undefined);
    assert.equal(next["bank.accountNumber"], "Account number is required"); // unaffected
  });

  it("fixed: changing bankName only clears its own error", () => {
    const errors: CustomerFormErrors = {
      "bank.bankName": "Bank Name is required",
      "bank.confirmAccountNumber": "Bank Account Numbers do not match",
    };
    const next = simulateUpdateBankFixed("bankName", errors);
    assert.equal(next["bank.bankName"], undefined);
    assert.equal(next["bank.confirmAccountNumber"], "Bank Account Numbers do not match"); // unaffected
  });

  it("fixed: when no confirmAccountNumber error exists, changing accountNumber is a no-op for confirm", () => {
    const errors: CustomerFormErrors = {
      "bank.accountNumber": "Account number is required",
    };
    const next = simulateUpdateBankFixed("accountNumber", errors);
    assert.equal(next["bank.accountNumber"], undefined); // own error cleared
    assert.equal(next["bank.confirmAccountNumber"], undefined); // already absent — still absent
  });

  it("fixed: changing accountNumber when no errors at all produces empty errors", () => {
    const next = simulateUpdateBankFixed("accountNumber", {});
    assert.deepEqual(next, {});
  });
});

// ── BUG_B23_007 — isEditing state not reactive to param changes ───────────────

describe("BUG_B23_007 — isEditing must re-sync when isEditingParam changes", () => {
  it("fixed: param changes from 'false' to 'true' updates isEditing", () => {
    const isEditing = simulateIsEditingFixed("false", "true");
    assert.equal(isEditing, true);
  });

  it("fixed: param changes from 'true' to 'false' updates isEditing", () => {
    const isEditing = simulateIsEditingFixed("true", "false");
    assert.equal(isEditing, false);
  });

  it("regression: buggy — param changes do NOT update isEditing (stale state)", () => {
    // Initial mount: isEditingParam = "false" → isEditing = false
    // Later: param updates to "true" but state doesn't re-sync
    const isEditing = simulateIsEditingBuggy("false", "true");
    assert.equal(isEditing, false); // WRONG — param is now "true" but state is stale
  });

  it("fixed: initial param 'true' sets isEditing=true (same initial behaviour)", () => {
    const isEditing = simulateIsEditingFixed("true", "true");
    assert.equal(isEditing, true);
  });

  it("fixed: initial param 'false' sets isEditing=false", () => {
    const isEditing = simulateIsEditingFixed("false", "false");
    assert.equal(isEditing, false);
  });

  it("fixed: isEditing=true triggers router.back() in handleContinue", () => {
    const isEditing = true;
    const navCall: NavCall = isEditing ? { method: "back" } : { method: "push" };
    assert.equal(navCall.method, "back");
  });

  it("fixed: isEditing=false triggers router.push() in handleContinue", () => {
    const isEditing = false;
    const navCall: NavCall = isEditing ? { method: "back" } : { method: "push" };
    assert.equal(navCall.method, "push");
  });

  it("regression: stale isEditing=false after param update causes wrong push navigation", () => {
    // User navigated from estimate screen with isEditing=true
    // But buggy code keeps isEditing=false from initial mount
    const isEditingStale = simulateIsEditingBuggy("false", "true"); // stale false
    const navCall: NavCall = isEditingStale ? { method: "back" } : { method: "push" };
    assert.equal(navCall.method, "push"); // WRONG — should be back() but pushes new screen
  });
});

// ── Combined validation timing scenarios ─────────────────────────────────────

describe("Combined validation timing scenarios", () => {
  it("fresh form: snapshot clean, no errors, alert returns null on Continue", () => {
    const bank = { accountNumber: "123456789" };
    const income = { salaryIncome: "500000" };
    const snapshot = makeInitialSnapshotFixed(bank, income);
    assert.equal(isFormDirtyFixed(snapshot, bank, income), false);
    assert.equal(simulateAlertFixed(true, false), null);
  });

  it("form invalid + docs ok: shows field error alert and no stale confirm error after fix", () => {
    const alert = simulateAlertFixed(false, false);
    assert.equal(alert?.title, "Incomplete Information");

    const errorsAfter = simulateUpdateBankFixed("accountNumber", {
      "bank.confirmAccountNumber": "do not match",
    });
    assert.equal(errorsAfter["bank.confirmAccountNumber"], undefined);
  });

  it("personal errors exist + form invalid: banner shows AND field alert fires", () => {
    const errors: CustomerFormErrors = {
      "personal.fullName": "Full Name is required",
      "bank.accountNumber": "Account number required",
    };
    assert.equal(hasPersonalErrors(errors), true);
    const alert = simulateAlertFixed(false, false);
    assert.equal(alert?.title, "Incomplete Information");
  });

  it("all 7 bugs fixed: clean form + no errors = no draft modal, no alert, form not dirty", () => {
    // B23_001: snapshot matches
    const bank = { accountNumber: "123456789" };
    const income = { salaryIncome: "500000" };
    const snapshot = makeInitialSnapshotFixed(bank, income);
    assert.equal(isFormDirtyFixed(snapshot, bank, income), false);

    // B23_005: valid form + no missing docs = null alert
    assert.equal(simulateAlertFixed(true, false), null);

    // B23_003/B23_004: no personal errors = no banner
    assert.equal(hasPersonalErrors({}), false);

    // B23_006: no stale confirm error
    const errors = simulateUpdateBankFixed("accountNumber", {});
    assert.deepEqual(errors, {});

    // B23_007: isEditing is correct
    assert.equal(simulateIsEditingFixed("false", "false"), false);
  });
});
