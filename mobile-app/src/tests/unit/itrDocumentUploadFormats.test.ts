/**
 * Bug 5 — ITR Document Upload: Support All Backend-Supported Formats
 *
 * Tests frontend validation and MIME/extension handling against
 * backend constraints defined in com.finsolz.validator.GstFileUploadValidator:
 * - Allowed content types:
 *     application/pdf
 *     image/jpeg
 *     image/png
 *     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *     application/vnd.ms-excel
 * - Supported extensions:
 *     pdf, jpg, jpeg, png, xlsx, xls
 * - Rejection of unsupported types (.doc, .docx, .csv, .json, .exe, .zip, etc.)
 * - Handling of generic/missing MIME types (application/octet-stream, wildcards)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  ITR_ALLOWED_EXTENSIONS,
  ITR_MIME_TYPES,
  BACKEND_ALLOWED_CONTENT_TYPES,
  getFileExtension,
  resolveItrMimeType,
  resolveExtensionFromMime,
  isItrSupportedFile,
  getItrAcceptedFormatsString,
} from "../../modules/itr/utils/itrDocumentUploadHelper";
import {
  resolveDriveDocumentMimeType,
  DRIVE_EXTENSION_MIME_MAP,
} from "../../shared/utils/driveDocumentMime";

describe("1. Backend-Supported Extensions and MIME Types Alignment", () => {
  it("includes all 5 canonical backend format categories across 6 extensions", () => {
    assert.deepEqual([...ITR_ALLOWED_EXTENSIONS], ["pdf", "jpg", "jpeg", "png", "xlsx", "xls"]);
    assert.equal(DRIVE_EXTENSION_MIME_MAP["pdf"], "application/pdf");
    assert.equal(
      DRIVE_EXTENSION_MIME_MAP["xlsx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("maps each extension to its exact authoritative backend Content-Type", () => {
    assert.equal(ITR_MIME_TYPES["pdf"], "application/pdf");
    assert.equal(ITR_MIME_TYPES["jpg"], "image/jpeg");
    assert.equal(ITR_MIME_TYPES["jpeg"], "image/jpeg");
    assert.equal(ITR_MIME_TYPES["png"], "image/png");
    assert.equal(
      ITR_MIME_TYPES["xlsx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    assert.equal(ITR_MIME_TYPES["xls"], "application/vnd.ms-excel");
  });

  it("authoritative content-types set matches backend ALLOWED_CONTENT_TYPES exactly", () => {
    assert.equal(BACKEND_ALLOWED_CONTENT_TYPES.has("application/pdf"), true);
    assert.equal(BACKEND_ALLOWED_CONTENT_TYPES.has("image/jpeg"), true);
    assert.equal(BACKEND_ALLOWED_CONTENT_TYPES.has("image/png"), true);
    assert.equal(
      BACKEND_ALLOWED_CONTENT_TYPES.has(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ),
      true
    );
    assert.equal(BACKEND_ALLOWED_CONTENT_TYPES.has("application/vnd.ms-excel"), true);
    assert.equal(BACKEND_ALLOWED_CONTENT_TYPES.size, 5);
  });
});

describe("2. Supported Formats Validation (isItrSupportedFile)", () => {
  it("accepts all backend-supported document extensions", () => {
    const validNames = [
      "Form16.pdf",
      "FORM16_PART_A.PDF",
      "TaxCredit_26AS.pdf",
      "salary_slip.jpg",
      "PAN_Card.JPEG",
      "BankStatement.png",
      "TradingPnL.xlsx",
      "TRADING_STATEMENT.XLSX",
      "BalanceSheet.xls",
      "TURNOVER_2023.XLS",
    ];

    for (const name of validNames) {
      assert.equal(
        isItrSupportedFile(name),
        true,
        `Expected ${name} to be supported by extension`
      );
    }
  });

  it("accepts valid files based on canonical MIME type even when extension is missing", () => {
    assert.equal(isItrSupportedFile("uploaded_doc_blob", "application/pdf"), true);
    assert.equal(isItrSupportedFile("camera_capture", "image/jpeg"), true);
    assert.equal(isItrSupportedFile("screenshot_blob", "image/png"), true);
    assert.equal(
      isItrSupportedFile(
        "pnl_export",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ),
      true
    );
    assert.equal(isItrSupportedFile("ledger_data", "application/vnd.ms-excel"), true);
  });
});

describe("3. Unsupported Formats and Invalid Files Rejection", () => {
  it("rejects non-backend formats (.doc, .docx, .csv, .json, .txt, etc.)", () => {
    const unsupported = [
      "summary.doc",
      "agreement.docx",
      "bank_export.csv",
      "transactions.tsv",
      "schema.json",
      "records.xml",
      "notes.txt",
      "archive.zip",
      "backup.tar.gz",
      "exploit.exe",
      "script.sh",
      "batch.bat",
    ];

    for (const name of unsupported) {
      assert.equal(
        isItrSupportedFile(name),
        false,
        `Expected unsupported file ${name} to be rejected`
      );
    }
  });

  it("rejects invalid, empty, or undefined files", () => {
    assert.equal(isItrSupportedFile(""), false);
    assert.equal(isItrSupportedFile(undefined), false);
    assert.equal(isItrSupportedFile(null as any), false);
    assert.equal(isItrSupportedFile("no_extension_file"), false);
    assert.equal(isItrSupportedFile("no_extension_file", "application/octet-stream"), false);
    assert.equal(isItrSupportedFile("file.xyz", "application/octet-stream"), false);
  });
});

describe("4. MIME Type and Extension Resolution for Generic / Missing Types", () => {
  it("resolves Excel XLSX canonical MIME type when MIME is missing or generic", () => {
    assert.equal(
      resolveItrMimeType("Report.xlsx", undefined),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    assert.equal(
      resolveItrMimeType("Report.xlsx", "application/octet-stream"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    assert.equal(
      resolveItrMimeType("Report.xlsx", "*/*"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("resolves Excel XLS canonical MIME type when MIME is missing or generic", () => {
    assert.equal(resolveItrMimeType("Balance.xls", undefined), "application/vnd.ms-excel");
    assert.equal(
      resolveItrMimeType("Balance.xls", "application/octet-stream"),
      "application/vnd.ms-excel"
    );
  });

  it("resolves PDF, PNG, and JPEG canonical MIME types when generic", () => {
    assert.equal(resolveItrMimeType("Form16.pdf", "*/*"), "application/pdf");
    assert.equal(resolveItrMimeType("Doc.png", "application/octet-stream"), "image/png");
    assert.equal(resolveItrMimeType("Photo.jpg", undefined), "image/jpeg");
    assert.equal(resolveItrMimeType("Photo.jpeg", undefined), "image/jpeg");
  });

  it("resolves file extension from canonical MIME type when filename has no extension", () => {
    assert.equal(resolveExtensionFromMime("application/pdf"), "pdf");
    assert.equal(resolveExtensionFromMime("image/jpeg"), "jpg");
    assert.equal(resolveExtensionFromMime("image/png"), "png");
    assert.equal(
      resolveExtensionFromMime(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ),
      "xlsx"
    );
    assert.equal(resolveExtensionFromMime("application/vnd.ms-excel"), "xls");
  });

  it("getFileExtension handles URLs with queries and hashes safely", () => {
    assert.equal(getFileExtension("https://cloud.com/files/doc.xlsx?token=123#frag"), "xlsx");
    assert.equal(getFileExtension("file:///cache/doc.pdf?version=2"), "pdf");
    assert.equal(getFileExtension("simple.PNG"), "png");
  });

  it("getItrAcceptedFormatsString returns clean display list", () => {
    assert.equal(getItrAcceptedFormatsString(), "PDF, JPG, JPEG, PNG, XLSX, XLS");
  });
});

describe("5. Component and Service Integration Integrity", () => {
  const sharedCardPath = path.resolve(
    __dirname,
    "../../modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard.tsx"
  );
  const checklistPath = path.resolve(
    __dirname,
    "../../modules/itr/itr-filing/components/Step4DocumentChecklist/Step4DocumentChecklist.tsx"
  );
  const modalPath = path.resolve(
    __dirname,
    "../../modules/itr/itr-filing/components/DocumentUploadModal/DocumentUploadModal.tsx"
  );
  const instructionCardPath = path.resolve(
    __dirname,
    "../../modules/itr/components/documents/UploadInstructionCard/UploadInstructionCard.tsx"
  );
  const apiServicePath = path.resolve(
    __dirname,
    "../../modules/itr/itr-filing/services/ItrApiService.ts"
  );
  const driveUploaderPath = path.resolve(
    __dirname,
    "../../shared/utils/driveDocumentUploader.ts"
  );

  const sharedCardContent = fs.readFileSync(sharedCardPath, "utf-8");
  const checklistContent = fs.readFileSync(checklistPath, "utf-8");
  const modalContent = fs.readFileSync(modalPath, "utf-8");
  const instructionCardContent = fs.readFileSync(instructionCardPath, "utf-8");
  const apiServiceContent = fs.readFileSync(apiServicePath, "utf-8");
  const driveUploaderContent = fs.readFileSync(driveUploaderPath, "utf-8");

  it("SharedItrDocumentCard uses ITR_ALLOWED_EXTENSIONS and resolves canonical MIME", () => {
    assert.equal(sharedCardContent.includes("ITR_ALLOWED_EXTENSIONS"), true);
    assert.equal(sharedCardContent.includes("resolveItrMimeType"), true);
    assert.equal(sharedCardContent.includes("isItrSupportedFile"), true);
    assert.equal(sharedCardContent.includes("json"), false);
    assert.equal(sharedCardContent.includes("docx"), false);
  });

  it("Step4DocumentChecklist passes allowedExtensions to SharedItrDocumentCard", () => {
    assert.equal(checklistContent.includes("allowedExtensions={[...ITR_ALLOWED_EXTENSIONS]}"), true);
  });

  it("DocumentUploadModal uses ITR_ALLOWED_EXTENSIONS and resolveItrMimeType", () => {
    assert.equal(modalContent.includes("allowedExtensions: [...ITR_ALLOWED_EXTENSIONS]"), true);
    assert.equal(modalContent.includes("resolveItrMimeType"), true);
    assert.equal(modalContent.includes('"json"'), false);
    assert.equal(modalContent.includes('"docx"'), false);
  });

  it("UploadInstructionCard states XLS and XLSX in supported formats", () => {
    assert.equal(
      instructionCardContent.includes("Supported formats: PDF, JPG, PNG, XLS, XLSX"),
      true
    );
  });

  it("ItrApiService maps capital gains and business turnover, and resolves canonical MIME for Excel files", () => {
    assert.equal(apiServiceContent.includes('"doc-capital-gains": "capitalGainsStatement"'), true);
    assert.equal(apiServiceContent.includes('"doc-business-turnover": "businessTurnover"'), true);
    assert.equal(apiServiceContent.includes("resolveItrMimeType(doc.fileName, doc.mimeType)"), true);
  });

  it("driveDocumentUploader delegates to resolveDriveDocumentMimeType without JPEG fallback", () => {
    assert.equal(driveUploaderContent.includes("resolveDriveDocumentMimeType"), true);
    assert.equal(driveUploaderContent.includes('else mimeType = "image/jpeg"'), false);
    assert.equal(driveUploaderContent.includes("DRIVE_EXTENSION_MIME_MAP"), true);
  });
});

describe("6. Bug 1 Regression Tests — Strict Security & API Alignment", () => {
  it(".exe with application/pdf — reject", () => {
    assert.equal(isItrSupportedFile("malware.exe", "application/pdf"), false);
    assert.equal(resolveDriveDocumentMimeType("exe", "application/pdf"), null);
    assert.equal(resolveItrMimeType("malware.exe", "application/pdf"), "application/octet-stream");
  });

  it(".pdf with image/jpeg — reject", () => {
    assert.equal(isItrSupportedFile("document.pdf", "image/jpeg"), false);
    assert.equal(resolveDriveDocumentMimeType("pdf", "image/jpeg"), null);
    assert.equal(resolveItrMimeType("document.pdf", "image/jpeg"), "application/octet-stream");
  });

  it(".xlsx with generic MIME — accept and resolve canonical MIME", () => {
    assert.equal(isItrSupportedFile("spreadsheet.xlsx", "application/octet-stream"), true);
    assert.equal(
      resolveItrMimeType("spreadsheet.xlsx", "application/octet-stream"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    assert.equal(
      resolveDriveDocumentMimeType("xlsx", "application/octet-stream"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    assert.equal(isItrSupportedFile("spreadsheet.xlsx", "*/*"), true);
    assert.equal(
      resolveItrMimeType("spreadsheet.xlsx", "*/*"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it(".pdf with missing MIME — accept and resolve canonical MIME", () => {
    assert.equal(isItrSupportedFile("form16.pdf", undefined), true);
    assert.equal(resolveItrMimeType("form16.pdf", undefined), "application/pdf");
    assert.equal(resolveDriveDocumentMimeType("pdf", undefined), "application/pdf");
  });

  it("unsupported extension with missing MIME — reject", () => {
    assert.equal(isItrSupportedFile("report.docx", undefined), false);
    assert.equal(isItrSupportedFile("payroll.csv", undefined), false);
    assert.equal(isItrSupportedFile("malware.exe", undefined), false);
    assert.equal(resolveDriveDocumentMimeType("exe", undefined), null);
    assert.equal(resolveDriveDocumentMimeType("unknown", undefined), null);
  });

  it("unknown extension passed to drive uploader — reject, never default to JPEG", () => {
    const unknownExts = ["unknown", "exe", "zip", "tar", "bin", "sh", "bat", "py"];
    for (const ext of unknownExts) {
      const resMissing = resolveDriveDocumentMimeType(ext, undefined);
      const resGeneric = resolveDriveDocumentMimeType(ext, "application/octet-stream");
      assert.equal(resMissing, null, `Expected extension ${ext} with missing MIME to return null`);
      assert.notEqual(resMissing, "image/jpeg", `Expected extension ${ext} not to default to JPEG`);
      assert.equal(resGeneric, null, `Expected extension ${ext} with generic MIME to return null`);
      assert.notEqual(resGeneric, "image/jpeg", `Expected extension ${ext} not to default to JPEG`);
    }
  });
});
