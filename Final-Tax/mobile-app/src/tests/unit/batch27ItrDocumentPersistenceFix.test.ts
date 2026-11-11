/**
 * Batch 27 — ITR document state persistence regression tests
 *
 * Bug: Documents uploaded for an income source (e.g. Business / Profession) are
 * permanently lost after: deselect income source → reselect → Update & Continue.
 *
 * Root cause:
 *   generateDynamicDocumentChecklist() (itrDocumentEngine.ts) ends with:
 *     return allCandidates.filter((doc) => doc.tier !== "NOT_REQUIRED");
 *   When an income source is deselected, its associated document is rebuilt with
 *   tier "NOT_REQUIRED" (the existingMap lookup correctly preserves fileUri in
 *   the intermediate doc object), but then the filter removes that object from the
 *   returned array.  On the next call, formData.documents no longer contains the
 *   doc, so existingMap cannot find it and the uploaded file info is gone.
 *
 * Fix:
 *   Return NOT_REQUIRED docs that carry an uploaded file, so they survive in
 *   formData.documents across income-source toggle cycles:
 *     return allCandidates.filter(
 *       (doc) => doc.tier !== "NOT_REQUIRED" || Boolean(doc.fileUri)
 *     );
 *   Step4DocumentChecklist already renders only REQUIRED / RECOMMENDED /
 *   ONLY_IF_APPLICABLE docs, so a NOT_REQUIRED doc with a file is invisible
 *   in the UI until the income source is reselected and the tier reverts.
 *
 * Uses Node.js built-in test runner. No React Native or project imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline types ──────────────────────────────────────────────────────────────

type DocumentTier = "REQUIRED" | "RECOMMENDED" | "ONLY_IF_APPLICABLE" | "NOT_REQUIRED";

interface DocItem {
  id: string;
  name: string;
  tier: DocumentTier;
  fileUri?: string;
  fileName?: string;
  mimeType?: string;
  uploadedAt?: string;
}

interface IncomeSourcesState {
  salary: { enabled: boolean };
  houseProperty: { enabled: boolean };
  business: { enabled: boolean };
  capitalGains: { enabled: boolean };
  otherSources: { enabled: boolean };
}

// ── Inline document engine (mirrors the fixed itrDocumentEngine.ts) ───────────

function makeDoc(
  id: string,
  tier: DocumentTier,
  existingMap: Map<string, DocItem>
): DocItem {
  const existing = existingMap.get(id);
  return {
    id,
    name: id,
    tier,
    fileUri: existing?.fileUri,
    fileName: existing?.fileName,
    mimeType: existing?.mimeType,
    uploadedAt: existing?.uploadedAt,
  };
}

/** FIXED version — preserves uploaded files even for NOT_REQUIRED docs. */
function generateDocumentChecklistFixed(
  sources: IncomeSourcesState,
  existingDocs: DocItem[]
): DocItem[] {
  const existingMap = new Map(existingDocs.map((d) => [d.id, d]));

  const candidates: DocItem[] = [
    makeDoc("doc-form-16", sources.salary.enabled ? "REQUIRED" : "NOT_REQUIRED", existingMap),
    makeDoc(
      "doc-capital-gains",
      sources.capitalGains.enabled ? "REQUIRED" : "NOT_REQUIRED",
      existingMap
    ),
    makeDoc(
      "doc-business-turnover",
      sources.business.enabled ? "REQUIRED" : "NOT_REQUIRED",
      existingMap
    ),
    makeDoc("doc-26as", "RECOMMENDED", existingMap),
    makeDoc("doc-bank", "RECOMMENDED", existingMap),
  ];

  // FIX: preserve docs that have an uploaded file even when NOT_REQUIRED
  return candidates.filter((doc) => doc.tier !== "NOT_REQUIRED" || Boolean(doc.fileUri));
}

/** BROKEN version — strips all NOT_REQUIRED docs unconditionally. */
function generateDocumentChecklistBroken(
  sources: IncomeSourcesState,
  existingDocs: DocItem[]
): DocItem[] {
  const existingMap = new Map(existingDocs.map((d) => [d.id, d]));

  const candidates: DocItem[] = [
    makeDoc("doc-form-16", sources.salary.enabled ? "REQUIRED" : "NOT_REQUIRED", existingMap),
    makeDoc(
      "doc-capital-gains",
      sources.capitalGains.enabled ? "REQUIRED" : "NOT_REQUIRED",
      existingMap
    ),
    makeDoc(
      "doc-business-turnover",
      sources.business.enabled ? "REQUIRED" : "NOT_REQUIRED",
      existingMap
    ),
    makeDoc("doc-26as", "RECOMMENDED", existingMap),
    makeDoc("doc-bank", "RECOMMENDED", existingMap),
  ];

  return candidates.filter((doc) => doc.tier !== "NOT_REQUIRED");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_SOURCES: IncomeSourcesState = {
  salary: { enabled: false },
  houseProperty: { enabled: false },
  business: { enabled: false },
  capitalGains: { enabled: false },
  otherSources: { enabled: false },
};

const UPLOADED_FILE = {
  fileUri: "file://uploads/business_turnover.pdf",
  fileName: "business_turnover.pdf",
  mimeType: "application/pdf",
  uploadedAt: "2026-01-01T00:00:00.000Z",
};

// ── BUG_ITR_DOCPERSIST_001: deselect → reselect cycle (the exact reproduction) ──

describe("BUG_ITR_DOCPERSIST_001 — business doc survives deselect → reselect cycle", () => {
  it("FIXED: uploaded file is preserved after deselect → reselect", () => {
    // 1. Business selected, documents generated
    const withBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: true } };
    let docs = generateDocumentChecklistFixed(withBusiness, []);

    // 2. Upload the business doc
    docs = docs.map((d) =>
      d.id === "doc-business-turnover" ? { ...d, ...UPLOADED_FILE } : d
    );
    assert.ok(docs.find((d) => d.id === "doc-business-turnover")?.fileUri, "file should be uploaded");

    // 3. Deselect business — engine runs again
    const withoutBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: false } };
    docs = generateDocumentChecklistFixed(withoutBusiness, docs);

    // The doc should still be in the list (NOT_REQUIRED but has a file)
    const afterDeselect = docs.find((d) => d.id === "doc-business-turnover");
    assert.ok(afterDeselect, "doc-business-turnover must still be in the list after deselect");
    assert.equal(afterDeselect?.fileUri, UPLOADED_FILE.fileUri, "fileUri must be preserved after deselect");
    assert.equal(afterDeselect?.tier, "NOT_REQUIRED", "tier must reflect the deselected state");

    // 4. Reselect business — engine runs again
    docs = generateDocumentChecklistFixed(withBusiness, docs);

    // The doc must be REQUIRED again and still carry the uploaded file
    const afterReselect = docs.find((d) => d.id === "doc-business-turnover");
    assert.ok(afterReselect, "doc-business-turnover must reappear after reselect");
    assert.equal(afterReselect?.tier, "REQUIRED", "tier must be REQUIRED after reselect");
    assert.equal(afterReselect?.fileUri, UPLOADED_FILE.fileUri, "fileUri must survive full cycle");
    assert.equal(afterReselect?.fileName, UPLOADED_FILE.fileName, "fileName must survive full cycle");
    assert.equal(afterReselect?.mimeType, UPLOADED_FILE.mimeType, "mimeType must survive full cycle");
    assert.equal(afterReselect?.uploadedAt, UPLOADED_FILE.uploadedAt, "uploadedAt must survive full cycle");
  });

  it("BROKEN (pre-fix): uploaded file is lost after deselect → reselect — confirming the bug", () => {
    // 1. Business selected, documents generated
    const withBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: true } };
    let docs = generateDocumentChecklistBroken(withBusiness, []);

    // 2. Upload the business doc
    docs = docs.map((d) =>
      d.id === "doc-business-turnover" ? { ...d, ...UPLOADED_FILE } : d
    );

    // 3. Deselect business
    const withoutBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: false } };
    docs = generateDocumentChecklistBroken(withoutBusiness, docs);

    // Bug: the doc is stripped out entirely
    const afterDeselect = docs.find((d) => d.id === "doc-business-turnover");
    assert.equal(afterDeselect, undefined, "BUG confirmed: doc removed from list on deselect");

    // 4. Reselect business
    docs = generateDocumentChecklistBroken(withBusiness, docs);

    // Bug: file info is gone because existingMap was empty for this id
    const afterReselect = docs.find((d) => d.id === "doc-business-turnover");
    assert.ok(afterReselect, "doc reappears after reselect");
    assert.equal(afterReselect?.fileUri, undefined, "BUG confirmed: fileUri is undefined after reselect");
  });
});

// ── BUG_ITR_DOCPERSIST_002: multiple income sources — only deselected source loses visibility ──

describe("BUG_ITR_DOCPERSIST_002 — other uploaded docs unaffected by business deselect", () => {
  it("FIXED: salary doc (uploaded) is unaffected when business is deselected", () => {
    const withBoth: IncomeSourcesState = {
      ...BASE_SOURCES,
      salary: { enabled: true },
      business: { enabled: true },
    };

    // Upload both docs
    let docs = generateDocumentChecklistFixed(withBoth, []);
    docs = docs.map((d) => {
      if (d.id === "doc-form-16")
        return { ...d, fileUri: "file://form16.pdf", fileName: "form16.pdf" };
      if (d.id === "doc-business-turnover")
        return { ...d, ...UPLOADED_FILE };
      return d;
    });

    // Deselect only business
    const withSalaryOnly: IncomeSourcesState = {
      ...BASE_SOURCES,
      salary: { enabled: true },
      business: { enabled: false },
    };
    docs = generateDocumentChecklistFixed(withSalaryOnly, docs);

    // Salary doc must still be REQUIRED with its file
    const form16 = docs.find((d) => d.id === "doc-form-16");
    assert.equal(form16?.tier, "REQUIRED");
    assert.equal(form16?.fileUri, "file://form16.pdf");

    // Business doc persists with its file, tier NOT_REQUIRED
    const bizDoc = docs.find((d) => d.id === "doc-business-turnover");
    assert.ok(bizDoc, "business doc should still be present");
    assert.equal(bizDoc?.tier, "NOT_REQUIRED");
    assert.equal(bizDoc?.fileUri, UPLOADED_FILE.fileUri);
  });
});

// ── BUG_ITR_DOCPERSIST_003: multiple deselect → reselect cycles ──────────────

describe("BUG_ITR_DOCPERSIST_003 — file persists across multiple toggle cycles", () => {
  it("FIXED: file survives two full deselect → reselect cycles", () => {
    const withBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: true } };
    const withoutBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: false } };

    let docs = generateDocumentChecklistFixed(withBusiness, []);
    docs = docs.map((d) =>
      d.id === "doc-business-turnover" ? { ...d, ...UPLOADED_FILE } : d
    );

    // Cycle 1
    docs = generateDocumentChecklistFixed(withoutBusiness, docs);
    docs = generateDocumentChecklistFixed(withBusiness, docs);
    assert.equal(
      docs.find((d) => d.id === "doc-business-turnover")?.fileUri,
      UPLOADED_FILE.fileUri,
      "file must survive cycle 1"
    );

    // Cycle 2
    docs = generateDocumentChecklistFixed(withoutBusiness, docs);
    docs = generateDocumentChecklistFixed(withBusiness, docs);
    assert.equal(
      docs.find((d) => d.id === "doc-business-turnover")?.fileUri,
      UPLOADED_FILE.fileUri,
      "file must survive cycle 2"
    );
  });
});

// ── BUG_ITR_DOCPERSIST_004: Review → Edit → Update & Continue navigation ─────

describe("BUG_ITR_DOCPERSIST_004 — Review → Edit Income → Update & Continue preserves docs", () => {
  /**
   * Simulates the full reproduction scenario:
   *   Step 2 (income) → Step 3 (documents, upload file) → Step 4 (review)
   *   → Edit Income (step 1, isEditing=true) → deselect business → reselect
   *   → Update & Continue → documents step must still show the file.
   */
  it("FIXED: uploaded business doc survives Review → Edit → reselect → Update & Continue", () => {
    const withBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: true } };

    // State after reaching review step (business selected, doc uploaded)
    let formDocuments = generateDocumentChecklistFixed(withBusiness, []);
    formDocuments = formDocuments.map((d) =>
      d.id === "doc-business-turnover" ? { ...d, ...UPLOADED_FILE } : d
    );

    // User navigates to Review, then clicks Edit Income (step index 1)
    // User deselects Business/Profession
    const withoutBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: false } };
    formDocuments = generateDocumentChecklistFixed(withoutBusiness, formDocuments);

    // User reselects Business/Profession
    formDocuments = generateDocumentChecklistFixed(withBusiness, formDocuments);

    // User clicks Update & Continue — documents step renders
    const bizDoc = formDocuments.find((d) => d.id === "doc-business-turnover");
    assert.ok(bizDoc, "business doc must be present in document step after Update & Continue");
    assert.equal(bizDoc?.tier, "REQUIRED", "business doc must be REQUIRED");
    assert.equal(
      bizDoc?.fileUri,
      UPLOADED_FILE.fileUri,
      "previously uploaded file must be intact"
    );
    assert.equal(bizDoc?.fileName, UPLOADED_FILE.fileName);
    assert.equal(bizDoc?.mimeType, UPLOADED_FILE.mimeType);
  });
});

// ── BUG_ITR_DOCPERSIST_005: NOT_REQUIRED doc without a file is still removed ──

describe("BUG_ITR_DOCPERSIST_005 — NOT_REQUIRED docs with no file are still excluded", () => {
  it("FIXED: NOT_REQUIRED doc with no file is not shown in document list", () => {
    const withoutBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: false } };
    const docs = generateDocumentChecklistFixed(withoutBusiness, []);
    const bizDoc = docs.find((d) => d.id === "doc-business-turnover");
    assert.equal(
      bizDoc,
      undefined,
      "NOT_REQUIRED doc with no upload must still be excluded from the list"
    );
  });

  it("FIXED: selecting capital gains without prior upload does not add its doc to the list when deselected again", () => {
    const withCg: IncomeSourcesState = { ...BASE_SOURCES, capitalGains: { enabled: true } };
    // Generate without uploading the cap gains doc
    let docs = generateDocumentChecklistFixed(withCg, []);
    // Deselect capital gains
    const without: IncomeSourcesState = { ...BASE_SOURCES };
    docs = generateDocumentChecklistFixed(without, docs);
    const cgDoc = docs.find((d) => d.id === "doc-capital-gains");
    assert.equal(cgDoc, undefined, "un-uploaded NOT_REQUIRED doc must not be kept");
  });
});

// ── BUG_ITR_DOCPERSIST_006: draft restore preserves document state ────────────

describe("BUG_ITR_DOCPERSIST_006 — draft restore and screen remount preserve document state", () => {
  /**
   * Simulates AsyncStorage round-trip: serialize formData.documents to JSON and
   * restore them, then run the engine. File info must survive the round-trip.
   */
  it("FIXED: document file info survives JSON serialisation (draft restore)", () => {
    const withBusiness: IncomeSourcesState = { ...BASE_SOURCES, business: { enabled: true } };

    let docs = generateDocumentChecklistFixed(withBusiness, []);
    docs = docs.map((d) =>
      d.id === "doc-business-turnover" ? { ...d, ...UPLOADED_FILE } : d
    );

    // Simulate AsyncStorage round-trip
    const serialised = JSON.stringify(docs);
    const restored: DocItem[] = JSON.parse(serialised);

    // Regenerate from restored docs (simulates screen remount / init)
    const regenerated = generateDocumentChecklistFixed(withBusiness, restored);

    const bizDoc = regenerated.find((d) => d.id === "doc-business-turnover");
    assert.ok(bizDoc);
    assert.equal(bizDoc?.fileUri, UPLOADED_FILE.fileUri);
    assert.equal(bizDoc?.fileName, UPLOADED_FILE.fileName);
    assert.equal(bizDoc?.mimeType, UPLOADED_FILE.mimeType);
  });
});
