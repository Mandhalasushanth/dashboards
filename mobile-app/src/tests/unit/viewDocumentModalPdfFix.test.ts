/**
 * ViewDocumentModal — PDF preview fix tests (BUG-ITR-046)
 *
 * Root cause: resolveIsImage() only checked URI extension and fileTypeLabel.
 * Gallery images (content:// URIs) and all PDFs fell through to a static
 * placeholder — no content was visible and no way to open PDFs was provided.
 *
 * Verifies the two pure resolver functions extracted from the fix:
 *   - resolveIsImage: detects images via mimeType, fileTypeLabel, and URI extension
 *   - resolveIsPdf:   detects PDFs via mimeType, fileName, and URI extension
 *
 * Uses Node.js built-in test runner. No React Native imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline resolver implementations (mirrors ViewDocumentModal.tsx) ───────────

function resolveIsImage(
  fileUri: string | undefined,
  mimeType: string | undefined,
  fileTypeLabel: string | undefined
): boolean {
  if (!fileUri) return false;
  if (mimeType?.startsWith("image/")) return true;
  const label = (fileTypeLabel || "").toUpperCase();
  if (label === "JPG" || label === "JPEG" || label === "PNG") return true;
  const lower = fileUri.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
}

function resolveIsPdf(
  fileUri: string | undefined,
  mimeType: string | undefined,
  fileName: string | undefined
): boolean {
  if (mimeType === "application/pdf") return true;
  if ((fileName || "").toLowerCase().endsWith(".pdf")) return true;
  return (fileUri || "").toLowerCase().endsWith(".pdf");
}

// ── resolveIsImage — true cases ───────────────────────────────────────────────

describe("resolveIsImage — returns true for image files", () => {
  it("detects via mimeType image/jpeg", () => {
    assert.equal(resolveIsImage("content://media/12345", "image/jpeg", undefined), true);
  });

  it("detects via mimeType image/png", () => {
    assert.equal(resolveIsImage("content://media/12345", "image/png", undefined), true);
  });

  it("detects via mimeType image/webp (any image/* type)", () => {
    assert.equal(resolveIsImage("content://media/12345", "image/webp", undefined), true);
  });

  it("detects via fileTypeLabel JPG (no extension in URI)", () => {
    assert.equal(resolveIsImage("content://media/12345", undefined, "JPG"), true);
  });

  it("detects via fileTypeLabel JPEG", () => {
    assert.equal(resolveIsImage("content://media/12345", undefined, "JPEG"), true);
  });

  it("detects via fileTypeLabel PNG", () => {
    assert.equal(resolveIsImage("content://media/12345", undefined, "PNG"), true);
  });

  it("detects via .jpg URI extension", () => {
    assert.equal(resolveIsImage("file:///storage/photo.jpg", undefined, undefined), true);
  });

  it("detects via .jpeg URI extension", () => {
    assert.equal(resolveIsImage("file:///storage/photo.jpeg", undefined, undefined), true);
  });

  it("detects via .png URI extension", () => {
    assert.equal(resolveIsImage("file:///storage/photo.png", undefined, undefined), true);
  });

  it("mimeType takes priority over extension (PDF URI but image mimeType)", () => {
    assert.equal(resolveIsImage("file:///doc.pdf", "image/jpeg", undefined), true);
  });
});

// ── resolveIsImage — false cases ─────────────────────────────────────────────

describe("resolveIsImage — returns false for non-image files", () => {
  it("returns false when fileUri is undefined", () => {
    assert.equal(resolveIsImage(undefined, "image/jpeg", "JPG"), false);
  });

  it("returns false when fileUri is empty string", () => {
    assert.equal(resolveIsImage("", "image/jpeg", "JPG"), false);
  });

  it("returns false for PDF mimeType", () => {
    assert.equal(resolveIsImage("file:///doc.pdf", "application/pdf", undefined), false);
  });

  it("returns false for .pdf URI with no mimeType or label", () => {
    assert.equal(resolveIsImage("file:///doc.pdf", undefined, undefined), false);
  });

  it("returns false for content URI with no mimeType, no label, no extension", () => {
    assert.equal(resolveIsImage("content://com.android.providers.media/12345", undefined, undefined), false);
  });

  it("returns false for .docx URI", () => {
    assert.equal(resolveIsImage("file:///report.docx", undefined, undefined), false);
  });

  it("returns false for fileTypeLabel PDF", () => {
    assert.equal(resolveIsImage("content://media/12345", undefined, "PDF"), false);
  });
});

// ── resolveIsPdf — true cases ─────────────────────────────────────────────────

describe("resolveIsPdf — returns true for PDF files", () => {
  it("detects via mimeType application/pdf", () => {
    assert.equal(resolveIsPdf("content://media/12345", "application/pdf", undefined), true);
  });

  it("detects via fileName .pdf extension", () => {
    assert.equal(resolveIsPdf("content://media/12345", undefined, "Form16.pdf"), true);
  });

  it("detects via fileName .PDF extension (case-insensitive)", () => {
    assert.equal(resolveIsPdf("content://media/12345", undefined, "FORM16.PDF"), true);
  });

  it("detects via .pdf URI extension", () => {
    assert.equal(resolveIsPdf("file:///storage/document.pdf", undefined, undefined), true);
  });

  it("detects via .PDF URI extension (uppercase)", () => {
    assert.equal(resolveIsPdf("file:///storage/DOCUMENT.PDF", undefined, undefined), true);
  });

  it("mimeType takes priority when URI has no extension", () => {
    assert.equal(resolveIsPdf("content://provider/document%3A12345", "application/pdf", undefined), true);
  });
});

// ── resolveIsPdf — false cases ────────────────────────────────────────────────

describe("resolveIsPdf — returns false for non-PDF files", () => {
  it("returns false for image/jpeg mimeType", () => {
    assert.equal(resolveIsPdf("file:///photo.jpg", "image/jpeg", undefined), false);
  });

  it("returns false for .jpg URI with no mimeType or fileName", () => {
    assert.equal(resolveIsPdf("file:///photo.jpg", undefined, undefined), false);
  });

  it("returns false when all inputs are undefined", () => {
    assert.equal(resolveIsPdf(undefined, undefined, undefined), false);
  });

  it("returns false for .docx fileName", () => {
    assert.equal(resolveIsPdf(undefined, undefined, "report.docx"), false);
  });

  it("returns false for content URI with no mimeType or fileName", () => {
    assert.equal(resolveIsPdf("content://com.android.providers/12345", undefined, undefined), false);
  });
});

// ── Gallery image scenario (the primary regression caught by the fix) ─────────

describe("gallery content:// URI — previously broken, now fixed", () => {
  it("gallery JPG (content:// URI, mimeType provided) is now detected as image", () => {
    const uri = "content://com.android.providers.media.documents/document/image%3A12345";
    assert.equal(resolveIsImage(uri, "image/jpeg", undefined), true,
      "Gallery image was previously shown as placeholder because extension check failed on content URIs");
  });

  it("gallery PNG (content:// URI, fileTypeLabel provided) is now detected as image", () => {
    const uri = "content://media/external/images/media/67890";
    assert.equal(resolveIsImage(uri, undefined, "PNG"), true);
  });
});

// ── PDF scenario (the primary root cause of BUG-ITR-046) ─────────────────────

describe("PDF preview — resolves correctly after fix", () => {
  it("PDF with mimeType is not detected as image", () => {
    assert.equal(resolveIsImage("file:///Form16.pdf", "application/pdf", undefined), false);
  });

  it("PDF with mimeType is correctly detected as PDF", () => {
    assert.equal(resolveIsPdf("file:///Form16.pdf", "application/pdf", undefined), true);
  });

  it("PDF from document picker (content URI, mimeType=application/pdf)", () => {
    const uri = "content://com.android.providers.media.documents/document/document%3A99";
    assert.equal(resolveIsImage(uri, "application/pdf", undefined), false);
    assert.equal(resolveIsPdf(uri, "application/pdf", undefined), true);
  });

  it("PDF from file system (.pdf extension)", () => {
    const uri = "file:///data/user/0/com.finsolz/cache/AIS_Statement.pdf";
    assert.equal(resolveIsImage(uri, undefined, undefined), false);
    assert.equal(resolveIsPdf(uri, undefined, undefined), true);
  });
});
