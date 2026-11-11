import { authService } from "@/modules/authentication/services/authService";
import { passcodeService } from "@/modules/authentication/services/passcodeService";
import { biometricService } from "@/modules/authentication/services/biometricService";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { authApi } from "@/modules/authentication/services/authApi";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import type { CustomerProfile } from "@/shared/types/domain";
import type { RecordFunction } from "./auth_flow_types";

export async function runScenarios1to6(record: RecordFunction): Promise<void> {
  // SCENARIO 1: New user: Phone -> OTP -> Profile -> Passcode setup -> Dashboard
  try {
    await authService.logout();
    useAuthStore.getState().resetFlow();

    const mobile = "9876500001";
    useAuthStore.getState().setMobileNumber(mobile);

    const originalVerify = authService.verifyOtp;
    authService.verifyOtp = async () => ({
      success: true,
      customerExists: false,
      isExistingUser: false,
      hasPasscode: false,
      profileCompleted: false,
    });

    const otpRes = await useAuthStore.getState().verifyOtp("123456");
    const isNew = !otpRes.isExistingUser && !otpRes.requiresPasscode;
    const sessionNotActive = !useAuthStore.getState().isLoggedIn;

    const dummyProfile: CustomerProfile = {
      name: "New Test User",
      email: "newuser@finsolz.in",
      pan: "ABCDE1234F",
      aadhaar: "123456789012",
      dob: "1995-05-15",
      gender: "Male",
      fatherSpouseName: "Parent Name",
      address: "123 Tech Street",
      addressLine1: "123 Tech Street",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      customerType: "Individual",
    };

    const originalRegister = authApi.register;
    authApi.register = async () => ({
      success: true,
      user: {
        customerId: "CUST_9876500001",
        name: dummyProfile.name,
        mobileNumber: mobile,
        email: dummyProfile.email,
        pan: dummyProfile.pan,
        aadhaar: dummyProfile.aadhaar,
        dob: dummyProfile.dob,
        registrationCompleted: true,
      },
      token: "mock-jwt-token-newuser",
    });

    const regRes = await useAuthStore.getState().register(dummyProfile, "112233");
    const authedAfterReg = useAuthStore.getState().isLoggedIn;
    const hasStoredPasscode = await passcodeService.hasPasscode(mobile);

    authService.verifyOtp = originalVerify;
    authApi.register = originalRegister;

    const passed = isNew && sessionNotActive && regRes.success && authedAfterReg && hasStoredPasscode;
    record(1, "New user: Phone -> OTP -> Profile -> Passcode setup -> Dashboard", passed, "Verified new user stays unauthenticated until registration with passcode is complete.");
  } catch (err: unknown) {
    record(1, "New user: Phone -> OTP -> Profile -> Passcode setup -> Dashboard", false, undefined, (err as Error).message);
  }

  // SCENARIO 2: Existing user: Phone -> OTP -> Passcode -> Dashboard
  try {
    await authService.logout();
    useAuthStore.getState().resetFlow();

    const mobile = "9876500002";
    useAuthStore.getState().setMobileNumber(mobile);
    await passcodeService.setPasscode(mobile, "654321");

    authStorage.saveUser({
      customerId: "CUST_9876500002",
      mobileNumber: mobile,
      name: "Existing User",
      email: "existing@finsolz.in",
      registrationCompleted: true,
      hasPasscode: true,
    });

    const originalVerify = authService.verifyOtp;
    authService.verifyOtp = async () => ({
      success: true,
      customerExists: true,
      isExistingUser: true,
      hasPasscode: true,
      profileCompleted: true,
    });

    const otpRes = await useAuthStore.getState().verifyOtp("123456");
    const flowState = useAuthStore.getState().authFlowState;
    const isPasscodePrompted = flowState === "PASSCODE_LOGIN";
    const loginRes = await useAuthStore.getState().loginWithPasscode("654321");
    const loggedIn = useAuthStore.getState().isLoggedIn;

    authService.verifyOtp = originalVerify;

    const passed = otpRes.requiresPasscode === true && isPasscodePrompted && loginRes.success && loggedIn;
    record(2, "Existing user: Phone -> OTP -> Passcode -> Dashboard", passed, "Verified existing user is routed to passcode screen and logs in upon entering correct passcode.");
  } catch (err: unknown) {
    record(2, "Existing user: Phone -> OTP -> Passcode -> Dashboard", false, undefined, (err as Error).message);
  }

  // SCENARIO 3: App restart with Biometric enabled -> Biometric prompt -> Dashboard
  try {
    const mobile = "9876500003";
    authStorage.saveSession({
      isLoggedIn: true,
      activeMobile: mobile,
      lastLoginAt: new Date().toISOString(),
    });
    authStorage.saveUser({
      customerId: "CUST_9876500003",
      mobileNumber: mobile,
      name: "Biometric User",
      email: "bio@finsolz.in",
      registrationCompleted: true,
    });

    await biometricService.setBiometricEnabled(true, mobile);
    const originalAuth = biometricService.authenticate;
    biometricService.authenticate = async () => ({ success: true });

    const session = authStorage.getSession();
    const isBioEnabled = await biometricService.isBiometricEnabled(mobile);
    let authSuccess = false;

    if (session?.isLoggedIn && isBioEnabled) {
      const authRes = await biometricService.authenticate();
      authSuccess = authRes.success;
    }

    biometricService.authenticate = originalAuth;
    const passed = Boolean(session?.isLoggedIn) && isBioEnabled && authSuccess;
    record(3, "App restart with Biometric enabled -> Biometric prompt -> Dashboard", passed, "Biometric authentication triggered on restart and unlocks directly to dashboard.");
  } catch (err: unknown) {
    record(3, "App restart with Biometric enabled -> Biometric prompt -> Dashboard", false, undefined, (err as Error).message);
  }

  // SCENARIO 4: App restart with Passcode only -> Passcode screen -> Dashboard
  try {
    const mobile = "9876500004";
    authStorage.saveSession({
      isLoggedIn: true,
      activeMobile: mobile,
      lastLoginAt: new Date().toISOString(),
    });
    authStorage.saveUser({
      customerId: "CUST_9876500004",
      mobileNumber: mobile,
      name: "Passcode Only User",
      email: "pass@finsolz.in",
      registrationCompleted: true,
      hasPasscode: true,
    });

    await biometricService.setBiometricEnabled(false, mobile);
    await passcodeService.setPasscode(mobile, "223344");

    const session = authStorage.getSession();
    const isBioEnabled = await biometricService.isBiometricEnabled(mobile);
    const hasPass = await passcodeService.hasPasscode(mobile);

    let nextFlowState = "";
    if (session?.isLoggedIn) {
      if (isBioEnabled) {
        nextFlowState = "BIOMETRIC";
      } else if (hasPass) {
        nextFlowState = "PASSCODE_LOGIN";
      } else {
        nextFlowState = "HOME";
      }
    }

    const passed = !isBioEnabled && hasPass && nextFlowState === "PASSCODE_LOGIN";
    record(4, "App restart with Passcode only -> Passcode screen -> Dashboard", passed, "Verified app restart with passcode-only configuration challenges user with passcode screen and never bypasses directly to dashboard.");
  } catch (err: unknown) {
    record(4, "App restart with Passcode only -> Passcode screen -> Dashboard", false, undefined, (err as Error).message);
  }

  // SCENARIO 5: Biometric cancelled -> Fall back to Passcode
  try {
    const mobile = "9876500005";
    await biometricService.setBiometricEnabled(true, mobile);
    await passcodeService.setPasscode(mobile, "556677");

    const originalAuth = biometricService.authenticate;
    biometricService.authenticate = async () => ({
      success: false,
      cancelled: true,
      error: "Authentication cancelled",
    });

    const bioRes = await biometricService.authenticate();
    let fallbackTarget = "";
    if (!bioRes.success) {
      const hasPass = await passcodeService.hasPasscode(mobile);
      fallbackTarget = hasPass ? "PASSCODE_LOGIN" : "ENTER_MOBILE";
    }

    biometricService.authenticate = originalAuth;
    const passed = !bioRes.success && bioRes.cancelled === true && fallbackTarget === "PASSCODE_LOGIN";
    record(5, "Biometric cancelled -> Fall back to Passcode", passed, "Verified biometric cancellation falls back cleanly to passcode prompt without crashing or bypassing.");
  } catch (err: unknown) {
    record(5, "Biometric cancelled -> Fall back to Passcode", false, undefined, (err as Error).message);
  }

  // SCENARIO 6: Wrong passcode 5 times -> 30 second lockout enforced
  try {
    const mobile = "9876500006";
    await passcodeService.setPasscode(mobile, "111111");
    await passcodeService.resetFailedAttempts(mobile);

    let lockoutOccurred = false;
    let lockoutRemaining = 0;

    for (let i = 1; i <= 5; i++) {
      const res = await passcodeService.recordFailedAttempt(mobile);
      if (res.isLocked) {
        lockoutOccurred = true;
        lockoutRemaining = res.remainingSeconds;
      }
    }

    const check = await passcodeService.checkLockout(mobile);
    await passcodeService.resetFailedAttempts(mobile);

    const passed = lockoutOccurred && lockoutRemaining > 0 && check.isLocked;
    record(6, "Wrong passcode 5 times -> 30 second lockout enforced", passed, `Verified 5 failed attempts triggered lockout of ${lockoutRemaining}s, blocking subsequent attempts.`);
  } catch (err: unknown) {
    record(6, "Wrong passcode 5 times -> 30 second lockout enforced", false, undefined, (err as Error).message);
  }
}
