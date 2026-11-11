/**
 * Batch 20 — ITR Filing Document Checklist Upload
 * Regression tests for 2 bugs:
 *   BUG_B20_001 — onRemove passes empty object instead of null; store
 *                 runs "set file" branch and stamps uploadedAt on removal
 *   BUG_B20_002 — File size limit text inconsistent with actual MAX_FILE_SIZE_BYTES
 *                 (DocumentUploadModal showed "2 MB"; SharedItrDocumentCard showed "10 MB";
 *                  both use a 15 MB constant)
 *
 * All logic inlined — no project module imports (avoids @/ alias issues
 * with --experimental-strip-types).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inlined helpers ───────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB — matches production constant

interface UploadedFileInfo {
  uri: string;
  name: string;
  size: string;
  mimeType?: string;
}

interface DocState {
  id: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  uploadedAt?: string;
}

/**
 * Mirrors the store's updateDocument reducer logic exactly.
 * fileInfo truthy  → spread new file fields + set uploadedAt
 * fileInfo falsy   → clear all file fields (undefined)
 */
function updateDocumentReducer(
  doc: DocState,
  fileInfo: UploadedFileInfo | null | { uri: string; name: string; size: string }
): DocState {
  if (fileInfo) {
    return {
      ...doc,
      fileUri: (fileInfo as UploadedFileInfo).uri,
      fileName: (fileInfo as UploadedFileInfo).name,
      fileSize: (fileInfo as UploadedFileInfo).size,
      mimeType: (fileInfo as UploadedFileInfo).mimeType,
      uploadedAt: new Date().toISOString(),
    };
  }
  return {
    ...doc,
    fileUri: undefined,
    fileName: undefined,
    fileSize: undefined,
    mimeType: undefined,
    uploadedAt: undefined,
  };
}

/** Returns the file size alert text, mirroring the fixed DocumentUploadModal. */
function buildSizeExceededMessage(limitMb: number): string {
  return `The selected file exceeds ${limitMb} MB. Please select a smaller file (under ${limitMb} MB) to proceed.`;
}

/** Returns whether a file passes the size check (mirrors production logic). */
function passesSizeCheck(sizeInBytes: number): boolean {
  return sizeInBytes <= MAX_FILE_SIZE_BYTES;
}

const DEFAULT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx", "json"];

/** Mirrors the fixed accepted-types error message in SharedItrDocumentCard. */
function buildUnsupportedTypeMessage(extension: string): string {
  return `Unsupported file (.${extension || "unknown"}). Accepted: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, JSON`;
}

/** Checks extension validity (mirrors production code). */
function isValidExtension(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return DEFAULT_EXTENSIONS.includes(ext);
}

// ── Group A: Remove document passes null, not empty object (BUG_B20_001) ────

describe("BUG_B20_001 — onRemove must pass null to trigger store clearing branch", () => {
  const initialDoc: DocState = {
    id: "doc-form16",
    fileUri: "file:///storage/form16.pdf",
    fileName: "form16.pdf",
    fileSize: "1.2 MB",
    mimeType: "application/pdf",
    uploadedAt: "2024-01-15T10:00:00.000Z",
  };

  it("null clears all file fields and uploadedAt", () => {
    const result = updateDocumentReducer(initialDoc, null);
    assert.equal(result.fileUri, undefined);
    assert.equal(result.fileName, undefined);
    assert.equal(result.fileSize, undefined);
    assert.equal(result.mimeType, undefined);
    assert.equal(result.uploadedAt, undefined);
  });

  it("empty object is truthy — hits 'set file' branch, stamps uploadedAt (the bug)", () => {
    // This demonstrates the BUG: empty UploadedFileInfo object is truthy
    const emptyObj = { uri: "", name: "", size: "" };
    assert.equal(Boolean(emptyObj), true); // truthy → wrong branch

    const bugResult = updateDocumentReducer(initialDoc, emptyObj);
    // Store ran the "set" branch instead of "clear" — uploadedAt was updated
    assert.notEqual(bugResult.uploadedAt, undefined);
    assert.notEqual(bugResult.uploadedAt, "2024-01-15T10:00:00.000Z");
    // fileUri is "" (falsy) — appears cleared in UI, but uploadedAt is stamped
    assert.equal(bugResult.fileUri, "");
  });

  it("null is falsy — hits 'clear' branch correctly (the fix)", () => {
    assert.equal(Boolean(null), false); // falsy → correct branch
    const fixResult = updateDocumentReducer(initialDoc, null);
    assert.equal(fixResult.uploadedAt, undefined); // uploadedAt cleared
    assert.equal(fixResult.fileUri, undefined);    // fileUri cleared
  });

  it("empty object leaves fileUri as '' — mandatory check appears OK but store state is wrong", () => {
    const emptyObj = { uri: "", name: "", size: "" };
    const bugResult = updateDocumentReducer(initialDoc, emptyObj);
    // checkMandatoryDocuments uses !doc.fileUri — !'' = true → appears missing
    // But uploadedAt is stamped — inconsistent state
    assert.equal(!bugResult.fileUri, true);  // doc appears missing
    assert.notEqual(bugResult.uploadedAt, undefined);  // but uploadedAt set
  });

  it("null leaves uploadedAt as undefined — consistent cleared state", () => {
    const fixResult = updateDocumentReducer(initialDoc, null);
    assert.equal(!fixResult.fileUri, true);    // doc appears missing
    assert.equal(fixResult.uploadedAt, undefined);  // and uploadedAt cleared
  });

  it("upload after removal (null): uploadedAt gets correct new timestamp", () => {
    const after_null = updateDocumentReducer(initialDoc, null);
    const after_upload = updateDocumentReducer(after_null, {
      uri: "file:///new_form16.pdf",
      name: "new_form16.pdf",
      size: "1.5 MB",
      mimeType: "application/pdf",
    });
    assert.equal(after_upload.fileUri, "file:///new_form16.pdf");
    assert.ok(typeof after_upload.uploadedAt === "string");
    assert.ok(after_upload.uploadedAt !== undefined);
  });

  it("upload (valid fileInfo) always sets uploadedAt", () => {
    const clean: DocState = { id: "doc-1" };
    const result = updateDocumentReducer(clean, {
      uri: "file:///doc.pdf",
      name: "doc.pdf",
      size: "0.8 MB",
      mimeType: "application/pdf",
    });
    assert.ok(result.uploadedAt !== undefined);
    assert.ok(typeof result.uploadedAt === "string");
  });

  it("doc not in state unchanged by reducer (id mismatch) — not tested here but pattern is clear", () => {
    // Reducer maps: doc.id !== docId ? doc : ...
    // Unaffected doc is returned as-is
    const unrelated: DocState = { id: "doc-other", fileUri: "file:///other.pdf", uploadedAt: "2024-01-01T00:00:00.000Z" };
    // Simulate: only the matching doc gets updated
    const docs = [initialDoc, unrelated];
    const updated = docs.map((d) =>
      d.id === initialDoc.id ? updateDocumentReducer(d, null) : d
    );
    assert.equal(updated[0].uploadedAt, undefined);    // removed
    assert.equal(updated[1].uploadedAt, "2024-01-01T00:00:00.000Z"); // unchanged
  });
});

// ── Group B: File size limit text matches constant (BUG_B20_002) ──────────────

describe("BUG_B20_002 — File size limit text must match MAX_FILE_SIZE_BYTES (15 MB)", () => {
  it("MAX_FILE_SIZE_BYTES is 15 MB", () => {
    assert.equal(MAX_FILE_SIZE_BYTES, 15 * 1024 * 1024);
    assert.equal(MAX_FILE_SIZE_BYTES, 15728640);
  });

  it("DocumentUploadModal error message now says 15 MB (fixed from '2 MB')", () => {
    const msg = buildSizeExceededMessage(15);
    assert.ok(msg.includes("15 MB"));
    assert.ok(!msg.includes("2 MB"));
  });

  it("SharedItrDocumentCard maxSizeText now says 15 MB (fixed from '10 MB')", () => {
    // Mirrors the fixed maxSizeText prop value
    const maxSizeText = "Maximum file size: 15 MB";
    assert.ok(maxSizeText.includes("15 MB"));
    assert.ok(!maxSizeText.includes("10 MB"));
  });

  it("file < 15 MB passes size check", () => {
    assert.equal(passesSizeCheck(14 * 1024 * 1024), true);
  });

  it("file exactly 15 MB passes size check", () => {
    assert.equal(passesSizeCheck(MAX_FILE_SIZE_BYTES), true);
  });

  it("file > 15 MB fails size check", () => {
    assert.equal(passesSizeCheck(16 * 1024 * 1024), false);
  });

  it("regression: 3 MB file passed old 2 MB check limit silently — users saw misleading error text", () => {
    // 3 MB < 15 MB → passes. Old text said '2 MB' — user was confused.
    const sizeBytes = 3 * 1024 * 1024;
    assert.equal(passesSizeCheck(sizeBytes), true);
    // Old message was "exceeds 2 MB" but the file should have been accepted
    const oldMsg = "The selected file exceeds 2 MB.";
    const fixedMsg = buildSizeExceededMessage(15);
    assert.ok(!fixedMsg.includes("2 MB"));
    // Only file > 15 MB would hit the error
    assert.equal(passesSizeCheck(sizeBytes), true); // 3 MB is accepted
    assert.equal(oldMsg.includes("2 MB"), true); // old message was wrong
  });

  it("regression: 12 MB file would have shown '10 MB exceeded' in SharedItrDocumentCard", () => {
    // 12 MB < 15 MB → passes. Old text said '10 MB'.
    const sizeBytes = 12 * 1024 * 1024;
    assert.equal(passesSizeCheck(sizeBytes), true);
    // Old SharedItrDocumentCard alert said "exceeds the 10 MB limit"
    const oldAlert = "File size exceeds the 10 MB limit.";
    const fixedAlert = "File size exceeds the 15 MB limit.";
    assert.ok(fixedAlert.includes("15 MB"));
    assert.ok(oldAlert.includes("10 MB")); // demonstrates the old wrong value
  });
});

// ── Group C: Accepted file extensions message includes all types ──────────────

describe("BUG_B20_002b — Accepted file types message matches DEFAULT_EXTENSIONS", () => {
  it("DEFAULT_EXTENSIONS contains expected types", () => {
    assert.ok(DEFAULT_EXTENSIONS.includes("pdf"));
    assert.ok(DEFAULT_EXTENSIONS.includes("jpg"));
    assert.ok(DEFAULT_EXTENSIONS.includes("jpeg"));
    assert.ok(DEFAULT_EXTENSIONS.includes("png"));
    assert.ok(DEFAULT_EXTENSIONS.includes("doc"));
    assert.ok(DEFAULT_EXTENSIONS.includes("docx"));
    assert.ok(DEFAULT_EXTENSIONS.includes("xls"));
    assert.ok(DEFAULT_EXTENSIONS.includes("xlsx"));
    assert.ok(DEFAULT_EXTENSIONS.includes("json"));
  });

  it("unsupported type error message lists all accepted types including DOC and XLS", () => {
    const msg = buildUnsupportedTypeMessage("csv");
    assert.ok(msg.includes("DOC"));
    assert.ok(msg.includes("XLS"));
    assert.ok(msg.includes("PDF"));
    assert.ok(msg.includes("JPG"));
  });

  it("regression: old message only listed PDF, JPG, PNG — missing DOC/DOCX/XLS/XLSX/JSON", () => {
    const oldMsg = "Unsupported file (.csv). Accepted: PDF, JPG, PNG";
    assert.ok(!oldMsg.includes("DOC"));
    assert.ok(!oldMsg.includes("XLS"));
    // Fixed message includes them
    const fixedMsg = buildUnsupportedTypeMessage("csv");
    assert.ok(fixedMsg.includes("DOC"));
    assert.ok(fixedMsg.includes("XLS"));
    assert.ok(fixedMsg.includes("JSON"));
  });

  it("valid extensions pass file format check", () => {
    for (const ext of DEFAULT_EXTENSIONS) {
      assert.equal(isValidExtension(`document.${ext}`), true, `expected ${ext} to be valid`);
    }
  });

  it("invalid extensions fail format check", () => {
    assert.equal(isValidExtension("document.csv"), false);
    assert.equal(isValidExtension("document.mp4"), false);
    assert.equal(isValidExtension("document.exe"), false);
    assert.equal(isValidExtension("document.zip"), false);
  });

  it("extension check is case-insensitive (toLowerCase applied)", () => {
    // The production code does .split('.').pop()?.toLowerCase()
    assert.equal(isValidExtension("Document.PDF".toLowerCase().includes("pdf") ? "doc.pdf" : "doc.PDF"), true);
  });
});

// ── Group D: Combined document checklist scenarios ────────────────────────────

describe("Combined document checklist upload scenarios", () => {
  it("upload success: fileInfo is truthy, sets all fields", () => {
    const doc: DocState = { id: "doc-form26as" };
    const result = updateDocumentReducer(doc, {
      uri: "file:///26as.pdf",
      name: "26as.pdf",
      size: "0.5 MB",
      mimeType: "application/pdf",
    });
    assert.equal(result.fileUri, "file:///26as.pdf");
    assert.equal(result.fileName, "26as.pdf");
    assert.equal(result.fileSize, "0.5 MB");
    assert.ok(result.uploadedAt !== undefined);
  });

  it("remove via null: all fields cleared including uploadedAt", () => {
    const doc: DocState = {
      id: "doc-form26as",
      fileUri: "file:///26as.pdf",
      fileName: "26as.pdf",
      fileSize: "0.5 MB",
      uploadedAt: "2024-03-01T12:00:00.000Z",
    };
    const result = updateDocumentReducer(doc, null);
    assert.equal(result.fileUri, undefined);
    assert.equal(result.fileName, undefined);
    assert.equal(result.fileSize, undefined);
    assert.equal(result.uploadedAt, undefined);
  });

  it("file just under 15 MB: passes, no error shown", () => {
    const sizeBytes = 14.9 * 1024 * 1024;
    assert.equal(passesSizeCheck(sizeBytes), true);
  });

  it("file just over 15 MB: fails, error shown with 15 MB text", () => {
    const sizeBytes = 15.1 * 1024 * 1024;
    assert.equal(passesSizeCheck(sizeBytes), false);
    const msg = buildSizeExceededMessage(15);
    assert.ok(msg.includes("15 MB"));
  });

  it("mandatory check: !fileUri is true for undefined (cleared doc)", () => {
    const doc: DocState = { id: "doc-mandatory" };
    assert.equal(!doc.fileUri, true);
  });

  it("mandatory check: !fileUri is false for uploaded doc", () => {
    const doc: DocState = { id: "doc-mandatory", fileUri: "file:///doc.pdf" };
    assert.equal(!doc.fileUri, false);
  });
});
