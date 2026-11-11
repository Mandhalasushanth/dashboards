/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  extractAllApplicationDocuments,
  normalizeDraftDocuments,
} from "../../store/applicationDraftMappers";
import type { Application } from "../../types/domain";

test("extractAllApplicationDocuments: extracts GST Compliance reconciliation documents", () => {
  const app: Partial<Application> = {
    id: "CMP-RECON-1",
    serviceId: "gst-compliance",
    serviceName: "GST Compliance - Reconciliation Support",
    formData: {
      requestType: "Reconciliation Support",
      purchaseDoc: {
        name: "purchase_aug_2025.xlsx",
        uri: "file:///documents/purchase_aug_2025.xlsx",
        sizeFormatted: "1.2 MB",
        category: "Purchase Register",
      },
      salesDoc: {
        name: "sales_aug_2025.pdf",
        uri: "file:///documents/sales_aug_2025.pdf",
        sizeFormatted: "450 KB",
        category: "Sales Register",
      },
    },
    documents: [],
  };

  const docs = extractAllApplicationDocuments(app);
  assert.equal(docs.length, 2, "Expected 2 documents extracted");

  const purchase = docs.find((d) => d.category === "Purchase Register");
  assert.ok(purchase, "Purchase register document must be found");
  assert.equal(purchase.name, "purchase_aug_2025.xlsx");
  assert.equal(purchase.status, "Uploaded");
  assert.equal(purchase.fileUri, "file:///documents/purchase_aug_2025.xlsx");
  assert.equal(purchase.fileSize, "1.2 MB");

  const sales = docs.find((d) => d.category === "Sales Register");
  assert.ok(sales, "Sales register document must be found");
  assert.equal(sales.name, "sales_aug_2025.pdf");
  assert.equal(sales.status, "Uploaded");
  assert.equal(sales.fileUri, "file:///documents/sales_aug_2025.pdf");
  assert.equal(sales.fileSize, "450 KB");
});

test("extractAllApplicationDocuments: extracts GST Compliance notice response document", () => {
  const app: Partial<Application> = {
    id: "CMP-NOTICE-1",
    serviceId: "gst-compliance",
    serviceName: "GST Compliance - Notice Response",
    formData: {
      requestType: "Notice Response",
      noticeNumber: "DRC-01-2025-9988",
      noticeDoc: {
        name: "GST_Notice_DRC01.pdf",
        uri: "file:///data/notices/GST_Notice_DRC01.pdf",
        sizeFormatted: "2.4 MB",
        category: "Notice Copy",
      },
    },
    documents: [],
  };

  const docs = extractAllApplicationDocuments(app);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].name, "GST_Notice_DRC01.pdf");
  assert.equal(docs[0].status, "Uploaded");
  assert.equal(docs[0].category, "Notice Copy");
  assert.equal(docs[0].fileUri, "file:///data/notices/GST_Notice_DRC01.pdf");
  assert.equal(docs[0].fileSize, "2.4 MB");
});

test("extractAllApplicationDocuments: backward compatibility merges placeholder docs with formData", () => {
  const app: Partial<Application> = {
    id: "CMP-HISTORICAL",
    serviceId: "gst-compliance",
    documents: [
      { name: "Purchase Register", status: "Pending" },
      { name: "Sales Register", status: "Pending" },
    ],
    formData: {
      purchaseDoc: {
        name: "Purchase_Book.xlsx",
        uri: "file:///storage/Purchase_Book.xlsx",
        sizeFormatted: "890 KB",
        category: "Purchase Register",
      },
    },
  };

  const docs = extractAllApplicationDocuments(app, app.documents);
  const purchase = docs.find((d) => d.category === "Purchase Register" || d.name === "Purchase_Book.xlsx");
  assert.ok(purchase, "Purchase document must be merged");
  assert.equal(purchase.status, "Uploaded", "Status must be upgraded to Uploaded");
  assert.equal(purchase.fileUri, "file:///storage/Purchase_Book.xlsx");
  assert.equal(purchase.fileSize, "890 KB");

  const sales = docs.find((d) => d.name === "Sales Register");
  assert.ok(sales, "Pending sales document is retained");
  assert.equal(sales.status, "Pending");
});

test("extractAllApplicationDocuments: handles GST Amendment supporting proof", () => {
  const app: Partial<Application> = {
    id: "ARN-AMD-2025-01",
    serviceId: "gst-amendment",
    formData: {
      section: "Principal Place of Business",
      document: {
        name: "Electricity_Bill_Oct25.pdf",
        uri: "file:///uploads/Electricity_Bill_Oct25.pdf",
        size: "340 KB",
      },
    },
  };

  const docs = extractAllApplicationDocuments(app);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].name, "Electricity_Bill_Oct25.pdf");
  assert.equal(docs[0].status, "Uploaded");
  assert.equal(docs[0].category, "Principal Place of Business");
  assert.equal(docs[0].fileUri, "file:///uploads/Electricity_Bill_Oct25.pdf");
  assert.equal(docs[0].fileSize, "340 KB");
});

test("extractAllApplicationDocuments: handles Loan applications with uploadedDocuments", () => {
  const app: Partial<Application> = {
    id: "LOAN-BIZ-101",
    serviceId: "business-loan",
    formData: {
      uploadedDocuments: [
        {
          name: "Bank_Statement_6M.pdf",
          fileUri: "file:///loans/Bank_Statement_6M.pdf",
          fileSize: "4.1 MB",
          category: "Bank Statement",
          status: "Uploaded",
        },
        {
          name: "ITR_V_AY2024.pdf",
          fileUri: "file:///loans/ITR_V_AY2024.pdf",
          fileSize: "1.2 MB",
          category: "ITR Ack",
          status: "Uploaded",
        },
      ],
    },
  };

  const docs = extractAllApplicationDocuments(app);
  assert.equal(docs.length, 2);
  assert.equal(docs[0].name, "Bank_Statement_6M.pdf");
  assert.equal(docs[0].status, "Uploaded");
  assert.equal(docs[1].name, "ITR_V_AY2024.pdf");
  assert.equal(docs[1].status, "Uploaded");
});

test("extractAllApplicationDocuments: handles TDS refund checklist documents", () => {
  const app: Partial<Application> = {
    id: "TDS-REF-2025",
    serviceId: "tds-refund",
    formData: {
      checklist: [
        {
          id: "form16",
          title: "Form 16 Part A & B",
          fileUri: "file:///tds/Form16.pdf",
          status: "uploaded",
          size: "520 KB",
        },
        {
          id: "form26as",
          title: "Form 26AS Tax Credit",
          fileUri: "file:///tds/26AS.pdf",
          status: "uploaded",
          size: "310 KB",
        },
      ],
    },
  };

  const docs = extractAllApplicationDocuments(app);
  assert.equal(docs.length, 2);
  assert.equal(docs[0].name, "Form 16 Part A & B");
  assert.equal(docs[0].status, "Uploaded");
  assert.equal(docs[1].name, "Form 26AS Tax Credit");
  assert.equal(docs[1].status, "Uploaded");
});

test("extractAllApplicationDocuments: handles GST Certificate generated PDF", () => {
  const app: Partial<Application> = {
    id: "CERT-REG06",
    serviceId: "gst-certificate",
    formData: {
      gstin: "27AABCU9603R1ZM",
      pdfUri: "file:///certificates/GST_REG06_27AABCU9603R1ZM.pdf",
      fileName: "GST_REG06_27AABCU9603R1ZM.pdf",
    },
  };

  const docs = extractAllApplicationDocuments(app);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].name, "GST_REG06_27AABCU9603R1ZM.pdf");
  assert.equal(docs[0].status, "Uploaded");
  assert.equal(docs[0].category, "Certificate");
  assert.equal(docs[0].fileUri, "file:///certificates/GST_REG06_27AABCU9603R1ZM.pdf");
});

test("extractAllApplicationDocuments: handles GST Registration documents with metadata", () => {
  const app: Partial<Application> = {
    id: "GST-REG-100",
    serviceId: "gst-registration",
    documents: [
      {
        name: "PAN Card",
        status: "Uploaded",
        fileUri: "file:///uploads/pan.jpg",
        fileName: "pan.jpg",
        fileSize: "512 KB",
        category: "Identity Proof",
      },
      {
        name: "Electricity Bill",
        status: "Uploaded",
        fileUri: "file:///uploads/elec.pdf",
        fileName: "elec.pdf",
        fileSize: "1.1 MB",
        category: "Principal Place of Business",
      },
    ],
  };

  const docs = extractAllApplicationDocuments(app);
  assert.equal(docs.length, 2);
  assert.equal(docs[0].name, "PAN Card");
  assert.equal(docs[0].fileUri, "file:///uploads/pan.jpg");
  assert.equal(docs[0].fileSize, "512 KB");
  assert.equal(docs[1].name, "Electricity Bill");
  assert.equal(docs[1].fileUri, "file:///uploads/elec.pdf");
});

test("Independent application isolation: two distinct applications retain separate documents", () => {
  const appA: Partial<Application> = {
    id: "APP-A",
    serviceId: "gst-compliance",
    formData: {
      purchaseDoc: { name: "Purchase_A.pdf", uri: "file:///a.pdf", sizeFormatted: "100 KB" },
    },
  };
  const appB: Partial<Application> = {
    id: "APP-B",
    serviceId: "gst-filing",
    formData: {
      documents: [{ name: "Filing_B.pdf", fileUri: "file:///b.pdf", fileSize: "200 KB", status: "Uploaded" }],
    },
  };

  const docsA = extractAllApplicationDocuments(appA);
  const docsB = extractAllApplicationDocuments(appB);

  assert.equal(docsA.length, 1);
  assert.equal(docsA[0].name, "Purchase_A.pdf");
  assert.equal(docsA[0].fileUri, "file:///a.pdf");

  assert.equal(docsB.length, 1);
  assert.equal(docsB[0].name, "Filing_B.pdf");
  assert.equal(docsB[0].fileUri, "file:///b.pdf");

  // No cross pollution
  assert.ok(!docsA.some((d) => d.name === "Filing_B.pdf"));
  assert.ok(!docsB.some((d) => d.name === "Purchase_A.pdf"));
});

test("normalizeDraftDocuments extracts documents from service drafts", () => {
  const draft = {
    serviceKey: "gst-compliance",
    step: 1,
    formData: {
      purchaseDoc: { name: "draft_purchase.pdf", uri: "file:///draft/purchase.pdf", sizeFormatted: "300 KB" },
    },
  };

  const docs = normalizeDraftDocuments(draft);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].name, "draft_purchase.pdf");
  assert.equal(docs[0].status, "Uploaded");
  assert.equal(docs[0].fileUri, "file:///draft/purchase.pdf");
});

test("GST Compliance Service source contract: mappedDocs passed with status Uploaded and fileUri", () => {
  const fullPath = path.join(process.cwd(), "src/modules/gst/services/gstComplianceService.ts");
  const content = fs.readFileSync(fullPath, "utf-8");

  assert.ok(content.includes("mappedDocs"), "gstComplianceService must create mappedDocs");
  assert.ok(content.includes('status: "Uploaded"'), "mappedDocs must set status to Uploaded");
  assert.ok(content.includes("fileUri: d.uri"), "mappedDocs must set fileUri to d.uri");
  assert.ok(content.includes("documents: mappedDocs"), "createApplication formData must include documents: mappedDocs");
  assert.ok(content.includes("purchaseDoc: data.purchaseDoc"), "createApplication formData must include purchaseDoc");
  assert.ok(content.includes("salesDoc: data.salesDoc"), "createApplication formData must include salesDoc");
  assert.ok(content.includes("noticeDoc: data.noticeDoc"), "createApplication formData must include noticeDoc");
});

test("Application Store source contract: createApplication normalizes and enriches documents", () => {
  const fullPath = path.join(process.cwd(), "src/store/applicationStore.ts");
  const content = fs.readFileSync(fullPath, "utf-8");

  assert.ok(content.includes("extractAllApplicationDocuments"), "applicationStore must import and use extractAllApplicationDocuments");
  assert.ok(content.includes("documents: extractAllApplicationDocuments("), "documents must be normalized via extractAllApplicationDocuments in createApplication");
});

test("DocumentsTab source contract: uses extractAllApplicationDocuments and supports eye preview", () => {
  const fullPath = path.join(process.cwd(), "src/components/screens/application/DocumentsTab.tsx");
  const content = fs.readFileSync(fullPath, "utf-8");

  assert.ok(content.includes("extractAllApplicationDocuments"), "DocumentsTab must use extractAllApplicationDocuments");
  assert.ok(content.includes("GstViewDocumentModal"), "DocumentsTab must import GstViewDocumentModal");
  assert.ok(content.includes("setPreviewDoc"), "DocumentsTab must use setPreviewDoc");
  assert.ok(content.includes("styles.docEyeButton"), "DocumentsTab must render docEyeButton");
  assert.ok(content.includes("name=\"eye-outline\""), "DocumentsTab must render eye-outline icon");
});

test("All modified source files strictly remain below 400 lines", () => {
  const modifiedFiles = [
    "src/types/domain.ts",
    "src/store/applicationDraftMappers.ts",
    "src/store/applicationStore.ts",
    "src/modules/gst/services/gstComplianceService.ts",
    "src/modules/gst/gst-filing/hooks/gstFilingHelpers.ts",
    "src/modules/gst/gst-filing/hooks/gstFilingStepHandlers.ts",
    "src/modules/gst/gst-amendment/services/submitAmendmentService.ts",
    "src/components/screens/application/DocumentsTab.tsx",
    "src/app/application/[id].tsx",
  ];

  for (const relPath of modifiedFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    assert.ok(fs.existsSync(fullPath), `File must exist: ${relPath}`);
    const content = fs.readFileSync(fullPath, "utf-8");
    const lineCount = content.split(/\r?\n/).length;
    assert.ok(
      lineCount < 400,
      `File ${relPath} has ${lineCount} lines, which exceeds the 400-line strict limit!`
    );
  }
});
