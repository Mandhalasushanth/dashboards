import { getErrorField } from "@/core/error-handling/errorMessage";

export interface PinCodeDetails {
  city: string;
  district: string;
  state: string;
}

export type PinCodeErrorType = "INVALID_FORMAT" | "NOT_FOUND" | "NETWORK_ERROR";

export class PinCodeLookupError extends Error {
  constructor(public errorType: PinCodeErrorType, message: string) {
    super(message);
    this.name = "PinCodeLookupError";
  }
}

const PIN_CODE_REGEX = /^[1-9][0-9]{5}$/;

export const pinCodeService = {
  isValidFormat: (pinCode: string): boolean => PIN_CODE_REGEX.test((pinCode || "").trim()),

  lookup: async (pinCode: string): Promise<PinCodeDetails> => {
    const clean = (pinCode || "").trim();
    if (!pinCodeService.isValidFormat(clean)) {
      throw new PinCodeLookupError("INVALID_FORMAT", "Enter a valid 6-digit PIN code");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new PinCodeLookupError("NETWORK_ERROR", "Unable to look up this PIN code");
      }

      const payload = await response.json();
      const result = payload?.[0];
      const postOffice = result?.PostOffice?.[0];
      if (result?.Status !== "Success" || !postOffice) {
        throw new PinCodeLookupError("NOT_FOUND", "PIN code not found");
      }

      return {
        city: postOffice.Block || postOffice.Taluk || postOffice.District || "",
        district: postOffice.District || "",
        state: postOffice.State || "",
      };
    } catch (error) {
      if (error instanceof PinCodeLookupError) throw error;
      throw new PinCodeLookupError(
        "NETWORK_ERROR",
        getErrorField(error, "name") === "AbortError"
          ? "PIN lookup timed out. Please enter the address manually."
          : "Unable to look up this PIN code. Please enter the address manually.",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

export default pinCodeService;
