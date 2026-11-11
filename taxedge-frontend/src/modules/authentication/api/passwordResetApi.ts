/**
 * Admin password reset: email a six-digit code, check it, then save the new password.
 *
 * UI only for now. The backend has no reset endpoints yet, so each step succeeds after a
 * short delay so the screens can be walked through. When the endpoints exist, replace each
 * body with an apiClient.post call; the screens already show any error these throw.
 */
const RESPONSE_DELAY_MS = 600;

const respond = () => new Promise<void>((resolve) => setTimeout(resolve, RESPONSE_DELAY_MS));

export const passwordResetApi = Object.freeze({
  /** Sends a six-digit verification code to the email. */
  sendCode: async (_email: string): Promise<void> => respond(),
  /** Checks the code the user typed. */
  verifyCode: async (_email: string, _code: string): Promise<void> => respond(),
  /** Saves the new password once the code has been checked. */
  resetPassword: async (_email: string, _code: string, _newPassword: string): Promise<void> => respond()
});
