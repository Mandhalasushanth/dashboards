import type { BusinessLoanFormData } from "../businessWorkingCapital/types/businessLoan.types";
import type { PersonalLoanFormData } from "../personalLoan/types/personalLoan.types";
import type { HomeLoanRequirementFormData } from "../homeLoan/types/homeLoan.types";
import type { PropertyLoanFormData } from "../property/types/property.types";
import { getPropertyDocumentRequirements } from "../property/constants/propertyDocuments";
import type { VehicleLoanFormData } from "../vehicle/types/vehicleLoan.types";
import { getVehicleLoanDocuments } from "../vehicle/constants/vehicleLoanDocuments";
import type { MachineryLoanFormData } from "../machinery/types/machinery.types";
import { getMachineryLoanDocuments } from "../machinery/constants/machineryLoanDocuments";
import type { MsmeLoanFormData } from "../msme/types/msmeLoan.types";
import { getMsmeLoanDocuments } from "../msme/constants/msmeDocuments";
import { createInitialMsmeLoanFormData } from "../msme/types/msmeLoan.types";
import type { LoanDocumentRequirement } from "../types/loanReview.types";
import type { LoanCategoryId } from "../types/loanCategory.types";
import { getLoanFlowDefinition } from "./loanFlow";
import {
  getPersonalLoanDocuments,
  getPropertyLoanDocuments,
  getRequiredDocuments,
} from "./loanDocuments";

export interface LoanDocumentContext {
  categoryId?: LoanCategoryId;
  businessFormData: BusinessLoanFormData;
  personalFormData?: PersonalLoanFormData;
  homeLoanFormData?: HomeLoanRequirementFormData;
  propertyFormData?: PropertyLoanFormData;
  vehicleFormData?: VehicleLoanFormData;
  machineryFormData?: MachineryLoanFormData;
  msmeFormData?: MsmeLoanFormData;
}

/** The documents that apply to the application in progress, whichever loan it is. */
export function resolveLoanDocumentRequirements(
  context: LoanDocumentContext
): LoanDocumentRequirement[] {
  const {
    categoryId,
    businessFormData,
    personalFormData,
    homeLoanFormData,
    propertyFormData,
    vehicleFormData,
    machineryFormData,
    msmeFormData,
  } = context;

  if (
    categoryId &&
    getLoanFlowDefinition(categoryId).availability === "coming-soon"
  ) {
    return [];
  }
  if (categoryId === "personal-loan" && personalFormData) {
    return getPersonalLoanDocuments(personalFormData);
  }
  if (categoryId === "property-loan" && propertyFormData) {
    return getPropertyDocumentRequirements(propertyFormData);
  }
  if (categoryId === "home-loan" && homeLoanFormData) {
    return getPropertyLoanDocuments(homeLoanFormData);
  }
  if (categoryId === "vehicle-loan" && vehicleFormData) {
    return getVehicleLoanDocuments(vehicleFormData);
  }
  if (categoryId === "machinery-loan" && machineryFormData) {
    return getMachineryLoanDocuments(machineryFormData);
  }
  if (categoryId === "msme-loan") {
    return msmeFormData
      ? getMsmeLoanDocuments(msmeFormData)
      : getMsmeLoanDocuments(createInitialMsmeLoanFormData());
  }
  if (
    categoryId === "vehicle-loan" ||
    categoryId === "machinery-loan"
  ) {
    return [];
  }
  if (categoryId === "business-loan" || !categoryId) {
    return getRequiredDocuments(businessFormData.loanType, businessFormData);
  }
  return [];
}
