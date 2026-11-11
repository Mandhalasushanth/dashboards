import test from "node:test";
import assert from "node:assert/strict";

// Verify unit logic for drive upload validation
test("driveDocumentUploader: file extension allowlist validation", () => {
  const allowed = ["pdf", "jpg", "jpeg", "png"];

  const checkExtension = (filename: string) => {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    return allowed.includes(ext);
  };

  assert.equal(checkExtension("Finsolz_Report.pdf"), true);
  assert.equal(checkExtension("profile_photo.JPG"), true);
  assert.equal(checkExtension("scan.png"), true);
  assert.equal(checkExtension("document.docx"), false);
  assert.equal(checkExtension("spreadsheet.xlsx"), false);
  assert.equal(checkExtension("archive.zip"), false);
});

test("driveDocumentUploader: size limit verification", () => {
  const maxBytes = 10 * 1024 * 1024; // 10 MB

  const isSizeAllowed = (sizeBytes: number) => sizeBytes <= maxBytes;

  assert.equal(isSizeAllowed(5 * 1024 * 1024), true); // 5 MB
  assert.equal(isSizeAllowed(10 * 1024 * 1024), true); // 10 MB
  assert.equal(isSizeAllowed(10 * 1024 * 1024 + 1), false); // > 10 MB
  assert.equal(isSizeAllowed(15 * 1024 * 1024), false); // 15 MB
});

test("driveDocumentUploader: MIME type deduction for cloud documents", () => {
  const deduceMime = (filename: string, rawMime?: string) => {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    let mimeType = rawMime;
    if (!mimeType || mimeType === "application/octet-stream" || mimeType === "*/*") {
      if (ext === "pdf") mimeType = "application/pdf";
      else if (ext === "png") mimeType = "image/png";
      else mimeType = "image/jpeg";
    }
    return mimeType;
  };

  assert.equal(deduceMime("TaxDoc.pdf", "*/*"), "application/pdf");
  assert.equal(deduceMime("TaxDoc.pdf", "application/octet-stream"), "application/pdf");
  assert.equal(deduceMime("Receipt.png", undefined), "image/png");
  assert.equal(deduceMime("Photo.jpg", undefined), "image/jpeg");
});
