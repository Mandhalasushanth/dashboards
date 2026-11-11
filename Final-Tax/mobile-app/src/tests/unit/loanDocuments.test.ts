/// <reference types="node" />
import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  getRequiredDocuments,
  getPersonalLoanDocuments,
} from "../../modules/loans/constants/loanDocuments";
import {
  getLoanDocumentProgress,
  validateLoanDocumentFile,
} from "../../modules/loans/validation/loanDocumentsValidation";
import { formatFileSize } from "../../modules/loans/utils/formatFileSize";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialBusinessFormData,
  createInitialPersonalFormData,
} from "../../modules/loans/store/loansStore.types";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const upload = (documentId: string): LoanDocumentUpload => ({
  id: `${documentId}_1`,
  documentId,
  fileName: `${documentId}.pdf`,
  fileUri: `file:///${documentId}.pdf`,
  fileSize: 1000,
  mimeType: "application/pdf",
  status: "selected",
});

describe("loan document requirements", () => {
  test("business loan and working capital get different document sets", () => {
    const form = createInitialBusinessFormData();
    const business = getRequiredDocuments("business-loan", form).map((d) => d.id);
    const wc = getRequiredDocuments("working-capital", form).map((d) => d.id);
    assert.deepEqual(business, ["pan_card", "business_proof", "bank_statement", "project_quotation"]);
    assert.deepEqual(wc, ["pan_card", "bank_statement", "gst_certificate", "financial_statements"]);
  });

  test("working capital proof depends on GST registration", () => {
    const form = createInitialBusinessFormData();
    form.businessProfile.isGstRegistered = true;
    const gst = getRequiredDocuments("working-capital", form).find((d) => d.id === "gst_certificate");
    assert.equal(gst?.name, "GST Registration Certificate");
    form.businessProfile.isGstRegistered = false;
    const trade = getRequiredDocuments("working-capital", form).find((d) => d.id === "gst_certificate");
    assert.equal(trade?.name, "Business License / Trade Proof");
  });
});

describe("loan document progress", () => {
  const form = createInitialBusinessFormData();
  const requirements = getRequiredDocuments("business-loan", form);
  const mandatory = requirements.filter((r) => r.isMandatory).map((r) => r.id);

  test("required documents block completion", () => {
    const progress = getLoanDocumentProgress(requirements, {});
    assert.equal(progress.isComplete, false);
    assert.deepEqual(progress.missingRequiredIds, mandatory);
  });

  test("optional documents never block completion", () => {
    const uploads = Object.fromEntries(mandatory.map((id) => [id, upload(id)]));
    const progress = getLoanDocumentProgress(requirements, uploads);
    assert.equal(progress.isComplete, true);
    assert.equal(progress.optionalUploaded, 0);
  });

  test("uploads with missing or invalid size metadata do not satisfy requirements", () => {
    const badUploads = {
      pan_card: {
        ...upload("pan_card"),
        fileSize: 0,
      },
      business_proof: upload("business_proof"),
      project_quotation: upload("project_quotation"),
    };
    const progress = getLoanDocumentProgress(requirements, badUploads);
    assert.equal(progress.isComplete, false);
    assert.deepEqual(progress.missingRequiredIds, ["pan_card"]);
  });
});

describe("loan document file validation", () => {
  const [pan] = getRequiredDocuments("business-loan", createInitialBusinessFormData());

  test("accepts PDF and images within the size limit", () => {
    assert.equal(validateLoanDocumentFile({ uri: "u", name: "a.pdf", size: 100, mimeType: "application/pdf" }, pan), null);
    assert.equal(validateLoanDocumentFile({ uri: "u", name: "a.jpg", size: 100 }, pan), null);
  });

  test("rejects unsupported types and oversized files with friendly messages", () => {
    assert.match(validateLoanDocumentFile({ uri: "u", name: "a.docx", size: 100, mimeType: "application/msword" }, pan) ?? "", /isn't supported/);
    assert.match(validateLoanDocumentFile({ uri: "u", name: "a.pdf", size: pan.maxSizeBytes + 1, mimeType: "application/pdf" }, pan) ?? "", /too large/);
  });

  test("rejects missing, zero-byte and unsafe size metadata", () => {
    assert.match(validateLoanDocumentFile({ uri: "u", name: "a.pdf", mimeType: "application/pdf" }, pan) ?? "", /size could not be verified/);
    assert.match(validateLoanDocumentFile({ uri: "u", name: "a.pdf", size: 0, mimeType: "application/pdf" }, pan) ?? "", /empty/);
  });
});

describe("loan document state", () => {
  test("uploaded documents survive step changes and edits to earlier screens", () => {
    const store = useLoansStore;
    store.getState().resetAll();
    store.getState().setDocumentAttachment("pan_card", upload("pan_card"));
    store.getState().setActiveStep("review");
    store.getState().setActiveStep("documents");
    store.getState().setBusinessProfileField("businessName", "Edited Pvt Ltd");
    assert.ok(store.getState().uploadedDocuments.pan_card?.fileUri);
    store.getState().setDocumentAttachment("pan_card", null);
    assert.equal(store.getState().uploadedDocuments.pan_card, undefined);
    store.getState().resetAll();
  });

  test("changing business subtype invalidates a bank statement with different requirements", () => {
    const store = useLoansStore;
    store.getState().resetAll();
    store.getState().setDocumentAttachment("bank_statement", upload("bank_statement"));
    store.getState().setDocumentAttachment("pan_card", upload("pan_card"));

    store.getState().setLoanType("working-capital");
    assert.equal(store.getState().uploadedDocuments.bank_statement, undefined);
    assert.ok(store.getState().uploadedDocuments.pan_card);
    store.getState().resetAll();
  });

  test("changing GST registration invalidates the upload with a different document meaning", () => {
    const store = useLoansStore;
    store.getState().resetAll();
    store.getState().setDocumentAttachment("gst_certificate", upload("gst_certificate"));
    store.getState().setBusinessProfileField("isGstRegistered", true);
    assert.equal(store.getState().uploadedDocuments.gst_certificate, undefined);
    store.getState().resetAll();
  });
});

describe("formatFileSize", () => {
  test("formats bytes, kilobytes and megabytes", () => {
    assert.equal(formatFileSize(0), "0 B");
    assert.equal(formatFileSize(512), "512 B");
    assert.equal(formatFileSize(2048), "2.0 KB");
    assert.equal(formatFileSize(2.5 * 1024 * 1024), "2.5 MB");
  });
});

describe("Personal Loan Bank Statement upload requirements and validation", () => {
  const personalForm = createInitialPersonalFormData();
  const personalDocs = getPersonalLoanDocuments(personalForm);
  const bankStatement = personalDocs.find((d) => d.id === "bank_statement");
  const panCard = personalDocs.find((d) => d.id === "pan_card");

  test("Personal Loan Bank Statement allows ONLY PDF files and ONLY files upload source", () => {
    assert.ok(bankStatement);
    assert.deepEqual(bankStatement?.allowedMimeTypes, ["application/pdf"]);
    assert.deepEqual(bankStatement?.uploadSources, ["files"]);

    // Camera and Gallery are strictly not available
    assert.equal(bankStatement?.uploadSources.includes("camera"), false);
    assert.equal(bankStatement?.uploadSources.includes("gallery" as any), false);
  });

  test("Other personal loan documents (PAN Card) keep camera and image types", () => {
    assert.ok(panCard);
    assert.ok(panCard?.uploadSources.includes("camera"));
    assert.ok(panCard?.uploadSources.includes("files"));
    assert.ok(panCard?.allowedMimeTypes.includes("image/jpeg"));
    assert.ok(panCard?.allowedMimeTypes.includes("image/png"));
  });

  test("accepts valid PDF within size limit", () => {
    assert.ok(bankStatement);
    const validPdf = {
      uri: "file:///docs/bank_statement.pdf",
      name: "bank_statement.pdf",
      size: 2 * 1024 * 1024,
      mimeType: "application/pdf",
    };
    assert.equal(validateLoanDocumentFile(validPdf, bankStatement!), null);
  });

  test("rejects JPG image files with clear PDF validation message", () => {
    assert.ok(bankStatement);
    const jpgFile = {
      uri: "file:///docs/bank_statement.jpg",
      name: "bank_statement.jpg",
      size: 500 * 1024,
      mimeType: "image/jpeg",
    };
    const err = validateLoanDocumentFile(jpgFile, bankStatement!);
    assert.equal(err, "Please upload your bank statement as a PDF.");
  });

  test("rejects JPEG image files with clear PDF validation message", () => {
    assert.ok(bankStatement);
    const jpegFile = {
      uri: "file:///docs/statement.jpeg",
      name: "statement.jpeg",
      size: 500 * 1024,
      mimeType: "image/jpeg",
    };
    const err = validateLoanDocumentFile(jpegFile, bankStatement!);
    assert.equal(err, "Please upload your bank statement as a PDF.");
  });

  test("rejects PNG image files with clear PDF validation message", () => {
    assert.ok(bankStatement);
    const pngFile = {
      uri: "file:///docs/statement.png",
      name: "statement.png",
      size: 500 * 1024,
      mimeType: "image/png",
    };
    const err = validateLoanDocumentFile(pngFile, bankStatement!);
    assert.equal(err, "Please upload your bank statement as a PDF.");
  });

  test("rejects WEBP image files with clear PDF validation message", () => {
    assert.ok(bankStatement);
    const webpFile = {
      uri: "file:///docs/statement.webp",
      name: "statement.webp",
      size: 500 * 1024,
      mimeType: "image/webp",
    };
    const err = validateLoanDocumentFile(webpFile, bankStatement!);
    assert.equal(err, "Please upload your bank statement as a PDF.");
  });

  test("rejects renamed image pretending to be PDF", () => {
    assert.ok(bankStatement);
    // File renamed to .pdf extension but actual mime type is image
    const fakePdfJpg = {
      uri: "file:///docs/renamed_image.pdf",
      name: "renamed_image.pdf",
      size: 500 * 1024,
      mimeType: "image/jpeg",
    };
    const errJpg = validateLoanDocumentFile(fakePdfJpg, bankStatement!);
    assert.equal(errJpg, "Please upload your bank statement as a PDF.");

    const fakePdfPng = {
      uri: "file:///docs/renamed_image.pdf",
      name: "renamed_image.pdf",
      size: 500 * 1024,
      mimeType: "image/png",
    };
    const errPng = validateLoanDocumentFile(fakePdfPng, bankStatement!);
    assert.equal(errPng, "Please upload your bank statement as a PDF.");
  });

  test("enforces size validation on oversized PDF files", () => {
    assert.ok(bankStatement);
    const oversizedPdf = {
      uri: "file:///docs/large_statement.pdf",
      name: "large_statement.pdf",
      size: 11 * 1024 * 1024, // 11 MB > 10 MB
      mimeType: "application/pdf",
    };
    const err = validateLoanDocumentFile(oversizedPdf, bankStatement!);
    assert.match(err ?? "", /too large/);
    assert.match(err ?? "", /10 MB/);
  });
});
