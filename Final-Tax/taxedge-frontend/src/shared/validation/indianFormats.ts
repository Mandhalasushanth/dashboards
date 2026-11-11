/**
 * Format checks for Indian business identifiers and contact details. Each returns an error
 * message or null; empty values pass so optional fields can be left blank (required is checked separately).
 */
type FormatCheck = (value: string) => string | null;

function pattern(regex: RegExp, message: string): FormatCheck {
  return (value) => (value === '' || regex.test(value) ? null : message);
}

/** AAAAA9999A — five letters, four digits, one letter; the 4th letter is the holder type. */
export const panFormat = pattern(/^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/, 'Enter a valid 10-character PAN, e.g. AAACT1234F.');

/** 2-digit state code + PAN + entity number + Z + checksum character. */
export const gstinFormat = pattern(
  /^(0[1-9]|[1-2]\d|3[0-8])[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  'Enter a valid 15-character GSTIN, e.g. 27AAACT1234F1Z5.'
);

/** CIN (companies) or LLPIN (LLPs). */
export const cinOrLlpinFormat = pattern(
  /^([LU]\d{5}[A-Z]{2}\d{4}(PLC|PTC|FTC|GOI|NPL|OPC|SGC|GAP|GAT|ULL|ULT|FLC)\d{6}|[A-Z]{3}-\d{4})$/,
  'Enter a valid 21-character CIN or an LLPIN like AAB-1234.'
);

/** ICAI Firm Registration Number: six digits and a region letter (C, E, N, S, W). */
export const icaiFrnFormat = pattern(/^\d{6}[CENSW]$/, 'Enter a valid ICAI FRN, e.g. 123456W.');

export const emailFormat = pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a valid email address.');

/** Indian mobile number, optionally prefixed with +91 or 0; spaces and hyphens are ignored. */
export const indianMobileFormat: FormatCheck = (value) => {
  const digits = value.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
  return value === '' || /^[6-9]\d{9}$/.test(digits) ? null : 'Enter a valid 10-digit Indian mobile number.';
};

export const httpsUrlFormat: FormatCheck = (value) => {
  if (value === '') {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('.') ? null : 'Enter a full https:// web address.';
  } catch {
    return 'Enter a full https:// web address.';
  }
};

/** Six digits; Indian PIN codes never start with 0. */
export const pinCodeFormat = pattern(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code.');

export const addressFormat = pattern(
  /^[A-Za-z0-9][A-Za-z0-9 ,./#&()':-]{1,119}$/,
  "Address may contain letters, digits, spaces and , . / # & ( ) ' : - only."
);

export const cityFormat = pattern(/^[A-Za-z][A-Za-z .'-]{1,59}$/, 'City may contain letters, spaces, dots and hyphens only.');

/** Bank code (4 letters) + 0 + branch code (6 characters). */
export const ifscFormat = pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid 11-character IFSC, e.g. HDFC0001234.');

export const bankAccountFormat = pattern(/^\d{9,18}$/, 'Account number must be 9 to 18 digits.');

export const upiFormat = pattern(/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/, 'Enter a valid UPI ID, e.g. finsolz@hdfcbank.');

/** Services Accounting Code: six digits starting with 99. */
export const sacFormat = pattern(/^99\d{4}$/, 'SAC must be 6 digits starting with 99, e.g. 998221.');

export const invoicePrefixFormat = pattern(
  /^[A-Z0-9][A-Z0-9/-]{1,9}$/,
  'Use 2–10 capital letters, digits, "/" or "-", e.g. TE/INV-.'
);

export const personOrBusinessNameFormat = pattern(
  /^[A-Za-z0-9][A-Za-z0-9 &.,'()-]{1,119}$/,
  'Use letters, digits, spaces and & . , \' ( ) - only.'
);

const IPV4_OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4_OR_CIDR = new RegExp(`^${IPV4_OCTET}(\\.${IPV4_OCTET}){3}(\\/(3[0-2]|[12]?\\d))?$`);

/** One IPv4 address or CIDR range per line. */
export const ipAllowListFormat: FormatCheck = (value) => {
  const entries = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const invalid = entries.find((entry) => !IPV4_OR_CIDR.test(entry));
  return invalid ? `"${invalid}" is not a valid IPv4 address or CIDR range.` : null;
};
