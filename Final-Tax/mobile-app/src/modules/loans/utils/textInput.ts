import { collapseTypingSpaces } from "@/shared/validators/profileValidators";

/**
 * Single-line text from pasted or typed input: line breaks, tabs and other control
 * characters become spaces (so "Acme\nCorp" stays readable), runs of spaces collapse and a
 * leading space is dropped. Letters of any script and emoji are left untouched.
 */
export const toSingleLine = (text: string): string =>
  collapseTypingSpaces(text.replace(/[\u0000-\u001F\u007F-\u009F]+/g, " "));

export const normalizeIndianMobile = (text: string): string => {
  const value = text.trim();
  if (!value || !/^\+?[\d\s()-]+$/.test(value)) return text;

  const digits = value.replace(/\D/g, "");
  if (
    digits.length === 12 &&
    digits.startsWith("91") &&
    /^\+?91(?:[\s()-]*\d){10}$/.test(value)
  ) {
    return digits.slice(2);
  }
  if (
    digits.length === 11 &&
    digits.startsWith("0") &&
    /^0(?:[\s()-]*\d){10}$/.test(value)
  ) {
    return digits.slice(1);
  }
  if (digits.length === 10 && !value.startsWith("+")) return digits;

  return text;
};
