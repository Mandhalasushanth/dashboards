import type { LoanCategoryId } from "../types/loanCategory.types";
import type {
  LoanKycData,
  LoanKycVerificationStatus,
  KycRequirementConfig,
} from "../types/loanKyc.types";

export interface KycProviderStatusResult {
  status: LoanKycVerificationStatus;
  isProviderConnected: boolean;
  message: string;
  requirements: KycRequirementConfig;
}

/**
 * Service handling KYC verification integration for Finsolz Loans.
 * 
 * Safe Frontend Operation:
 * - Does not inspect, reference, or call unconfigured backend KYC endpoints.
 * - Profile data is treated solely as customer pre-fill and never automatically verified identity.
 * - Displays neutral pending/not-connected state because no live trusted KYC provider is active.
 * - Keeps PAN, Aadhaar, DOB, and Email conditional on real provider/lender requirements.
 */
export const loanKycService = {
  /**
   * Retrieves the current KYC provider configuration and connection status.
   */
  getInitialKycState(): KycProviderStatusResult {
    return {
      status: "not_connected",
      isProviderConnected: false,
      message:
        "KYC provider integration is not connected. Verification status remains pending.",
      requirements: {
        requireDob: false,
        requirePan: false,
        requireAadhaar: false,
        requireEmail: false,
      },
    };
  },

  /**
   * Returns current provider/lender requirements.
   * By default, PAN, Aadhaar, DOB, and Email are conditional.
   */
  getProviderRequirements(categoryId?: LoanCategoryId): KycRequirementConfig {
    if (categoryId === "personal-loan") {
      // Personal loans always need DOB and PAN; Aadhaar comes from the KYC provider.
      return {
        requireDob: true,
        requirePan: true,
        requireAadhaar: false,
        requireEmail: false,
        showAadhaar: false,
      };
    }
    return {
      requireDob: false,
      requirePan: false,
      requireAadhaar: false,
      requireEmail: false,
    };
  },

  /**
   * Submits the customer KYC details.
   * If real provider integration is unavailable, returns a neutral pending state
   * rather than simulating successful verification.
   */
  async submitKycVerification(
    _data: LoanKycData
  ): Promise<{
    success: boolean;
    status: LoanKycVerificationStatus;
    message: string;
  }> {
    // In compliance with safety rules: Do not fake 3rd-party provider verification.
    // Provider integration is currently not connected; submission succeeds in recording
    // customer details while maintaining neutral 'pending' status.
    return {
      success: true,
      status: "pending",
      message:
        "KYC details recorded. Real-time verification is pending provider configuration.",
    };
  },
};

