import { AmendmentFormData, RegisteredDetails } from "../types/gstAmendmentTypes";

/**
 * Checks whether a candidate string is a valid business name.
 * Rejects empty strings, whitespace-only, and placeholder dashes.
 */
export function isValidBusinessName(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed !== "" && trimmed !== "-";
}

/**
 * Resolves the effective business name for a GST amendment application.
 * - Legal Business Name amendment: uses formData.newLegalBusinessName if valid.
 * - Other amendment types: preserves registeredDetails.legalBusinessName.
 * - Falls back safely to Registered Business if no valid name exists (never GSTIN, never "-").
 */
export function resolveEffectiveBusinessName(
  selectedSectionId: string,
  formData?: Partial<AmendmentFormData> | null,
  registeredDetails?: Partial<RegisteredDetails> | null
): string {
  const isLegalNameAmendment = selectedSectionId === "legal-name";

  if (isLegalNameAmendment && isValidBusinessName(formData?.newLegalBusinessName)) {
    return (formData?.newLegalBusinessName || "").trim();
  }

  if (isValidBusinessName(registeredDetails?.legalBusinessName)) {
    return (registeredDetails?.legalBusinessName || "").trim();
  }

  // If not legal-name amendment or registered details was not populated yet, check newLegalBusinessName
  if (isValidBusinessName(formData?.newLegalBusinessName)) {
    return (formData?.newLegalBusinessName || "").trim();
  }

  return "Registered Business";
}

export function resolveTargetGstId(
  gstin: string,
  customer: any,
  gstDraft: any,
  applications: any[]
): string {
  return (
    gstin ||
    customer?.gstId ||
    gstDraft?.createdGstId ||
    applications.find((a) => a.formData?.createdGstId || a.formData?.gstId || a.formData?.gstin)?.formData?.createdGstId ||
    applications.find((a) => a.formData?.createdGstId || a.formData?.gstId || a.formData?.gstin)?.formData?.gstId ||
    applications.find((a) => a.formData?.createdGstId || a.formData?.gstId || a.formData?.gstin)?.formData?.gstin ||
    "GST29AAACU9876P1Z5"
  );
}

export function generateArn(): string {
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
  return `AA2993${randomSuffix.toString().slice(0, 6)}`;
}

export function buildComparisonSummaries(
  sectionId: string,
  registeredDetails: RegisteredDetails,
  formData: AmendmentFormData
): {
  currentValSummary: string;
  requestedValSummary: string;
  currentValDict: Record<string, string>;
  requestedValDict: Record<string, string>;
} {
  let currentValSummary = "";
  let requestedValSummary = "";
  let currentValDict: Record<string, string> = {};
  let requestedValDict: Record<string, string> = {};

  switch (sectionId) {
    case "legal-name":
      currentValSummary = registeredDetails.legalBusinessName;
      requestedValSummary = formData.newLegalBusinessName;
      currentValDict = { "Legal Business Name": registeredDetails.legalBusinessName };
      requestedValDict = { "Legal Business Name": formData.newLegalBusinessName };
      break;

    case "principal-place":
      currentValSummary = `${registeredDetails.principalAddress}, ${registeredDetails.principalCity}, ${registeredDetails.principalDistrict}, ${registeredDetails.principalState} - ${registeredDetails.principalPincode}`;
      requestedValSummary = `${formData.newPrincipalAddress}, ${formData.newPrincipalCity}, ${formData.newPrincipalDistrict}, ${formData.newPrincipalState} - ${formData.newPrincipalPincode} (${formData.newPrincipalNatureOfPremises})`;
      currentValDict = {
        Address: registeredDetails.principalAddress,
        City: registeredDetails.principalCity,
        District: registeredDetails.principalDistrict,
        State: registeredDetails.principalState,
        "PIN Code": registeredDetails.principalPincode,
      };
      requestedValDict = {
        "Business Address": formData.newPrincipalAddress,
        City: formData.newPrincipalCity,
        District: formData.newPrincipalDistrict,
        "State / UT": formData.newPrincipalState,
        "PIN Code": formData.newPrincipalPincode,
        "Nature of Premises": formData.newPrincipalNatureOfPremises,
      };
      break;

    case "additional-place":
      currentValSummary = `${registeredDetails.additionalAddress}, ${registeredDetails.additionalCity} - ${registeredDetails.additionalPincode} (${registeredDetails.additionalNatureOfPremises})`;
      requestedValSummary = `${formData.newAdditionalAddress}, ${formData.newAdditionalCity} - ${formData.newAdditionalPincode} (${formData.newAdditionalNatureOfPremises})`;
      currentValDict = {
        Address: registeredDetails.additionalAddress,
        City: registeredDetails.additionalCity,
        "PIN Code": registeredDetails.additionalPincode,
        "Nature of Premises": registeredDetails.additionalNatureOfPremises,
      };
      requestedValDict = {
        "Additional Place Address": formData.newAdditionalAddress,
        City: formData.newAdditionalCity,
        "PIN Code": formData.newAdditionalPincode,
        "Nature of Premises": formData.newAdditionalNatureOfPremises,
      };
      break;

    case "bank-accounts":
      currentValSummary = `${registeredDetails.bankName} - A/C: ${registeredDetails.bankAccountNumber}, IFSC: ${registeredDetails.ifscCode}`;
      requestedValSummary = `${formData.newBankName} - A/C: ${formData.newBankAccountNumber}, IFSC: ${formData.newIfscCode}`;
      currentValDict = {
        "Bank Name": registeredDetails.bankName,
        "Account Number": registeredDetails.bankAccountNumber,
        "IFSC Code": registeredDetails.ifscCode,
        "Account Type": registeredDetails.accountType,
      };
      requestedValDict = {
        "Bank Name": formData.newBankName,
        "Account Number": formData.newBankAccountNumber,
        "Confirm Account Number": formData.confirmBankAccountNumber,
        "IFSC Code": formData.newIfscCode,
        "Account Type": formData.newAccountType,
      };
      break;

    case "authorised-signatories":
      currentValSummary = `${registeredDetails.signatoryName} (${registeredDetails.signatoryPan}) - ${registeredDetails.signatoryDesignation}`;
      requestedValSummary = `${formData.newSignatoryName} (${formData.newSignatoryPan}) - ${formData.newSignatoryDesignation}`;
      currentValDict = {
        Name: registeredDetails.signatoryName,
        PAN: registeredDetails.signatoryPan,
        Designation: registeredDetails.signatoryDesignation,
        Mobile: registeredDetails.signatoryMobile,
        Email: registeredDetails.signatoryEmail,
      };
      requestedValDict = {
        "Signatory Name": formData.newSignatoryName,
        "Signatory PAN": formData.newSignatoryPan,
        "Date of Birth": formData.newSignatoryDob,
        Designation: formData.newSignatoryDesignation,
        "Signatory Mobile": formData.newSignatoryMobile,
        "Signatory Email": formData.newSignatoryEmail,
      };
      break;

    case "contact-details":
      currentValSummary = `Mob: ${registeredDetails.contactMobile}, Email: ${registeredDetails.contactEmail}`;
      requestedValSummary = `Mob: ${formData.newContactMobile}, Email: ${formData.newContactEmail}`;
      currentValDict = {
        Mobile: registeredDetails.contactMobile,
        Email: registeredDetails.contactEmail,
      };
      requestedValDict = {
        "Mobile Number": formData.newContactMobile,
        "Email Address": formData.newContactEmail,
      };
      break;
  }

  return {
    currentValSummary,
    requestedValSummary,
    currentValDict,
    requestedValDict,
  };
}

export function buildDbReviewSummaries(
  sectionId: string,
  registeredDetails: RegisteredDetails,
  dbData: any,
  fallbackFormData: AmendmentFormData
): Record<string, string> {
  let requestedValDict: Record<string, string> = {};

  switch (sectionId) {
    case "legal-name": {
      const legalName = dbData?.newLegalName ?? fallbackFormData.newLegalBusinessName;
      requestedValDict = { "Legal Business Name": legalName };
      break;
    }
    case "principal-place": {
      requestedValDict = {
        "Business Address": dbData?.newBusinessAddress ?? fallbackFormData.newPrincipalAddress,
        City: dbData?.newCity ?? fallbackFormData.newPrincipalCity,
        District: dbData?.newDistrict ?? fallbackFormData.newPrincipalDistrict,
        "State / UT": dbData?.newState ?? fallbackFormData.newPrincipalState,
        "PIN Code": dbData?.newPinCode ?? fallbackFormData.newPrincipalPincode,
        "Nature of Premises": dbData?.natureOfPremises ?? fallbackFormData.newPrincipalNatureOfPremises,
      };
      break;
    }
    case "additional-place": {
      requestedValDict = {
        "Additional Place Address": dbData?.address ?? fallbackFormData.newAdditionalAddress,
        City: dbData?.city ?? fallbackFormData.newAdditionalCity,
        "PIN Code": dbData?.pinCode ?? fallbackFormData.newAdditionalPincode,
        "Nature of Premises": dbData?.natureOfPremises ?? fallbackFormData.newAdditionalNatureOfPremises,
      };
      break;
    }
    case "bank-accounts": {
      const rawAcct = dbData?.newBankAccountNumber ?? fallbackFormData.newBankAccountNumber;
      const maskedAcct = rawAcct && rawAcct.length > 4 
        ? "XXXX" + rawAcct.slice(-4) 
        : rawAcct || "";
      requestedValDict = {
        "Bank Name": dbData?.newBankName ?? fallbackFormData.newBankName,
        "Account Number": maskedAcct,
        "IFSC Code": dbData?.newIfscCode ?? fallbackFormData.newIfscCode,
        "Account Type": dbData?.newAccountType ?? fallbackFormData.newAccountType,
      };
      break;
    }
    case "contact-details": {
      requestedValDict = {
        "Mobile Number": dbData?.newMobileNumber ?? fallbackFormData.newContactMobile,
        "Email Address": dbData?.newEmail ?? fallbackFormData.newContactEmail,
      };
      break;
    }
    case "authorised-signatories": {
      requestedValDict = {
        "Signatory Name": dbData?.newSignatoryName ?? fallbackFormData.newSignatoryName,
        "Signatory PAN": dbData?.newSignatoryPan ?? fallbackFormData.newSignatoryPan,
        "Date of Birth": dbData?.newSignatoryDob ?? fallbackFormData.newSignatoryDob,
        Designation: dbData?.newDesignation ?? dbData?.newSignatoryDesignation ?? fallbackFormData.newSignatoryDesignation,
        "Signatory Mobile": dbData?.newSignatoryMobile ?? fallbackFormData.newSignatoryMobile,
        "Signatory Email": dbData?.newSignatoryEmail ?? fallbackFormData.newSignatoryEmail,
      };
      break;
    }
    default:
      break;
  }

  return requestedValDict;
}

const AMENDMENT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function formatAmendmentSubmissionDate(isoStr: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${AMENDMENT_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {
    // unparseable — return raw
  }
  return isoStr;
}
