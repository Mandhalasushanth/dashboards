export { LoansMainScreen } from "./screens/LoansMainScreen";
export { LoanKycScreen } from "./screens/LoanKycScreen";
export { LoanDocumentUploadScreen } from "./screens/LoanDocumentUploadScreen";
export { LoanReviewScreen } from "./screens/LoanReviewScreen";
export { LoanUnderReviewScreen } from "./screens/LoanUnderReviewScreen";

// Product barrels
export * from "./businessWorkingCapital";
export * from "./personalLoan";
export * from "./homeLoan";
export * from "./property";
export * from "./vehicle";
export * from "./machinery";
export * from "./msme";

// Shared infrastructure
export { LOAN_CATEGORIES, resolveLoanCategory } from "./constants/loanCategories";
export {
  LOAN_FLOW_DEFINITIONS,
  getLoanDetailsStep,
  getLoanEntryStep,
  getLoanFlowDefinition,
  getLoanFlowTotalSteps,
  resolveLoanActiveStep,
} from "./constants/loanFlow";
export { useLoansStore } from "./store/loansStore";
export { validateLoanKyc, isApplicantAdult } from "./validation/loanKycValidation";
export { validateReviewSubmission } from "./validation/loanReviewValidation";
export { getRequiredDocuments, getPersonalLoanDocuments } from "./constants/loanDocuments";
export { getLoanDocumentProgress, validateLoanDocumentFile } from "./validation/loanDocumentsValidation";
export { loanKycService } from "./services/loanKycService";
export type { LoanCategory, LoanCategoryId } from "./types/loanCategory.types";
export type {
  LoanKycData,
  LoanKycAddress,
  LoanKycErrors,
  LoanKycVerificationStatus,
  LoansFlowState,
} from "./types/loanKyc.types";
export type {
  LoanDocumentRequirement,
  LoanDocumentUpload,
  LoanReviewState,
  LoanReviewErrors,
} from "./types/loanReview.types";
