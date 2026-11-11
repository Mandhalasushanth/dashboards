import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";
import { formatCurrencyINR } from "@/shared/formatters/currencyFormatter";
import type { BusinessLoanFormData } from "../businessWorkingCapital/types/businessLoan.types";
import type { PersonalLoanFormData } from "../personalLoan/types/personalLoan.types";
import type { HomeLoanRequirementFormData } from "../homeLoan/types/homeLoan.types";
import type { VehicleLoanFormData } from "../vehicle/types/vehicleLoan.types";
import type { PropertyLoanFormData } from "../property/types/property.types";
import type { MachineryLoanFormData } from "../machinery/types/machinery.types";
import type { MsmeLoanFormData } from "../msme/types/msmeLoan.types";
import type { LoanCategoryId } from "../types/loanCategory.types";
import { getLoanFlowDefinition } from "../constants/loanFlow";
import { buildPropertyReviewSections } from "./propertyReviewSummary";
import type { LoanKycAddress, LoanKycData } from "../types/loanKyc.types";
import { isProjectCostRequired } from "../businessWorkingCapital/validation/businessLoanValidation";

export type ReviewSectionId =
  | "applicant"
  | "business"
  | "loan"
  | "employment"
  | "home-requirement"
  | "property"
  | "vehicle"
  | "machinery"
  | "msme";
export type ReviewEditTarget =
  | "kyc"
  | "business-details"
  | "personal-employment"
  | "home-loan-requirement"
  | "property-details"
  | "vehicle-details"
  | "machinery-details"
  | "msme-details";

export interface ReviewRow {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ReviewSection {
  id: ReviewSectionId;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  editTarget: ReviewEditTarget;
  editLabel: string;
  rows: ReviewRow[];
}

const EMPTY = "—";

export const LOAN_TYPE_LABELS: Record<BusinessLoanFormData["loanType"], string> = {
  "business-loan": "Business Loan",
  "working-capital": "Working Capital Loan",
};

const formatAddress = (address: LoanKycAddress): string =>
  [address.houseNumber, address.street, address.city, address.state, address.pincode]
    .filter((part) => part?.trim())
    .join(", ");

/** "XXXX XXXX 1234": the full Aadhaar number is never shown on screen. */
export const maskAadhaar = (aadhaar: string): string => {
  const digits = aadhaar.replace(/\D/g, "");
  return digits.length >= 4 ? `XXXX XXXX ${digits.slice(-4)}` : EMPTY;
};

const orOther = (value: string, other: string): string =>
  value === "Other" ? other.trim() || EMPTY : value || EMPTY;

const amount = (value: string): string =>
  value?.trim() ? formatCurrencyINR(value) : EMPTY;

function applicantSection(kyc: LoanKycData): ReviewSection {
  const rows: ReviewRow[] = [
    { label: "Full Name", value: kyc.fullName || EMPTY },
    { label: "Mobile Number", value: kyc.mobile ? `+91 ${kyc.mobile}` : EMPTY },
  ];
  if (kyc.email) rows.push({ label: "Email", value: kyc.email });
  if (kyc.pan) rows.push({ label: "PAN", value: kyc.pan.toUpperCase() });
  if (kyc.aadhaar) rows.push({ label: "Aadhaar", value: maskAadhaar(kyc.aadhaar) });
  if (kyc.dob) rows.push({ label: "Date of Birth", value: kyc.dob });
  rows.push({
    label: "Current Address",
    value: formatAddress(kyc.currentAddress) || EMPTY,
  });
  rows.push({
    label: "Permanent Address",
    value: kyc.isPermanentSameAsCurrent
      ? "Same as current address"
      : formatAddress(kyc.permanentAddress) || EMPTY,
  });

  return {
    id: "applicant",
    title: "Applicant Details",
    subtitle: "Name, contact, PAN, Aadhaar and address",
    icon: "person-outline",
    editTarget: "kyc",
    editLabel: "Edit applicant details",
    rows,
  };
}

function businessSection(form: BusinessLoanFormData): ReviewSection {
  const p = form.businessProfile;
  const rows: ReviewRow[] = [
    { label: "Business Name", value: p.businessName || EMPTY },
    { label: "Constitution", value: orOther(p.constitution, p.constitutionOther) },
    { label: "Activity", value: orOther(p.businessActivity, p.activityOther) },
    { label: "Established", value: p.establishmentDate || EMPTY },
    { label: "Business Address", value: p.businessAddress || EMPTY },
    { label: "PIN Code", value: p.pincode || EMPTY },
    {
      label: "GST",
      value: p.isGstRegistered ? p.gstin || "Registered" : "Not registered",
    },
  ];
  if (p.udyamRegistration) {
    rows.push({ label: "Udyam / MSME", value: p.udyamRegistration });
  }

  return {
    id: "business",
    title: "Business Details",
    subtitle: "Business profile and operational information",
    icon: "business-outline",
    editTarget: "business-details",
    editLabel: "Edit business details",
    rows,
  };
}

function loanSection(form: BusinessLoanFormData): ReviewSection {
  const rows: ReviewRow[] = [
    { label: "Loan Type", value: LOAN_TYPE_LABELS[form.loanType] },
  ];

  if (form.loanType === "business-loan") {
    const d = form.businessLoan;
    rows.push(
      { label: "Requested Amount", value: amount(d.loanAmount), highlight: true },
      { label: "Purpose", value: orOther(d.purpose, d.purposeOther) }
    );
    if (d.purposeDescription.trim()) {
      rows.push({ label: "Description", value: d.purposeDescription.trim() });
    }
    // Only the purposes that need a cost estimate show it.
    if (isProjectCostRequired(d.purpose) && d.projectCost.trim()) {
      rows.push({ label: "Project / Equipment Cost", value: amount(d.projectCost) });
    }
  } else {
    const d = form.workingCapital;
    rows.push(
      { label: "Required Credit Limit", value: amount(d.loanAmount), highlight: true },
      { label: "Purpose of Funds", value: orOther(d.purpose, d.purposeOther) }
    );
    if (d.purposeDescription.trim()) {
      rows.push({ label: "Description", value: d.purposeDescription.trim() });
    }
    rows.push(
      { label: "Avg Monthly Sales", value: amount(d.monthlySales) },
      { label: "Avg Monthly Expenses", value: amount(d.monthlyExpenses) }
    );
  }

  return {
    id: "loan",
    title: "Loan Details",
    subtitle: "Loan type and financing requirements",
    icon: "cash-outline",
    editTarget: "business-details",
    editLabel: "Edit loan requirements",
    rows,
  };
}

function personalEmploymentSection(form: PersonalLoanFormData): ReviewSection {
  const isSalaried = form.employmentType === "salaried";
  const rows: ReviewRow[] = [
    {
      label: "Employment Type",
      value: isSalaried ? "Salaried" : "Self Employed",
    },
  ];

  if (isSalaried) {
    rows.push(
      {
        label: "Employer / Company",
        value: form.employerName || form.companyName || EMPTY,
      },
      { label: "Job Type", value: form.jobType || EMPTY },
      {
        label: "Monthly Net Salary",
        value: amount(form.monthlyNetSalary || form.monthlySalary),
        highlight: true,
      },
      { label: "Work Experience", value: form.workExperience || EMPTY },
      {
        label: "Salary Credit Method",
        value: form.salaryCreditMethod || EMPTY,
      }
    );
  } else {
    rows.push(
      {
        label: "Business / Profession",
        value:
          form.businessOrProfessionName || form.professionName || EMPTY,
      },
      { label: "Nature of Business", value: form.natureOfBusiness || EMPTY },
      {
        label: "Average Monthly Income",
        value: amount(form.averageMonthlyIncome || form.monthlyIncome),
        highlight: true,
      },
      { label: "Years in Business", value: form.yearsInBusiness || EMPTY }
    );
  }

  return {
    id: "employment",
    title: "Employment & Income",
    subtitle: isSalaried
      ? "Salaried employment and compensation"
      : "Professional or business earnings",
    icon: isSalaried ? "briefcase-outline" : "person-outline",
    editTarget: "personal-employment",
    editLabel: "Edit employment details",
    rows,
  };
}

function personalLoanSection(form: PersonalLoanFormData): ReviewSection {
  const loanAmt = form.loanAmount || form.requestedAmount || "";
  const rows: ReviewRow[] = [
    { label: "Loan Type", value: "Personal Loan" },
    {
      label: "Requested Loan Amount",
      value: amount(loanAmt),
      highlight: true,
    },
  ];
  if (form.purpose?.trim()) {
    rows.push({
      label: "Purpose",
      value: orOther(form.purpose, form.purposeOther || ""),
    });
  }

  return {
    id: "loan",
    title: "Loan Requirements",
    subtitle: "Requested financing and purpose",
    icon: "cash-outline",
    editTarget: "personal-employment",
    editLabel: "Edit loan requirements",
    rows,
  };
}

function homeLoanRequirementSection(
  form: HomeLoanRequirementFormData
): ReviewSection {
  const loanAmt = form.loanAmount || form.requestedAmount || "";
  const propVal = form.approximatePropertyValue || form.propertyValue || "";
  const rows: ReviewRow[] = [
    { label: "Loan Type", value: "Home Loan" },
    {
      label: "Requested Loan Amount",
      value: amount(loanAmt),
      highlight: true,
    },
    {
      label: "Purpose of Loan",
      value: form.purpose || EMPTY,
    },
    {
      label: "Property Status",
      value: form.propertyStatus || EMPTY,
    },
    {
      label: "Approximate Property Value",
      value: amount(propVal),
      highlight: true,
    },
  ];

  return {
    id: "home-requirement",
    title: "Home Loan Requirement",
    subtitle: "Financing purpose, property status and valuation",
    icon: "home-outline",
    editTarget: "home-loan-requirement",
    editLabel: "Edit home loan requirement",
    rows,
  };
}

function vehicleLoanSection(form: VehicleLoanFormData): ReviewSection {
  const rows: ReviewRow[] = [
    {
      label: "Requested Loan Amount",
      value: amount(form.requestedLoanAmount),
      highlight: true,
    },
    { label: "Vehicle Condition", value: form.vehicleCondition || EMPTY },
    {
      label: "Vehicle Category",
      value: orOther(form.vehicleCategory, form.vehicleCategoryOther),
    },
    { label: "Vehicle Make / Brand", value: form.make || EMPTY },
    { label: "Vehicle Model", value: form.model || EMPTY },
    {
      label: "Approximate Vehicle Price",
      value: amount(form.approximateVehiclePrice),
      highlight: true,
    },
    { label: "Dealer Selected?", value: form.dealerSelected || EMPTY },
  ];
  if (form.dealerSelected === "Yes") {
    rows.push({ label: "Dealer Name", value: form.dealerName || EMPTY });
  }
  rows.push(
    { label: "Purchase Timeline", value: form.purchaseTimeline || EMPTY },
    { label: "Registration State", value: form.registrationState || EMPTY }
  );

  return {
    id: "vehicle",
    title: "Vehicle & Loan Details",
    subtitle: "Vehicle selection and financing requirement",
    icon: "car-outline",
    editTarget: "vehicle-details",
    editLabel: "Edit vehicle and loan details",
    rows,
  };
}

function machineryLoanSection(form: MachineryLoanFormData): ReviewSection {
  const rows: ReviewRow[] = [
    {
      label: "Requested Loan Amount",
      value: amount(form.requestedLoanAmount),
      highlight: true,
    },
    { label: "Machinery Type", value: orOther(form.machineryType, form.machineryTypeOther) },
    { label: "Machinery Name / Description", value: form.machineryName || EMPTY },
    { label: "Machinery Condition", value: form.machineryCondition || EMPTY },
    { label: "Purchase Type", value: form.purchaseType || EMPTY },
    {
      label: "Approximate Machinery Cost",
      value: amount(form.approximateMachineryCost),
      highlight: true,
    },
    { label: "Dealer / Supplier Name", value: form.dealerName || EMPTY },
  ];

  return {
    id: "machinery",
    title: "Machinery & Loan Details",
    subtitle: "Machinery selection and financing requirement",
    icon: "construct-outline",
    editTarget: "machinery-details",
    editLabel: "Edit machinery and loan details",
    rows,
  };
}

function msmeReviewSection(form: MsmeLoanFormData): ReviewSection {
  const addressParts = [
    form.operatingAddress.houseNumber,
    form.operatingAddress.street,
    form.operatingAddress.city,
    form.operatingAddress.state,
    form.operatingAddress.pincode,
  ].filter((p) => p && p.trim());

  const rows: ReviewRow[] = [
    { label: "Business / Trade Name", value: form.businessName || EMPTY },
    {
      label: "Constitution",
      value:
        form.constitution === "Other"
          ? form.constitutionOther || "Other"
          : form.constitution || EMPTY,
    },
    {
      label: "Primary Activity",
      value:
        form.businessActivity === "Other"
          ? form.businessActivityOther || "Other"
          : form.businessActivity || EMPTY,
    },
    { label: "Establishment Date", value: form.establishmentDate || EMPTY },
    { label: "Operating Address", value: addressParts.join(", ") || EMPTY },
    { label: "Udyam Status", value: form.udyamStatus || EMPTY },
  ];

  if (form.udyamStatus === "Registered" && form.udyamRegistrationNumber) {
    rows.push({ label: "Udyam Reg. Number", value: form.udyamRegistrationNumber });
  }

  rows.push({ label: "GST Status", value: form.gstStatus || EMPTY });
  if (form.gstStatus === "Registered" && form.gstin) {
    rows.push({ label: "GSTIN", value: form.gstin });
  }

  rows.push(
    { label: "Operating Duration", value: form.operatingDuration || EMPTY },
    { label: "Employees", value: form.numberOfEmployees || EMPTY },
    {
      label: "Annual Turnover",
      value: amount(form.annualTurnover),
      highlight: true,
    },
    {
      label: "Ownership",
      value:
        form.ownershipType === "Other"
          ? form.ownershipTypeOther || "Other"
          : form.ownershipType || EMPTY,
    }
  );

  return {
    id: "msme",
    title: "MSME & Business Details",
    subtitle: "Enterprise profile and operational details",
    icon: "briefcase-outline",
    editTarget: "msme-details",
    editLabel: "Edit MSME and business details",
    rows,
  };
}

/** Read-only summary of everything the customer entered, grouped for the Review screen. */
export function buildReviewSections(
  kyc: LoanKycData,
  businessForm: BusinessLoanFormData,
  personalForm?: PersonalLoanFormData,
  categoryId?: LoanCategoryId,
  homeLoanForm?: HomeLoanRequirementFormData,
  propertyForm?: PropertyLoanFormData,
  vehicleForm?: VehicleLoanFormData,
  machineryForm?: MachineryLoanFormData,
  msmeForm?: MsmeLoanFormData
): ReviewSection[] {
  if (
    categoryId &&
    getLoanFlowDefinition(categoryId).availability === "coming-soon"
  ) {
    return [applicantSection(kyc)];
  }
  if (categoryId === "msme-loan") {
    return msmeForm
      ? [applicantSection(kyc), msmeReviewSection(msmeForm)]
      : [applicantSection(kyc)];
  }
  if (categoryId === "property-loan") {
    return [
      applicantSection(kyc),
      ...(propertyForm ? buildPropertyReviewSections(propertyForm) : []),
    ];
  }
  if (categoryId === "vehicle-loan") {
    return vehicleForm
      ? [applicantSection(kyc), vehicleLoanSection(vehicleForm)]
      : [applicantSection(kyc)];
  }
  if (categoryId === "machinery-loan") {
    return machineryForm
      ? [applicantSection(kyc), machineryLoanSection(machineryForm)]
      : [applicantSection(kyc)];
  }
  if (categoryId === "personal-loan") {
    return personalForm
      ? [
          applicantSection(kyc),
          personalLoanSection(personalForm),
          personalEmploymentSection(personalForm),
        ]
      : [applicantSection(kyc)];
  }
  if (categoryId === "home-loan") {
    return homeLoanForm
      ? [applicantSection(kyc), homeLoanRequirementSection(homeLoanForm)]
      : [applicantSection(kyc)];
  }
  if (categoryId === "business-loan" || !categoryId) {
    return [
      applicantSection(kyc),
      businessSection(businessForm),
      loanSection(businessForm),
    ];
  }
  return [applicantSection(kyc)];
}


export const LOAN_CATEGORY_LABELS: Record<string, string> = {
  "business-loan": "Business & Working Capital Loans",
  "personal-loan": "Personal Loan",
  "home-loan": "Home Loan",
  "property-loan": "Property Loan",
  "vehicle-loan": "Vehicle Loan",
  "machinery-loan": "Machinery Loans",
  "msme-loan": "MSME Loan",
  "project-finance": "Project Finance",
};

/** The loan name and requested amount shown on the post-submission screen. */
export function getSubmittedLoanSummary(
  categoryId: string | undefined,
  form: BusinessLoanFormData,
  personalLoanAmount?: string,
  propertyLoanAmount?: string,
  homeLoanAmount?: string,
  vehicleLoanAmount?: string,
  machineryLoanAmount?: string,
  msmeTurnover?: string
): { label: string; amountRaw: string } {
  if (categoryId === "msme-loan") {
    return { label: "MSME Loan", amountRaw: msmeTurnover ?? "" };
  }
  if (categoryId === "home-loan") {
    return { label: "Home Loan", amountRaw: homeLoanAmount ?? "" };
  }
  if (categoryId === "property-loan") {
    return { label: "Property Loan", amountRaw: propertyLoanAmount ?? "" };
  }
  if (categoryId === "personal-loan") {
    return { label: "Personal Loan", amountRaw: personalLoanAmount ?? "" };
  }
  if (categoryId === "vehicle-loan") {
    return { label: "Vehicle Loan", amountRaw: vehicleLoanAmount ?? "" };
  }
  if (categoryId === "machinery-loan") {
    return { label: "Machinery Loan", amountRaw: machineryLoanAmount ?? "" };
  }
  if (!categoryId || categoryId === "business-loan") {
    const amountRaw =
      form.loanType === "business-loan"
        ? form.businessLoan.loanAmount
        : form.workingCapital.loanAmount;
    return { label: LOAN_TYPE_LABELS[form.loanType] ?? "Business Loan", amountRaw };
  }
  return {
    label: LOAN_CATEGORY_LABELS[categoryId] ?? "Loan Application",
    amountRaw: "",
  };
}
