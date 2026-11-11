/// <reference types="node" />
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import {
  getLoanDetailsStep,
  getLoanEntryStep,
  getLoanFlowDefinition,
  resolveLoanActiveStep,
} from "../../modules/loans/constants/loanFlow";
import { resolveLoanDocumentRequirements } from "../../modules/loans/constants/loanDocumentResolver";
import {
  useLoansStore,
  type LoanStep,
} from "../../modules/loans/store/loansStore";
import {
  createInitialBusinessFormData,
  createInitialHomeLoanFormData,
  createInitialKycData,
  createInitialPersonalFormData,
} from "../../modules/loans/store/loansStore.types";
import { createInitialPropertyFormData } from "../../modules/loans/property/types/property.types";
import { createInitialVehicleLoanFormData } from "../../modules/loans/vehicle/types/vehicleLoan.types";
import { validateReviewSubmission } from "../../modules/loans/validation/loanReviewValidation";
import { buildReviewSections } from "../../modules/loans/utils/loanReviewSummary";
import type { LoanCategoryId } from "../../modules/loans/types/loanCategory.types";

const category = (id: LoanCategoryId) => ({
  id,
  title: id,
  description: "",
  image: { uri: "test" },
});

const unsupportedCategories: LoanCategoryId[] = [
  "project-finance",
];

const implementedDetails: readonly (readonly [LoanCategoryId, LoanStep])[] = [
  ["business-loan", "business-details"],
  ["personal-loan", "personal-employment"],
  ["home-loan", "home-loan-requirement"],
  ["property-loan", "property-details"],
  ["vehicle-loan", "vehicle-details"],
  ["machinery-loan", "machinery-details"],
  ["msme-loan", "msme-details"],
];

const documentUpload = {
  id: "business-proof-file",
  documentId: "business_proof",
  fileName: "business-proof.pdf",
  fileUri: "file:///business-proof.pdf",
  fileSize: 10,
  mimeType: "application/pdf",
  status: "selected" as const,
};

describe("loan category flow routing", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("Project Finance enters Coming Soon, not a fallback flow", () => {
    for (const id of unsupportedCategories) {
      const flow = getLoanFlowDefinition(id);
      assert.equal(flow.availability, "coming-soon", id);
      assert.equal(getLoanDetailsStep(id), null, id);
      assert.equal(getLoanEntryStep(id), "unavailable", id);

      useLoansStore.getState().selectCategory(category(id));
      assert.equal(useLoansStore.getState().activeStep, "unavailable", id);
      useLoansStore.getState().retreatTo("categories");
      assert.equal(useLoansStore.getState().activeStep, "categories", id);
    }
  });

  test("Business, Personal, Home, Property, Vehicle, Machinery, and MSME use their dedicated routes", () => {
    for (const [id, expectedStep] of implementedDetails) {
      assert.equal(getLoanFlowDefinition(id).availability, "implemented", id);
      assert.equal(getLoanDetailsStep(id), expectedStep, id);
      assert.equal(getLoanEntryStep(id), "kyc", id);

      useLoansStore.getState().selectCategory(category(id));
      assert.equal(useLoansStore.getState().activeStep, "kyc", id);
    }
  });

  test("a stale detail step resolves to KYC, then advances to the selected product screen", () => {
    for (const [id, expectedStep] of implementedDetails) {
      for (const [, staleStep] of implementedDetails) {
        const resolvedStep = resolveLoanActiveStep(id, staleStep);
        assert.equal(
          resolvedStep,
          staleStep === expectedStep ? expectedStep : "kyc",
          `${id} must not render ${staleStep}`
        );
      }

      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory(category(id));
      useLoansStore.getState().setActiveStep("business-details");
      assert.equal(
        resolveLoanActiveStep(id, useLoansStore.getState().activeStep),
        id === "business-loan" ? "business-details" : "kyc",
        `${id} must not render stale Business details`
      );

      useLoansStore.getState().advanceTo(getLoanDetailsStep(id) ?? "unavailable");
      assert.equal(useLoansStore.getState().activeStep, expectedStep, id);
      assert.equal(
        resolveLoanActiveStep(id, useLoansStore.getState().activeStep),
        expectedStep,
        `${id} resolves to its own Screen 2`
      );
    }
  });

  test("each implemented product returns from Screen 2 to KYC and advances to its own Screen 2", () => {
    for (const [id, expectedStep] of implementedDetails) {
      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory(category(id));
      assert.equal(useLoansStore.getState().activeStep, "kyc", id);

      useLoansStore.getState().advanceTo(getLoanDetailsStep(id) ?? "unavailable");
      assert.equal(resolveLoanActiveStep(id, useLoansStore.getState().activeStep), expectedStep, id);

      useLoansStore.getState().retreatTo("kyc");
      assert.equal(useLoansStore.getState().activeStep, "kyc", id);

      useLoansStore.getState().advanceTo(getLoanDetailsStep(id) ?? "unavailable");
      assert.equal(useLoansStore.getState().activeStep, expectedStep, id);
      assert.equal(resolveLoanActiveStep(id, useLoansStore.getState().activeStep), expectedStep, id);
    }
  });

  test("unsupported categories cannot resolve to a product detail screen", () => {
    for (const id of unsupportedCategories) {
      for (const [, detailsStep] of implementedDetails) {
        assert.equal(resolveLoanActiveStep(id, detailsStep), "unavailable", id);
      }
    }
  });

  test("Working Capital remains the existing Business product subtype", () => {
    useLoansStore.getState().selectCategory(category("business-loan"));
    useLoansStore.getState().setLoanType("working-capital");
    assert.equal(getLoanDetailsStep("business-loan"), "business-details");
    assert.equal(useLoansStore.getState().businessFormData.loanType, "working-capital");
  });

  test("Review Edit targets the mapped product screen and Update & Continue returns to Review", () => {
    for (const [id, expectedStep] of implementedDetails) {
      useLoansStore.getState().resetAll();
      const store = useLoansStore.getState();
      store.selectCategory(category(id));
      store.advanceTo(expectedStep);
      store.advanceTo("documents");
      store.advanceTo("review");
      useLoansStore.getState().editFromReview(getLoanDetailsStep(id) ?? "unavailable");

      assert.equal(useLoansStore.getState().activeStep, expectedStep, id);
      assert.equal(useLoansStore.getState().returnToReview, true, id);
      useLoansStore.getState().advanceTo("documents");
      assert.equal(useLoansStore.getState().activeStep, "review", id);
      assert.equal(useLoansStore.getState().returnToReview, false, id);
    }
  });

  test("unsupported products have no Business documents or Business review sections", () => {
    const businessFormData = createInitialBusinessFormData();
    for (const id of unsupportedCategories) {
      assert.deepEqual(
        resolveLoanDocumentRequirements({ categoryId: id, businessFormData }),
        [],
        id
      );
      const sections = buildReviewSections(
        createInitialKycData(),
        businessFormData,
        undefined,
        id
      );
      assert.deepEqual(sections.map((section) => section.id), ["applicant"], id);
    }
  });

  test("Vehicle Loan resolves condition-specific documents instead of an empty list", () => {
    const vehicleFormData = {
      ...createInitialVehicleLoanFormData(),
      vehicleCondition: "New Vehicle" as const,
    };
    const requirements = resolveLoanDocumentRequirements({
      categoryId: "vehicle-loan",
      businessFormData: createInitialBusinessFormData(),
      vehicleFormData,
    });
    assert.deepEqual(
      requirements.map(({ id, isMandatory }) => [id, isMandatory]),
      [
        ["vehicle_new_quotation", true],
        ["vehicle_booking_receipt", false],
      ]
    );
    assert.ok(requirements.length > 0);
    assert.equal(requirements.some(({ id }) => id === "business_proof"), false);
  });

  test("unsupported products cannot be submitted through Business validation", () => {
    const result = validateReviewSubmission(
      createInitialKycData(),
      createInitialBusinessFormData(),
      {},
      true,
      undefined,
      "project-finance"
    );
    assert.equal(result.isValid, false);
    assert.match(result.errors.general ?? "", /coming soon/i);
  });
});

describe("loan category state isolation", () => {
  const transitions: readonly (readonly [
    LoanCategoryId,
    LoanCategoryId,
    "business-loan" | "working-capital",
  ])[] = [
    ["business-loan", "vehicle-loan", "business-loan"],
    ["vehicle-loan", "business-loan", "business-loan"],
    ["business-loan", "msme-loan", "working-capital"],
    ["msme-loan", "personal-loan", "business-loan"],
    ["project-finance", "home-loan", "business-loan"],
    ["home-loan", "vehicle-loan", "business-loan"],
    ["property-loan", "machinery-loan", "business-loan"],
  ];

  beforeEach(() => useLoansStore.getState().resetAll());

  test("switching categories clears every product form, document, error, edit, and submission state", () => {
    for (const [from, to, loanType] of transitions) {
      useLoansStore.getState().resetAll();
      const store = useLoansStore.getState();
      store.selectCategory(category(from));
      store.setKycField("fullName", "Previous applicant");
      store.setBusinessProfileField("businessName", "Previous business");
      store.setBusinessLoanField("loanAmount", "111000");
      store.setWorkingCapitalField("loanAmount", "222000");
      store.setLoanType(loanType);
      store.setPersonalLoanField("employerName", "Previous employer");
      store.setHomeLoanField("loanAmount", "333000");
      store.setPropertyField("city", "Previous city");
      store.setVehicleLoanField("make", "Previous vehicle");
      store.setDocumentAttachment("business_proof", documentUpload);
      useLoansStore.setState({
        kycErrors: { fullName: "Previous validation error" },
        businessErrors: { businessName: "Previous validation error" },
        personalErrors: { loanAmount: "Previous validation error" },
        homeLoanErrors: { loanAmount: "Previous validation error" },
        propertyErrors: { city: "Previous validation error" },
        reviewErrors: { general: "Previous review error" },
        isReviewConsentGiven: true,
        returnToReview: true,
        completedSteps: ["kyc", "review"],
        submittedApplicationId: "previous-application",
        submittedAt: "2026-01-01T00:00:00.000Z",
        isSubmissionSynced: true,
        isSubmitting: true,
      });

      useLoansStore.getState().selectCategory(category(to));
      const next = useLoansStore.getState();

      assert.equal(next.selectedCategory?.id, to);
      assert.equal(next.activeStep, getLoanEntryStep(to));
      assert.equal(next.returnToReview, false);
      assert.deepEqual(next.completedSteps, []);
      assert.deepEqual(next.kycData, createInitialKycData());
      assert.equal(next.kycStatus, "not_connected");
      assert.deepEqual(next.kycErrors, {});
      assert.deepEqual(next.businessFormData, createInitialBusinessFormData());
      assert.deepEqual(next.businessErrors, {});
      assert.deepEqual(next.personalFormData, createInitialPersonalFormData());
      assert.deepEqual(next.personalErrors, {});
      assert.deepEqual(next.homeLoanFormData, createInitialHomeLoanFormData());
      assert.deepEqual(next.homeLoanErrors, {});
      assert.deepEqual(next.propertyFormData, createInitialPropertyFormData());
      assert.deepEqual(next.propertyErrors, {});
      assert.deepEqual(next.vehicleFormData, {
        requestedLoanAmount: "",
        vehicleCondition: "",
        vehicleCategory: "",
        vehicleCategoryOther: "",
        make: "",
        model: "",
        approximateVehiclePrice: "",
        dealerSelected: "",
        dealerName: "",
        purchaseTimeline: "",
        registrationState: "",
      });
      assert.deepEqual(next.vehicleErrors, {});
      assert.deepEqual(next.invalidVehicleMoneyFields, {});
      assert.deepEqual(next.uploadedDocuments, {});
      assert.equal(next.isReviewConsentGiven, false);
      assert.deepEqual(next.reviewErrors, {});
      assert.equal(next.submittedApplicationId, null);
      assert.equal(next.submittedAt, null);
      assert.equal(next.isSubmissionSynced, false);
      assert.equal(next.isSubmitting, false);
    }
  });
});

describe("Screen 2 matrix routing and anti-fallback regression", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  const ROUTING_MATRIX = [
    { id: "personal-loan" as const, name: "Personal Loan", expectedStep: "personal-employment", component: "PersonalLoanScreen", isComingSoon: false },
    { id: "business-loan" as const, name: "Business Loan", expectedStep: "business-details", component: "BusinessLoanScreen", isComingSoon: false },
    { id: "home-loan" as const, name: "Home Loan", expectedStep: "home-loan-requirement", component: "HomeLoanRequirementScreen", isComingSoon: false },
    { id: "property-loan" as const, name: "Property Loan", expectedStep: "property-details", component: "PropertyLoanScreen", isComingSoon: false },
    { id: "vehicle-loan" as const, name: "Vehicle Loan", expectedStep: "vehicle-details", component: "VehicleLoanScreen", isComingSoon: false },
    { id: "machinery-loan" as const, name: "Machinery Loan", expectedStep: "machinery-details", component: "MachineryLoanScreen", isComingSoon: false },
    { id: "msme-loan" as const, name: "MSME Loan", expectedStep: "msme-details", component: "MsmeLoanScreen", isComingSoon: false },
    { id: "project-finance" as const, name: "Project Finance", expectedStep: null, component: "LoanNextStepPlaceholder", isComingSoon: true },
  ];

  test("matrix routing: every loan resolves its canonical Screen 2 step and never falls back to Business", () => {
    for (const row of ROUTING_MATRIX) {
      const flow = getLoanFlowDefinition(row.id);
      if (row.isComingSoon) {
        assert.equal(flow.availability, "coming-soon", `${row.name} must be coming soon`);
        assert.equal(getLoanDetailsStep(row.id), null, `${row.name} must have no details step`);
      } else {
        assert.equal(flow.availability, "implemented", `${row.name} must be implemented`);
        assert.equal(getLoanDetailsStep(row.id), row.expectedStep, `${row.name} details step`);
      }
    }
  });

  test("Vehicle Loan runtime path: KYC -> Continue resolves to VehicleLoanScreen and NOT BusinessLoanScreen", () => {
    useLoansStore.getState().selectCategory(category("vehicle-loan"));
    assert.equal(useLoansStore.getState().selectedCategory?.id, "vehicle-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // KYC Continue advances to canonical details step
    const nextStep = getLoanDetailsStep("vehicle-loan");
    assert.equal(nextStep, "vehicle-details");
    assert.notEqual(nextStep, "business-details");

    useLoansStore.getState().advanceTo(nextStep!);
    assert.equal(useLoansStore.getState().activeStep, "vehicle-details");

    const resolved = resolveLoanActiveStep("vehicle-loan", useLoansStore.getState().activeStep);
    assert.equal(resolved, "vehicle-details");
    assert.notEqual(resolved, "business-details");
  });

  test("Home Loan runtime path: KYC -> Continue resolves to HomeLoanRequirementScreen and NOT BusinessLoanScreen", () => {
    useLoansStore.getState().selectCategory(category("home-loan"));
    assert.equal(useLoansStore.getState().selectedCategory?.id, "home-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    const nextStep = getLoanDetailsStep("home-loan");
    assert.equal(nextStep, "home-loan-requirement");
    assert.notEqual(nextStep, "business-details");

    useLoansStore.getState().advanceTo(nextStep!);
    assert.equal(useLoansStore.getState().activeStep, "home-loan-requirement");

    const resolved = resolveLoanActiveStep("home-loan", useLoansStore.getState().activeStep);
    assert.equal(resolved, "home-loan-requirement");
    assert.notEqual(resolved, "business-details");
  });

  test("Property Loan runtime path: KYC -> Continue resolves to PropertyLoanScreen and NOT BusinessLoanScreen", () => {
    useLoansStore.getState().selectCategory(category("property-loan"));
    assert.equal(useLoansStore.getState().selectedCategory?.id, "property-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    const nextStep = getLoanDetailsStep("property-loan");
    assert.equal(nextStep, "property-details");
    assert.notEqual(nextStep, "business-details");

    useLoansStore.getState().advanceTo(nextStep!);
    assert.equal(useLoansStore.getState().activeStep, "property-details");

    const resolved = resolveLoanActiveStep("property-loan", useLoansStore.getState().activeStep);
    assert.equal(resolved, "property-details");
    assert.notEqual(resolved, "business-details");
  });

  test("Business and Working Capital runtime paths resolve to BusinessLoanScreen", () => {
    useLoansStore.getState().selectCategory(category("business-loan"));
    assert.equal(useLoansStore.getState().selectedCategory?.id, "business-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    const nextStep = getLoanDetailsStep("business-loan");
    assert.equal(nextStep, "business-details");

    useLoansStore.getState().advanceTo(nextStep!);
    assert.equal(useLoansStore.getState().activeStep, "business-details");
    assert.equal(resolveLoanActiveStep("business-loan", "business-details"), "business-details");

    // Working Capital is a subtype under Business
    useLoansStore.getState().setLoanType("working-capital");
    assert.equal(useLoansStore.getState().businessFormData.loanType, "working-capital");
    assert.equal(useLoansStore.getState().activeStep, "business-details");
  });

  test("Personal Loan runtime path resolves to PersonalLoanScreen", () => {
    useLoansStore.getState().selectCategory(category("personal-loan"));
    assert.equal(useLoansStore.getState().selectedCategory?.id, "personal-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    const nextStep = getLoanDetailsStep("personal-loan");
    assert.equal(nextStep, "personal-employment");
    assert.notEqual(nextStep, "business-details");

    useLoansStore.getState().advanceTo(nextStep!);
    assert.equal(useLoansStore.getState().activeStep, "personal-employment");
    assert.equal(resolveLoanActiveStep("personal-loan", "personal-employment"), "personal-employment");
  });

  test("LoansMainScreen architecture contains NO fallback to BusinessLoanScreen", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const mainPath = path.resolve(__dirname, "../../modules/loans/screens/LoansMainScreen/LoansMainScreen.tsx");
    const content = fs.readFileSync(mainPath, "utf-8");

    // Ensure no fallback ternary or default that returns BusinessLoanScreen
    assert.doesNotMatch(content, /default:\s*return\s*<BusinessLoanScreen/);
    assert.doesNotMatch(content, /category\s*!==\s*["']personal-loan["']\s*\?\s*["']business-details["']/);
    assert.doesNotMatch(content, /selectedCategory\.id\s*===\s*["']personal-loan["']\s*\?\s*["']personal-employment["']\s*:\s*["']business-details["']/);

    // Ensure explicit step mappings
    assert.match(content, /case "vehicle-details":\s*return\s*\(\s*<VehicleLoanScreen/);
    assert.match(content, /case "machinery-details":\s*return\s*\(\s*<MachineryLoanScreen/);
    assert.match(content, /case "msme-details":\s*return\s*\(\s*<MsmeLoanScreen/);
    assert.match(content, /case "home-loan-requirement":\s*return\s*\(\s*<HomeLoanRequirementScreen/);
    assert.match(content, /case "property-details":\s*return\s*\(\s*<PropertyLoanScreen/);
    assert.match(content, /case "personal-employment":\s*return\s*\(\s*<PersonalLoanScreen/);
    assert.match(content, /case "business-details":\s*return\s*\(\s*<BusinessLoanScreen/);
  });
});
