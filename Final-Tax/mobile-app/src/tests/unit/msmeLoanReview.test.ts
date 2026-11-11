/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, test } from "node:test";
import {
  getLoanDetailsStep,
  getLoanEntryStep,
  getLoanFlowDefinition,
  getLoanFlowTotalSteps,
  resolveLoanActiveStep,
} from "../../modules/loans/constants/loanFlow";
import { LOAN_CATEGORIES } from "../../modules/loans/constants/loanCategories";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialMsmeLoanAddress,
  createInitialMsmeLoanFormData,
  type MsmeLoanFormData,
} from "../../modules/loans/msme/types/msmeLoan.types";
import {
  MSME_DOCUMENT_IDS,
  getMsmeLoanDocuments,
  isUdyamRegistered,
  isGstRegistered,
} from "../../modules/loans/msme/constants/msmeDocuments";
import { resolveLoanDocumentRequirements } from "../../modules/loans/constants/loanDocumentResolver";
import {
  buildReviewSections,
  getSubmittedLoanSummary,
  maskAadhaar,
} from "../../modules/loans/utils/loanReviewSummary";
import { validateReviewSubmission } from "../../modules/loans/validation/loanReviewValidation";
import { getContinueLabel, UPDATE_AND_CONTINUE_LABEL } from "../../modules/loans/constants/continueLabels";
import { useAuthStore } from "../../modules/authentication/store/authStore";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const msmeCategory = LOAN_CATEGORIES.find((c) => c.id === "msme-loan")!;

const createValidKycData = (): LoanKycData => ({
  fullName: "Ananya Sharma",
  mobile: "9876543210",
  email: "ananya.sharma@example.com",
  pan: "ABCDE1234F",
  aadhaar: "123456789012",
  dob: "1990-08-25",
  currentAddress: {
    houseNumber: "Flat 302, Green Meadows",
    street: "Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
  },
  isPermanentSameAsCurrent: true,
  permanentAddress: {
    houseNumber: "Flat 302, Green Meadows",
    street: "Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
  },
  consentGiven: true,
  isProfilePrefilled: true,
  isProfileLocked: true,
});

const createValidMsmeFormData = (): MsmeLoanFormData => ({
  businessName: "Zenith Bio-Tech Solutions Pvt Ltd",
  constitution: "Private Limited Company",
  constitutionOther: "",
  businessActivity: "Manufacturing",
  businessActivityOther: "",
  establishmentDate: "2019-11-12",
  operatingAddress: {
    houseNumber: "Unit 4B, Electronic City Phase 1",
    street: "Hosur Main Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
  },
  udyamStatus: "Registered",
  udyamRegistrationNumber: "UDYAM-KR-03-0098765",
  gstStatus: "Registered",
  gstin: "29ABCDE1234F1Z5",
  operatingDuration: "5–10 years",
  numberOfEmployees: "45",
  annualTurnover: "85,00,000",
  ownershipType: "Sole Owner",
  ownershipTypeOther: "",
});

const createMockUpload = (docId: string, name: string): LoanDocumentUpload => ({
  id: `${docId}_test_id`,
  documentId: docId,
  fileName: name,
  fileUri: `file:///storage/emulated/0/Download/${name}`,
  fileSize: 1024 * 1024, // 1 MB
  mimeType: "application/pdf",
  status: "selected",
});

const createValidMsmeDocuments = (form: MsmeLoanFormData): Record<string, LoanDocumentUpload> => {
  const docs: Record<string, LoanDocumentUpload> = {};
  if (isUdyamRegistered(form.udyamStatus)) {
    docs[MSME_DOCUMENT_IDS.udyamCertificate] = createMockUpload(
      MSME_DOCUMENT_IDS.udyamCertificate,
      "udyam_cert.pdf"
    );
  }
  if (isGstRegistered(form.gstStatus)) {
    docs[MSME_DOCUMENT_IDS.gstCertificate] = createMockUpload(
      MSME_DOCUMENT_IDS.gstCertificate,
      "gst_cert.pdf"
    );
  }
  return docs;
};

describe("MSME Loan Screen 4: Review & Submit Comprehensive Architecture Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customerExists: true,
      customer: {
        customerId: "cust-msme-rev-1",
        customerType: "Individual",
        name: "Ananya Sharma",
        mobile: "9876543210",
        email: "ananya.sharma@example.com",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        dob: "1990-08-25",
        address: "Flat 302, Green Meadows, Bengaluru, Karnataka - 560103",
        profileCompleted: true,
      },
    });
  });

  // =========================================================================
  // 1. REVIEW SUMMARY & FIELD RENDERING
  // =========================================================================
  test("1. Valid MSME application renders correctly with Applicant & MSME sections", () => {
    const kyc = createValidKycData();
    const msme = createValidMsmeFormData();

    const sections = buildReviewSections(
      kyc,
      useLoansStore.getState().businessFormData,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      msme
    );

    assert.equal(sections.length, 2, "Must contain exactly Applicant and MSME sections");
    assert.equal(sections[0].id, "applicant");
    assert.equal(sections[1].id, "msme");
  });

  test("2. All MSME Screen 2 fields appear correctly in MSME review section", () => {
    const kyc = createValidKycData();
    const msme = createValidMsmeFormData();

    const sections = buildReviewSections(
      kyc,
      useLoansStore.getState().businessFormData,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      msme
    );

    const msmeSection = sections.find((s) => s.id === "msme")!;
    assert.ok(msmeSection, "MSME section must exist");
    assert.equal(msmeSection.title, "MSME & Business Details");
    assert.equal(msmeSection.editTarget, "msme-details");

    const rowMap = Object.fromEntries(msmeSection.rows.map((r) => [r.label, r.value]));

    assert.equal(rowMap["Business / Trade Name"], "Zenith Bio-Tech Solutions Pvt Ltd");
    assert.equal(rowMap["Constitution"], "Private Limited Company");
    assert.equal(rowMap["Primary Activity"], "Manufacturing");
    assert.equal(rowMap["Establishment Date"], "2019-11-12");
    assert.ok(rowMap["Operating Address"].includes("Bengaluru"));
    assert.ok(rowMap["Operating Address"].includes("560100"));
    assert.equal(rowMap["Udyam Status"], "Registered");
    assert.equal(rowMap["Udyam Reg. Number"], "UDYAM-KR-03-0098765");
    assert.equal(rowMap["GST Status"], "Registered");
    assert.equal(rowMap["GSTIN"], "29ABCDE1234F1Z5");
    assert.equal(rowMap["Operating Duration"], "5–10 years");
    assert.equal(rowMap["Employees"], "45");
    assert.equal(rowMap["Annual Turnover"], "₹85,00,000");
    assert.equal(rowMap["Ownership"], "Sole Owner");

    // Highlight flag on Annual Turnover
    const turnoverRow = msmeSection.rows.find((r) => r.label === "Annual Turnover");
    assert.equal(turnoverRow?.highlight, true);
  });

  test("3. KYC details appear correctly in Review (with masked Aadhaar and locked status)", () => {
    const kyc = createValidKycData();
    const msme = createValidMsmeFormData();

    const sections = buildReviewSections(
      kyc,
      useLoansStore.getState().businessFormData,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      msme
    );

    const applicant = sections.find((s) => s.id === "applicant")!;
    assert.ok(applicant, "Applicant section must exist");
    assert.equal(applicant.editTarget, "kyc");

    const rowMap = Object.fromEntries(applicant.rows.map((r) => [r.label, r.value]));
    assert.equal(rowMap["Full Name"], "Ananya Sharma");
    assert.equal(rowMap["Mobile Number"], "+91 9876543210");
    assert.equal(rowMap["Email"], "ananya.sharma@example.com");
    assert.equal(rowMap["PAN"], "ABCDE1234F");
    assert.equal(rowMap["Aadhaar"], maskAadhaar("123456789012"));
    assert.equal(rowMap["Aadhaar"], "XXXX XXXX 9012");
    assert.equal(rowMap["Date of Birth"], "1990-08-25");
    assert.ok(rowMap["Current Address"].includes("Green Meadows"));
    assert.equal(rowMap["Permanent Address"], "Same as current address");
  });

  // =========================================================================
  // 2. MSME DOCUMENTS SPECIFICITY
  // =========================================================================
  test("4. MSME documents appear correctly and adapt to Udyam / GST status", () => {
    const msme = createValidMsmeFormData();

    // 1. Registered Udyam + Registered GST
    const reqs1 = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: msme,
    });
    const ids1 = reqs1.map((r) => r.id);
    assert.deepEqual(ids1, [
      MSME_DOCUMENT_IDS.udyamCertificate,
      MSME_DOCUMENT_IDS.gstCertificate,
    ]);

    // 2. Registered Udyam + Not Registered GST
    const msme2: MsmeLoanFormData = {
      ...msme,
      udyamStatus: "Registered",
      gstStatus: "Not Registered",
    };
    const reqs2 = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: msme2,
    });
    const ids2 = reqs2.map((r) => r.id);
    assert.deepEqual(ids2, [MSME_DOCUMENT_IDS.udyamCertificate]);

    // 3. Not Registered Udyam + Not Registered GST
    const msme3: MsmeLoanFormData = {
      ...msme,
      udyamStatus: "Not Registered",
      gstStatus: "Not Registered",
    };
    const reqs3 = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: msme3,
    });
    const ids3 = reqs3.map((r) => r.id);
    assert.deepEqual(ids3, []);
  });

  test("5. Missing required documents block review submission", () => {
    const kyc = createValidKycData();
    const msme = createValidMsmeFormData();
    const docs = createValidMsmeDocuments(msme);

    // Remove udyam certificate
    delete docs[MSME_DOCUMENT_IDS.udyamCertificate];

    const validation = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      docs,
      true, // consent given
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msme
    );

    assert.equal(validation.isValid, false);
    assert.ok(validation.errors.documents?.[MSME_DOCUMENT_IDS.udyamCertificate]);
  });

  // =========================================================================
  // 3. INDEPENDENT REVIEW VALIDATION (ADVERSARIAL SECURITY CHECK)
  // =========================================================================
  test("6. Invalid MSME data blocks submission in Review (adversarial inputs)", () => {
    const kyc = createValidKycData();
    const validMsme = createValidMsmeFormData();
    const validDocs = createValidMsmeDocuments(validMsme);

    // 1. Emoji in Business Name
    const msmeWithEmoji = { ...validMsme, businessName: "Zenith Bio-Tech 🚀" };
    const resEmoji = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      validDocs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msmeWithEmoji
    );
    assert.equal(resEmoji.isValid, false);
    assert.ok(resEmoji.errors.msme, "Must block emoji in business name");

    // 2. Decimal Turnover
    const msmeDecimal = { ...validMsme, annualTurnover: "8500000.50" };
    const resDecimal = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      validDocs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msmeDecimal
    );
    assert.equal(resDecimal.isValid, false);
    assert.ok(resDecimal.errors.msme, "Must block decimal turnover");

    // 3. Scientific notation turnover (1e9)
    const msmeSci = { ...validMsme, annualTurnover: "1e9" };
    const resSci = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      validDocs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msmeSci
    );
    assert.equal(resSci.isValid, false);
    assert.ok(resSci.errors.msme, "Must block 1e9 scientific notation");

    // 4. Zero turnover
    const msmeZero = { ...validMsme, annualTurnover: "0" };
    const resZero = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      validDocs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msmeZero
    );
    assert.equal(resZero.isValid, false);
    assert.ok(resZero.errors.msme, "Must block zero turnover");

    // 5. Decimal Employees (12.5)
    const msmeEmp = { ...validMsme, numberOfEmployees: "12.5" };
    const resEmp = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      validDocs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msmeEmp
    );
    assert.equal(resEmp.isValid, false);
    assert.ok(resEmp.errors.msme, "Must block decimal employees");

    // 6. Invalid GSTIN format
    const msmeGst = { ...validMsme, gstin: "INVALID_GSTIN_123" };
    const resGst = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      validDocs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msmeGst
    );
    assert.equal(resGst.isValid, false);
    assert.ok(resGst.errors.msme, "Must block invalid GSTIN");

    // 7. Invalid Udyam format
    const msmeUdyam = { ...validMsme, udyamRegistrationNumber: "UDYAM123456" };
    const resUdyam = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      validDocs,
      true,
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msmeUdyam
    );
    assert.equal(resUdyam.isValid, false);
    assert.ok(resUdyam.errors.msme, "Must block invalid Udyam format");
  });

  test("7. Review independently validates MSME data and requires consent", () => {
    const kyc = createValidKycData();
    const msme = createValidMsmeFormData();
    const docs = createValidMsmeDocuments(msme);

    // Missing consent
    const withoutConsent = validateReviewSubmission(
      kyc,
      useLoansStore.getState().businessFormData,
      docs,
      false, // consent false
      undefined,
      "msme-loan",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      msme
    );
    assert.equal(withoutConsent.isValid, false);
    assert.ok(withoutConsent.errors.consent, "Consent required");

    // With consent -> Valid
    const withConsent = validateReviewSubmission(
      kyc,
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
      msme
    );
    assert.equal(withConsent.isValid, true);
    assert.deepEqual(withConsent.errors.documents, {});
  });

  // =========================================================================
  // 4. REVIEW -> EDIT -> UPDATE & CONTINUE FLOW
  // =========================================================================
  test("8. Edit Screen 2: Review -> edit msme-details -> Update & Continue -> Review", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    const msme = createValidMsmeFormData();
    const docs = createValidMsmeDocuments(msme);

    useLoansStore.setState({
      msmeFormData: { ...msme },
      uploadedDocuments: { ...docs },
      activeStep: "review",
      completedSteps: ["kyc", "msme-details", "documents", "review"],
      isReviewConsentGiven: true,
    });

    // 1. Customer taps Edit on MSME section
    const detailsStep = getLoanDetailsStep("msme-loan");
    assert.equal(detailsStep, "msme-details");
    useLoansStore.getState().editFromReview(detailsStep!);

    // Store is now on msme-details with returnToReview=true
    assert.equal(useLoansStore.getState().activeStep, "msme-details");
    assert.equal(useLoansStore.getState().returnToReview, true);

    // CTA label
    const label = getContinueLabel(useLoansStore.getState().returnToReview, "Continue →");
    assert.equal(label, UPDATE_AND_CONTINUE_LABEL);

    // Modify a field
    useLoansStore.getState().setMsmeLoanField("businessName", "Zenith Bio-Tech Global Ltd");

    // Advance: returns directly to Review!
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
    assert.equal(useLoansStore.getState().msmeFormData.businessName, "Zenith Bio-Tech Global Ltd");

    // Documents remain preserved
    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate]);
  });

  test("9. Edit Documents: Review -> edit documents -> Update & Continue -> Review", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    const msme = createValidMsmeFormData();
    const docs = createValidMsmeDocuments(msme);

    useLoansStore.setState({
      msmeFormData: { ...msme },
      uploadedDocuments: { ...docs },
      activeStep: "review",
      completedSteps: ["kyc", "msme-details", "documents", "review"],
      isReviewConsentGiven: true,
    });

    // Tap Edit on Documents
    useLoansStore.getState().editFromReview("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    assert.equal(useLoansStore.getState().returnToReview, true);

    const label = getContinueLabel(useLoansStore.getState().returnToReview, "Continue →");
    assert.equal(label, UPDATE_AND_CONTINUE_LABEL);

    // MSME data remains preserved
    assert.equal(useLoansStore.getState().msmeFormData.businessName, "Zenith Bio-Tech Solutions Pvt Ltd");

    // Update & Continue returns directly to Review
    useLoansStore.getState().advanceTo("review");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });

  test("10. Back button on Review returns to Documents without losing state", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    const msme = createValidMsmeFormData();
    const docs = createValidMsmeDocuments(msme);

    useLoansStore.setState({
      msmeFormData: { ...msme },
      uploadedDocuments: { ...docs },
      activeStep: "review",
      completedSteps: ["kyc", "msme-details", "documents", "review"],
    });

    // Back from Review goes to Documents
    useLoansStore.getState().setActiveStep("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    assert.equal(useLoansStore.getState().msmeFormData.businessName, "Zenith Bio-Tech Solutions Pvt Ltd");
    assert.ok(useLoansStore.getState().uploadedDocuments[MSME_DOCUMENT_IDS.udyamCertificate]);
  });

  // =========================================================================
  // 5. PROFILE LOCK INTEGRITY & STATE ISOLATION
  // =========================================================================
  test("11. KYC profile fields remain locked during Review & Edit", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    const kyc = createValidKycData();
    useLoansStore.setState({
      kycData: { ...kyc },
      isProfileLocked: true,
      activeStep: "review",
    });

    // Attempting store updates to locked KYC fields fails silently
    useLoansStore.getState().setKycField("fullName", "Hacked Name");
    useLoansStore.getState().setKycField("mobile", "9999999999");
    useLoansStore.getState().setCurrentAddressField("city", "Mumbai");

    assert.equal(useLoansStore.getState().kycData.fullName, "Ananya Sharma");
    assert.equal(useLoansStore.getState().kycData.mobile, "9876543210");
    assert.equal(useLoansStore.getState().kycData.currentAddress.city, "Bengaluru");
  });

  test("12. Cross-loan state isolation: other loans' documents and data NEVER appear in MSME", () => {
    // 1. Business documents never appear in MSME
    const msmeReqs = resolveLoanDocumentRequirements({
      categoryId: "msme-loan",
      businessFormData: useLoansStore.getState().businessFormData,
      msmeFormData: createValidMsmeFormData(),
    });
    const msmeDocIds = msmeReqs.map((r) => r.id);
    assert.ok(!msmeDocIds.includes("pan_card"), "Business pan_card must not appear in MSME");
    assert.ok(!msmeDocIds.includes("project_quotation"), "Business project_quotation must not appear in MSME");

    // 2. Machinery documents never appear in MSME
    assert.ok(!msmeDocIds.includes("machinery_new_quotation"), "Machinery quotation must not appear in MSME");
    assert.ok(!msmeDocIds.includes("machinery_used_purchase_document"), "Machinery used doc must not appear in MSME");

    // 3. Vehicle documents never appear in MSME
    assert.ok(!msmeDocIds.includes("vehicle_new_quotation"), "Vehicle quotation must not appear in MSME");
    assert.ok(!msmeDocIds.includes("vehicle_used_rc_copy"), "Vehicle RC must not appear in MSME");

    // 4. Switching categories completely isolates state
    useLoansStore.getState().selectLoanProduct("msme-loan");
    useLoansStore.setState({
      msmeFormData: createValidMsmeFormData(),
      uploadedDocuments: {
        [MSME_DOCUMENT_IDS.udyamCertificate]: createMockUpload(MSME_DOCUMENT_IDS.udyamCertificate, "udyam.pdf"),
      },
    });

    // Switch to Business Loan
    useLoansStore.getState().selectLoanProduct("business-loan");
    const switchedState = useLoansStore.getState();
    assert.equal(switchedState.selectedCategory?.id, "business-loan");
    assert.equal(switchedState.msmeFormData.businessName, "", "MSME form data must be reset");
    assert.deepEqual(switchedState.uploadedDocuments, {}, "Documents must be reset on loan switch");
  });

  // =========================================================================
  // 6. SUBMISSION & UNDER REVIEW
  // =========================================================================
  test("13. Submit reaches Under Review only after successful validation", async () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    const kyc = createValidKycData();
    const msme = createValidMsmeFormData();
    const docs = createValidMsmeDocuments(msme);

    useLoansStore.setState({
      kycData: { ...kyc },
      msmeFormData: { ...msme },
      uploadedDocuments: { ...docs },
      activeStep: "review",
      completedSteps: ["kyc", "msme-details", "documents", "review"],
      isReviewConsentGiven: true,
    });

    const success = await useLoansStore.getState().submitLoanApplication();
    assert.equal(success, true);

    const postSubmit = useLoansStore.getState();
    assert.equal(postSubmit.activeStep, "submitted");
    assert.ok(postSubmit.submittedApplicationId?.startsWith("TXE-LN-"));
    assert.ok(postSubmit.submittedAt);

    // Submitted loan summary displays MSME Loan and Annual Turnover
    const summary = getSubmittedLoanSummary(
      "msme-loan",
      postSubmit.businessFormData,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      postSubmit.msmeFormData.annualTurnover
    );
    assert.equal(summary.label, "MSME Loan");
    assert.equal(summary.amountRaw, "85,00,000");
  });

  test("14. Submit fails if any required field is invalid or missing", async () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    const kyc = createValidKycData();
    const msme = createValidMsmeFormData();
    const docs = createValidMsmeDocuments(msme);

    // Break business name with emoji
    msme.businessName = "Invalid Name 🚀";

    useLoansStore.setState({
      kycData: { ...kyc },
      msmeFormData: { ...msme },
      uploadedDocuments: { ...docs },
      activeStep: "review",
      completedSteps: ["kyc", "msme-details", "documents", "review"],
      isReviewConsentGiven: true,
    });

    const success = await useLoansStore.getState().submitLoanApplication();
    assert.equal(success, false, "Submission MUST fail on invalid business name");
    assert.notEqual(useLoansStore.getState().activeStep, "submitted");
    assert.ok(useLoansStore.getState().reviewErrors.msme);
  });

  // =========================================================================
  // 7. ARCHITECTURE AUDIT (ZERO DUPLICATION)
  // =========================================================================
  test("15. Architecture audit: existing shared LoanReviewScreen, ApplicationSummarySection & CTA are reused", () => {
    const modulesDir = path.resolve(__dirname, "../../modules/loans");

    // Verify no duplicate Review screen in msme directory
    const msmeDir = path.join(modulesDir, "msme");
    const msmeFiles = fs.readdirSync(msmeDir, { recursive: true }) as string[];
    const hasDuplicateReviewScreen = msmeFiles.some((f) =>
      f.toLowerCase().includes("reviewscreen") || f.toLowerCase().includes("msmereview")
    );
    assert.equal(hasDuplicateReviewScreen, false, "Must NOT create a duplicate Review screen in msme");

    // Verify shared LoanReviewScreen is used
    const mainScreenPath = path.join(modulesDir, "screens/LoansMainScreen/LoansMainScreen.tsx");
    const mainScreenContent = fs.readFileSync(mainScreenPath, "utf-8");
    assert.match(mainScreenContent, /case "review":\s*return \(\s*<LoanReviewScreen/);

    // Verify shared continue label helper is used
    const continueLabelsPath = path.join(modulesDir, "constants/continueLabels.ts");
    const continueLabelsContent = fs.readFileSync(continueLabelsPath, "utf-8");
    assert.match(continueLabelsContent, /Update & Continue →/);
  });
});
