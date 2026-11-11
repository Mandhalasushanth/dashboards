import type { DirectorInfo, OpcNomineeInfo } from '../types/director.types';
import { EMOJI_REGEX, UNSUPPORTED_CHARS_MSG } from './companySchema';

export const DOB_REGEX = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/;

export function isValidDob(dob: string): boolean {
  if (!dob || !DOB_REGEX.test(dob)) return false;
  const parts = dob.split('-');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function formatDobInput(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
}

export function validatePersonName(name?: string, isRequired = true, label = 'Full name'): string | null {
  const trimmed = name?.trim() || '';
  if (!trimmed) {
    return isRequired ? `${label} is required.` : null;
  }
  if (EMOJI_REGEX.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length > 100 || !/^[\p{L}\p{M}\s.'\-]+$/u.test(trimmed)) {
    return 'Enter a valid full name.';
  }
  const letters = (trimmed.match(/[\p{L}\p{M}]/gu) || []).length;
  if (letters < 2) {
    return 'Enter a valid full name.';
  }
  return null;
}

export function validateDesignation(designation?: string, isRequired = true): string | null {
  const trimmed = designation?.trim() || '';
  if (!trimmed) {
    return isRequired ? 'Designation is required.' : null;
  }
  if (EMOJI_REGEX.test(trimmed) || !/^[\p{L}\p{M}\s.\-/'()&]+$/u.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  return null;
}

export function validateNomineeRelationship(rel?: string): string | null {
  const trimmed = rel?.trim() || '';
  if (!trimmed) return null;
  if (EMOJI_REGEX.test(trimmed) || !/^[\p{L}\p{M}\s.\-/'()&]+$/u.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  return null;
}

export function validateAadhaar(aadhaar?: string, isRequired = false): string | null {
  const trimmed = aadhaar?.trim() || '';
  if (!trimmed) {
    return isRequired ? 'Aadhaar number is required.' : null;
  }
  if (EMOJI_REGEX.test(trimmed) || !/^\d+$/.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length !== 12) {
    return 'Aadhaar must contain exactly 12 digits.';
  }
  return null;
}

export function validateNomineeAadhaar(aadhaar?: string): string | null {
  return validateAadhaar(aadhaar, false);
}

export function validatePercentage(pct?: string | number, label = 'Percentage', isRequired = false): string | null {
  if (pct === undefined || pct === null || String(pct).trim() === '') {
    return isRequired ? `${label} is required.` : null;
  }
  const str = String(pct).trim();
  if (EMOJI_REGEX.test(str) || !/^\d+(\.\d+)?$/.test(str)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  const num = Number(str);
  if (num <= 0 || num > 100) {
    return `${label} must be between 1 and 100.`;
  }
  return null;
}

export function validateDirectorPan(pan?: string): string | null {
  const trimmed = pan?.trim().toUpperCase() || '';
  if (!trimmed) return 'PAN number is required.';
  if (EMOJI_REGEX.test(trimmed) || !/^[A-Z0-9]+$/i.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(trimmed)) {
    return 'Enter a valid 10-character PAN, for example ABCDE1234F.';
  }
  if (trimmed.charAt(3) !== 'P') {
    return 'Director/Nominee PAN must be for an Individual (4th character must be "P").';
  }
  return null;
}

export function validateDirectorEmail(email?: string): string | null {
  const trimmed = email?.trim() || '';
  if (!trimmed) return 'Email address is required.';
  if (EMOJI_REGEX.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.includes(' ')) {
    return 'Enter a valid email address.';
  }
  if (!/^[a-zA-Z0-9._%+\-@]+$/.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length > 254) return 'Email address must not exceed 254 characters.';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return null;
}

export function validateDirectorMobile(mobile?: string): string | null {
  const trimmed = mobile?.trim() || '';
  if (!trimmed) return 'Mobile number is required.';
  if (EMOJI_REGEX.test(trimmed) || !/^\d+$/.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length !== 10) {
    return 'Mobile number must contain exactly 10 digits.';
  }
  if (!/^[6-9][0-9]{9}$/.test(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  return null;
}

export function validateDirectorDob(dob?: string): string | null {
  const trimmed = dob?.trim() || '';
  if (!trimmed) return 'Date of Birth is required.';
  if (EMOJI_REGEX.test(trimmed) || !/^[\d-]+$/.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (!isValidDob(trimmed)) {
    return 'Please enter a valid date of birth in DD-MM-YYYY format.';
  }
  const parts = trimmed.split('-');
  const birthDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 18) {
    return 'Director/Nominee must be at least 18 years of age.';
  }
  if (age > 120) {
    return 'Please enter a valid date of birth.';
  }
  return null;
}

export function validateDirectorDin(din?: string, hasDin?: boolean): string | null {
  const trimmed = din?.trim() || '';
  if (!hasDin && !trimmed) return null;
  if (hasDin && !trimmed) return 'DIN is required if you indicated having one.';
  if (EMOJI_REGEX.test(trimmed) || !/^\d+$/.test(trimmed)) {
    return UNSUPPORTED_CHARS_MSG;
  }
  if (trimmed.length !== 8) {
    return 'DIN must be exactly 8 digits.';
  }
  return null;
}

export function validateOpcNominee(nominee?: Partial<OpcNomineeInfo>): {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
} {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};

  const nameErr = validatePersonName(nominee?.name, true, 'Nominee full name');
  if (nameErr) {
    fieldErrors.nominee_name = nameErr;
    errors.push(nameErr);
  }

  const panErr = validateDirectorPan(nominee?.pan);
  if (panErr) {
    fieldErrors.nominee_pan = panErr;
    errors.push(panErr);
  }

  const relErr = validateNomineeRelationship(nominee?.relationship);
  if (relErr) {
    fieldErrors.nominee_relationship = relErr;
    errors.push(relErr);
  }

  const emailErr = validateDirectorEmail(nominee?.email);
  if (emailErr) {
    fieldErrors.nominee_email = emailErr;
    errors.push(emailErr);
  }

  const phoneErr = validateDirectorMobile(nominee?.phone);
  if (phoneErr) {
    fieldErrors.nominee_phone = phoneErr;
    errors.push(phoneErr);
  }

  const aadhaarErr = validateNomineeAadhaar(nominee?.aadhaar);
  if (aadhaarErr) {
    fieldErrors.nominee_aadhaar = aadhaarErr;
    errors.push(aadhaarErr);
  }

  return { valid: errors.length === 0, errors, fieldErrors };
}

export const directorSchema = {
  validateDirector(director: Partial<DirectorInfo>, index = 0): { valid: boolean; errors: string[]; fieldErrors: Record<string, string> } {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    const dirId = director.id || `dir_${index}`;
    const prefix = `dir_${dirId}_`;

    const nameErr = validatePersonName(director.name, true, 'Full name');
    if (nameErr) {
      fieldErrors[`${prefix}name`] = nameErr;
      errors.push(nameErr);
    }

    const panErr = validateDirectorPan(director.pan);
    if (panErr) {
      fieldErrors[`${prefix}pan`] = panErr;
      errors.push(panErr);
    }

    const dobErr = validateDirectorDob(director.dob);
    if (dobErr) {
      fieldErrors[`${prefix}dob`] = dobErr;
      errors.push(dobErr);
    }

    const emailErr = validateDirectorEmail(director.email);
    if (emailErr) {
      fieldErrors[`${prefix}email`] = emailErr;
      errors.push(emailErr);
    }

    const mobileErr = validateDirectorMobile(director.phone);
    if (mobileErr) {
      fieldErrors[`${prefix}phone`] = mobileErr;
      errors.push(mobileErr);
    }

    const dinErr = validateDirectorDin(director.din, director.hasDin);
    if (dinErr) {
      fieldErrors[`${prefix}din`] = dinErr;
      errors.push(dinErr);
    }

    const desigErr = validateDesignation(director.designation, true);
    if (desigErr) {
      fieldErrors[`${prefix}designation`] = desigErr;
      errors.push(desigErr);
    }

    return { valid: errors.length === 0, errors, fieldErrors };
  },
};

