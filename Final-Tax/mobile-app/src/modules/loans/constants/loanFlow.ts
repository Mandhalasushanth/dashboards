import type { LoanCategoryId } from "../types/loanCategory.types";
import type { LoanStep } from "../store/loansStore.types";

const PRODUCT_DETAILS_STEPS: readonly LoanStep[] = [
  "business-details",
  "personal-employment",
  "home-loan-requirement",
  "property-details",
  "vehicle-details",
  "machinery-details",
  "msme-details",
];

type LoanDetailsStep =
  | "business-details"
  | "personal-employment"
  | "home-loan-requirement"
  | "property-details"
  | "vehicle-details"
  | "machinery-details"
  | "msme-details";

type LoanFlowDefinition =
  | { availability: "implemented"; detailsStep: LoanDetailsStep }
  | { availability: "coming-soon" };

/** The explicit product-to-flow registry. Unsupported products never inherit a fallback flow. */
export const LOAN_FLOW_DEFINITIONS: Record<LoanCategoryId, LoanFlowDefinition> = {
  "business-loan": {
    availability: "implemented",
    detailsStep: "business-details",
  },
  "personal-loan": {
    availability: "implemented",
    detailsStep: "personal-employment",
  },
  "home-loan": {
    availability: "implemented",
    detailsStep: "home-loan-requirement",
  },
  "property-loan": {
    availability: "implemented",
    detailsStep: "property-details",
  },
  "vehicle-loan": {
    availability: "implemented",
    detailsStep: "vehicle-details",
  },
  "machinery-loan": {
    availability: "implemented",
    detailsStep: "machinery-details",
  },
  "msme-loan": {
    availability: "implemented",
    detailsStep: "msme-details",
  },
  "project-finance": { availability: "coming-soon" },
};

export const getLoanFlowDefinition = (
  categoryId: LoanCategoryId
): LoanFlowDefinition => LOAN_FLOW_DEFINITIONS[categoryId];

export const getLoanDetailsStep = (
  categoryId: LoanCategoryId
): LoanStep | null => {
  const flow = getLoanFlowDefinition(categoryId);
  return flow.availability === "implemented" ? flow.detailsStep : null;
};

/** Prevent a stale product step from rendering another loan's screen. */
export const resolveLoanActiveStep = (
  categoryId: LoanCategoryId,
  requestedStep: LoanStep
): LoanStep => {
  const flow = getLoanFlowDefinition(categoryId);
  if (flow.availability === "coming-soon") return "unavailable";
  if (requestedStep === "categories") return requestedStep;

  if (
    PRODUCT_DETAILS_STEPS.includes(requestedStep) &&
    requestedStep !== flow.detailsStep
  ) {
    return "kyc";
  }

  if (requestedStep === "home-employment-income" && categoryId !== "home-loan") {
    return "kyc";
  }

  return requestedStep === "unavailable" ? "kyc" : requestedStep;
};

export const getLoanEntryStep = (categoryId: LoanCategoryId): LoanStep =>
  getLoanFlowDefinition(categoryId).availability === "implemented"
    ? "kyc"
    : "unavailable";

/** Business: KYC, details, documents, review, Under Review. */
export const getLoanFlowTotalSteps = (categoryId?: LoanCategoryId): number => {
  if (
    categoryId &&
    getLoanFlowDefinition(categoryId).availability === "coming-soon"
  ) {
    return 1;
  }
  return 5;
};
