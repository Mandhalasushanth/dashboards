import React from "react";
import { useAuthStore } from "../../store/authStore";
import { MobileNumberSection } from "../MobileNumberSection";
import { OTPSection } from "../OTPSection";
import { PasscodeLoginSection } from "../PasscodeLoginSection";
import { ResetPasscodeSection } from "../ResetPasscodeSection";

interface AuthFlowSectionsProps {
  biometricTypeLabel: string;
  onMobileSubmit: () => void;
  onOtpVerify: (code?: string) => void;
  onPasscodeLogin: () => void;
  onForgotPasscode: () => void;
  onBiometricLogin: () => void;
  onForgotPasscodeOtpVerify: (code?: string) => void;
  onResetPasscodeSubmit: () => void;
}

/**
 * Form sections for the standard auth states
 * (ENTER_MOBILE / OTP_VERIFICATION / PASSCODE_LOGIN / FORGOT_PASSCODE_OTP / RESET_PASSCODE).
 * Field values come from the auth store; flow actions come from the screen.
 */
export function AuthFlowSections({
  biometricTypeLabel,
  onMobileSubmit,
  onOtpVerify,
  onPasscodeLogin,
  onForgotPasscode,
  onBiometricLogin,
  onForgotPasscodeOtpVerify,
  onResetPasscodeSubmit,
}: AuthFlowSectionsProps) {
  const {
    authFlowState,
    mobileNumber,
    otp,
    passcode,
    confirmPasscode,
    isLoading,
    error,
    otpTimer,
    canResendOTP,
    otpLockoutUntil,
    passcodeLockoutUntil,
    setMobileNumber,
    setOtp,
    setPasscode,
    setConfirmPasscode,
    resendOtp,
    changeNumber,
    setAuthFlowState,
    isBiometricEnabled,
  } = useAuthStore();

  const isMobileReadOnly = authFlowState !== "ENTER_MOBILE";

  return (
    <>
      {/* 1. ENTER_MOBILE or OTP_VERIFICATION */}
      {(authFlowState === "ENTER_MOBILE" || authFlowState === "OTP_VERIFICATION") && (
        <>
          <MobileNumberSection
            mobile={mobileNumber}
            onChangeMobile={setMobileNumber}
            onSubmit={onMobileSubmit}
            isReadOnly={isMobileReadOnly}
            onChangeNumber={changeNumber}
            loading={isLoading && authFlowState === "ENTER_MOBILE"}
            showContinueButton={authFlowState === "ENTER_MOBILE"}
          />

          {authFlowState === "OTP_VERIFICATION" && (
            <OTPSection
              otp={otp}
              onChangeOtp={setOtp}
              onVerify={onOtpVerify}
              onResend={resendOtp}
              timer={otpTimer}
              canResend={canResendOTP}
              loading={isLoading}
              verifyButtonTitle="Verify OTP"
              lockoutUntil={otpLockoutUntil}
            />
          )}
        </>
      )}

      {/* 2. PASSCODE_LOGIN (Existing User — reached via OTP verify) */}
      {authFlowState === "PASSCODE_LOGIN" && (
        <>
          <MobileNumberSection
            mobile={mobileNumber}
            onChangeMobile={setMobileNumber}
            onSubmit={() => { }}
            isReadOnly={true}
            onChangeNumber={changeNumber}
            loading={false}
            showContinueButton={false}
          />

          <PasscodeLoginSection
            passcode={passcode}
            onChangePasscode={setPasscode}
            onLogin={onPasscodeLogin}
            onForgotPasscode={onForgotPasscode}
            loading={isLoading}
            onBiometricLogin={onBiometricLogin}
            isBiometricEnabled={isBiometricEnabled}
            biometricTypeLabel={biometricTypeLabel}
            autoFocus={true}
            lockoutUntil={passcodeLockoutUntil}
          />
        </>
      )}

      {/* 3. FORGOT_PASSCODE_OTP */}
      {authFlowState === "FORGOT_PASSCODE_OTP" && (
        <>
          <MobileNumberSection
            mobile={mobileNumber}
            onChangeMobile={setMobileNumber}
            onSubmit={() => { }}
            isReadOnly={true}
            onChangeNumber={() => setAuthFlowState("PASSCODE_LOGIN")}
            loading={false}
            showContinueButton={false}
          />

          <OTPSection
            otp={otp}
            onChangeOtp={setOtp}
            onVerify={onForgotPasscodeOtpVerify}
            onResend={resendOtp}
            timer={otpTimer}
            canResend={canResendOTP}
            loading={isLoading}
            verifyButtonTitle="Verify Reset Code"
            lockoutUntil={otpLockoutUntil}
          />
        </>
      )}

      {/* 4. RESET_PASSCODE */}
      {authFlowState === "RESET_PASSCODE" && (
        <ResetPasscodeSection
          passcode={passcode}
          confirmPasscode={confirmPasscode}
          onChangePasscode={setPasscode}
          onChangeConfirmPasscode={setConfirmPasscode}
          onSubmit={onResetPasscodeSubmit}
          loading={isLoading}
          error={error}
          mobileNumber={mobileNumber}
        />
      )}
    </>
  );
}

export default AuthFlowSections;
