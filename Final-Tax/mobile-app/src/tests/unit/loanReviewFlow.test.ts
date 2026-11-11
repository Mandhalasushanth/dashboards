/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { buildReviewSections, maskAadhaar } from "../../modules/loans/utils/loanReviewSummary";
import { getRequiredDocuments } from "../../modules/loans/constants/loanDocuments";
import { getLoanDocumentChecklist } from "../../modules/loans/validation/loanDocumentsValidation";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import { DEFAULT_NEXT_STEPS, STATUS_LABELS, formatSubmittedAt } from "../../shared/components/ApplicationUnderReview/config";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const doc = (id: string): LoanDocumentUpload => ({
  id: `${id}_1`,
  documentId: id,
  fileName: `${id}.pdf`,
  fileUri: `file:///${id}.pdf`,
  fileSize: 100,
  mimeType: "application/pdf",
  status: "selected",
});

const category = {
  id: "business-loan" as const,
  title: "Business & Working Capital",
  description: "Business Credit",
  image: { uri: "test" },
};

function fillKycAndBusiness(loanType: "business-loan" | "working-capital") {
  const s = useLoansStore.getState();
  s.selectCategory(category);
  s.setKycField("fullName", "Rajesh Sharma");
  s.setKycField("mobile", "9876543210");
  s.setKycField("pan", "ABCPE1234F");
  s.setKycField("aadhaar", "234567890123");
  s.setKycField("dob", "15-08-1985");
  s.setCurrentAddressField("houseNumber", "Flat 402");
  s.setCurrentAddressField("street", "MG Road");
  s.setCurrentAddressField("city", "Hyderabad");
  s.setCurrentAddressField("state", "Telangana");
  s.setCurrentAddressField("pincode", "500001");
  s.setConsent(true);
  s.setLoanType(loanType);
  s.setBusinessProfileField("businessName", "Sharma Enterprises");
  s.setBusinessProfileField("constitution", "Proprietorship");
  s.setBusinessProfileField("pincode", "500001");
  if (loanType === "business-loan") {
    s.setBusinessLoanField("loanAmount", "500000");
    s.setBusinessLoanField("purpose", "Business Expansion");
  } else {
    s.setWorkingCapitalField("loanAmount", "300000");
    s.setWorkingCapitalField("purpose", "Payroll");
    s.setWorkingCapitalField("monthlySales", "800000");
  }
}

function uploadAllRequired() {
  const form = useLoansStore.getState().businessFormData;
  getRequiredDocuments(form.loanType, form)
    .filter((r) => r.isMandatory)
    .forEach((r) => useLoansStore.getState().setDocumentAttachment(r.id, doc(r.id)));
}

const sectionsOf = () => {
  const { kycData, businessFormData } = useLoansStore.getState();
  return buildReviewSections(kycData, businessFormData);
};

describe("review summary", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("business loan shows business-loan fields only", () => {
    fillKycAndBusiness("business-loan");
    const loan = sectionsOf().find((s) => s.id === "loan");
    const labels = loan?.rows.map((r) => r.label) ?? [];
    assert.ok(labels.includes("Requested Amount"));
    assert.ok(labels.includes("Purpose"));
    assert.ok(!labels.includes("Avg Monthly Sales"));
    assert.equal(loan?.rows[0].value, "Business Loan");
  });

  test("project cost appears only for purposes that need it", () => {
    fillKycAndBusiness("business-loan");
    const s = useLoansStore.getState();
    s.setBusinessLoanField("projectCost", "250000");
    let loan = sectionsOf().find((x) => x.id === "loan");
    assert.ok(!loan?.rows.some((r) => r.label === "Project / Equipment Cost"));
    s.setBusinessLoanField("purpose", "Equipment Purchase");
    loan = sectionsOf().find((x) => x.id === "loan");
    assert.ok(loan?.rows.some((r) => r.label === "Project / Equipment Cost"));
  });

  test("working capital shows working-capital fields only", () => {
    fillKycAndBusiness("working-capital");
    const loan = sectionsOf().find((s) => s.id === "loan");
    const labels = loan?.rows.map((r) => r.label) ?? [];
    assert.ok(labels.includes("Required Credit Limit"));
    assert.ok(labels.includes("Avg Monthly Sales"));
    assert.ok(!labels.includes("Requested Amount"));
    assert.equal(loan?.rows[0].value, "Working Capital Loan");
  });

  test("applicant section masks Aadhaar and asks for no credit information", () => {
    fillKycAndBusiness("business-loan");
    const applicant = sectionsOf().find((s) => s.id === "applicant");
    assert.equal(applicant?.rows.find((r) => r.label === "Aadhaar")?.value, "XXXX XXXX 0123");
    assert.equal(maskAadhaar("12"), "—");
    const text = JSON.stringify(sectionsOf()).toLowerCase();
    assert.ok(!/cibil|credit score|existing loan|emi/.test(text));
  });
});

describe("review documents are status only", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("checklist reports uploaded and missing documents", () => {
    fillKycAndBusiness("business-loan");
    useLoansStore.getState().setDocumentAttachment("pan_card", doc("pan_card"));
    const { businessFormData, uploadedDocuments } = useLoansStore.getState();
    const items = getLoanDocumentChecklist(
      getRequiredDocuments(businessFormData.loanType, businessFormData),
      uploadedDocuments
    );
    assert.equal(items.find((i) => i.id === "pan_card")?.isUploaded, true);
    assert.equal(items.find((i) => i.id === "business_proof")?.isUploaded, false);
  });

  test("Review screen sources contain no upload controls", () => {
    const root = path.join(process.cwd(), "src/modules/loans");
    const files = [
      "screens/LoanReviewScreen/LoanReviewScreen.tsx",
      "components/ReviewDocumentsSummary/ReviewDocumentsSummary.tsx",
      "components/ApplicationSummarySection/ApplicationSummarySection.tsx",
    ];
    for (const file of files) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      assert.ok(
        !/DocumentPicker|ImagePicker|DocumentUploadBottomSheet|useLoanDocumentUpload|useDocumentUploadHelper|DocumentRequirementCard|setDocumentAttachment/.test(source),
        file
      );
    }
  });
});

describe("submission", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  test("missing required documents block submission and stay on review", async () => {
    fillKycAndBusiness("business-loan");
    useLoansStore.getState().setActiveStep("review");
    useLoansStore.getState().setReviewConsent(true);
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    const s = useLoansStore.getState();
    assert.equal(s.activeStep, "review");
    assert.ok(s.reviewErrors.documents?.pan_card);
    assert.equal(s.submittedApplicationId, null);
  });

  test("missing required fields are reported on their section", async () => {
    uploadAllRequired();
    useLoansStore.getState().setReviewConsent(true);
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    const errors = useLoansStore.getState().reviewErrors;
    assert.ok(errors.applicant);
    assert.ok(errors.business);
  });

  test("a complete application moves to Under Review and is not marked synced", async () => {
    fillKycAndBusiness("working-capital");
    uploadAllRequired();
    useLoansStore.getState().setActiveStep("review");
    useLoansStore.getState().setReviewConsent(true);
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true, JSON.stringify(useLoansStore.getState().reviewErrors));
    const s = useLoansStore.getState();
    assert.equal(s.activeStep, "submitted");
    assert.ok(s.submittedApplicationId?.startsWith("TXE-LN-"));
    assert.ok(s.submittedAt);
    assert.equal(s.isSubmissionSynced, false);
  });

  test("a failing submission service keeps all data and shows a friendly error", async () => {
    setLoanSubmissionService({
      submit: async () => {
        throw new Error("socket hang up 500");
      },
    });
    fillKycAndBusiness("business-loan");
    uploadAllRequired();
    useLoansStore.getState().setActiveStep("review");
    useLoansStore.getState().setReviewConsent(true);
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    const s = useLoansStore.getState();
    assert.equal(s.activeStep, "review");
    assert.equal(s.isSubmitting, false);
    assert.ok(!/socket|500/.test(s.reviewErrors.general ?? ""));
    assert.equal(s.kycData.fullName, "Rajesh Sharma");
    assert.ok(s.uploadedDocuments.pan_card);
  });

  test("editing earlier screens from review preserves the whole application", () => {
    fillKycAndBusiness("business-loan");
    uploadAllRequired();
    const s = useLoansStore.getState();
    s.setActiveStep("review");
    s.setActiveStep("kyc");
    s.setKycField("fullName", "Rajesh K Sharma");
    s.setActiveStep("business-details");
    s.setBusinessLoanField("loanAmount", "600000");
    s.setActiveStep("documents");
    s.setActiveStep("review");
    const after = useLoansStore.getState();
    assert.equal(after.kycData.fullName, "Rajesh K Sharma");
    assert.equal(after.businessFormData.businessLoan.loanAmount, "600000");
    assert.equal(after.businessFormData.loanType, "business-loan");
    assert.ok(after.uploadedDocuments.pan_card);
    assert.equal(after.businessFormData.businessProfile.businessName, "Sharma Enterprises");
  });
});

describe("edit from review returns to review", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("forward navigation follows the normal order outside edit mode", () => {
    const s = useLoansStore.getState();
    s.setActiveStep("kyc");
    s.advanceTo("business-details");
    assert.equal(useLoansStore.getState().activeStep, "business-details");
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    useLoansStore.getState().retreatTo("business-details");
    assert.equal(useLoansStore.getState().activeStep, "business-details");
  });

  test("saving an edited section goes straight back to review with data intact", () => {
    fillKycAndBusiness("working-capital");
    uploadAllRequired();
    useLoansStore.getState().setActiveStep("review");

    useLoansStore.getState().editFromReview("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().returnToReview, true);
    useLoansStore.getState().setKycField("fullName", "Rajesh Edited");
    useLoansStore.getState().advanceTo("business-details");

    const s = useLoansStore.getState();
    assert.equal(s.activeStep, "review");
    assert.equal(s.returnToReview, false);
    assert.equal(s.kycData.fullName, "Rajesh Edited");
    assert.equal(s.businessFormData.loanType, "working-capital");
    assert.equal(s.businessFormData.workingCapital.monthlySales, "800000");
    assert.ok(s.uploadedDocuments.pan_card);
  });

  test("backing out of an edit also returns to review", () => {
    fillKycAndBusiness("business-loan");
    useLoansStore.getState().setActiveStep("review");
    useLoansStore.getState().editFromReview("documents");
    useLoansStore.getState().retreatTo("business-details");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });

  test("discarding the application clears edit mode", () => {
    useLoansStore.getState().editFromReview("kyc");
    useLoansStore.getState().resetAll();
    assert.equal(useLoansStore.getState().returnToReview, false);
    assert.equal(useLoansStore.getState().activeStep, "categories");
  });
});

describe("loan type switching and submission payload", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  test("switching loan type keeps both sets of entered values", () => {
    fillKycAndBusiness("business-loan");
    useLoansStore.getState().setWorkingCapitalField("monthlySales", "900000");
    useLoansStore.getState().setLoanType("working-capital");
    useLoansStore.getState().setLoanType("business-loan");
    const form = useLoansStore.getState().businessFormData;
    assert.equal(form.businessLoan.loanAmount, "500000");
    assert.equal(form.workingCapital.monthlySales, "900000");
    assert.equal(form.businessProfile.businessName, "Sharma Enterprises");
  });

  test("only documents that apply to the selected loan type are submitted", async () => {
    let captured: LoanSubmissionPayload | null = null;
    setLoanSubmissionService({
      submit: async (payload) => {
        captured = payload;
        return { applicationId: "TXE-LN-1", submittedAt: new Date().toISOString(), isSyncedToServer: false };
      },
    });
    fillKycAndBusiness("working-capital");
    uploadAllRequired();
    // Left over from before the customer switched loan type.
    useLoansStore.getState().setDocumentAttachment("business_proof", doc("business_proof"));
    useLoansStore.getState().setReviewConsent(true);
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true, JSON.stringify(useLoansStore.getState().reviewErrors));
    const ids = (captured as LoanSubmissionPayload | null)?.documents.map((d) => d.documentId) ?? [];
    assert.ok(ids.includes("pan_card"));
    assert.ok(!ids.includes("business_proof"));
  });

  test("consent error clears when the declaration is accepted", async () => {
    fillKycAndBusiness("business-loan");
    uploadAllRequired();
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    assert.ok(useLoansStore.getState().reviewErrors.consent);
    useLoansStore.getState().setReviewConsent(true);
    assert.equal(useLoansStore.getState().reviewErrors.consent, undefined);
  });

  test("resetAll leaves no stale application behind", () => {
    fillKycAndBusiness("working-capital");
    uploadAllRequired();
    useLoansStore.getState().setReviewConsent(true);
    useLoansStore.getState().resetAll();
    const s = useLoansStore.getState();
    assert.equal(s.kycData.fullName, "");
    assert.equal(s.businessFormData.loanType, "business-loan");
    assert.equal(s.businessFormData.workingCapital.loanAmount, "");
    assert.deepEqual(s.uploadedDocuments, {});
    assert.equal(s.isReviewConsentGiven, false);
    assert.equal(s.submittedApplicationId, null);
    assert.equal(s.selectedCategory, null);
  });
});

const readSource = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("shared Application Under Review", () => {
  test("the only status is Under Review and nothing claims approval", () => {
    assert.deepEqual(Object.values(STATUS_LABELS), ["Under Review"]);
    const sources = [
      "src/shared/components/ApplicationUnderReview/ApplicationUnderReview.tsx",
      "src/shared/components/ApplicationUnderReview/config.ts",
      "src/modules/loans/screens/LoanUnderReviewScreen/LoanUnderReviewScreen.tsx",
    ]
      .map(readSource)
      .join(" ")
      .concat(DEFAULT_NEXT_STEPS.join(" "));
    assert.ok(!/approved|sanction|eligible|guarantee|disburs/i.test(sources));
  });

  test("formats the submission time and tolerates a missing one", () => {
    assert.equal(formatSubmittedAt(null), "—");
    assert.equal(formatSubmittedAt("not-a-date"), "—");
    assert.match(formatSubmittedAt("2026-10-13T10:41:00.000Z"), /2026/);
  });

  test("loans uses the shared component and has no screen UI of its own", () => {
    const loans = readSource("src/modules/loans/screens/LoanUnderReviewScreen/LoanUnderReviewScreen.tsx");
    assert.ok(loans.includes("@/shared/components/ApplicationUnderReview"));
    assert.ok(!/StyleSheet|<View|<Text/.test(loans));
  });
});

describe("edit mode screens", () => {
  const flowScreens = [
    "src/modules/loans/screens/LoanKycScreen/LoanKycScreen.tsx",
    "src/modules/loans/businessWorkingCapital/screens/BusinessLoanScreen/BusinessLoanScreen.tsx",
    "src/modules/loans/screens/LoanDocumentUploadScreen/LoanDocumentUploadScreen.tsx",
  ];

  test("edit screens use Update & Continue and hide back through the header", () => {
    for (const file of flowScreens) {
      const source = readSource(file);
      assert.ok(source.includes("Update & Continue"), file);
      assert.ok(source.includes("isEditMode={isEditMode}"), file);
    }
    const header = readSource("src/modules/loans/components/LoanFlowHeader/LoanFlowHeader.tsx");
    assert.ok(/onBack:\s*undefined/.test(header));
  });

  test("redundant category and provider banners are gone from the flow screens", () => {
    for (const file of flowScreens) {
      assert.ok(!readSource(file).includes("LoanCategoryBadge"), file);
    }
  });
});
