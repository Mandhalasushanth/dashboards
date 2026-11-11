import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import { validateGstinFull } from "@/modules/gst/utils/gstValidation";
import {
  MSME_BUSINESS_ACTIVITY_OPTIONS,
  MSME_CONSTITUTION_OPTIONS,
  MSME_DURATION_OPTIONS,
  MSME_GST_STATUS_OPTIONS,
  MSME_OWNERSHIP_OPTIONS,
  MSME_REGISTRATION_STATUS_OPTIONS,
  type MsmeLoanAddress,
  type MsmeLoanFormData,
  type MsmeLoanErrors,
  type MsmeMoneyField,
} from "../types/msmeLoan.types";
import {
  isUdyamRegistered,
  isGstRegistered,
} from "../constants/msmeDocuments";

export const MSME_BUSINESS_NAME_MAX_LENGTH = 100;
export const MSME_CONSTITUTION_OTHER_MAX_LENGTH = 50;
export const MSME_ACTIVITY_OTHER_MAX_LENGTH = 60;
export const MSME_HOUSE_MAX_LENGTH = 100;
export const MSME_STREET_MAX_LENGTH = 120;
export const MSME_CITY_MAX_LENGTH = 50;
export const MSME_OWNERSHIP_OTHER_MAX_LENGTH = 50;
export const MSME_MAX_EMPLOYEES = 50000;

// Broad emoji detection covering standard emojis, pictorial symbols, and presentation selectors
export const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{200D}]/u;

// Control characters (newlines, tabs, null bytes, backspaces, etc.)
export const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/;

// HTML tags, script payloads, javascript: URLs
export const HTML_SCRIPT_REGEX = /<[^>]*>|javascript:|alert\(|<\s*script/i;

// SQL injection patterns like ' OR 1=1 --, DROP TABLE, UNION SELECT, etc.
export const SQL_INJECTION_REGEX =
  /('\s*(OR|AND)\b|--|\/\*|\*\/|\b(UNION\s+SELECT|INSERT\s+INTO|DROP\s+TABLE|DELETE\s+FROM|UPDATE\s+\w+\s+SET|OR\s+1\s*=\s*1|EXEC|XP_)\b)/i;

// Legitimate characters for business name: Latin letters, Indian scripts (\u0900-\u0D7F), numbers, spaces, and standard punctuation (. , & ' - / ( ))
const BUSINESS_NAME_ALLOWED_REGEX =
  /^[a-zA-Z0-9\u0900-\u0D7F\s.,&'\-/()]+$/;

// City must only contain letters, legitimate Indian language characters, spaces, and dots/hyphens. NO numbers, NO arbitrary symbols.
const CITY_ALLOWED_REGEX = /^[a-zA-Z\u0900-\u0D7F\s.'-]+$/;

// Address house / street allowed characters
const ADDRESS_LINE_ALLOWED_REGEX =
  /^[a-zA-Z0-9\u0900-\u0D7F\s.,#'\-/()]+$/;

// Standard Indian PIN code: 6 digits, 1-9 start
const PINCODE_REGEX = /^[1-9]\d{5}$/;

// Standard Udyam Registration format: UDYAM-XX-00-0000000
const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;


/**
 * Checks for emoji, control characters, script/html, and SQL injection payloads.
 */
export function hasMaliciousOrDecorativeChars(input: string): boolean {
  if (EMOJI_REGEX.test(input)) return true;
  if (CONTROL_CHAR_REGEX.test(input)) return true;
  if (HTML_SCRIPT_REGEX.test(input)) return true;
  if (SQL_INJECTION_REGEX.test(input)) return true;
  return false;
}

/**
 * Validates Business / Trade Name.
 */
export function validateBusinessName(name: string): string | undefined {
  if (!name || !name.trim()) {
    return "Please enter your business or trade name";
  }
  if (name.startsWith(" ") || name.endsWith(" ")) {
    return "Business name cannot contain leading or trailing spaces";
  }
  if (name.length > MSME_BUSINESS_NAME_MAX_LENGTH) {
    return `Business name cannot exceed ${MSME_BUSINESS_NAME_MAX_LENGTH} characters`;
  }
  if (hasMaliciousOrDecorativeChars(name)) {
    return "Business name contains invalid symbols, emoji or formatting";
  }
  if (!BUSINESS_NAME_ALLOWED_REGEX.test(name)) {
    return "Business name contains invalid characters";
  }
  // Must contain at least one letter (Latin or Indian language Unicode)
  if (!/[a-zA-Z\u0900-\u0D7F]/.test(name)) {
    return "Business name must contain letters";
  }
  return undefined;
}

/**
 * Validates Business Constitution 'Other' specification.
 */
export function validateConstitutionOther(value: string): string | undefined {
  if (!value || !value.trim()) {
    return "Please specify your business constitution";
  }
  if (value.startsWith(" ") || value.endsWith(" ")) {
    return "Constitution cannot contain leading or trailing spaces";
  }
  if (value.length > MSME_CONSTITUTION_OTHER_MAX_LENGTH) {
    return `Constitution cannot exceed ${MSME_CONSTITUTION_OTHER_MAX_LENGTH} characters`;
  }
  if (hasMaliciousOrDecorativeChars(value)) {
    return "Constitution contains invalid characters or emoji";
  }
  if (!/^[a-zA-Z\u0900-\u0D7F\s.,'\-/()]+$/.test(value)) {
    return "Constitution contains invalid characters";
  }
  if (!/[a-zA-Z\u0900-\u0D7F]/.test(value)) {
    return "Constitution must contain letters";
  }
  return undefined;
}

/**
 * Validates Business Activity 'Other' specification.
 */
export function validateBusinessActivityOther(value: string): string | undefined {
  if (!value || !value.trim()) {
    return "Please specify your business activity";
  }
  if (value.startsWith(" ") || value.endsWith(" ")) {
    return "Activity cannot contain leading or trailing spaces";
  }
  if (value.length > MSME_ACTIVITY_OTHER_MAX_LENGTH) {
    return `Activity cannot exceed ${MSME_ACTIVITY_OTHER_MAX_LENGTH} characters`;
  }
  if (hasMaliciousOrDecorativeChars(value)) {
    return "Activity contains invalid characters or emoji";
  }
  if (!/^[a-zA-Z0-9\u0900-\u0D7F\s.,'\-/()]+$/.test(value)) {
    return "Activity contains invalid characters";
  }
  if (!/[a-zA-Z\u0900-\u0D7F]/.test(value)) {
    return "Activity must contain letters";
  }
  return undefined;
}

/**
 * Validates Business Establishment Date.
 * Supports ISO (YYYY-MM-DD) or Indian display (DD-MM-YYYY).
 */
export function validateEstablishmentDate(dateStr: string): string | undefined {
  if (!dateStr || !dateStr.trim()) {
    return "Please select business establishment date";
  }
  const clean = dateStr.trim();
  let day: number;
  let month: number;
  let year: number;

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parts = clean.split("-").map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
    const parts = clean.split("-").map(Number);
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else {
    return "Please enter a valid establishment date";
  }

  if (year < 1850) {
    return "Please enter a valid establishment year";
  }

  // Check valid calendar date
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return "Please enter a valid calendar date";
  }

  // Cannot be in the future
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (parsed > today) {
    return "Establishment date cannot be in the future";
  }

  return undefined;
}

/**
 * Validates Business Operating Address.
 */
export function validateOperatingAddress(
  address: MsmeLoanAddress
): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};

  // House / Flat
  const rawHouse = address.houseNumber || "";
  const house = rawHouse.trim();
  if (!house) {
    errors["operatingAddress.houseNumber"] = "Please enter house, flat or building";
  } else if (rawHouse.startsWith(" ") || rawHouse.endsWith(" ")) {
    errors["operatingAddress.houseNumber"] = "House/flat cannot contain leading or trailing spaces";
  } else if (house.length > MSME_HOUSE_MAX_LENGTH) {
    errors["operatingAddress.houseNumber"] = `House/flat cannot exceed ${MSME_HOUSE_MAX_LENGTH} characters`;
  } else if (hasMaliciousOrDecorativeChars(house) || !ADDRESS_LINE_ALLOWED_REGEX.test(house)) {
    errors["operatingAddress.houseNumber"] = "House/flat contains invalid characters";
  }

  // Street / Locality
  const rawStreet = address.street || "";
  const street = rawStreet.trim();
  if (!street) {
    errors["operatingAddress.street"] = "Please enter street, locality or landmark";
  } else if (rawStreet.startsWith(" ") || rawStreet.endsWith(" ")) {
    errors["operatingAddress.street"] = "Street cannot contain leading or trailing spaces";
  } else if (street.length > MSME_STREET_MAX_LENGTH) {
    errors["operatingAddress.street"] = `Street cannot exceed ${MSME_STREET_MAX_LENGTH} characters`;
  } else if (hasMaliciousOrDecorativeChars(street) || !ADDRESS_LINE_ALLOWED_REGEX.test(street)) {
    errors["operatingAddress.street"] = "Street/locality contains invalid characters";
  }

  // City / District
  const rawCity = address.city || "";
  const city = rawCity.trim();
  if (!city) {
    errors["operatingAddress.city"] = "Please enter city or district";
  } else if (rawCity.startsWith(" ") || rawCity.endsWith(" ")) {
    errors["operatingAddress.city"] = "City cannot contain leading or trailing spaces";
  } else if (city.length > MSME_CITY_MAX_LENGTH) {
    errors["operatingAddress.city"] = `City cannot exceed ${MSME_CITY_MAX_LENGTH} characters`;
  } else if (hasMaliciousOrDecorativeChars(city)) {
    errors["operatingAddress.city"] = "City contains invalid symbols or emoji";
  } else if (!CITY_ALLOWED_REGEX.test(city) || /\d/.test(city)) {
    errors["operatingAddress.city"] = "City must contain letters only";
  } else if (!/[a-zA-Z\u0900-\u0D7F]/.test(city)) {
    errors["operatingAddress.city"] = "City must contain letters";
  }

  // State
  const state = (address.state || "").trim();
  if (!state) {
    errors["operatingAddress.state"] = "Please select a state or union territory";
  } else if (!INDIAN_STATES_AND_UTS.includes(state as (typeof INDIAN_STATES_AND_UTS)[number])) {
    errors["operatingAddress.state"] = "Please select a valid state from the list";
  }

  // PIN Code
  const rawPin = address.pincode || "";
  if (!rawPin.trim()) {
    errors["operatingAddress.pincode"] = "Please enter a 6-digit PIN code";
  } else if (/\s/.test(rawPin)) {
    errors["operatingAddress.pincode"] = "PIN code cannot contain spaces";
  } else if (rawPin.startsWith("0")) {
    errors["operatingAddress.pincode"] = "PIN code cannot start with 0";
  } else if (!PINCODE_REGEX.test(rawPin)) {
    errors["operatingAddress.pincode"] = "Please enter a valid 6-digit PIN code";
  }

  return errors;
}

/**
 * Validates Udyam Registration Number.
 */
export function validateUdyamNumber(
  number: string,
  status: string
): string | undefined {
  if (status !== "Registered") return undefined;
  const raw = number || "";
  if (!raw.trim()) {
    return "Please enter your Udyam registration number";
  }
  if (/\s/.test(raw)) {
    return "Udyam number cannot contain spaces";
  }
  const clean = raw.trim().toUpperCase();
  if (hasMaliciousOrDecorativeChars(clean)) {
    return "Udyam number contains invalid characters or emoji";
  }
  if (!UDYAM_REGEX.test(clean)) {
    return "Enter a valid Udyam number (e.g. UDYAM-XX-00-0000000)";
  }
  return undefined;
}

/**
 * Validates GSTIN.
 */
export function validateGstin(
  gstin: string,
  status: string
): string | undefined {
  if (status !== "Registered") return undefined;
  if (!gstin || !gstin.trim()) return "Enter GSTIN";
  return validateGstinFull(gstin) ?? undefined;
}

/**
 * Validates Number of Employees.
 */
export function validateEmployees(value: string): string | undefined {
  const raw = value || "";
  const clean = raw.trim();
  if (!clean) {
    return "Please enter number of employees";
  }
  if (raw.startsWith(" ") || raw.endsWith(" ")) {
    return "Number of employees cannot contain spaces";
  }
  if (hasMaliciousOrDecorativeChars(clean)) {
    return "Employees must contain digits only";
  }
  // Decimal check: e.g. 12.5
  if (clean.includes(".")) {
    return "Number of employees must be a whole number";
  }
  // Scientific notation / negative check
  if (/[eE+\-]/.test(clean)) {
    return "Number of employees must be a valid whole number";
  }
  if (!/^\d+$/.test(clean)) {
    return "Number of employees must contain digits only";
  }
  const count = parseInt(clean, 10);
  if (isNaN(count) || count < 1) {
    return "Please enter at least 1 employee";
  }
  if (count > MSME_MAX_EMPLOYEES) {
    return `Number of employees cannot exceed ${MSME_MAX_EMPLOYEES.toLocaleString("en-IN")}`;
  }
  return undefined;
}

/**
 * Validates Annual Business Turnover.
 */
export function validateTurnover(
  turnover: string,
  isInvalidMoney?: boolean
): string | undefined {
  if (isInvalidMoney) {
    return "Enter a whole-rupee amount using numbers only";
  }
  const raw = (turnover || "").trim();
  if (!raw) {
    return "Please enter annual turnover";
  }
  if (hasMaliciousOrDecorativeChars(raw)) {
    return "Turnover contains invalid characters or emoji";
  }
  if (/[eE+\-]/.test(raw)) {
    return "Turnover cannot use scientific notation or signs";
  }
  if (raw.includes(".")) {
    return "Annual turnover must be a whole-rupee amount";
  }
  const clean = raw.replace(/,/g, "");
  if (!/^\d+$/.test(clean)) {
    return "Annual turnover must contain numbers only";
  }
  const amount = parseInt(clean, 10);
  if (isNaN(amount) || amount <= 0) {
    return "Annual turnover must be greater than zero";
  }
  return undefined;
}

/**
 * Validates Business Ownership 'Other' specification.
 */
export function validateOwnershipOther(
  ownershipType: string,
  otherValue: string
): string | undefined {
  if (ownershipType !== "Other") return undefined;
  const raw = otherValue || "";
  const clean = raw.trim();
  if (!clean) {
    return "Please specify ownership type";
  }
  if (raw.startsWith(" ") || raw.endsWith(" ")) {
    return "Ownership type cannot contain leading or trailing spaces";
  }
  if (clean.length > MSME_OWNERSHIP_OTHER_MAX_LENGTH) {
    return `Ownership type cannot exceed ${MSME_OWNERSHIP_OTHER_MAX_LENGTH} characters`;
  }
  if (hasMaliciousOrDecorativeChars(clean)) {
    return "Ownership type contains invalid characters or emoji";
  }
  if (!/^[a-zA-Z\u0900-\u0D7F\s.,'\-/()]+$/.test(clean)) {
    return "Ownership type contains invalid characters";
  }
  if (!/[a-zA-Z\u0900-\u0D7F]/.test(clean)) {
    return "Ownership type must contain letters";
  }
  return undefined;
}

/**
 * Complete form validation for MSME Loan Screen 2.
 */
export function validateMsmeLoanForm(
  formData: MsmeLoanFormData,
  invalidMoneyFields?: Partial<Record<MsmeMoneyField, boolean>>
): { isValid: boolean; errors: MsmeLoanErrors } {
  const errors: MsmeLoanErrors = {};

  // 1. Business Name
  const businessNameError = validateBusinessName(formData.businessName);
  if (businessNameError) errors.businessName = businessNameError;

  // 2. Business Constitution
  if (!formData.constitution) {
    errors.constitution = "Please select business constitution";
  } else if (!MSME_CONSTITUTION_OPTIONS.includes(formData.constitution)) {
    errors.constitution = "Please select a valid business constitution";
  } else if (formData.constitution === "Other") {
    const constOtherError = validateConstitutionOther(formData.constitutionOther);
    if (constOtherError) errors.constitutionOther = constOtherError;
  }

  // 3. Primary Business Activity
  if (!formData.businessActivity) {
    errors.businessActivity = "Please select primary business activity";
  } else if (!MSME_BUSINESS_ACTIVITY_OPTIONS.includes(formData.businessActivity)) {
    errors.businessActivity = "Please select a valid business activity";
  } else if (formData.businessActivity === "Other") {
    const actOtherError = validateBusinessActivityOther(formData.businessActivityOther);
    if (actOtherError) errors.businessActivityOther = actOtherError;
  }

  // 4. Establishment Date
  const dateError = validateEstablishmentDate(formData.establishmentDate);
  if (dateError) errors.establishmentDate = dateError;

  // 5. Operating Address
  const addressErrors = validateOperatingAddress(formData.operatingAddress);
  Object.assign(errors, addressErrors);

  // 6. Udyam Registration Status
  const isUdyamRegisteredVal = isUdyamRegistered(formData.udyamStatus);
  const isValidUdyamOption =
    (MSME_REGISTRATION_STATUS_OPTIONS as readonly string[]).includes(formData.udyamStatus) ||
    formData.udyamStatus === "Yes" ||
    formData.udyamStatus === "No";

  if (!formData.udyamStatus) {
    errors.udyamStatus = "Please select Udyam registration status";
  } else if (!isValidUdyamOption) {
    errors.udyamStatus = "Please select a valid registration status";
  } else if (isUdyamRegisteredVal) {
    const udyamError = validateUdyamNumber(
      formData.udyamRegistrationNumber,
      "Registered"
    );
    if (udyamError) errors.udyamRegistrationNumber = udyamError;
  }

  // 7. GST Registration Status
  const isGstRegisteredVal = isGstRegistered(formData.gstStatus);
  const isValidGstOption =
    (MSME_GST_STATUS_OPTIONS as readonly string[]).includes(formData.gstStatus) ||
    formData.gstStatus === "Yes" ||
    formData.gstStatus === "No";

  if (!formData.gstStatus) {
    errors.gstStatus = "Please select GST registration status";
  } else if (!isValidGstOption) {
    errors.gstStatus = "Please select a valid GST registration status";
  } else if (isGstRegisteredVal) {
    const gstinError = validateGstin(formData.gstin, "Registered");
    if (gstinError) errors.gstin = gstinError;
  }

  // 8. Operating Duration
  if (!formData.operatingDuration) {
    errors.operatingDuration = "Please select business operating duration";
  } else if (!MSME_DURATION_OPTIONS.includes(formData.operatingDuration)) {
    errors.operatingDuration = "Please select a valid operating duration";
  }

  // 9. Number of Employees
  const employeesError = validateEmployees(formData.numberOfEmployees);
  if (employeesError) errors.numberOfEmployees = employeesError;

  // 10. Annual Business Turnover
  const turnoverError = validateTurnover(
    formData.annualTurnover,
    invalidMoneyFields?.annualTurnover
  );
  if (turnoverError) errors.annualTurnover = turnoverError;

  // 11. Business Ownership
  if (!formData.ownershipType) {
    errors.ownershipType = "Please select business ownership type";
  } else if (!MSME_OWNERSHIP_OPTIONS.includes(formData.ownershipType)) {
    errors.ownershipType = "Please select a valid ownership type";
  } else if (formData.ownershipType === "Other") {
    const ownOtherError = validateOwnershipOther(
      formData.ownershipType,
      formData.ownershipTypeOther
    );
    if (ownOtherError) errors.ownershipTypeOther = ownOtherError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
