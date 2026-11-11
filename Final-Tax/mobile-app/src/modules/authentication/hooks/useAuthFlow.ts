import { useAuthStore } from "../store/authStore";

export function useAuthFlow() {
  const store = useAuthStore();

  return {
    state: store.authFlowState,
    mobileNumber: store.mobileNumber,
    otp: store.otp,
    passcode: store.passcode,
    confirmPasscode: store.confirmPasscode,
    isLoading: store.isLoading,
    error: store.error,
    otpTimer: store.otpTimer,
    canResendOTP: store.canResendOTP,
    isExistingUser: store.isExistingUser,
    isLoggedIn: store.isLoggedIn,
    authenticatedUser: store.authenticatedUser,
    actions: {
      setMobileNumber: store.setMobileNumber,
      setOtp: store.setOtp,
      setPasscode: store.setPasscode,
      setConfirmPasscode: store.setConfirmPasscode,
      setError: store.setError,
      sendOtp: store.sendOtp,
      verifyOtp: store.verifyOtp,
      loginWithPasscode: store.loginWithPasscode,
      startForgotPasscode: store.startForgotPasscode,
      verifyForgotPasscodeOtp: store.verifyForgotPasscodeOtp,
      resetPasscodeAndProceed: store.resetPasscodeAndProceed,
      resendOtp: store.resendOtp,
      changeNumber: store.changeNumber,
      resetFlow: store.resetFlow,
      logout: store.logout,
    },
  };
}

export default useAuthFlow;
