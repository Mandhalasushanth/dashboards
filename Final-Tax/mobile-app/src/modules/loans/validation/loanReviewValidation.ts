import type { BusinessLoanFormData } from "../businessWorkingCapital/types/businessLoan.types";
import type { PersonalLoanFormData } from "../personalLoan/types/personalLoan.types";
import type { HomeLoanRequirementFormData } from "../homeLoan/types/homeLoan.types";
import type { PropertyLoanFormData } from "../property/types/property.types";
import { validatePropertyLoanForm } from "../property/validation/propertyLoanValidation";
import { resolveLoanDocumentRequirements } from "../constants/loanDocumentResolver";
import type { LoanKycData } from "../types/loanKyc.types";
import type {
  LoanDocumentUpload,
  LoanReviewErrors,
} from "../types/loanReview.types";
import { validatePersonalLoanForm } from "../personalLoan/validation/personalLoanValidation";
import { validateHomeLoanRequirementForm } from "../homeLoan/validation/homeLoanValidation";
import { validateLoanKyc } from "./loanKycValidation";
import { loanKycService } from "../services/loanKycService";
import type { LoanCategoryId } from "../types/loanCategory.types";
import { getLoanFlowDefinition } from "../constants/loanFlow";
import { validateVehicleLoanForm } from "../vehicle/validation/vehicleLoanValidation";
import type {
  VehicleLoanFormData,
  VehicleMoneyField,
} from "../vehicle/types/vehicleLoan.types";
import type {
  MachineryLoanFormData,
  MachineryMoneyField,
} from "../machinery/types/machinery.types";
import { validateMachineryLoanForm } from "../machinery/validation/machineryLoanValidation";
import type {
  MsmeLoanFormData,
  MsmeMoneyField,
} from "../msme/types/msmeLoan.types";
import { validateMsmeLoanForm } from "../msme/validation/msmeLoanValidation";
import { validateLoanDocumentFile } from "./loanDocumentsValidation";

export function validateReviewSubmission(
  kycData: LoanKycData,
  businessFormData: BusinessLoanFormData,
  documents: Record<string, LoanDocumentUpload>,
  isConsentGiven: boolean,
  personalFormData?: PersonalLoanFormData,
  categoryId?: LoanCategoryId,
  homeLoanFormData?: HomeLoanRequirementFormData,
  propertyFormData?: PropertyLoanFormData,
  vehicleFormData?: VehicleLoanFormData,
  invalidVehicleMoneyFields?: Partial<Record<VehicleMoneyField, boolean>>,
  machineryFormData?: MachineryLoanFormData,
  invalidMachineryMoneyFields?: Partial<Record<MachineryMoneyField, boolean>>,
  msmeFormData?: MsmeLoanFormData,
  invalidMsmeMoneyFields?: Partial<Record<MsmeMoneyField, boolean>>
): { isValid: boolean; errors: LoanReviewErrors } {
  const errors: LoanReviewErrors = {
    documents: {},
  };

  if (
    categoryId &&
    getLoanFlowDefinition(categoryId).availability === "coming-soon"
  ) {
    errors.general = "Applications for this loan product are coming soon.";
    return { isValid: false, errors };
  }

  // 1. Verify KYC minimums
  if (!kycData.fullName?.trim() || !kycData.mobile?.trim()) {
    errors.applicant = "Applicant details are incomplete. Please edit applicant details.";
    errors.general = errors.applicant;
  }

  // Re-run the same KYC checks used before the application can reach Review.
  if (categoryId) {
    const kycCheck = validateLoanKyc(
      kycData,
      loanKycService.getProviderRequirements(categoryId)
    );
    if (!kycCheck.isValid) {
      errors.applicant = "Applicant details are incomplete. Please edit applicant details.";
      errors.general = errors.applicant;
    }
  }

  // 2. Loan details validation
  if (categoryId === "personal-loan" && personalFormData) {
    const personalCheck = validatePersonalLoanForm(personalFormData);
    const amountError = personalCheck.errors.loanAmount;
    if (amountError) {
      errors.loan = amountError;
      errors.general = errors.loan;
    }

    if (personalFormData.employmentType === "salaried") {
      const employer = (
        personalFormData.employerName ||
        personalFormData.companyName ||
        ""
      ).trim();
      const salary = (
        personalFormData.monthlyNetSalary ||
        personalFormData.monthlySalary ||
        ""
      ).trim();
      if (!employer || !salary || !personalCheck.isValid) {
        errors.business = "Employment details are incomplete or invalid. Please edit employment details.";
        errors.employment = errors.business;
        errors.general = errors.business;
      }
    } else {
      const profession = (
        personalFormData.businessOrProfessionName ||
        personalFormData.professionName ||
        ""
      ).trim();
      const income = (
        personalFormData.averageMonthlyIncome ||
        personalFormData.monthlyIncome ||
        ""
      ).trim();
      if (!profession || !income || !personalCheck.isValid) {
        errors.business = "Profession details are incomplete or invalid. Please edit profession details.";
        errors.employment = errors.business;
        errors.general = errors.business;
      }
    }
  } else if (categoryId === "property-loan") {
    if (!propertyFormData) {
      errors.property = "Property details are incomplete. Please edit property details.";
      errors.general = errors.property;
    } else {
      const propertyCheck = validatePropertyLoanForm(propertyFormData);
      if (!propertyCheck.isValid) {
        const { requestedAmount, purpose, purposeOther } = propertyCheck.errors;
        const requirementProblem = requestedAmount || purpose || purposeOther;
        if (requirementProblem) {
          errors.loan = requirementProblem;
          errors.general = errors.loan;
        }
        if (Object.keys(propertyCheck.errors).some((key) => !["requestedAmount", "purpose", "purposeOther"].includes(key))) {
          errors.property = "Property details are incomplete. Please edit property details.";
          errors.general = errors.property;
        }
      }
    }
  } else if (categoryId === "vehicle-loan") {
    const vehicleCheck = vehicleFormData
      ? validateVehicleLoanForm(vehicleFormData, invalidVehicleMoneyFields)
      : { isValid: false };
    if (!vehicleCheck.isValid) {
      errors.vehicle = "Vehicle and loan details are incomplete. Please edit vehicle details.";
      errors.general = errors.vehicle;
    }
  } else if (categoryId === "machinery-loan") {
    const machineryCheck = machineryFormData
      ? validateMachineryLoanForm(machineryFormData, invalidMachineryMoneyFields)
      : { isValid: false };
    if (!machineryCheck.isValid) {
      errors.machinery = "Machinery and loan details are incomplete. Please edit machinery details.";
      errors.general = errors.machinery;
    }
  } else if (categoryId === "msme-loan") {
    const msmeCheck = msmeFormData
      ? validateMsmeLoanForm(msmeFormData, invalidMsmeMoneyFields)
      : { isValid: false, errors: {} };
    if (!msmeCheck.isValid) {
      const firstError = Object.values(msmeCheck.errors)[0];
      errors.msme =
        firstError ||
        "MSME and business details are incomplete. Please edit business details.";
      errors.business = errors.msme;
      errors.general = errors.msme;
    }
  } else if (categoryId === "home-loan") {
    if (!homeLoanFormData) {
      errors.loan = "Home loan details are incomplete.";
      errors.general = errors.loan;
    } else {
      const homeCheck = validateHomeLoanRequirementForm(homeLoanFormData);
      if (!homeCheck.isValid) {
        errors.loan =
          homeCheck.errors.loanAmount ||
          homeCheck.errors.purpose ||
          homeCheck.errors.propertyStatus ||
          homeCheck.errors.approximatePropertyValue ||
          "Home loan details are incomplete.";
        errors.general = errors.loan;
      }
    }
  } else if (categoryId === "business-loan" || !categoryId) {
    // Business profile minimums
    if (
      !businessFormData.businessProfile.businessName?.trim() ||
      !businessFormData.businessProfile.constitution?.trim() ||
      !businessFormData.businessProfile.pincode?.trim()
    ) {
      errors.business = "Business details are incomplete. Please edit business details.";
      errors.general = errors.business;
    }

    if (businessFormData.loanType === "business-loan") {
      if (!businessFormData.businessLoan.loanAmount?.trim()) {
        errors.loan = "Loan requested amount is missing. Please edit loan requirements.";
        errors.general = errors.loan;
      }
    } else if (businessFormData.loanType === "working-capital") {
      if (
        !businessFormData.workingCapital.loanAmount?.trim() ||
        !businessFormData.workingCapital.monthlySales?.trim()
      ) {
        errors.loan = "Working capital limit or sales information is incomplete.";
        errors.general = errors.loan;
      }
    }
  }

  // 3. Verify Mandatory Documents
  const requirements = resolveLoanDocumentRequirements({
    categoryId,
    businessFormData,
    personalFormData,
    homeLoanFormData,
    propertyFormData,
    vehicleFormData,
    machineryFormData,
    msmeFormData,
  });

  const missingDocs: Record<string, string> = {};
  requirements
    .filter((req) => req.isMandatory)
    .forEach((req) => {
      const doc = documents[req.id];
      if (!doc) {
        missingDocs[req.id] = `${req.name} is required for submission`;
      } else {
        const fileProblem = validateLoanDocumentFile({
          uri: doc.fileUri,
          name: doc.fileName,
          size: doc.fileSize,
          mimeType: doc.mimeType,
        }, req);
        if (fileProblem) {
          missingDocs[req.id] = `${req.name}: ${fileProblem}`;
        }
      }
    });

  if (Object.keys(missingDocs).length > 0) {
    errors.documents = missingDocs;
  }

  // 4. Verify Consent
  if (!isConsentGiven) {
    errors.consent = "Please confirm that the provided information is accurate";
  }

  const hasDocErrors = Object.keys(errors.documents || {}).length > 0;
  const isValid =
    !errors.applicant &&
    !errors.business &&
    !errors.employment &&
    !errors.property &&
    !errors.vehicle &&
    !errors.machinery &&
    !errors.msme &&
    !errors.loan &&
    !hasDocErrors &&
    !errors.consent;

  return { isValid, errors };
}
