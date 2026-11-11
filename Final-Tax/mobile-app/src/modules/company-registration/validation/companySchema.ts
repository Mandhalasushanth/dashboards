import type { CompanyDetails } from '../types/company.types';
import type { LinkedRegistrations } from '../types/registration.types';

export const isOpcCompanyType = (type?: string): boolean => {
  if (!type?.trim()) return false;
  const normalized = type.trim().toLowerCase();
  return (
    normalized === 'one person company (opc)' ||
    normalized === 'one person company' ||
    normalized === 'opc' ||
    normalized.includes('one person') ||
    normalized.includes('opc')
  );
};

export const isPublicCompanyType = (type?: string): boolean => {
  if (!type?.trim()) return false;
  const normalized = type.trim().toLowerCase();
  return normalized === 'public limited' || normalized.includes('public limited');
};

export const getMinRequiredPromoters = (companyType?: string): number => {
  if (isPublicCompanyType(companyType)) return 3;
  if (isOpcCompanyType(companyType)) return 1;
  return 2;
};

export const getSuffixForType = (type?: string): string => {
  if (!type?.trim()) return '';
  if (isOpcCompanyType(type)) return '(OPC) Private Limited';
  if (isPublicCompanyType(type)) return 'Limited';
  switch (type.trim()) {
    case 'Private Limited':
      return 'Private Limited';
    case 'Section 8 (NGO)':
      return 'Foundation / Section 8';
    case 'Limited Liability Partnership (LLP)':
      return 'LLP';
    default:
      return '';
  }
};

export const EMOJI_REGEX = /(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F3FB}-\u{1F3FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u200D\uFE0E\uFE0F])/u;
export const UNSUPPORTED_CHARS_MSG = 'Please remove unsupported special characters.';

export const validateProposedCompanyName = (name?: string, suffix?: string): string | null => {
  const trimmed = name?.trim() || '';
  if (!trimmed) {
    return 'Please enter a proposed company name.';
  }

  // Check for manually typed legal suffixes at the end of the name
  const suffixRegex = /(?:\b|\s)(PRIVATE\s+LIMITED|PVT\.?\s*LTD\.?|LIMITED|LTD\.?|LLP|OPC)\b\.?$/i;
  if (suffixRegex.test(trimmed)) {
    return 'Please enter the company name without a legal suffix. The legal suffix is added automatically.';
  }

  const suffixText = suffix || '';
  const fullLength = (trimmed + ' ' + suffixText).trim().length;
  if (fullLength > 75 || trimmed.length > 75) {
    return 'Company name exceeds the permitted character limit.';
  }

  if (trimmed.length < 3) {
    return 'Please enter a valid company name.';
  }

  if (EMOJI_REGEX.test(trimmed) || !/^[\p{L}\p{M}0-9\s&.\-,()]+$/u.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }

  const alphaCount = (trimmed.match(/[\p{L}\p{M}]/gu) || []).length;
  if (alphaCount < 2) {
    return 'Please enter a valid company name.';
  }

  return null;
};

export const validateBusinessActivity = (text?: string, isRequired = true): string | null => {
  const trimmed = text?.trim() || '';
  if (!trimmed) {
    return isRequired ? 'Please enter the primary business activity.' : null;
  }
  if (EMOJI_REGEX.test(trimmed) || !/^[\p{L}\p{M}\p{N}\s,.\-#/()'&;:_%\n\r\t"]+$/u.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (isRequired && trimmed.length < 10) {
    return 'Primary activity description must be at least 10 characters.';
  }
  return null;
};

export const validateNicCode = (nic?: string): string | null => {
  const trimmed = nic?.trim() || '';
  if (!trimmed) return 'NIC code is required.';
  if (EMOJI_REGEX.test(trimmed) || !/^\d+$/.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length !== 5) {
    return 'NIC code must contain exactly 5 digits.';
  }
  return null;
};

export const validateAddressLine = (address?: string): string | null => {
  const trimmed = address?.trim() || '';
  if (!trimmed) return 'Building / Premises Address Line is required.';
  if (EMOJI_REGEX.test(trimmed) || !/^[\p{L}\p{M}\p{N}\s,.\-#/()'&;:_]+$/u.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length < 3) return 'Please enter a valid address.';
  return null;
};

export const validateLocationName = (name?: string, label = 'Location'): string | null => {
  const trimmed = name?.trim() || '';
  if (!trimmed) return `${label} is required.`;
  if (EMOJI_REGEX.test(trimmed) || !/^[\p{L}\p{M}\s.'\-&]+$/u.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length < 2) return `Please enter a valid ${label.toLowerCase()}.`;
  return null;
};

export const validatePinCode = (pin?: string): string | null => {
  const trimmed = pin?.trim() || '';
  if (!trimmed) return 'PIN code is required.';
  if (EMOJI_REGEX.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
    return 'Enter a valid 6-digit Indian PIN code.';
  }
  return null;
};

export const validateCompanyEmail = (email?: string): string | null => {
  const trimmed = email?.trim() || '';
  if (!trimmed) return 'Company email is required.';
  if (EMOJI_REGEX.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length > 254) return 'Email address must not exceed 254 characters.';
  if (trimmed.includes(' ')) {
    return 'Enter a valid email address.';
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return null;
};

export const validateCompanyMobile = (mobile?: string): string | null => {
  const trimmed = mobile?.trim() || '';
  if (!trimmed) return 'Mobile number is required.';
  if (EMOJI_REGEX.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (!/^\d+$/.test(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  if (trimmed.length < 10) {
    return 'Mobile number must contain exactly 10 digits.';
  }
  if (!/^[6-9][0-9]{9}$/.test(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  return null;
};

export const validateCapitalNumeric = (val?: number | string, label = 'Amount'): string | null => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return `Please enter valid ${label}.`;
  }
  const str = String(val).trim();
  if (EMOJI_REGEX.test(str) || !/^\d+(\.\d+)?$/.test(str)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (Number(str) <= 0) {
    return `Please enter valid ${label}.`;
  }
  return null;
};

export const validateIndustryCategory = (category?: string, isRequired = true): string | null => {
  const trimmed = category?.trim() || '';
  if (!trimmed) {
    return isRequired ? 'Industry Category is required.' : null;
  }
  if (EMOJI_REGEX.test(trimmed) || !/^[\p{L}\p{M}\p{N}\s,.\-/'()&]+$/u.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length < 2) {
    return 'Please enter a valid industry category.';
  }
  return null;
};

export const validateAccountNumber = (acc?: string): string | null => {
  const trimmed = acc?.trim() || '';
  if (!trimmed) return 'Bank account number is required.';
  if (EMOJI_REGEX.test(trimmed) || !/^\d+$/.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length < 6 || trimmed.length > 18) {
    return 'Please enter a valid bank account number (6 to 18 digits).';
  }
  return null;
};

/** Step 0: company type. Adds messages to `fieldErrors` and `errors`. */
const collectCompanyTypeErrors = (
  details: Partial<CompanyDetails>, fieldErrors: Record<string, string>, errors: string[]
): void => {
  if (!details.companyType?.trim()) {
    fieldErrors.companyType = 'Please select a Company Type to proceed.';
    errors.push(fieldErrors.companyType);
  }
};

/** Step 1: classification, activity and names. Adds messages to `fieldErrors` and `errors`. */
const collectCompanyDetailsErrors = (
  details: Partial<CompanyDetails>, fieldErrors: Record<string, string>, errors: string[]
): void => {
  if (!details.companyCategory?.trim()) {
    fieldErrors.companyCategory = 'Please select a company category.';
    errors.push(fieldErrors.companyCategory);
  }
  if (!details.companySubCategory?.trim()) {
    fieldErrors.companySubCategory = 'Please select a sub-category.';
    errors.push(fieldErrors.companySubCategory);
  }
  const suffixText = details.nameSuffix || getSuffixForType(details.companyType);
  const nameError = validateProposedCompanyName(details.proposedName1, suffixText);
  if (nameError) {
    fieldErrors.proposedName1 = nameError;
    errors.push(nameError);
  }
  const name2Error = validateProposedCompanyName(details.proposedName2, suffixText);
  if (name2Error) {
    fieldErrors.proposedName2 = name2Error;
    errors.push(name2Error);
  } else if (
    details.proposedName1?.trim() &&
    details.proposedName2?.trim() &&
    details.proposedName1.trim().toLowerCase() === details.proposedName2.trim().toLowerCase()
  ) {
    fieldErrors.proposedName2 = 'Alternative name must be distinct from primary proposed name.';
    errors.push(fieldErrors.proposedName2);
  }
  const primActivityError = validateBusinessActivity(details.primaryActivity, true);
  if (primActivityError) {
    fieldErrors.primaryActivity = primActivityError;
    errors.push(primActivityError);
  }
  if (details.secondaryActivity?.trim()) {
    const secActivityError = validateBusinessActivity(details.secondaryActivity, false);
    if (secActivityError) {
      fieldErrors.secondaryActivity = secActivityError;
      errors.push(secActivityError);
    }
  }
  const nicError = validateNicCode(details.nicCode);
  if (nicError) {
    fieldErrors.nicCode = nicError;
    errors.push(nicError);
  }
};

/** Step 2: registered office. Adds messages to `fieldErrors` and `errors`. */
const collectRegisteredOfficeErrors = (
  details: Partial<CompanyDetails>, fieldErrors: Record<string, string>, errors: string[]
): void => {
  const addrError = validateAddressLine(details.registeredAddressLine);
  if (addrError) {
    fieldErrors.registeredAddressLine = addrError;
    errors.push(addrError);
  }
  const cityError = validateLocationName(details.registeredCity, 'City');
  if (cityError) {
    fieldErrors.registeredCity = cityError;
    errors.push(cityError);
  }
  const distError = validateLocationName(details.registeredDistrict, 'District');
  if (distError) {
    fieldErrors.registeredDistrict = distError;
    errors.push(distError);
  }
  const stateError = validateLocationName(details.registeredState, 'State');
  if (stateError) {
    fieldErrors.registeredState = stateError;
    errors.push(stateError);
  }
  const pinErr = validatePinCode(details.registeredPincode);
  if (pinErr) {
    fieldErrors.registeredPincode = pinErr;
    errors.push(pinErr);
  }
  if (!details.premisesOwnership?.trim()) {
    fieldErrors.premisesOwnership = 'Please select premises ownership status.';
    errors.push(fieldErrors.premisesOwnership);
  }
  const emailErr = validateCompanyEmail(details.companyEmail);
  if (emailErr) {
    fieldErrors.companyEmail = emailErr;
    errors.push(emailErr);
  }
  const mobileErr = validateCompanyMobile(details.companyMobile);
  if (mobileErr) {
    fieldErrors.companyMobile = mobileErr;
    errors.push(mobileErr);
  }
};

/** Step 4: capital and shares. Adds messages to `fieldErrors` and `errors`. */
const collectCapitalErrors = (
  details: Partial<CompanyDetails>, fieldErrors: Record<string, string>, errors: string[]
): void => {
  const authErr = validateCapitalNumeric(details.authorizedCapital, 'Authorised Capital');
  if (authErr) {
    fieldErrors.authorizedCapital = authErr;
    errors.push(authErr);
  }
  const faceErr = validateCapitalNumeric(details.faceValuePerShare, 'Face Value per Share');
  if (faceErr) {
    fieldErrors.faceValuePerShare = faceErr;
    errors.push(faceErr);
  }
  if (details.authorizedCapital && details.numberOfShares && details.faceValuePerShare) {
    const calculated = Math.round(Number(details.numberOfShares) * Number(details.faceValuePerShare));
    if (Math.abs(calculated - Number(details.authorizedCapital)) > 0.01) {
      fieldErrors.authorizedCapital = `Authorised Capital (₹${Number(details.authorizedCapital).toLocaleString('en-IN')}) must equal Shares (${Number(details.numberOfShares).toLocaleString('en-IN')}) × Face Value (₹${details.faceValuePerShare}) = ₹${calculated.toLocaleString('en-IN')}.`;
      errors.push(fieldErrors.authorizedCapital);
    }
  }
  if (details.paidUpCapital && details.authorizedCapital && details.paidUpCapital > details.authorizedCapital) {
    fieldErrors.paidUpCapital = 'Subscribed Capital cannot exceed Authorised Capital.';
    errors.push(fieldErrors.paidUpCapital);
  }
};

/** Step 6: linked registrations. Adds messages to `fieldErrors` and `errors`. */
const collectLinkedRegistrationErrors = (
  details: Partial<CompanyDetails>, linkedRegistrations: LinkedRegistrations | undefined, fieldErrors: Record<string, string>, errors: string[]
): void => {
  if (linkedRegistrations?.bankAccount) {
    const accErr = validateAccountNumber(details.accountNumber);
    if (accErr) {
      fieldErrors.accountNumber = accErr;
      errors.push(accErr);
    }
  }
};

export const companySchema = {
  validateStep(step: number, details: Partial<CompanyDetails>, linkedRegistrations?: LinkedRegistrations): { valid: boolean; errors: string[]; fieldErrors: Record<string, string> } {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (step === 0) {
      collectCompanyTypeErrors(details, fieldErrors, errors);
    }

    if (step === 1) {
      collectCompanyDetailsErrors(details, fieldErrors, errors);
    }

    if (step === 2) {
      collectRegisteredOfficeErrors(details, fieldErrors, errors);
    }

    if (step === 4) {
      collectCapitalErrors(details, fieldErrors, errors);
    }

    if (step === 6) {
      collectLinkedRegistrationErrors(details, linkedRegistrations, fieldErrors, errors);
    }

    return { valid: errors.length === 0, errors, fieldErrors };
  },
};

