import { getErrorMessage, getErrorField } from "@/core/error-handling/errorMessage";

/**
 * IFSC Lookup Service
 * Uses the official open RBI IFSC dataset endpoint (Razorpay IFSC directory)
 * to verify IFSC codes and fetch bank and branch information.
 */

export interface IfscDetails {
  bank: string;
  branch: string;
  city?: string;
  district?: string;
  state?: string;
  address?: string;
  ifsc: string;
}

export type IfscErrorType = "INVALID_FORMAT" | "NOT_FOUND" | "NETWORK_ERROR";

export class IfscLookupError extends Error {
  constructor(public errorType: IfscErrorType, message: string) {
    super(message);
    this.name = "IfscLookupError";
  }
}

// 4 letters (Bank code) + 0 + 6 alphanumeric characters (Branch code)
export const IFSC_FORMAT_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const ifscService = {
  isValidFormat: (ifsc: string): boolean => {
    const clean = (ifsc || "").trim().toUpperCase();
    return clean.length === 11 && IFSC_FORMAT_REGEX.test(clean);
  },

  lookup: async (ifsc: string): Promise<IfscDetails> => {
    const clean = (ifsc || "").trim().toUpperCase();

    if (!ifscService.isValidFormat(clean)) {
      throw new IfscLookupError("INVALID_FORMAT", "Enter a valid IFSC code");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`https://ifsc.razorpay.com/${clean}`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        throw new IfscLookupError("NOT_FOUND", "IFSC code not found");
      }

      if (!response.ok) {
        throw new IfscLookupError("NETWORK_ERROR", "Unable to verify IFSC. Please try again.");
      }

      const data = await response.json();

      if (!data || !data.BANK) {
        throw new IfscLookupError("NOT_FOUND", "IFSC code not found");
      }

      return {
        bank: data.BANK || "Bank",
        branch: data.BRANCH || "Main Branch",
        city: data.CITY || "",
        district: data.DISTRICT || "",
        state: data.STATE || "",
        address: data.ADDRESS || "",
        ifsc: clean,
      };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof IfscLookupError) {
        throw err;
      }

      const message = getErrorMessage(err);
      if (getErrorField(err, "name") === "AbortError" || message?.toLowerCase().includes("network") || message?.toLowerCase().includes("failed")) {
        throw new IfscLookupError("NETWORK_ERROR", "Unable to verify IFSC. Please try again.");
      }

      throw new IfscLookupError("NETWORK_ERROR", "Unable to verify IFSC. Please try again.");
    }
  },
};

export default ifscService;
