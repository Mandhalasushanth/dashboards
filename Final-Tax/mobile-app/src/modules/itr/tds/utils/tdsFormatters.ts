/**
 * Formats a numeric string to Indian currency style with commas (e.g. 1,10,000)
 * Functional implementation - zero loops
 */
export const formatIndianNumber = (val: string): string => {
  const digits = (val || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  const num = Number(digits);
  if (!isNaN(num)) {
    return num.toLocaleString("en-IN");
  }
  // Pure functional regex fallback - zero loops
  const lastThree = digits.substring(digits.length - 3);
  const otherNumbers = digits.substring(0, digits.length - 3);
  return otherNumbers !== ""
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
};

/**
 * Strips formatting to extract raw numeric digits
 */
export const stripCommas = (val: string): string => {
  return (val || "").replace(/[^0-9]/g, "");
};

export const formatIndianAmount = formatIndianNumber;
export const cleanNumericValue = stripCommas;
