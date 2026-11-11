/**
 * Batch 11 — Document checklist mandatory enforcement regression tests
 *
 * Bugs fixed:
 *   BUG_ITR_084 — Confirm & Continue allows navigation with zero documents uploaded
 *   BUG_ITR_085 — Allows navigation when ALL mandatory documents are missing
 *   BUG_ITR_086 — Allows navigation when only ONE mandatory document is uploaded
 *   BUG_ITR_087 — Allows navigation when SOME (but not all) mandatory docs are missing
 *
 * Root cause:
 *   Step4DocumentChecklist.tsx "Update & Continue" button used:
 *     onPress={onUpdateAndContinue || handleContinuePress}
 *   Since onUpdateAndContinue (handleStep3Update) was always provided by ItrFilingScreen,
 *   the validation gate in handleContinuePress was completely bypassed in the editing path.
 *   The editing path is active whenever maxStepReached >= 3 — i.e. when a user revisits
 *   the document step after completing the full flow, OR when a draft is restored past step 3.
 *
 * Fix:
 *   Extracted checkMandatoryDocuments() as a shared gate.
 *   Added handleUpdateAndContinuePress() that runs the gate then calls onUpdateAndContinue.
 *   The editing button now calls handleUpdateAndContinuePress instead of bypassing validation.
 *
 * Uses Node.js built-in test runner. No React Native or project imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline type (mirrors ItrDocumentItem subset) ─────────────────────────────

type DocumentTier = "REQUIRED" | "RECOMMENDED" | "ONLY_IF_APPLICABLE" | "NOT_REQUIRED";

interface DocItem {
  id: string;
  name: string;
  tier: DocumentTier;
  fileUri?: string;
}

// ── Inline logic stubs that mirror the fixed code ────────────────────────────

/** Mirrors checkMandatoryDocuments() in Step4DocumentChecklist. */
function checkMandatoryDocuments(docs: DocItem[]): string | null {
  const required = docs.filter((d) => d.tier === "REQUIRED");
  const missing = required.filter((d) => !d.fileUri);
  if (missing.length > 0) {
    return `Required Documents Missing: ${missing.map((d) => d.name).join(", ")}`;
  }
  return null;
}

/** Mirrors handleContinuePress — returns whether navigation proceeds. */
function handleContinuePress(docs: DocItem[]): { navigated: boolean; error: string | null } {
  const error = checkMandatoryDocuments(docs);
  if (error) return { navigated: false, error };
  return { navigated: true, error: null };
}

/** Mirrors handleUpdateAndContinuePress (the fixed editing-path handler). */
function handleUpdateAndContinuePress(
  docs: DocItem[],
  onUpdateAndContinue: (() => void) | undefined,
  onContinue: () => void
): { navigated: boolean; error: string | null; calledUpdate: boolean } {
  const error = checkMandatoryDocuments(docs);
  if (error) return { navigated: false, error, calledUpdate: false };
  if (onUpdateAndContinue) {
    onUpdateAndContinue();
    return { navigated: true, error: null, calledUpdate: true };
  }
  onContinue();
  return { navigated: true, error: null, calledUpdate: false };
}

/** Old (broken) editing handler — onUpdateAndContinue bypassed validation. */
function handleUpdateAndContinueBroken(
  docs: DocItem[],
  onUpdateAndContinue: (() => void) | undefined
): { navigated: boolean } {
  if (onUpdateAndContinue) {
    onUpdateAndContinue();
    return { navigated: true };
  }
  const error = checkMandatoryDocuments(docs);
  return { navigated: !error };
}

// ── Sample document lists ─────────────────────────────────────────────────────

const requiredDocForm16: DocItem = { id: "doc-form-16", name: "Form 16 (Part A & B)", tier: "REQUIRED" };
const requiredDocCapGains: DocItem = { id: "doc-capital-gains", name: "Capital Gains Statement", tier: "REQUIRED" };
const requiredDocBusiness: DocItem = { id: "doc-business-turnover", name: "Business Turnover & GST Filings", tier: "REQUIRED" };
const recommendedDoc: DocItem = { id: "doc-26as", name: "Form 26AS", tier: "RECOMMENDED" };

const withUri = (doc: DocItem): DocItem => ({ ...doc, fileUri: "file://uploaded/doc.pdf" });

// ── BUG_ITR_084: zero documents uploaded ─────────────────────────────────────

describe("BUG_ITR_084 — no documents uploaded", () => {
  const docs: DocItem[] = [requiredDocForm16];

  it("first-time path (handleContinuePress) blocks navigation", () => {
    const result = handleContinuePress(docs);
    assert.equal(result.navigated, false);
    assert.ok(result.error?.includes("Form 16"));
  });

  it("editing path (OLD broken handler) allowed navigation — confirming the bug", () => {
    let called = false;
    const result = handleUpdateAndContinueBroken(docs, () => { called = true; });
    assert.equal(result.navigated, true);
    assert.equal(called, true);
  });

  it("editing path (FIXED handler) blocks navigation (BUG_ITR_084 fix)", () => {
    let called = false;
    const result = handleUpdateAndContinuePress(docs, () => { called = true; }, () => {});
    assert.equal(result.navigated, false);
    assert.equal(result.calledUpdate, false);
    assert.ok(result.error?.includes("Form 16"));
  });
});

// ── BUG_ITR_085: all 3 mandatory documents missing ───────────────────────────

describe("BUG_ITR_085 — salary, business and capital gains selected, all mandatory docs missing", () => {
  const docs: DocItem[] = [requiredDocForm16, requiredDocCapGains, requiredDocBusiness, recommendedDoc];

  it("first-time path blocks navigation listing all 3 missing docs", () => {
    const result = handleContinuePress(docs);
    assert.equal(result.navigated, false);
    assert.ok(result.error?.includes("Form 16"));
    assert.ok(result.error?.includes("Capital Gains Statement"));
    assert.ok(result.error?.includes("Business Turnover"));
  });

  it("editing path (FIXED) blocks navigation when all 3 required docs missing (BUG_ITR_085 fix)", () => {
    let called = false;
    const result = handleUpdateAndContinuePress(docs, () => { called = true; }, () => {});
    assert.equal(result.navigated, false);
    assert.equal(called, false);
  });

  it("navigation proceeds after all 3 required docs are uploaded", () => {
    const uploaded = [withUri(requiredDocForm16), withUri(requiredDocCapGains), withUri(requiredDocBusiness), recommendedDoc];
    const result = handleContinuePress(uploaded);
    assert.equal(result.navigated, true);
    assert.equal(result.error, null);
  });
});

// ── BUG_ITR_086: only one of three mandatory docs uploaded ───────────────────

describe("BUG_ITR_086 — only one mandatory doc uploaded", () => {
  const docs: DocItem[] = [withUri(requiredDocForm16), requiredDocCapGains, requiredDocBusiness];

  it("first-time path blocks and names the 2 still-missing docs", () => {
    const result = handleContinuePress(docs);
    assert.equal(result.navigated, false);
    assert.ok(result.error?.includes("Capital Gains Statement"));
    assert.ok(result.error?.includes("Business Turnover"));
    assert.ok(!result.error?.includes("Form 16"));
  });

  it("editing path (FIXED) blocks when 2 of 3 required docs are missing (BUG_ITR_086 fix)", () => {
    const result = handleUpdateAndContinuePress(docs, () => {}, () => {});
    assert.equal(result.navigated, false);
  });
});

// ── BUG_ITR_087: some but not all mandatory docs uploaded ────────────────────

describe("BUG_ITR_087 — some mandatory docs uploaded but at least one missing", () => {
  const docs: DocItem[] = [withUri(requiredDocForm16), withUri(requiredDocCapGains), requiredDocBusiness];

  it("first-time path blocks when 1 required doc remains missing", () => {
    const result = handleContinuePress(docs);
    assert.equal(result.navigated, false);
    assert.ok(result.error?.includes("Business Turnover"));
  });

  it("editing path (FIXED) blocks when 1 required doc is still missing (BUG_ITR_087 fix)", () => {
    const result = handleUpdateAndContinuePress(docs, () => {}, () => {});
    assert.equal(result.navigated, false);
  });

  it("navigation proceeds once the final required doc is uploaded", () => {
    const allUploaded = [withUri(requiredDocForm16), withUri(requiredDocCapGains), withUri(requiredDocBusiness)];
    const result = handleUpdateAndContinuePress(allUploaded, () => {}, () => {});
    assert.equal(result.navigated, true);
    assert.equal(result.calledUpdate, true);
  });
});

// ── Edge cases ───────────────────────────────────────────────────────────────

describe("Edge cases", () => {
  it("no income sources selected → no REQUIRED docs → navigation allowed (correct behaviour)", () => {
    const docs: DocItem[] = [recommendedDoc];
    const result = handleContinuePress(docs);
    assert.equal(result.navigated, true);
  });

  it("RECOMMENDED doc not uploaded does not block navigation", () => {
    const docs: DocItem[] = [withUri(requiredDocForm16), recommendedDoc];
    const result = handleContinuePress(docs);
    assert.equal(result.navigated, true);
  });

  it("ONLY_IF_APPLICABLE doc not uploaded does not block navigation", () => {
    const conditional: DocItem = { id: "doc-80d", name: "Health Insurance Receipt", tier: "ONLY_IF_APPLICABLE" };
    const docs: DocItem[] = [withUri(requiredDocForm16), conditional];
    const result = handleContinuePress(docs);
    assert.equal(result.navigated, true);
  });

  it("empty string fileUri (removed doc) is treated as missing — blocks navigation", () => {
    const removedDoc: DocItem = { ...requiredDocForm16, fileUri: "" };
    const result = handleContinuePress([removedDoc]);
    assert.equal(result.navigated, false);
  });

  it("handleUpdateAndContinuePress falls back to onContinue when onUpdateAndContinue not provided", () => {
    const docs: DocItem[] = [withUri(requiredDocForm16)];
    let continueCalled = false;
    const result = handleUpdateAndContinuePress(docs, undefined, () => { continueCalled = true; });
    assert.equal(result.navigated, true);
    assert.equal(continueCalled, true);
    assert.equal(result.calledUpdate, false);
  });
});
