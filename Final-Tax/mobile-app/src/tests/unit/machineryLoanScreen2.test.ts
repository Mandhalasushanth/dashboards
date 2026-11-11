import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import type { LoanCategoryId } from "../../modules/loans/types/loanCategory.types";
import {
  getLoanFlowTotalSteps,
  resolveLoanActiveStep,
} from "../../modules/loans/constants/loanFlow";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  MACHINERY_CONDITION_OPTIONS,
  type MachineryLoanFormData,
} from "../../modules/loans/machinery/types/machinery.types";
import {
  MACHINERY_DEALER_MAX_LENGTH,
  MACHINERY_NAME_MAX_LENGTH,
  MACHINERY_OTHER_SUPPLIER_MAX_LENGTH,
  MACHINERY_OTHER_TYPE_MAX_LENGTH,
  validateMachineryLoanForm,
} from "../../modules/loans/machinery/validation/machineryLoanValidation";
import { getContinueLabel } from "../../modules/loans/constants/continueLabels";
import {
  resolveLoanDocumentRequirements,
} from "../../modules/loans/constants/loanDocumentResolver";
import {
  createInitialBusinessFormData,
} from "../../modules/loans/store/loansStore.types";
import {
  getLoanDocumentChecklist,
  getLoanDocumentProgress,
  validateLoanDocumentFile,
} from "../../modules/loans/validation/loanDocumentsValidation";
import {
  MACHINERY_DOCUMENT_IDS,
} from "../../modules/loans/machinery/constants/machineryLoanDocuments";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import { buildReviewSections } from "../../modules/loans/utils/loanReviewSummary";

const machineryDocuments = (condition: MachineryLoanFormData["machineryCondition"]) =>
  resolveLoanDocumentRequirements({
    categoryId: "machinery-loan",
    businessFormData: createInitialBusinessFormData(),
    machineryFormData: { ...validFormData, machineryCondition: condition },
  });

const makeCategory = (id: LoanCategoryId, title: string = id) => ({
  id,
  title,
  description: "",
  image: { uri: "test" },
});

const machineryCategory = makeCategory("machinery-loan", "Machinery Loan");

const validFormData: MachineryLoanFormData = {
  requestedLoanAmount: "2500000",
  machineryType: "CNC / Industrial Machinery",
  machineryTypeOther: "",
  machineryName: "5-Axis CNC Milling Center",
  machineryCondition: "New",
  purchaseType: "Authorized Dealer",
  purchaseTypeOther: "",
  approximateMachineryCost: "3200000",
  dealerName: "Apex Machine Tools Pvt Ltd",
};

const setValidMachineryForm = () => {
  const store = useLoansStore.getState();
  store.selectCategory(machineryCategory);
  useLoansStore.setState({
    kycData: {
      fullName: "Sunita Sharma",
      mobile: "9876543210",
      email: "sunita@example.com",
      pan: "ABCDE1234F",
      aadhaar: "123456789012",
      dob: "1988-05-15",
      currentAddress: {
        houseNumber: "Flat 101",
        street: "Industrial Road",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
      },
      isPermanentSameAsCurrent: true,
      permanentAddress: {
        houseNumber: "Flat 101",
        street: "Industrial Road",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
      },
      consentGiven: true,
      isProfilePrefilled: true,
      isProfileLocked: true,
    },
  });
  for (const [key, value] of Object.entries(validFormData)) {
    useLoansStore
      .getState()
      .setMachineryLoanField(key as keyof MachineryLoanFormData, value);
  }
};

const machineryUpload = () => ({
  id: `${MACHINERY_DOCUMENT_IDS.newQuotation}_1`,
  documentId: MACHINERY_DOCUMENT_IDS.newQuotation,
  fileName: "machinery-quotation.pdf",
  fileUri: "file:///machinery-quotation.pdf",
  fileSize: 1024,
  mimeType: "application/pdf",
  status: "selected" as const,
});

describe("Machinery Loan Screen 2 — Dedicated Architecture & Validation Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  test("1. Screen configuration and headers render correctly", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().advanceTo("machinery-details");

    const totalSteps = getLoanFlowTotalSteps("machinery-loan");
    assert.equal(totalSteps, 5, "Machinery Loan has 5 steps");

    const screenPath = path.resolve(
      __dirname,
      "../../modules/loans/machinery/screens/MachineryLoanScreen/MachineryLoanScreen.tsx"
    );
    const source = fs.readFileSync(screenPath, "utf-8");

    assert.match(source, /title="Machinery Loan"/);
    assert.match(source, /subtitle="Machinery & Loan Details"/);
    assert.match(source, /currentStep=\{2\}/);
    assert.match(source, /LoanFlowHeader/);
    assert.match(source, /Loan Requirement/);
    assert.match(source, /Machinery Details/);
  });

  test("2. Requested amount is required and validates valid amounts", () => {
    const invalidForm = { ...validFormData, requestedLoanAmount: "" };
    const res = validateMachineryLoanForm(invalidForm);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.requestedLoanAmount);

    const validRes = validateMachineryLoanForm(validFormData);
    assert.equal(validRes.isValid, true);
    assert.equal(validRes.errors.requestedLoanAmount, undefined);
  });

  test("3. Machinery type is required", () => {
    const invalidForm: MachineryLoanFormData = {
      ...validFormData,
      machineryType: "",
    };
    const res = validateMachineryLoanForm(invalidForm);
    assert.equal(res.isValid, false);
    assert.equal(res.errors.machineryType, "Please select the machinery type");
  });

  test("4. Other machinery type requires specification and validates length/characters", () => {
    const otherWithoutSpec: MachineryLoanFormData = {
      ...validFormData,
      machineryType: "Other",
      machineryTypeOther: "",
    };
    const resEmpty = validateMachineryLoanForm(otherWithoutSpec);
    assert.equal(resEmpty.isValid, false);
    assert.ok(resEmpty.errors.machineryTypeOther);

    const otherWithSpaces: MachineryLoanFormData = {
      ...validFormData,
      machineryType: "Other",
      machineryTypeOther: "    ",
    };
    const resSpaces = validateMachineryLoanForm(otherWithSpaces);
    assert.equal(resSpaces.isValid, false);
    assert.ok(resSpaces.errors.machineryTypeOther);

    const otherValid: MachineryLoanFormData = {
      ...validFormData,
      machineryType: "Other",
      machineryTypeOther: "Robotic Laser Welding Arm",
    };
    const resValid = validateMachineryLoanForm(otherValid);
    assert.equal(resValid.isValid, true);
    assert.equal(resValid.errors.machineryTypeOther, undefined);

    const otherTooLong: MachineryLoanFormData = {
      ...validFormData,
      machineryType: "Other",
      machineryTypeOther: "A".repeat(MACHINERY_OTHER_TYPE_MAX_LENGTH + 1),
    };
    const resLong = validateMachineryLoanForm(otherTooLong);
    assert.equal(resLong.isValid, false);
    assert.ok(resLong.errors.machineryTypeOther);
  });

  test("5. Machinery name is required, accepts Unicode and rejects invalid input", () => {
    const emptyName: MachineryLoanFormData = {
      ...validFormData,
      machineryName: "",
    };
    assert.equal(validateMachineryLoanForm(emptyName).isValid, false);

    const whitespaceName: MachineryLoanFormData = {
      ...validFormData,
      machineryName: "   ",
    };
    assert.equal(validateMachineryLoanForm(whitespaceName).isValid, false);

    // Unicode / Indian language script support
    const hindiName: MachineryLoanFormData = {
      ...validFormData,
      machineryName: "सीएनसी खराद मशीन",
    };
    assert.equal(validateMachineryLoanForm(hindiName).isValid, true);

    const tooLongName: MachineryLoanFormData = {
      ...validFormData,
      machineryName: "X".repeat(MACHINERY_NAME_MAX_LENGTH + 1),
    };
    const resLong = validateMachineryLoanForm(tooLongName);
    assert.equal(resLong.isValid, false);
    assert.ok(resLong.errors.machineryName);
  });

  test("6. New/Used selection works for Machinery Condition", () => {
    assert.ok(MACHINERY_CONDITION_OPTIONS.includes("New"));
    assert.ok(MACHINERY_CONDITION_OPTIONS.includes("Used / Pre-owned"));

    const newForm: MachineryLoanFormData = {
      ...validFormData,
      machineryCondition: "New",
    };
    assert.equal(validateMachineryLoanForm(newForm).isValid, true);

    const usedForm: MachineryLoanFormData = {
      ...validFormData,
      machineryCondition: "Used / Pre-owned",
    };
    assert.equal(validateMachineryLoanForm(usedForm).isValid, true);

    const emptyCondition: MachineryLoanFormData = {
      ...validFormData,
      machineryCondition: "",
    };
    const resEmpty = validateMachineryLoanForm(emptyCondition);
    assert.equal(resEmpty.isValid, false);
    assert.equal(
      resEmpty.errors.machineryCondition,
      "Please select the machinery condition"
    );
  });

  test("7. Purchase type is required", () => {
    const emptyPurchase: MachineryLoanFormData = {
      ...validFormData,
      purchaseType: "",
    };
    const res = validateMachineryLoanForm(emptyPurchase);
    assert.equal(res.isValid, false);
    assert.equal(
      res.errors.purchaseType,
      "Please select the machinery purchase type"
    );
  });

  test("8. Other Supplier requires specification", () => {
    const otherSupplierEmpty: MachineryLoanFormData = {
      ...validFormData,
      purchaseType: "Other Supplier",
      purchaseTypeOther: "",
    };
    const resEmpty = validateMachineryLoanForm(otherSupplierEmpty);
    assert.equal(resEmpty.isValid, false);
    assert.ok(resEmpty.errors.purchaseTypeOther);

    const otherSupplierValid: MachineryLoanFormData = {
      ...validFormData,
      purchaseType: "Other Supplier",
      purchaseTypeOther: "Direct Import from Germany GmbH",
    };
    const resValid = validateMachineryLoanForm(otherSupplierValid);
    assert.equal(resValid.isValid, true);
    assert.equal(resValid.errors.purchaseTypeOther, undefined);

    const otherSupplierTooLong: MachineryLoanFormData = {
      ...validFormData,
      purchaseType: "Other Supplier",
      purchaseTypeOther: "Z".repeat(MACHINERY_OTHER_SUPPLIER_MAX_LENGTH + 1),
    };
    assert.equal(validateMachineryLoanForm(otherSupplierTooLong).isValid, false);
  });

  test("9. Machinery cost is required and validates properly", () => {
    const emptyCost: MachineryLoanFormData = {
      ...validFormData,
      approximateMachineryCost: "",
    };
    const res = validateMachineryLoanForm(emptyCost);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.approximateMachineryCost);
  });

  test("10. Dealer/Supplier Name is OPTIONAL", () => {
    const formWithoutDealer: MachineryLoanFormData = {
      ...validFormData,
      dealerName: "",
    };
    const res = validateMachineryLoanForm(formWithoutDealer);
    assert.equal(res.isValid, true, "Empty dealerName must still be valid");

    const formWithLongDealer: MachineryLoanFormData = {
      ...validFormData,
      dealerName: "D".repeat(MACHINERY_DEALER_MAX_LENGTH + 1),
    };
    assert.equal(validateMachineryLoanForm(formWithLongDealer).isValid, false);
  });

  test("11. Invalid money is rejected (zero, negative, decimal, scientific notation)", () => {
    const testCases = ["0", "-50000", "25000.50", "1e9", "abc", "50000abc"];
    for (const val of testCases) {
      const form: MachineryLoanFormData = {
        ...validFormData,
        requestedLoanAmount: val,
      };
      const res = validateMachineryLoanForm(form);
      assert.equal(
        res.isValid,
        false,
        `Expected invalid for requestedLoanAmount: ${val}`
      );
    }
  });

  test("12. Malformed pasted money flag triggers proper error message", () => {
    const res = validateMachineryLoanForm(validFormData, {
      requestedLoanAmount: true,
    });
    assert.equal(res.isValid, false);
    assert.equal(
      res.errors.requestedLoanAmount,
      "Enter a whole-rupee amount using numbers only"
    );

    const costRes = validateMachineryLoanForm(validFormData, {
      approximateMachineryCost: true,
    });
    assert.equal(costRes.isValid, false);
    assert.equal(
      costRes.errors.approximateMachineryCost,
      "Enter a whole-rupee amount using numbers only"
    );
  });

  test("13. Dropdown values are restricted to valid options", () => {
    const invalidTypeForm = {
      ...validFormData,
      machineryType: "Invalid Custom Type" as any,
    };
    assert.equal(validateMachineryLoanForm(invalidTypeForm).isValid, false);

    const invalidConditionForm = {
      ...validFormData,
      machineryCondition: "Refurbished Unknown" as any,
    };
    assert.equal(validateMachineryLoanForm(invalidConditionForm).isValid, false);

    const invalidPurchaseForm = {
      ...validFormData,
      purchaseType: "Black Market" as any,
    };
    assert.equal(validateMachineryLoanForm(invalidPurchaseForm).isValid, false);
  });

  test("14. Back navigates to KYC without resetting state", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().setKycField("fullName", "Rajesh Patel");
    useLoansStore.getState().advanceTo("machinery-details");

    assert.equal(useLoansStore.getState().activeStep, "machinery-details");

    // Retreat to KYC
    useLoansStore.getState().retreatTo("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().kycData.fullName, "Rajesh Patel");
  });

  test("15. Continue opens the shared Documents screen after Machinery Screen 2", () => {
    setValidMachineryForm();
    useLoansStore.getState().advanceTo("machinery-details");

    assert.equal(useLoansStore.getState().validateMachineryLoanForm(), true);
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../modules/loans/screens/LoansMainScreen/LoansMainScreen.tsx"),
      "utf-8"
    );
    assert.match(source, /onContinue=\{\(\) => advanceTo\("documents"\)\}/);
    assert.doesNotMatch(source, /machinery-purchase-usage/);
  });

  test("Machinery documents resolve by condition and remain isolated from other products", () => {
    const newRequirements = machineryDocuments("New");
    const usedRequirements = machineryDocuments("Used / Pre-owned");
    assert.equal(newRequirements.length, 1);
    assert.equal(usedRequirements.length, 1);
    assert.equal(newRequirements[0].name, "Machinery Quotation / Proforma Invoice");
    assert.equal(usedRequirements[0].name, "Machinery Quotation / Purchase Document");
    assert.equal(newRequirements[0].isMandatory, true);
    assert.equal(usedRequirements[0].isMandatory, true);
    assert.equal(newRequirements[0].id, MACHINERY_DOCUMENT_IDS.newQuotation);
    assert.equal(usedRequirements[0].id, MACHINERY_DOCUMENT_IDS.usedPurchaseDocument);
    assert.notEqual(newRequirements[0].id, usedRequirements[0].id);
    assert.equal(new Set(newRequirements.map((item) => item.id)).size, newRequirements.length);

    const businessRequirements = resolveLoanDocumentRequirements({
      categoryId: "business-loan",
      businessFormData: createInitialBusinessFormData(),
      machineryFormData: validFormData,
    });
    assert.equal(
      businessRequirements.some(
        (item) =>
          item.id === MACHINERY_DOCUMENT_IDS.newQuotation ||
          item.id === MACHINERY_DOCUMENT_IDS.usedPurchaseDocument
      ),
      false
    );
    assert.deepEqual(
      resolveLoanDocumentRequirements({
        categoryId: "machinery-loan",
        businessFormData: createInitialBusinessFormData(),
      }),
      []
    );
  });

  test("Machinery quotation blocks progression until a valid document is uploaded", () => {
    const [requirement] = machineryDocuments("New");
    assert.ok(requirement);
    assert.deepEqual(
      getLoanDocumentProgress([requirement], {}).missingRequiredIds,
      [MACHINERY_DOCUMENT_IDS.newQuotation]
    );
    assert.equal(
      validateLoanDocumentFile(
        {
          uri: "file:///quotation.pdf",
          name: "quotation.pdf",
          size: 1024,
          mimeType: "application/pdf",
        },
        requirement
      ),
      null
    );
    assert.match(
      validateLoanDocumentFile(
        {
          uri: "file:///quotation.txt",
          name: "quotation.txt",
          size: 1024,
          mimeType: "text/plain",
        },
        requirement
      ) ?? "",
      /isn't supported/
    );
    assert.match(
      validateLoanDocumentFile(
        { uri: "file:///empty.pdf", name: "empty.pdf", size: 0, mimeType: "application/pdf" },
        requirement
      ) ?? "",
      /empty/
    );
    assert.match(
      validateLoanDocumentFile(
        {
          uri: "file:///large.pdf",
          name: "large.pdf",
          size: requirement.maxSizeBytes + 1,
          mimeType: "application/pdf",
        },
        requirement
      ) ?? "",
      /too large/
    );
  });

  test("Replace, remove, back, and Review Edit preserve the shared document state", () => {
    setValidMachineryForm();
    const firstUpload = machineryUpload();
    useLoansStore.getState().setDocumentAttachment(firstUpload.documentId, firstUpload);
    const replacement = { ...machineryUpload(), fileName: "replacement.pdf" };
    useLoansStore.getState().setDocumentAttachment(replacement.documentId, replacement);
    assert.equal(
      useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation]?.fileName,
      "replacement.pdf"
    );

    useLoansStore.getState().setActiveStep("documents");
    useLoansStore.getState().retreatTo("machinery-details");
    assert.ok(useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation]);
    useLoansStore.getState().editFromReview("documents");
    assert.ok(useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation]);
    useLoansStore.getState().advanceTo("review");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.ok(useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation]);

    useLoansStore
      .getState()
      .setDocumentAttachment(MACHINERY_DOCUMENT_IDS.newQuotation, null);
    assert.equal(
      useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation],
      undefined
    );
  });

  test("Review validates required Machinery documents and shows their uploaded status", () => {
    setValidMachineryForm();
    useLoansStore.getState().setReviewConsent(true);
    assert.equal(useLoansStore.getState().validateReview(), false);
    assert.ok(
      useLoansStore.getState().reviewErrors.documents?.[MACHINERY_DOCUMENT_IDS.newQuotation]
    );

    useLoansStore.getState().setDocumentAttachment(
      MACHINERY_DOCUMENT_IDS.newQuotation,
      machineryUpload()
    );
    assert.equal(useLoansStore.getState().validateReview(), true);
    const state = useLoansStore.getState();
    const sections = buildReviewSections(
      state.kycData,
      state.businessFormData,
      undefined,
      "machinery-loan",
      undefined,
      undefined,
      undefined,
      state.machineryFormData
    );
    assert.equal(sections.find((section) => section.id === "machinery")?.editTarget, "machinery-details");
    const checklist = getLoanDocumentChecklist(
      machineryDocuments(state.machineryFormData.machineryCondition),
      state.uploadedDocuments
    );
    assert.equal(checklist[0].isUploaded, true);
    assert.equal(checklist[0].fileName, "machinery-quotation.pdf");
  });

  test("New/Used condition changes hide incompatible uploads and preserve condition-specific documents", () => {
    setValidMachineryForm();
    useLoansStore.getState().setDocumentAttachment(
      MACHINERY_DOCUMENT_IDS.newQuotation,
      machineryUpload()
    );
    useLoansStore.getState().setMachineryLoanField("machineryCondition", "Used / Pre-owned");
    assert.equal(
      machineryDocuments(useLoansStore.getState().machineryFormData.machineryCondition)[0].name,
      "Machinery Quotation / Purchase Document"
    );
    const usedRequirement = machineryDocuments("Used / Pre-owned")[0];
    assert.ok(usedRequirement);
    assert.equal(usedRequirement.id, MACHINERY_DOCUMENT_IDS.usedPurchaseDocument);
    assert.deepEqual(
      getLoanDocumentProgress(
        [usedRequirement],
        useLoansStore.getState().uploadedDocuments
      ).missingRequiredIds,
      [MACHINERY_DOCUMENT_IDS.usedPurchaseDocument]
    );
    assert.ok(useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation]);
    const usedUpload = {
      ...machineryUpload(),
      id: `${MACHINERY_DOCUMENT_IDS.usedPurchaseDocument}_1`,
      documentId: MACHINERY_DOCUMENT_IDS.usedPurchaseDocument,
      fileName: "machinery-purchase-document.pdf",
    };
    useLoansStore.getState().setDocumentAttachment(
      MACHINERY_DOCUMENT_IDS.usedPurchaseDocument,
      usedUpload
    );
    useLoansStore.getState().setMachineryLoanField("machineryCondition", "New");
    assert.ok(useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation]);
    const newRequirement = machineryDocuments("New")[0];
    assert.ok(newRequirement);
    assert.deepEqual(
      getLoanDocumentProgress(
        [newRequirement],
        useLoansStore.getState().uploadedDocuments
      ).missingRequiredIds,
      []
    );
    assert.equal(
      getLoanDocumentChecklist(
        [newRequirement],
        useLoansStore.getState().uploadedDocuments
      )[0].fileName,
      "machinery-quotation.pdf"
    );
    useLoansStore.getState().setMachineryLoanField("machineryCondition", "Used / Pre-owned");
    assert.deepEqual(
      getLoanDocumentProgress(
        [usedRequirement],
        useLoansStore.getState().uploadedDocuments
      ).missingRequiredIds,
      []
    );
    assert.equal(
      getLoanDocumentChecklist(
        [usedRequirement],
        useLoansStore.getState().uploadedDocuments
      )[0].fileName,
      "machinery-purchase-document.pdf"
    );
  });

  test("Submission includes Machinery form and only the applicable Machinery document", async () => {
    setValidMachineryForm();
    useLoansStore.getState().setDocumentAttachment(
      MACHINERY_DOCUMENT_IDS.newQuotation,
      machineryUpload()
    );
    useLoansStore.getState().setDocumentAttachment("business_proof", {
      ...machineryUpload(),
      id: "business_proof_1",
      documentId: "business_proof",
      fileName: "business-proof.pdf",
    });
    useLoansStore.getState().setReviewConsent(true);
    let submittedPayload: LoanSubmissionPayload | undefined;
    setLoanSubmissionService({
      submit: async (payload) => {
        submittedPayload = payload;
        return {
          applicationId: "TXE-LN-TEST",
          submittedAt: "2026-10-15T00:00:00.000Z",
          isSyncedToServer: false,
        };
      },
    });

    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    assert.deepEqual(
      submittedPayload?.documents.map((document) => document.documentId),
      [MACHINERY_DOCUMENT_IDS.newQuotation]
    );
    assert.equal(submittedPayload?.machineryFormData?.machineryName, validFormData.machineryName);
    assert.equal(submittedPayload?.businessFormData.businessProfile.businessName, "");
  });

  test("16. First visit shows 'Continue →'", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().advanceTo("machinery-details");

    const isRevisit = useLoansStore
      .getState()
      .completedSteps.includes("machinery-details");
    assert.equal(isRevisit, false);
    assert.equal(getContinueLabel(isRevisit, "Continue →"), "Continue →");
  });

  test("17. Revisit/edit shows 'Update & Continue →'", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().advanceTo("machinery-details");
    useLoansStore.getState().advanceTo("documents");

    // Going back to Screen 2
    useLoansStore.getState().retreatTo("machinery-details");

    const isRevisit = useLoansStore
      .getState()
      .completedSteps.includes("machinery-details");
    assert.equal(isRevisit, true);
    assert.equal(
      getContinueLabel(isRevisit, "Continue →"),
      "Update & Continue →"
    );
  });

  test("18. Update & Continue moves forward normally", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().advanceTo("machinery-details");
    useLoansStore.getState().advanceTo("documents");
    useLoansStore.getState().retreatTo("machinery-details");

    // Press Update & Continue
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
  });

  test("19. KYC data remains intact throughout Screen 2 entry, edit, and forward navigation", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().setKycField("fullName", "Sunita Sharma");
    useLoansStore.getState().setKycField("mobile", "9876543210");
    useLoansStore.getState().setKycField("pan", "ABCPS1234F");

    useLoansStore.getState().advanceTo("machinery-details");
    useLoansStore
      .getState()
      .setMachineryLoanField("requestedLoanAmount", "1500000");

    assert.equal(useLoansStore.getState().kycData.fullName, "Sunita Sharma");
    assert.equal(useLoansStore.getState().kycData.mobile, "9876543210");
    assert.equal(useLoansStore.getState().kycData.pan, "ABCPS1234F");

    useLoansStore.getState().retreatTo("kyc");
    assert.equal(useLoansStore.getState().kycData.fullName, "Sunita Sharma");
  });

  test("20. Existing later-screen data remains intact on Screen 2 edit", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().advanceTo("machinery-details");
    useLoansStore.getState().advanceTo("documents");

    // Add a document attachment
    useLoansStore.getState().setDocumentAttachment(MACHINERY_DOCUMENT_IDS.newQuotation, {
      id: "doc-1",
      documentId: MACHINERY_DOCUMENT_IDS.newQuotation,
      fileName: "quotation.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
      fileUri: "file:///quotation.pdf",
      status: "selected",
    });

    // Return to Screen 2 and edit
    useLoansStore.getState().retreatTo("machinery-details");
    useLoansStore
      .getState()
      .setMachineryLoanField("approximateMachineryCost", "4000000");

    // Advance forward
    useLoansStore.getState().advanceTo("documents");

    // Verify document attachment was preserved
    assert.ok(
      useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation]
    );
    assert.equal(
      useLoansStore.getState().uploadedDocuments[MACHINERY_DOCUMENT_IDS.newQuotation].fileName,
      "quotation.pdf"
    );
  });

  test("21. Machinery data does not leak into another loan on category switch", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore
      .getState()
      .setMachineryLoanField("requestedLoanAmount", "5000000");
    useLoansStore
      .getState()
      .setMachineryLoanField("machineryName", "Hydraulic Press");
    useLoansStore.getState().setDocumentAttachment(
      MACHINERY_DOCUMENT_IDS.newQuotation,
      machineryUpload()
    );

    // Switch to Personal Loan
    const personalCategory = makeCategory("personal-loan", "Personal Loan");
    useLoansStore.getState().selectCategory(personalCategory);

    const stateAfterSwitch = useLoansStore.getState();
    assert.equal(
      stateAfterSwitch.machineryFormData.requestedLoanAmount,
      ""
    );
    assert.equal(stateAfterSwitch.machineryFormData.machineryName, "");
    assert.equal(stateAfterSwitch.personalFormData.loanAmount, "");
    assert.deepEqual(stateAfterSwitch.uploadedDocuments, {});
    assert.equal(
      resolveLoanDocumentRequirements({
        categoryId: "personal-loan",
        businessFormData: stateAfterSwitch.businessFormData,
        personalFormData: stateAfterSwitch.personalFormData,
        machineryFormData: stateAfterSwitch.machineryFormData,
      }).some(
        (item) =>
          item.id === MACHINERY_DOCUMENT_IDS.newQuotation ||
          item.id === MACHINERY_DOCUMENT_IDS.usedPurchaseDocument
      ),
      false
    );
  });

  test("22. Business/Working Capital UI never appears for Machinery Loan", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().advanceTo("machinery-details");

    const mainScreenPath = path.resolve(
      __dirname,
      "../../modules/loans/screens/LoansMainScreen/LoansMainScreen.tsx"
    );
    const mainScreenSource = fs.readFileSync(mainScreenPath, "utf-8");

    // Explicit check that machinery-details maps to MachineryLoanScreen
    assert.match(
      mainScreenSource,
      /case "machinery-details":\s*return\s*\(\s*<MachineryLoanScreen/
    );
    assert.doesNotMatch(
      mainScreenSource,
      /case "machinery-details":\s*return\s*\(\s*<BusinessLoanScreen/
    );

    // Verify resolveLoanActiveStep returns machinery-details and never business-details
    const resolved = resolveLoanActiveStep(
      "machinery-loan",
      useLoansStore.getState().activeStep
    );
    assert.equal(resolved, "machinery-details");
    assert.notEqual(resolved, "business-details");
  });

  test("23. Architectural audit: No duplicate CTA or Dropdown components created", () => {
    const machineryDir = path.resolve(
      __dirname,
      "../../modules/loans/machinery"
    );
    const files = fs.readdirSync(machineryDir, { recursive: true }).map(String);

    assert.ok(
      !files.some((f) => /dropdown/i.test(f)),
      "No duplicate Dropdown component in machinery module"
    );
    assert.ok(
      !files.some((f) => /(Continue|Cta|PrimaryButton)/i.test(f)),
      "No duplicate CTA button component in machinery module"
    );
  });
});
