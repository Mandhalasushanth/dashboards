import { GstBusinessFormData } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import { logger } from "@/core/logging/logger";

/**
 * Normalizes input string to UPPER_SNAKE_CASE for exact matching.
 */
const normalizeInput = (val: string): string =>
  (val || "")
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

/**
 * Exact or partial match dictionary lookup (Clean approach without if-else spaghetti)
 */
const getMappedValue = (
  rawInput: string,
  dict: Record<string, string>,
  fallback: string,
): string => {
  if (!rawInput) return fallback;

  // 1. Try Exact O(1) Lookup
  if (dict[rawInput]) return dict[rawInput];

  // 2. Fallback to Partial Match (Production-safe fallback)
  const matchedKey = Object.keys(dict).find((key) => rawInput.includes(key));
  return matchedKey ? dict[matchedKey] : fallback;
};

// --- DICTIONARY MAPS (Configurations) ---

const CONSTITUTION_MAP: Record<string, string> = {
  PARTNERSHIP_FIRM: "PARTNERSHIP",
  LLP: "LLP",
  PRIVATE: "PRIVATE_LIMITED_COMPANY",
  PUBLIC: "PUBLIC_LIMITED_COMPANY",
  HUF: "HUF",
  SOCIETY: "SOCIETY_TRUST_CLUB",
  TRUST: "SOCIETY_TRUST_CLUB",
  AOP: "AOP_BOI",
  BOI: "AOP_BOI",
  GOVERNMENT: "GOVERNMENT_DEPARTMENT",
  FOREIGN: "FOREIGN_COMPANY",
  PARTNERSHIP: "PARTNERSHIP",
};

const NATURE_MAP: Record<string, string> = {
  WHOLESALER: "TRADER",
  DISTRIBUTOR: "TRADER",
  RETAILER: "TRADER",
  TRADER: "TRADER",
  MANUFACTURER: "MANUFACTURER",
  E_COMMERCE: "E_COMMERCE",
  WORK_CONTRACT: "WORK_CONTRACT",
  IMPORT: "IMPORT_EXPORT",
  EXPORT: "IMPORT_EXPORT",
  WARE_HOUSE: "WARE_HOUSE_DEPOT",
  DEPOT: "WARE_HOUSE_DEPOT",
};

const REASON_MAP: Record<string, string> = {
  E_COMMERCE: "ECOMMERCE_OPERATOR_SELLER",
  THRESHOLD: "CROSSED_TURN_OVER_THRESHOLD",
  TURN_OVER: "CROSSED_TURN_OVER_THRESHOLD",
  INTER_STATE: "INTER_STATE_SUPPLY",
  CASUAL: "CASUAL_TAXABLE_PERSON",
  INPUT_SERVICE: "INPUT_SERVICE_DISTRIBUTOR",
};

const ACCOUNT_TYPE_MAP: Record<string, string> = {
  CURRENT: "CURRENT",
  CURRENT_ACCOUNT: "CURRENT",
  SAVINGS: "SAVINGS",
  SAVINGS_ACCOUNT: "SAVINGS",
  CASH_CREDIT: "CASH_CREDIT_OD",
  CASH_CREDIT_OD: "CASH_CREDIT_OD",
  OD: "CASH_CREDIT_OD",
};

const PLACE_MAP: Record<string, string> = {
  ADDITIONAL: "ADDITIONAL_PLACE_OF_BUSINESS",
  ADDITIONAL_PLACE: "ADDITIONAL_PLACE_OF_BUSINESS",
  ADDITIONAL_PLACE_OF_BUSINESS: "ADDITIONAL_PLACE_OF_BUSINESS",
  PRINCIPAL: "PRINCIPAL_PLACE_OF_BUSINESS",
  PRINCIPAL_PLACE: "PRINCIPAL_PLACE_OF_BUSINESS",
  PRINCIPAL_PLACE_OF_BUSINESS: "PRINCIPAL_PLACE_OF_BUSINESS",
};

/**
 * Safely extracts date parts { year, month, day } from string without timezone shifts.
 * Handles DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, and ISO 8601 strings.
 */
export const extractDateParts = (
  dateStr?: string | null,
): { year: string; month: string; day: string } | null => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const str = dateStr.trim();
  if (!str) return null;

  // YYYY-MM-DD or YYYY/MM/DD or YYYY-MM-DDTHH:mm:ss...
  const ymdMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(str);
  if (ymdMatch) {
    return {
      year: ymdMatch[1],
      month: ymdMatch[2].padStart(2, "0"),
      day: ymdMatch[3].padStart(2, "0"),
    };
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(str);
  if (dmyMatch) {
    return {
      year: dmyMatch[3],
      month: dmyMatch[2].padStart(2, "0"),
      day: dmyMatch[1].padStart(2, "0"),
    };
  }

  return null;
};

/**
 * Exception-safe Date Formatter for Backend (YYYY-MM-DD)
 * Guarantees zero timezone shifts. Returns empty string if missing.
 */
export const formatBackendDate = (dateStr?: string | null): string => {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) return "";
  const parts = extractDateParts(dateStr);
  if (parts) return `${parts.year}-${parts.month}-${parts.day}`;
  return dateStr.trim();
};

/**
 * Exception-safe Date Formatter for UI (DD-MM-YYYY)
 * Guarantees zero timezone shifts. Returns empty string if missing.
 */
export const formatUiDate = (dateStr?: string | null): string => {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) return "";
  const parts = extractDateParts(dateStr);
  if (parts) return `${parts.day}-${parts.month}-${parts.year}`;
  return dateStr.trim();
};

/**
 * Maps the frontend GstBusinessFormData to the backend-expected payload format.
 * Includes global Exception Handling.
 */
export const mapGstRegistrationPayload = (
  businessData: GstBusinessFormData,
  customerId?: string,
  gstId?: string,
) => {
  try {
    const rawConstitution = normalizeInput(businessData.businessType);
    const rawNature = normalizeInput(businessData.natureOfBusiness);
    const rawReason = normalizeInput(businessData.reasonForRegistration);
    const rawScheme = normalizeInput(businessData.compositionScheme);
    const rawPlace = normalizeInput(businessData.placeOfBusiness);
    const resolvedCustomerId = customerId || businessData.customerId || "";
    const resolvedGstId = gstId || businessData.gstId || "";

    return {
      ...(resolvedGstId ? { gstId: resolvedGstId } : {}),
      ...(resolvedCustomerId ? { customerId: resolvedCustomerId } : {}),
      legalName: businessData.legalName,
      tradeName: (businessData.businessName || businessData.legalName || "").trim(),
      constitutionOfBusiness: getMappedValue(
        rawConstitution,
        CONSTITUTION_MAP,
        "PROPRIETORSHIP",
      ),
      natureOfBusiness: getMappedValue(
        rawNature,
        NATURE_MAP,
        "SERVICE_PROVIDER",
      ),
      dateOfCommencement: formatBackendDate(businessData.businessStartDate),
      reasonForRegistration: getMappedValue(
        rawReason,
        REASON_MAP,
        "VOLUNTARY_REGISTRATION",
      ),
      compositionScheme: rawScheme.includes("YES")
        ? "YES_COMPOSITION_SCHEME"
        : "NO_REGULAR_SCHEME",
      placeOfBusiness: getMappedValue(
        rawPlace,
        PLACE_MAP,
        "PRINCIPAL_PLACE_OF_BUSINESS",
      ),
      businessAddress: (businessData.businessAddress || "").trim(),
      city: (businessData.city || "").trim(),
      district: (businessData.district || "").trim(),
      state: businessData.state,
      pinCode: businessData.pinCode,
      hsnSac: businessData.hsnCode,
      accountHolderName: (businessData.accountHolderName || "").trim(),
      bankAccountNumber: businessData.bankAccountNumber,
      ifscCode: businessData.ifscCode,
      bankName: businessData.bankName,
      branchName: (businessData.branchName || "").trim(),
      accountType: getMappedValue(
        normalizeInput(businessData.accountType),
        ACCOUNT_TYPE_MAP,
        "CURRENT",
      ),
      authorisedSignatory: businessData.signatoryName ? "YES" : "NO",
      businessPan: businessData.businessPan,
      signatoryName: (businessData.signatoryName || businessData.legalName || "").trim(),
      signatoryPan: businessData.signatoryPan,
      signatoryDob: formatBackendDate(businessData.signatoryDob),
      designation: (businessData.signatoryDesignation || "Owner").trim(),
      signatoryMobile: businessData.signatoryMobile,
      signatoryEmail: (businessData.signatoryEmail || "").trim(),
    };
  } catch (error) {
    logger.error("[gstRegistrationMapper] Payload Mapping Exception:", { error });
    // In production, throw a standardized AppError so the UI layer's try-catch can show a toast
    throw new Error("Failed to process registration data for submission.");
  }
};

const REVERSE_CONSTITUTION_MAP: Record<string, string> = {
  PROPRIETORSHIP: "Proprietorship",
  PARTNERSHIP: "Partnership Firm",
  LLP: "Limited Liability Partnership (LLP)",
  PRIVATE_LIMITED_COMPANY: "Private Limited Company",
  PUBLIC_LIMITED_COMPANY: "Public Limited Company",
  HUF: "HUF",
  SOCIETY_TRUST_CLUB: "Society / Trust / Club",
  AOP_BOI: "AOP / BOI",
  GOVERNMENT_DEPARTMENT: "Government Department",
  FOREIGN_COMPANY: "Foreign Company",
};

const REVERSE_NATURE_MAP: Record<string, string> = {
  TRADER: "Trader",
  MANUFACTURER: "Manufacturer",
  SERVICE_PROVIDER: "Service Provider",
  RETAILER: "Retailer",
  E_COMMERCE: "E-commerce",
  WORK_CONTRACT: "Contractor / Freelancer",
  IMPORT_EXPORT: "Exporter / Importer",
  WARE_HOUSE_DEPOT: "Wholesaler / Distributor",
};

const REVERSE_REASON_MAP: Record<string, string> = {
  CROSSED_TURN_OVER_THRESHOLD: "Crossed turnover threshold",
  VOLUNTARY_REGISTRATION: "Voluntary registration",
  INTER_STATE_SUPPLY: "Inter-state supply",
  ECOMMERCE_OPERATOR_SELLER: "E-commerce operator / seller",
  CASUAL_TAXABLE_PERSON: "Casual taxable person",
  INPUT_SERVICE_DISTRIBUTOR: "Input Service Distributor",
};

const REVERSE_ACCOUNT_TYPE_MAP: Record<string, string> = {
  CURRENT: "Current",
  SAVINGS: "Savings",
  CASH_CREDIT_OD: "Cash Credit / OD",
};

const REVERSE_PLACE_MAP: Record<string, string> = {
  PRINCIPAL_PLACE_OF_BUSINESS: "Principal place of business",
  ADDITIONAL_PLACE_OF_BUSINESS: "Additional place of business",
};

/**
 * Reverse maps backend BusinessDto to frontend form fields.
 */
export const mapDtoToGstBusinessFormData = (
  dto?: Record<string, unknown> | null,
): Partial<GstBusinessFormData> => {
  if (!dto) return {};
  const rawConst = String(dto.constitutionOfBusiness || "").toUpperCase();
  const rawNat = String(dto.natureOfBusiness || "").toUpperCase();
  const rawReason = String(dto.reasonForRegistration || "").toUpperCase();
  const rawAcc = String(dto.accountType || "").toUpperCase();
  const rawPlace = String(dto.placeOfBusiness || "").toUpperCase();

  return {
    gstId: (dto.gstId as string) || undefined,
    customerId: (dto.customerId as string) || undefined,
    legalName: (dto.legalName as string) || "",
    businessName: (dto.tradeName as string) || "",
    businessType: REVERSE_CONSTITUTION_MAP[rawConst] || (dto.constitutionOfBusiness as string) || "",
    natureOfBusiness: REVERSE_NATURE_MAP[rawNat] || (dto.natureOfBusiness as string) || "",
    placeOfBusiness: REVERSE_PLACE_MAP[rawPlace] || (dto.placeOfBusiness as string) || "Principal place of business",
    businessStartDate: formatUiDate(dto.dateOfCommencement as string),
    reasonForRegistration: REVERSE_REASON_MAP[rawReason] || (dto.reasonForRegistration as string) || "",
    compositionScheme:
      dto.compositionScheme === "YES_COMPOSITION_SCHEME"
        ? "Yes - composition scheme"
        : "No - regular scheme",
    businessAddress: (dto.businessAddress as string) || "",
    city: (dto.city as string) || "",
    district: (dto.district as string) || "",
    state: (dto.state as string) || "",
    pinCode: (dto.pinCode as string) || "",
    hsnCode: (dto.hsnSac as string) || "",
    accountHolderName: (dto.accountHolderName as string) || "",
    bankAccountNumber: (dto.bankAccountNumber as string) || "",
    confirmBankAccountNumber: (dto.bankAccountNumber as string) || "",
    ifscCode: (dto.ifscCode as string) || "",
    bankName: (dto.bankName as string) || "",
    branchName: (dto.branchName as string) || "",
    accountType: REVERSE_ACCOUNT_TYPE_MAP[rawAcc] || (dto.accountType as string) || "Current",
    businessPan: (dto.businessPan as string) || "",
    signatoryName: (dto.signatoryName as string) || "",
    signatoryPan: (dto.signatoryPan as string) || "",
    signatoryDob: formatUiDate(dto.signatoryDob as string),
    signatoryDesignation: (dto.designation as string) || "Owner",
    signatoryMobile: (dto.signatoryMobile as string) || "",
    signatoryEmail: (dto.signatoryEmail as string) || "",
  };
};

/**
 * Maps backend DocumentsDto onto DocumentItem array
 */
export const mapDtoToDocuments = <T extends { id: string; name?: string; fileUri?: string; fileName?: string }>(
  dto: Record<string, unknown> | null | undefined,
  currentDocs: T[],
): T[] => {
  if (!dto || !Array.isArray(currentDocs)) return currentDocs;
  return currentDocs.map((doc) => {
    const key = `${doc.id} ${doc.name || ""}`.toLowerCase();
    let fileUri = doc.fileUri;
    let fileName = doc.fileName;

    if (key.includes("pan") && dto.panCard) {
      fileUri = fileUri || dto.panCard;
      fileName = fileName || String(dto.panCard).split("/").pop() || "panCard";
    } else if ((key.includes("aadhaar") || key.includes("adhar")) && dto.aadhaarCard) {
      fileUri = fileUri || dto.aadhaarCard;
      fileName = fileName || String(dto.aadhaarCard).split("/").pop() || "aadhaarCard";
    } else if (key.includes("business") && dto.businessRegistrationProof) {
      fileUri = fileUri || dto.businessRegistrationProof;
      fileName = fileName || String(dto.businessRegistrationProof).split("/").pop() || "businessRegistrationProof";
    } else if ((key.includes("address") || key.includes("place")) && dto.principalPlaceAddressProof) {
      fileUri = fileUri || dto.principalPlaceAddressProof;
      fileName = fileName || String(dto.principalPlaceAddressProof).split("/").pop() || "principalPlaceAddressProof";
    } else if ((key.includes("bank") || key.includes("passbook") || key.includes("cheque")) && dto.bankPassbookOrCancelledCheque) {
      fileUri = fileUri || dto.bankPassbookOrCancelledCheque;
      fileName = fileName || String(dto.bankPassbookOrCancelledCheque).split("/").pop() || "bankPassbookOrCancelledCheque";
    } else if (key.includes("photo") && dto.passportSizePhotograph) {
      fileUri = fileUri || dto.passportSizePhotograph;
      fileName = fileName || String(dto.passportSizePhotograph).split("/").pop() || "passportSizePhotograph";
    }

    return {
      ...doc,
      fileUri,
      fileName,
    };
  });
};

/**
 * Clean dictionary mapping for Document Upload Types
 */
const DOC_TYPE_MAP: Record<string, string> = {
  PAN: "PAN_CARD",
  AADHAAR: "AADHAAR_CARD",
  ADDRESS_PROOF: "PRINCIPAL_PLACE_ADDRESS_PROOF",
  BUSINESS_PROOF: "BUSINESS_REGISTRATION_PROOF",
  BANK_STATEMENT: "BANK_PASSBOOK_OR_CANCELLED_CHEQUE",
  BANK_PROOF: "BANK_PASSBOOK_OR_CANCELLED_CHEQUE",
  PHOTOGRAPH: "PASSPORT_SIZE_PHOTOGRAPH",
  AUTHORIZATION_PROOF: "PASSPORT_SIZE_PHOTOGRAPH",
};

export const mapDocumentType = (docId: string, subtitle?: string) => {
  const rawId = normalizeInput(docId);
  const type = getMappedValue(rawId, DOC_TYPE_MAP, rawId);

  // Specific condition: If it's address proof, the subtype is the actual proof name
  const subType =
    type === "PRINCIPAL_PLACE_ADDRESS_PROOF"
      ? normalizeInput(subtitle || "")
      : "";

  return { type, subType };
};
