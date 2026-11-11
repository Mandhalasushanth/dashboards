/**
 * Payment instrument validators (UPI, card, net banking).
 * Service-agnostic: used by Payments checkout and by GST payment flows.
 */

export interface CardValidationInput {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface NetBankingValidationInput {
  selectedBank: string;
  customerId: string;
}

/**
 * Validates standard string length (minimum non-empty length)
 */
export const isNotEmpty = (str: string, minLength: number = 2): boolean => {
  return str.trim().length >= minLength;
};

export const PaymentValidators = {
  /**
   * Validates UPI ID format (e.g. username@bank / pavan@ybl)
   */
  isValidUpi: (upi: string): boolean => {
    const cleanUpi = upi.trim();
    const upiRegex = /^[\w.\-_]{2,}@[\w\-]{2,}$/;
    return upiRegex.test(cleanUpi);
  },

  /**
   * Validates Debit / Credit Card number (16 digits)
   */
  isValidCardNumber: (cardNumber: string): boolean => {
    const cleanNum = cardNumber.replace(/[\s-]/g, "");
    return /^\d{16}$/.test(cleanNum);
  },

  /**
   * Validates Card Expiry Date (MM/YY)
   */
  isValidExpiry: (expiry: string): boolean => {
    const cleanExp = expiry.trim();
    return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cleanExp);
  },

  /**
   * Validates Card CVV (3 or 4 digits)
   */
  isValidCvv: (cvv: string): boolean => {
    const cleanCvv = cvv.trim();
    return /^\d{3,4}$/.test(cleanCvv);
  },

  /**
   * Validates full card form
   */
  validateCard: (data: CardValidationInput): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!PaymentValidators.isValidCardNumber(data.cardNumber)) errs.cardNumber = "Enter a valid 16-digit card number";
    if (!isNotEmpty(data.cardHolder, 2)) errs.cardHolder = "Cardholder name is required";
    if (!PaymentValidators.isValidExpiry(data.expiry)) errs.expiry = "Enter a valid expiry (MM/YY)";
    if (!PaymentValidators.isValidCvv(data.cvv)) errs.cvv = "Enter a valid CVV";
    return errs;
  },

  /**
   * Validates net banking form
   */
  validateNetBanking: (data: NetBankingValidationInput): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!isNotEmpty(data.selectedBank, 2)) errs.selectedBank = "Please select your bank";
    if (!isNotEmpty(data.customerId, 4)) errs.customerId = "Customer / User ID is required";
    return errs;
  },
};
