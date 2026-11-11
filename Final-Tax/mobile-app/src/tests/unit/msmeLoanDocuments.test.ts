/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, test, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { useAuthStore } from "../../modules/authentication/store/authStore";
import {
  getLoanDocumentChecklist,
  getLoanDocumentProgress,
} from "../../modules/loans/validation/loanDocumentsValidation";
import { resolveLoanDocumentRequirements } from "../../modules/loans/constants/loanDocumentResolver";
import {
  getMsmeLoanDocuments,
  MSME_DOCUMENT_IDS,
  isUdyamRegistered,
  isGstRegistered,
} from "../../modules/loans/msme/constants/msmeDocuments";
import {
  createInitialMsmeLoanFormData,
  type MsmeLoanFormData,
} from "../../modules/loans/msme/types/msmeLoan.types";
import { validateReviewSubmission } from "../../modules/loans/validation/loanReviewValidation";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import { getContinueLabel } from "../../modules/loans/constants/continueLabels";
import { buildReviewSections } from "../../modules/loans/utils/loanReviewSummary";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";

const validKyc: LoanKycData = {
  fullName: "Ananya Sharma",
  mobile: "9876543210",
  email: "ananya.sharma@example.com",
  pan: "ABCPE1234F",
  aadhaar: "234567890123",
  dob: "15-08-1985",
  currentAddress: {
    houseNumber: "Flat 402, Tech Park",
    street: "Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
  },
  isPermanentSameAsCurrent: true,
  permanentAddress: {
    houseNumber: "Flat 402, Tech Park",
    street: "Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
  },
  consentGiven: true,
  isProfilePrefilled: false,
};

const validMsmeBase: MsmeLoanFormData = {
  ...createInitialMsmeLoanFormData(),
  businessName: "Zenith Bio-Tech Solutions Pvt Ltd",
  constitution: "Private Limited Company",
  businessActivity: "Manufacturing",
  establishmentDate: "15-06-2018",
  operatingAddress: {
    houseNumber: "Plot 42",
    street: "Whitefield Main Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560066",
  },
  udyamStatus: "Registered",
  udyamRegistrationNumber: "UDYAM-KR-03-0012345",
  gstStatus: "Registered",
  gstin: "29ABCDE1234F1Z5",
  operatingDuration: "5–10 years",
  numberOfEmployees: "25",
  annualTurnover: "8500000",
  ownershipType: "Sole Owner",
};

const mockUpload = (docId: string, name: string): LoanDocumentUpload => ({
  id: `${docId}_test_upload`,
  documentId: docId,
  fileName: name,
  fileUri: `file:///${name}`,
  fileSize: 204800,
  mimeType: "application/pdf",
  status: "selected",
});

describe("MSME Loan Screen 3 Dynamic Document Logic & Architecture Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
    });
  });

  // =========================================================================
  // 1. DYNAMIC DOCUMENT REQUIREMENTS DETERMINATION
  // =========================================================================
  test("1. Udyam = Yes → Udyam certificate appears", () => {
    // Both "Yes" and "Registered" represent Udyam registered
    const formYes: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes",
      gstStatus: "No",
    };
    const reqsYes = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formYes,
    });
    assert.equal(reqsYes.length, 1);
    assert.equal(reqsYes[0].id, MSME_DOCUMENT_IDS.udyamCertificate);
    assert.equal(reqsYes[0].name, "Udyam Registration Certificate");
    assert.equal(reqsYes[0].isMandatory, true);

    const formRegistered: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Registered",
      gstStatus: "Not Registered",
    };
    const reqsReg = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formRegistered,
    });
    assert.equal(reqsReg.length, 1);
    assert.equal(reqsReg[0].id, MSME_DOCUMENT_IDS.udyamCertificate);
  });

  test("2. Udyam = No → Udyam certificate does not appear", () => {
    const formNo: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "No",
      gstStatus: "Yes",
    };
    const reqsNo = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formNo,
    });
    assert.equal(reqsNo.some((r) => r.id === MSME_DOCUMENT_IDS.udyamCertificate), false);

    const formNotReg: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Not Registered",
      gstStatus: "Registered",
    };
    const reqsNotReg = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formNotReg,
    });
    assert.equal(reqsNotReg.some((r) => r.id === MSME_DOCUMENT_IDS.udyamCertificate), false);
  });

  test("3. GST = Yes → GST certificate appears", () => {
    const formYes: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "No",
      gstStatus: "Yes",
    };
    const reqsYes = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formYes,
    });
    assert.equal(reqsYes.length, 1);
    assert.equal(reqsYes[0].id, MSME_DOCUMENT_IDS.gstCertificate);
    assert.equal(reqsYes[0].name, "GST Registration Certificate");
    assert.equal(reqsYes[0].isMandatory, true);

    const formRegistered: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Not Registered",
      gstStatus: "Registered",
    };
    const reqsReg = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formRegistered,
    });
    assert.equal(reqsReg.length, 1);
    assert.equal(reqsReg[0].id, MSME_DOCUMENT_IDS.gstCertificate);
  });

  test("4. GST = No → GST certificate does not appear", () => {
    const formNo: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes",
      gstStatus: "No",
    };
    const reqsNo = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formNo,
    });
    assert.equal(reqsNo.some((r) => r.id === MSME_DOCUMENT_IDS.gstCertificate), false);

    const formExempt: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Registered",
      gstStatus: "Exempt",
    };
    const reqsExempt = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formExempt,
    });
    assert.equal(reqsExempt.some((r) => r.id === MSME_DOCUMENT_IDS.gstCertificate), false);
  });

  test("5. Both Yes → both certificates appear", () => {
    const formBothYes: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes",
      gstStatus: "Yes",
    };
    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formBothYes,
    });
    assert.deepEqual(
      reqs.map((r) => r.id),
      [MSME_DOCUMENT_IDS.udyamCertificate, MSME_DOCUMENT_IDS.gstCertificate]
    );
  });

  test("6. Both No → neither certificate appears", () => {
    const formBothNo: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "No",
      gstStatus: "No",
    };
    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formBothNo,
    });
    assert.equal(reqs.length, 0);
  });

  // =========================================================================
  // 2. DYNAMIC FIELD TRANSITIONS & STORE PRUNING
  // =========================================================================
  test("7. Changing Udyam Yes → No removes its requirement and clears uploaded doc", () => {
    const store = useLoansStore.getState();
    store.selectLoanProduct("msme-loan");
    store.setMsmeLoanField("udyamStatus", "Yes");
    store.setMsmeLoanField("gstStatus", "Yes");
    store.setDocumentAttachment(
      MSME_DOCUMENT_IDS.udyamCertificate,
      mockUpload(MSME_DOCUMENT_IDS.udyamCertificate, "udyam.pdf")
    );
    store.setDocumentAttachment(
      MSME_DOCUMENT_IDS.gstCertificate,
      mockUpload(MSME_DOCUMENT_IDS.gstCertificate, "gst.pdf")
    );

    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate]);
    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.gstCertificate]);

    // Change Udyam to No
    store.setMsmeLoanField("udyamStatus", "No");

    const afterChange = useLoansStore.getState();
    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: afterChange.businessFormData,
      msmeFormData: afterChange.msmeFormData,
    });
    assert.deepEqual(reqs.map((r) => r.id), [MSME_DOCUMENT_IDS.gstCertificate]);
    // Stale Udyam doc is pruned
    assert.equal(afterChange.uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate], undefined);
    assert.ok(afterChange.uploadedDocuments[MSME_DOCUMENT_IDS.gstCertificate]);
  });

  test("8. Changing GST Yes → No removes its requirement and clears uploaded doc", () => {
    const store = useLoansStore.getState();
    store.selectLoanProduct("msme-loan");
    store.setMsmeLoanField("udyamStatus", "Yes");
    store.setMsmeLoanField("gstStatus", "Yes");
    store.setDocumentAttachment(
      MSME_DOCUMENT_IDS.udyamCertificate,
      mockUpload(MSME_DOCUMENT_IDS.udyamCertificate, "udyam.pdf")
    );
    store.setDocumentAttachment(
      MSME_DOCUMENT_IDS.gstCertificate,
      mockUpload(MSME_DOCUMENT_IDS.gstCertificate, "gst.pdf")
    );

    // Change GST to No
    store.setMsmeLoanField("gstStatus", "No");

    const afterChange = useLoansStore.getState();
    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: afterChange.businessFormData,
      msmeFormData: afterChange.msmeFormData,
    });
    assert.deepEqual(reqs.map((r) => r.id), [MSME_DOCUMENT_IDS.udyamCertificate]);
    // Stale GST doc is pruned
    assert.equal(afterChange.uploadedDocuments[MSME_DOCUMENT_IDS.gstCertificate], undefined);
    assert.ok(afterChange.uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate]);
  });

  test("9. Changing Udyam No → Yes adds the requirement", () => {
    const store = useLoansStore.getState();
    store.selectLoanProduct("msme-loan");
    store.setMsmeLoanField("udyamStatus", "No");
    store.setMsmeLoanField("gstStatus", "No");

    assert.equal(
      resolveLoanDocumentRequirements({
        categoryId: "msme-loan",
        businessFormData: store.businessFormData,
        msmeFormData: store.msmeFormData,
      }).length,
      0
    );

    store.setMsmeLoanField("udyamStatus", "Yes");

    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: useLoansStore.getState().msmeFormData,
    });
    assert.deepEqual(reqs.map((r) => r.id), [MSME_DOCUMENT_IDS.udyamCertificate]);
  });

  test("10. Changing GST No → Yes adds the requirement", () => {
    const store = useLoansStore.getState();
    store.selectLoanProduct("msme-loan");
    store.setMsmeLoanField("udyamStatus", "No");
    store.setMsmeLoanField("gstStatus", "No");

    store.setMsmeLoanField("gstStatus", "Yes");

    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: useLoansStore.getState().msmeFormData,
    });
    assert.deepEqual(reqs.map((r) => r.id), [MSME_DOCUMENT_IDS.gstCertificate]);
  });

  // =========================================================================
  // 3. STALE DOCUMENT INTEGRITY & ADVERSARIAL RESISTANCE
  // =========================================================================
  test("11. Stale Udyam upload cannot satisfy another requirement (e.g. GST)", () => {
    const form: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "No",
      gstStatus: "Yes",
    };
    // Pretend a stale Udyam certificate upload exists in the documents map
    const docs = {
      [MSME_DOCUMENT_IDS.udyamCertificate]: mockUpload(
        MSME_DOCUMENT_IDS.udyamCertificate,
        "stale_udyam.pdf"
      ),
    };

    const result = validateReviewSubmission(
      validKyc,
      useLoansStore.getState().businessFormData,
      docs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      form
    );

    // Must fail because GST certificate is missing; stale Udyam does NOT satisfy GST
    assert.equal(result.isValid, false);
    assert.ok(result.errors.documents?.[MSME_DOCUMENT_IDS.gstCertificate]);
    assert.equal(result.errors.documents?.[MSME_DOCUMENT_IDS.udyamCertificate], undefined);
  });

  test("12. Stale GST upload cannot satisfy another requirement (e.g. Udyam)", () => {
    const form: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes",
      gstStatus: "No",
    };
    // Pretend a stale GST certificate upload exists in the documents map
    const docs = {
      [MSME_DOCUMENT_IDS.gstCertificate]: mockUpload(
        MSME_DOCUMENT_IDS.gstCertificate,
        "stale_gst.pdf"
      ),
    };

    const result = validateReviewSubmission(
      validKyc,
      useLoansStore.getState().businessFormData,
      docs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      form
    );

    // Must fail because Udyam certificate is missing; stale GST does NOT satisfy Udyam
    assert.equal(result.isValid, false);
    assert.ok(result.errors.documents?.[MSME_DOCUMENT_IDS.udyamCertificate]);
    assert.equal(result.errors.documents?.[MSME_DOCUMENT_IDS.gstCertificate], undefined);
  });

  test("13. Missing Udyam blocks submission when Udyam = Yes", () => {
    const form: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes",
      gstStatus: "No",
    };
    const result = validateReviewSubmission(
      validKyc,
      useLoansStore.getState().businessFormData,
      {}, // Empty documents
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      form
    );
    assert.equal(result.isValid, false);
    assert.ok(result.errors.documents?.[MSME_DOCUMENT_IDS.udyamCertificate]);
  });

  test("14. Missing GST blocks submission when GST = Yes", () => {
    const form: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "No",
      gstStatus: "Yes",
    };
    const result = validateReviewSubmission(
      validKyc,
      useLoansStore.getState().businessFormData,
      {}, // Empty documents
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      form
    );
    assert.equal(result.isValid, false);
    assert.ok(result.errors.documents?.[MSME_DOCUMENT_IDS.gstCertificate]);
  });

  test("15. GST = No does not block submission because GST certificate is absent", () => {
    const form: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes",
      gstStatus: "No",
    };
    const docs = {
      [MSME_DOCUMENT_IDS.udyamCertificate]: mockUpload(
        MSME_DOCUMENT_IDS.udyamCertificate,
        "udyam.pdf"
      ),
    };
    const result = validateReviewSubmission(
      validKyc,
      useLoansStore.getState().businessFormData,
      docs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      form
    );
    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors.documents, {});
  });

  test("16. Udyam = No does not block submission because Udyam certificate is absent", () => {
    const form: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "No",
      gstStatus: "Yes",
    };
    const docs = {
      [MSME_DOCUMENT_IDS.gstCertificate]: mockUpload(
        MSME_DOCUMENT_IDS.gstCertificate,
        "gst.pdf"
      ),
    };
    const result = validateReviewSubmission(
      validKyc,
      useLoansStore.getState().businessFormData,
      docs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      form
    );
    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors.documents, {});
  });

  // =========================================================================
  // 4. REVIEW & SUBMISSION CHECKLIST & PAYLOAD INTEGRITY
  // =========================================================================
  test("17. Review shows only active requirements", () => {
    const form: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes",
      gstStatus: "No",
    };
    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: form,
    });
    const checklist = getLoanDocumentChecklist(reqs, {
      [MSME_DOCUMENT_IDS.udyamCertificate]: mockUpload(
        MSME_DOCUMENT_IDS.udyamCertificate,
        "udyam.pdf"
      ),
      [MSME_DOCUMENT_IDS.gstCertificate]: mockUpload(
        MSME_DOCUMENT_IDS.gstCertificate,
        "stale_gst.pdf"
      ),
    });

    assert.equal(checklist.length, 1);
    assert.equal(checklist[0].id, MSME_DOCUMENT_IDS.udyamCertificate);
    assert.equal(checklist[0].name, "Udyam Registration Certificate");
    assert.equal(checklist[0].isUploaded, true);
    assert.equal(checklist.some((c) => c.id === MSME_DOCUMENT_IDS.gstCertificate), false);
  });

  test("18. Submission payload contains only active MSME document requirements", async () => {
    let capturedPayload: LoanSubmissionPayload | undefined;
    setLoanSubmissionService({
      submit: async (payload) => {
        capturedPayload = payload;
        return {
          applicationId: "TXE-LN-MSME-TEST",
          submittedAt: new Date().toISOString(),
          isSyncedToServer: false,
        };
      },
    });

    try {
      const store = useLoansStore.getState();
      store.selectLoanProduct("msme-loan");
      useLoansStore.setState({
        kycData: { ...validKyc },
        msmeFormData: {
          ...validMsmeBase,
          udyamStatus: "Yes",
          gstStatus: "No",
        },
        uploadedDocuments: {
          [MSME_DOCUMENT_IDS.udyamCertificate]: mockUpload(
            MSME_DOCUMENT_IDS.udyamCertificate,
            "udyam.pdf"
          ),
          [MSME_DOCUMENT_IDS.gstCertificate]: mockUpload(
            MSME_DOCUMENT_IDS.gstCertificate,
            "stale_gst.pdf"
          ),
        },
        isReviewConsentGiven: true,
      });

      const success = await useLoansStore.getState().submitLoanApplication();
      assert.equal(success, true);
      assert.ok(capturedPayload);
      assert.equal(capturedPayload?.categoryId, "msme-loan");
      // Payload documents must contain ONLY active documents (udyam), NOT stale GST
      assert.deepEqual(
        capturedPayload?.documents.map((d) => d.documentId),
        [MSME_DOCUMENT_IDS.udyamCertificate]
      );
    } finally {
      setLoanSubmissionService(localLoanSubmissionService);
    }
  });

  // =========================================================================
  // 5. NAVIGATION & STATE PRESERVATION
  // =========================================================================
  test("19. Documents are preserved when navigating Back", () => {
    const store = useLoansStore.getState();
    store.selectLoanProduct("msme-loan");
    store.setMsmeLoanField("udyamStatus", "Yes");
    store.setMsmeLoanField("gstStatus", "Yes");
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");

    store.setDocumentAttachment(
      MSME_DOCUMENT_IDS.udyamCertificate,
      mockUpload(MSME_DOCUMENT_IDS.udyamCertificate, "udyam.pdf")
    );

    // Customer goes Back: Documents -> MSME Screen 2
    store.setActiveStep("msme-details");
    assert.equal(useLoansStore.getState().activeStep, "msme-details");
    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate]);

    // Customer re-advances: MSME Screen 2 -> Documents
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate]);
  });

  test("20. Review → Edit → Update & Continue preserves valid documents", () => {
    const store = useLoansStore.getState();
    store.selectLoanProduct("msme-loan");
    useLoansStore.setState({
      kycData: { ...validKyc },
      msmeFormData: { ...validMsmeBase },
      uploadedDocuments: {
        [MSME_DOCUMENT_IDS.udyamCertificate]: mockUpload(
          MSME_DOCUMENT_IDS.udyamCertificate,
          "udyam.pdf"
        ),
        [MSME_DOCUMENT_IDS.gstCertificate]: mockUpload(
          MSME_DOCUMENT_IDS.gstCertificate,
          "gst.pdf"
        ),
      },
      activeStep: "review",
      completedSteps: ["kyc", "msme-details", "documents", "review"],
      isReviewConsentGiven: true,
    });

    // Tap Edit on MSME details
    store.editFromReview("msme-details");
    assert.equal(useLoansStore.getState().activeStep, "msme-details");
    assert.equal(useLoansStore.getState().returnToReview, true);
    assert.equal(getContinueLabel(true, "Continue →"), "Update & Continue →");

    // Modify a non-document field
    store.setMsmeLoanField("businessName", "Zenith Bio-Tech World Ltd");

    // Continue returns straight to Review
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().msmeFormData.businessName, "Zenith Bio-Tech World Ltd");
    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate]);
    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.gstCertificate]);
  });

  // =========================================================================
  // 6. ISOLATION & ARCHITECTURE AUDIT
  // =========================================================================
  test("21. No cross-loan document leakage", () => {
    const formBothYes: MsmeLoanFormData = {
      ...validMsmeBase,
      udyamStatus: "Yes" as unknown as MsmeLoanFormData["udyamStatus"],
      gstStatus: "Yes" as unknown as MsmeLoanFormData["gstStatus"],
    };
    const reqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: formBothYes,
    });
    const ids = reqs.map((r) => r.id);

    // Business & Working Capital documents must not leak
    assert.equal(ids.includes("pan_card"), false);
    assert.equal(ids.includes("business_proof"), false);
    assert.equal(ids.includes("bank_statement"), false);
    assert.equal(ids.includes("financial_statements"), false);
    assert.equal(ids.includes("project_quotation"), false);

    // Machinery & Vehicle documents must not leak
    assert.equal(ids.includes("machinery_new_quotation"), false);
    assert.equal(ids.includes("vehicle_new_quotation"), false);
  });

  test("22. No duplicate document IDs", () => {
    const values = Object.values(MSME_DOCUMENT_IDS);
    const uniqueValues = new Set(values);
    assert.equal(values.length, uniqueValues.size);
    assert.ok(MSME_DOCUMENT_IDS.udyamCertificate.startsWith("msme_"));
    assert.ok(MSME_DOCUMENT_IDS.gstCertificate.startsWith("msme_"));
  });

  test("23. No duplicate upload components", () => {
    const root = path.join(process.cwd(), "src/modules/loans");
    // Ensure no redundant document screen exists inside msme folder
    assert.equal(fs.existsSync(path.join(root, "msme/screens/MsmeDocumentUploadScreen")), false);
    assert.equal(fs.existsSync(path.join(root, "msme/screens/MsmeLoanDocumentUploadScreen")), false);
    // Shared document screen exists and is reused
    assert.equal(
      fs.existsSync(path.join(root, "screens/LoanDocumentUploadScreen/LoanDocumentUploadScreen.tsx")),
      true
    );
  });
});
