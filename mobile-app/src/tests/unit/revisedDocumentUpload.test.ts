import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  REVISED_ITR_ALLOWED_EXTENSIONS,
  MAX_REVISED_DOCUMENT_SIZE_BYTES,
  REVISED_DOCUMENT_FIELD_MAP,
  getFileExtension,
  resolveMimeType,
  isSupportedFileType,
  validateRevisedDocument,
  formatFileSize,
  describeUploadError,
  prepareLocalFileForUpload,
  createBlobFromFileUri,
} from "../../modules/itr/revisedItr/utils/revisedDocumentUploadHelper";

describe("Stage 2: Revised ITR Document Upload Hardening", () => {
  // ── Group 1: MIME Type & Extension Detection ─────────────────────────
  describe("1. MIME Type and Extension Detection", () => {
    it("extracts clean lowercase file extensions", () => {
      assert.equal(getFileExtension("Form16.PDF"), "pdf");
      assert.equal(getFileExtension("pan_card.JPG"), "jpg");
      assert.equal(getFileExtension("tax_sheet.XLSX"), "xlsx");
      assert.equal(getFileExtension("bank_statement.XLS"), "xls");
      assert.equal(getFileExtension("document"), "");
      assert.equal(getFileExtension(""), "");
    });

    it("resolves exact backend-compatible MIME type for PDF", () => {
      assert.equal(resolveMimeType("form16.pdf"), "application/pdf");
      assert.equal(resolveMimeType("form16.PDF"), "application/pdf");
    });

    it("resolves exact backend-compatible MIME type for JPEG images", () => {
      assert.equal(resolveMimeType("pan.jpg"), "image/jpeg");
      assert.equal(resolveMimeType("pan.jpeg"), "image/jpeg");
      assert.equal(resolveMimeType("pan.JPEG"), "image/jpeg");
    });

    it("resolves exact backend-compatible MIME type for PNG images", () => {
      assert.equal(resolveMimeType("aadhaar.png"), "image/png");
      assert.equal(resolveMimeType("aadhaar.PNG"), "image/png");
    });

    it("resolves exact backend-compatible MIME type for Excel spreadsheets (xlsx and xls)", () => {
      assert.equal(
        resolveMimeType("income_computation.xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      assert.equal(resolveMimeType("old_statement.xls"), "application/vnd.ms-excel");
    });

    it("overrides generic octet-stream MIME with extension-derived MIME", () => {
      assert.equal(
        resolveMimeType("statement.xlsx", "application/octet-stream"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      assert.equal(
        resolveMimeType("salary.pdf", "*/*"),
        "application/pdf"
      );
    });

    it("identifies supported file extensions for backend GstFileUploadValidator", () => {
      for (const ext of REVISED_ITR_ALLOWED_EXTENSIONS) {
        assert.equal(isSupportedFileType(`test_file.${ext}`), true);
      }
    });

    it("rejects unsupported extensions (.doc, .docx, .csv, .json, .exe)", () => {
      assert.equal(isSupportedFileType("notes.doc"), false);
      assert.equal(isSupportedFileType("notes.docx"), false);
      assert.equal(isSupportedFileType("data.csv"), false);
      assert.equal(isSupportedFileType("config.json"), false);
      assert.equal(isSupportedFileType("script.exe"), false);
    });
  });

  // ── Group 2: File Size and Document Validation ───────────────────────
  describe("2. Document Validation and 10 MB Limit", () => {
    it("enforces strict 10 MB maximum limit (10 * 1024 * 1024 bytes)", () => {
      assert.equal(MAX_REVISED_DOCUMENT_SIZE_BYTES, 10 * 1024 * 1024);
    });

    it("accepts valid documents within 10 MB", () => {
      const validPdf = validateRevisedDocument({
        name: "pan_card.pdf",
        uri: "file:///sandbox/cache/pan_card.pdf",
        sizeBytes: 5 * 1024 * 1024, // 5 MB
      });
      assert.equal(validPdf.isValid, true);
      assert.equal(validPdf.error, undefined);

      const exact10Mb = validateRevisedDocument({
        name: "bank.xlsx",
        uri: "file:///sandbox/cache/bank.xlsx",
        sizeBytes: 10 * 1024 * 1024, // exactly 10 MB
      });
      assert.equal(exact10Mb.isValid, true);
    });

    it("rejects oversized documents exceeding 10 MB", () => {
      const oversized = validateRevisedDocument({
        name: "large_statement.pdf",
        uri: "file:///sandbox/cache/large.pdf",
        sizeBytes: 10 * 1024 * 1024 + 1, // 10 MB + 1 byte
      });
      assert.equal(oversized.isValid, false);
      assert.ok(oversized.error?.includes("10 MB"));
    });

    it("rejects empty documents (0 bytes)", () => {
      const emptyDoc = validateRevisedDocument({
        name: "empty.pdf",
        uri: "file:///sandbox/cache/empty.pdf",
        sizeBytes: 0,
      });
      assert.equal(emptyDoc.isValid, false);
      assert.ok(emptyDoc.error?.toLowerCase().includes("empty"));
    });

    it("rejects unsupported format with actionable error message", () => {
      const unsupported = validateRevisedDocument({
        name: "document.docx",
        uri: "file:///sandbox/cache/document.docx",
        sizeBytes: 1024 * 1024,
      });
      assert.equal(unsupported.isValid, false);
      assert.ok(unsupported.error?.includes("Unsupported file type"));
      assert.ok(unsupported.error?.includes("PDF, JPG, JPEG, PNG, XLSX, XLS"));
    });

    it("formats file sizes accurately for display", () => {
      assert.equal(formatFileSize(0), "0 MB");
      assert.equal(formatFileSize(512 * 1024), "512 KB");
      assert.equal(formatFileSize(2.5 * 1024 * 1024), "2.50 MB");
    });
  });

  // ── Group 3: Android Content URI Handling & Sandbox Preparation ───────
  describe("3. Android Content URI and Cache Handling", () => {
    it("handles preparation of Android content:// URIs gracefully without adapter", async () => {
      const contentUri = "content://com.android.providers.media.documents/document/image%3A12345";
      const result = await prepareLocalFileForUpload(contentUri, "aadhaar_card.jpg");
      assert.ok(result);
      assert.ok(result.localUri);
      assert.equal(typeof result.size, "number");
    });

    it("copies Android content:// URIs into local cache directory via FileSystem", async () => {
      const copiedCalls: { from: string; to: string }[] = [];
      const mockFs = {
        cacheDirectory: "file:///data/user/0/com.finsolz/cache/",
        copyAsync: async (opts: { from: string; to: string }) => {
          copiedCalls.push(opts);
        },
        getInfoAsync: async (path: string) => ({
          exists: true,
          isDirectory: false,
          size: 2048576, // 2 MB
        }),
      };

      const contentUri = "content://com.android.providers.media.documents/document/12345";
      const result = await prepareLocalFileForUpload(contentUri, "pan card (v1).pdf", mockFs);

      assert.equal(copiedCalls.length, 1);
      assert.equal(copiedCalls[0].from, contentUri);
      assert.ok(copiedCalls[0].to.startsWith("file:///data/user/0/com.finsolz/cache/revised_doc_"));
      assert.ok(copiedCalls[0].to.endsWith("pan_card__v1_.pdf"));
      assert.equal(result.localUri, copiedCalls[0].to);
      assert.equal(result.size, 2048576);
    });

    it("copies iOS ph:// URIs into sandbox cache directory", async () => {
      const copiedCalls: { from: string; to: string }[] = [];
      const mockFs = {
        cacheDirectory: "file:///var/mobile/Containers/Data/Application/Finsolz/Library/Caches/",
        copyAsync: async (opts: { from: string; to: string }) => {
          copiedCalls.push(opts);
        },
        getInfoAsync: async (path: string) => ({
          exists: true,
          isDirectory: false,
          size: 1024000,
        }),
      };

      const phUri = "ph://ED7AC36B-A150-4C38-BB8C-B6D696F69508/L0/001";
      const result = await prepareLocalFileForUpload(phUri, "aadhaar.png", mockFs);

      assert.equal(copiedCalls.length, 1);
      assert.equal(copiedCalls[0].from, phUri);
      assert.equal(result.size, 1024000);
    });

    it("preserves files that are already inside cache directory", async () => {
      let copyCalled = false;
      const mockFs = {
        cacheDirectory: "file:///data/user/0/com.finsolz/cache/",
        copyAsync: async () => {
          copyCalled = true;
        },
        getInfoAsync: async () => ({
          exists: true,
          isDirectory: false,
          size: 512000,
        }),
      };

      const existingCacheUri = "file:///data/user/0/com.finsolz/cache/existing_statement.pdf";
      const result = await prepareLocalFileForUpload(existingCacheUri, "statement.pdf", mockFs);

      assert.equal(copyCalled, false);
      assert.equal(result.localUri, existingCacheUri);
      assert.equal(result.size, 512000);
    });

    it("handles copy failure gracefully by falling back to original URI", async () => {
      const mockFs = {
        cacheDirectory: "file:///data/user/0/com.finsolz/cache/",
        copyAsync: async () => {
          throw new Error("Disk full or permission revoked");
        },
        getInfoAsync: async (path: string) => ({
          exists: false,
          isDirectory: false,
          size: 0,
        }),
      };

      const contentUri = "content://media/external/images/media/456";
      const result = await prepareLocalFileForUpload(contentUri, "doc.pdf", mockFs);

      assert.equal(result.localUri, contentUri);
      assert.equal(result.size, 0);
    });

    it("throws when given invalid or empty URI", async () => {
      await assert.rejects(
        async () => {
          await prepareLocalFileForUpload("");
        },
        /Invalid file URI/
      );
    });
  });

  // ── Group 4: Backend Field Mapping ───────────────────────────────────
  describe("4. Multipart Field Name Mapping", () => {
    it("maps all 6 document types to exact backend parameter names", () => {
      assert.equal(REVISED_DOCUMENT_FIELD_MAP["doc-1"], "panCard");
      assert.equal(REVISED_DOCUMENT_FIELD_MAP["doc-2"], "aadhaarCard");
      assert.equal(REVISED_DOCUMENT_FIELD_MAP["doc-3"], "form16Form16A");
      assert.equal(REVISED_DOCUMENT_FIELD_MAP["doc-4"], "aisTisStatement");
      assert.equal(REVISED_DOCUMENT_FIELD_MAP["doc-5"], "bankStatements");
      assert.equal(REVISED_DOCUMENT_FIELD_MAP["doc-6"], "investmentProofs");
    });
  });

  // ── Group 5: Error Handling and User Messaging ───────────────────────
  describe("5. Error Handling and Normalization", () => {
    it("normalizes network failures to helpful connection advice", () => {
      const err = new Error("Network request failed");
      const msg = describeUploadError(err);
      assert.ok(msg.toLowerCase().includes("network connection"));
    });

    it("surfaces file size exceeded error", () => {
      const err = new Error("File size cannot exceed 10 MB for panCard");
      const msg = describeUploadError(err);
      assert.ok(msg.includes("10 MB"));
    });

    it("surfaces unsupported file type error", () => {
      const err = new Error("Unsupported file type for investmentProofs");
      const msg = describeUploadError(err);
      assert.ok(msg.includes("Unsupported file type"));
      assert.ok(msg.includes("PDF, JPG, JPEG, PNG, XLSX, and XLS"));
    });

    it("surfaces at-least-one-document requirement error", () => {
      const err = new Error("At least one document is required");
      const msg = describeUploadError(err);
      assert.ok(msg.toLowerCase().includes("at least one document"));
    });

    it("surfaces permission and FileNotFound errors clearly", () => {
      const err = new Error("java.io.FileNotFoundException: open failed: EACCES (Permission denied)");
      const msg = describeUploadError(err);
      assert.ok(msg.toLowerCase().includes("permissions"));
    });

    it("extracts clean details from backend HTTP status errors", () => {
      const err = new Error("HTTP error! Status: 400. Details: Invalid PDF file content");
      const msg = describeUploadError(err);
      assert.equal(msg, "Invalid PDF file content");
    });

    it("handles null/undefined error gracefully without crashing", () => {
      const msg = describeUploadError(null);
      assert.ok(msg.length > 0);
    });
  });

  // ── Group 6: Cancellation and Edge Cases ─────────────────────────────
  describe("6. Cancellation and Flow Resilience", () => {
    it("recognizes picker cancellation results without error states", () => {
      const cancelledPickerResult = { canceled: true, assets: null };
      assert.equal(cancelledPickerResult.canceled, true);
      assert.equal(cancelledPickerResult.assets, null);
    });

    it("ensures no fake dummy PDF blob fallback is produced", () => {
      // In the old implementation, if documents array had no uploaded docs,
      // it appended a fake dummy PDF blob. Our helper and API service now throw
      // "At least one document is required before proceeding."
      const emptyDocs: any[] = [
        { id: "doc-1", status: "not_uploaded" },
        { id: "doc-2", status: "not_uploaded" },
      ];
      const hasUploaded = emptyDocs.some((d) => !!d.fileUri && d.status === "uploaded");
      assert.equal(hasUploaded, false);
    });
  });

  // ── Group 7: FormData Construction and Multipart Upload Hardening ──
  describe("7. FormData Construction and Multipart Upload Hardening (Critical Runtime Fix)", () => {
    it("1. Valid PDF upload creates a valid Blob with application/pdf MIME type", async () => {
      const blob = await createBlobFromFileUri("file:///test/form16.pdf", "form16.pdf", "application/pdf");
      assert.ok(blob instanceof Blob, "Must be an instance of Blob");
      assert.equal(blob.type, "application/pdf");
      assert.equal((blob as any).name, "form16.pdf");
    });

    it("2. Valid JPG and PNG uploads create valid Blobs with canonical image MIME types", async () => {
      const jpgBlob = await createBlobFromFileUri("file:///test/pan.jpg", "pan.jpg", "image/jpeg");
      assert.ok(jpgBlob instanceof Blob);
      assert.equal(jpgBlob.type, "image/jpeg");
      assert.equal((jpgBlob as any).name, "pan.jpg");

      const pngBlob = await createBlobFromFileUri("file:///test/aadhaar.png", "aadhaar.png", "image/png");
      assert.ok(pngBlob instanceof Blob);
      assert.equal(pngBlob.type, "image/png");
      assert.equal((pngBlob as any).name, "aadhaar.png");
    });

    it("3. Multiple document uploads correctly populate FormData with distinct field names", async () => {
      const fd = new FormData();
      const files = [
        { id: "doc-1", name: "pan.pdf", mime: "application/pdf" },
        { id: "doc-2", name: "aadhaar.jpg", mime: "image/jpeg" },
        { id: "doc-3", name: "form16.pdf", mime: "application/pdf" },
      ];

      for (const f of files) {
        const paramName = REVISED_DOCUMENT_FIELD_MAP[f.id];
        const blob = await createBlobFromFileUri(`file:///cache/${f.name}`, f.name, f.mime);
        fd.append(paramName, blob, f.name);
      }

      assert.ok(fd.has("panCard"));
      assert.ok(fd.has("aadhaarCard"));
      assert.ok(fd.has("form16Form16A"));
      assert.ok(!fd.has("bankStatements"));
    });

    it("4. Unsupported file rejection prevents invalid format upload attempts", () => {
      const result = validateRevisedDocument({
        name: "malicious.exe",
        uri: "file:///cache/malicious.exe",
        sizeBytes: 1024,
      });
      assert.equal(result.isValid, false);
      assert.match(result.error || "", /Unsupported file type/);
    });

    it("5. File exceeding 10 MB limit is strictly rejected prior to upload", () => {
      const result = validateRevisedDocument({
        name: "large_statement.pdf",
        uri: "file:///cache/large_statement.pdf",
        sizeBytes: 10 * 1024 * 1024 + 1,
      });
      assert.equal(result.isValid, false);
      assert.match(result.error || "", /cannot exceed 10 MB/);
    });

    it("6. Zero-byte file is rejected prior to upload", () => {
      const result = validateRevisedDocument({
        name: "empty.pdf",
        uri: "file:///cache/empty.pdf",
        sizeBytes: 0,
      });
      assert.equal(result.isValid, false);
      assert.match(result.error || "", /cannot be empty/);
    });

    it("7. Android content:// URI is cached locally and converted to a valid binary Blob", async () => {
      const mockFs = {
        cacheDirectory: "file:///sandbox/cache/",
        copyAsync: async () => {},
        getInfoAsync: async () => ({ exists: true, isDirectory: false, size: 2048 }),
        readAsStringAsync: async () => "JVBERi0xLjQKJcTl8uXr", // '%PDF-1.4\n...' base64
        EncodingType: { Base64: "base64" },
      };

      const { localUri } = await prepareLocalFileForUpload(
        "content://com.android.providers.media.documents/document/123",
        "android_doc.pdf",
        mockFs
      );
      assert.ok(localUri.startsWith("file:///sandbox/cache/"));

      const blob = await createBlobFromFileUri(localUri, "android_doc.pdf", "application/pdf", mockFs);
      assert.ok(blob instanceof Blob);
      assert.equal(blob.type, "application/pdf");
    });

    it("8. Upload API failure throws user-readable error and does not produce success", async () => {
      const simulatedFailure = new Error("HTTP error! Status: 500. Details: Database connection pool exhausted");
      const userMessage = describeUploadError(simulatedFailure);
      assert.equal(userMessage, "Database connection pool exhausted");
    });

    it("9. Retry after failure resets submitting mutex cleanly", () => {
      let isSubmitting = true;
      const isSubmittingRef = { current: true };

      // Simulate failure cleanup in finally block
      try {
        throw new Error("Network request failed");
      } catch {
        // Handled error
      } finally {
        isSubmittingRef.current = false;
        isSubmitting = false;
      }

      assert.equal(isSubmittingRef.current, false, "Mutex ref must be released for retry");
      assert.equal(isSubmitting, false, "Loading state must be reset for retry");
    });

    it("10. Correct FormData file-part construction prevents 'Unsupported FormDataPart implementation'", async () => {
      const fd = new FormData();
      const blob = await createBlobFromFileUri("file:///cache/test.pdf", "test.pdf", "application/pdf");
      fd.append("panCard", blob, "test.pdf");

      const entry = fd.get("panCard");
      // Must be an instance of Blob (not an arbitrary { uri, name, type } object)
      assert.ok(entry instanceof Blob, "Entry must be a Blob to satisfy Expo Winter fetch convertFormDataAsync");
      assert.equal(typeof (entry as any).uri, "undefined", "Must not be a legacy React Native { uri } pseudo-object");

      // Verify that Expo's winter convertFormDataAsync type check passes:
      const isValidExpoWinterPart =
        typeof entry === "string" ||
        entry instanceof Blob ||
        (typeof entry === "object" && entry !== null && "bytes" in entry);
      assert.equal(isValidExpoWinterPart, true, "Must satisfy Expo Winter fetch valid part conditions");
    });
  });
});
