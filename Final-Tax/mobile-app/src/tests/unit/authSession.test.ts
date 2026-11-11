/// <reference types="node" />
/**
 * Batch 2 regression tests: mobile number entry (BUG-LOGIN-001/002), registration recovery after a
 * restart (BUG-SESSION-001) and stale lockout presentation (BUG-LOGIN-004).
 * Run with: node scripts/run-auth-lockout-tests.cjs src/tests/unit/authSession.test.ts
 */
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  applyMobileInput,
  normalizeIndianMobile,
  BLOCKED_DUMMY_MOBILE_NUMBERS,
  MOBILE_NOT_ALLOWED_MESSAGE,
} from "../../modules/authentication/validation/mobileNumber";
import { validateLoginPhone } from "../../modules/authentication/validation/authSchema";

interface Harness {
  secureStore: Map<string, string>;
  userStore: Map<string, unknown>;
  asyncStore: Map<string, string>;
  logs: string[];
  calls: { sessionCleared: boolean; session: unknown };
  freshLaunch: () => void;
}
const harness = (globalThis as unknown as { __authTest: Harness }).__authTest;

const MOBILE = "9876543210";
const START = Date.UTC(2026, 0, 1, 10, 0, 0);
const PROOF = "proof-token-9f8e7d6c5b4a3f2e1d0c";

// ---- controllable clock ----------------------------------------------------------------------
let now = START;
Date.now = () => now;
const advance = (seconds: number) => {
  now += seconds * 1000;
};

// ---- scripted backend ------------------------------------------------------------------------
const queue: { status: number; body: unknown }[] = [];
const requests: { url: string; body: Record<string, unknown>; headers: Record<string, string> }[] = [];
globalThis.fetch = (async (url: string, init?: { body?: string; headers?: Record<string, string> }) => {
  requests.push({ url, body: init?.body ? JSON.parse(init.body) : {}, headers: init?.headers ?? {} });
  const next = queue.shift();
  if (!next) throw new Error(`Unscripted request to ${url}`);
  const text = typeof next.body === "string" ? next.body : JSON.stringify(next.body);
  return {
    ok: next.status >= 200 && next.status < 300,
    status: next.status,
    statusText: String(next.status),
    headers: { get: () => null },
    text: async () => text,
  };
}) as unknown as typeof fetch;
const reply = (status: number, body: unknown) => void queue.push({ status, body });
const customerExists = (exists: boolean) => reply(200, { exists, mobileNumber: MOBILE });

// ---- app under test --------------------------------------------------------------------------
type Mod<T extends string> = T extends "svc"
  ? typeof import("../../modules/authentication/services/authService")
  : T extends "reg"
    ? typeof import("../../modules/authentication/services/registrationProgressService")
    : T extends "recover"
      ? typeof import("../../modules/authentication/services/launchRegistrationRecovery")
      : T extends "pass"
        ? typeof import("../../modules/authentication/services/passcodeService")
        : typeof import("../../modules/authentication/store/authStore");
let authService: Mod<"svc">["authService"];
let registration: Mod<"reg">["registrationProgressService"];
let isIncompleteRegistration: Mod<"reg">["isIncompleteRegistration"];
let recoverIncompleteRegistration: Mod<"recover">["recoverIncompleteRegistration"];
let passcodeService: Mod<"pass">["passcodeService"];
let useAuthStore: Mod<"store">["useAuthStore"];

async function launchApp() {
  harness.freshLaunch();
  authService = (await import("../../modules/authentication/services/authService")).authService;
  const regModule = await import("../../modules/authentication/services/registrationProgressService");
  registration = regModule.registrationProgressService;
  isIncompleteRegistration = regModule.isIncompleteRegistration;
  recoverIncompleteRegistration = (await import("../../modules/authentication/services/launchRegistrationRecovery"))
    .recoverIncompleteRegistration;
  passcodeService = (await import("../../modules/authentication/services/passcodeService")).passcodeService;
  useAuthStore = (await import("../../modules/authentication/store/authStore")).useAuthStore;
}

beforeEach(async () => {
  now = START;
  queue.length = 0;
  requests.length = 0;
  harness.secureStore.clear();
  harness.userStore.clear();
  harness.calls.sessionCleared = false;
  harness.calls.session = null;
  harness.logs.length = 0;
  await launchApp();
});

const placeholderUser = {
  customerId: "",
  mobileNumber: MOBILE,
  name: "",
  email: `${MOBILE}@finsolz.in`,
  customerType: "Individual",
  registrationCompleted: false,
};
const completedUser = { ...placeholderUser, customerId: "CUST-1", name: "Asha", registrationCompleted: true };

// ===============================================================================================
// BUG-LOGIN-001: pasted +91 numbers
// ===============================================================================================

test("pasting +919876543210 keeps the correct 10-digit number", () => {
  assert.equal(applyMobileInput("", "+919876543210"), "9876543210");
});

test("every supported pasted format normalises to the same 10 digits", () => {
  for (const pasted of [
    "+91 98765 43210",
    "+91-9876543210",
    "+91 (98765) 43210",
    "919876543210",
    "91 98765 43210",
    "0091 9876543210",
    "009198765 43210",
    "09876543210",
    "98765 43210",
    " 9876543210 ",
  ]) {
    assert.equal(applyMobileInput("", pasted), "9876543210", pasted);
    const result = normalizeIndianMobile(pasted);
    assert.deepEqual(result, { ok: true, value: "9876543210" }, pasted);
  }
});

test("a pasted number replaces what was in the field", () => {
  assert.equal(applyMobileInput("987", "+919123456789"), "9123456789");
});

test("typing digits one at a time never reinterprets a prefix", () => {
  let value = "";
  for (const ch of "919876543210") {
    value = applyMobileInput(value, value + ch);
  }
  // 10 digits are accepted; the 11th and 12th key presses are ignored, not folded into a +91 number.
  assert.equal(value, "9198765432");
});

test("an 11th typed digit is ignored rather than accepted", () => {
  assert.equal(applyMobileInput("9876543210", "98765432101"), "9876543210");
});

test("non-digit typing is stripped", () => {
  assert.equal(applyMobileInput("98", "98a"), "98");
});

test("a paste that is not a valid number is kept whole, not cut to 10 digits, and then rejected", () => {
  const kept = applyMobileInput("", "98765432101");
  assert.equal(kept, "98765432101");
  assert.equal(validateLoginPhone(kept).valid, false);
  assert.equal(validateLoginPhone(kept).error, "Please enter a valid 10-digit mobile number");
});

test("malformed and unsupported formats are rejected with a clear message", () => {
  const cases: [string, string][] = [
    ["", "Mobile number is required"],
    ["   ", "Mobile number is required"],
    ["98765", "Please enter a valid 10-digit mobile number"],
    ["987654321012", "Please enter a valid 10-digit mobile number"],
    ["5876543210", "Invalid mobile number format"],
    ["+915876543210", "Invalid mobile number format"],
    ["+449876543210", "Only Indian (+91) mobile numbers are supported"],
    ["+1 9876543210", "Only Indian (+91) mobile numbers are supported"],
    ["98765abcde", "Mobile number can contain only digits (an optional +91 prefix is allowed)"],
    ["9876543210+", "Mobile number can contain only digits (an optional +91 prefix is allowed)"],
    ["+91", "Please enter a valid 10-digit mobile number"],
    ["+9198765432", "Please enter a valid 10-digit mobile number"],
  ];
  for (const [input, error] of cases) {
    const result = validateLoginPhone(input);
    assert.equal(result.valid, false, `"${input}" should be rejected`);
    assert.equal(result.error, error, `"${input}"`);
  }
});

test("validateLoginPhone returns the normalised number for a pasted +91 value", () => {
  assert.deepEqual(validateLoginPhone("+91 98765 43210"), { valid: true, value: "9876543210" });
});

// ===============================================================================================
// BUG-LOGIN-002: dummy numbers
// ===============================================================================================

test("the four reported dummy numbers are rejected, also when pasted with +91", () => {
  for (const dummy of ["9999999999", "8888888888", "7777777777", "6666666666"]) {
    for (const form of [dummy, `+91${dummy}`, `91 ${dummy}`, `0${dummy}`]) {
      const result = validateLoginPhone(form);
      assert.equal(result.valid, false, form);
      assert.equal(result.error, MOBILE_NOT_ALLOWED_MESSAGE, form);
    }
  }
  assert.deepEqual([...BLOCKED_DUMMY_MOBILE_NUMBERS].sort(), ["6666666666", "7777777777", "8888888888", "9999999999"]);
});

test("dummy numbers never reach the OTP endpoint", async () => {
  for (const dummy of ["9999999999", "8888888888", "7777777777", "6666666666", "+919999999999"]) {
    const res = await authService.sendOtp(dummy);
    assert.equal(res.success, false, dummy);
    assert.equal(res.message, MOBILE_NOT_ALLOWED_MESSAGE, dummy);
  }
  assert.equal(requests.length, 0);
});

test("the store refuses a dummy number before generating an OTP", async () => {
  const ok = await useAuthStore.getState().sendOtp("9999999999");

  assert.equal(ok, false);
  assert.equal(useAuthStore.getState().error, MOBILE_NOT_ALLOWED_MESSAGE);
  assert.equal(requests.length, 0);
});

test("legitimate lookalike numbers are not rejected", async () => {
  for (const legit of ["9111111111", "9999999998", "6000000000", "7777777778"]) {
    assert.equal(validateLoginPhone(legit).valid, true, legit);
  }
  reply(200, { exists: false });
  reply(200, "OTP sent successfully");
  assert.equal(await useAuthStore.getState().sendOtp("+91 98765 43210"), true);
  assert.equal(requests[1].body.mobileNumber, MOBILE, "the OTP request carries the clean 10 digits");
});

// ===============================================================================================
// BUG-SESSION-001: resume an interrupted registration
// ===============================================================================================

test("OTP verification of a new number records registration progress that survives a restart", async () => {
  reply(200, {
    success: true,
    isExistingUser: false,
    customerExists: false,
    hasPasscode: false,
    message: "ok",
    registrationProof: PROOF,
    registrationProofExpiresInSeconds: 1800,
  });
  useAuthStore.getState().setMobileNumber(MOBILE);

  const res = await useAuthStore.getState().verifyOtp("123456");
  assert.equal(res.success, true);
  assert.equal(res.requiresPasscode, false);

  await launchApp();
  const progress = await registration.get();
  assert.equal(progress?.mobile, MOBILE);
  assert.equal(progress?.stage, "OTP_VERIFIED");
  assert.equal(progress?.proof, PROOF);
});

test("an OTP verification that returned no proof leaves nothing to resume", async () => {
  reply(200, { success: true, isExistingUser: false, customerExists: false, hasPasscode: false, message: "ok" });
  useAuthStore.getState().setMobileNumber(MOBILE);

  await useAuthStore.getState().verifyOtp("123456");

  assert.equal(await registration.get(), null);
});

test("restart after OTP with an incomplete registration resumes the profile step, not passcode login", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  await launchApp();
  customerExists(false);

  const decision = await recoverIncompleteRegistration(placeholderUser, MOBILE);

  assert.deepEqual(decision, { kind: "RESUME_PROFILE", mobile: MOBILE });
  assert.equal(harness.calls.sessionCleared, true, "the placeholder session must not remain a login");
});

test("the resume decision does not depend on a stored logged-in session", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  await launchApp();
  customerExists(false);

  assert.deepEqual(await recoverIncompleteRegistration(null, null), { kind: "RESUME_PROFILE", mobile: MOBILE });
});

test("a completed registration still follows the normal launch flow", async () => {
  assert.equal(isIncompleteRegistration(completedUser), false);

  const decision = await recoverIncompleteRegistration(completedUser, MOBILE);

  assert.equal(decision, null);
  assert.equal(requests.length, 0, "no network call for a completed customer");
  assert.equal(harness.calls.sessionCleared, false);
});

test("when the customer now exists on the server the user goes to normal passcode login", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  await launchApp();
  customerExists(true);

  const decision = await recoverIncompleteRegistration(placeholderUser, MOBILE);

  assert.deepEqual(decision, { kind: "PASSCODE_LOGIN", mobile: MOBILE });
  assert.equal(await registration.get(), null, "stale progress is dropped once the customer exists");
});

test("expired registration progress is not resumed and is cleared", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  advance(31 * 60);
  await launchApp();
  customerExists(false);

  const decision = await recoverIncompleteRegistration(placeholderUser, MOBILE);

  assert.deepEqual(decision, { kind: "RESTART" });
  assert.equal(await registration.get(), null);
  assert.equal(harness.secureStore.has("finsolz_secure_registration_progress"), false);
});

test("progress just inside the window is still resumed", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  advance(29 * 60);
  await launchApp();
  customerExists(false);

  assert.deepEqual(await recoverIncompleteRegistration(placeholderUser, MOBILE), {
    kind: "RESUME_PROFILE",
    mobile: MOBILE,
  });
});

test("invalid or tampered progress is ignored", async () => {
  const key = "finsolz_secure_registration_progress";
  const bad: string[] = [
    "not json",
    JSON.stringify({ mobile: MOBILE, stage: "PROFILE_DONE", verifiedAt: START }),
    JSON.stringify({ mobile: "123", stage: "OTP_VERIFIED", verifiedAt: START }),
    JSON.stringify({ mobile: MOBILE, stage: "OTP_VERIFIED", verifiedAt: START + 3 * 24 * 3600 * 1000 }),
    JSON.stringify({ mobile: MOBILE, stage: "OTP_VERIFIED" }),
    JSON.stringify({ mobile: MOBILE, stage: "OTP_VERIFIED", verifiedAt: START }),
    JSON.stringify({ mobile: MOBILE, stage: "OTP_VERIFIED", verifiedAt: START, proof: "", proofExpiresAt: START + 1000 }),
    JSON.stringify({ mobile: MOBILE, stage: "OTP_VERIFIED", verifiedAt: START, proof: PROOF, proofExpiresAt: START - 1 }),
  ];
  for (const value of bad) {
    harness.secureStore.set(key, value);
    assert.equal(await registration.get(), null, value);
    assert.equal(harness.secureStore.has(key), false, `cleared: ${value}`);
  }
});

test("hand-written progress with no placeholder session and no record never grants anything", async () => {
  assert.equal(await recoverIncompleteRegistration(null, MOBILE), null);
});

test("a failed customer lookup starts the user over rather than trusting the stored state", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  await launchApp();
  // no scripted response: the request fails like an unreachable server

  const decision = await recoverIncompleteRegistration(placeholderUser, MOBILE);

  assert.deepEqual(decision, { kind: "RESTART" });
  assert.equal(harness.calls.sessionCleared, true);
});

test("a server error on the lookup starts the user over", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  await launchApp();
  reply(500, { message: "boom" });

  assert.deepEqual(await recoverIncompleteRegistration(placeholderUser, MOBILE), { kind: "RESTART" });
});

test("a placeholder session with no progress record is never treated as logged in", async () => {
  customerExists(false);

  const decision = await recoverIncompleteRegistration(placeholderUser, MOBILE);

  assert.deepEqual(decision, { kind: "RESTART" });
  assert.equal(harness.calls.sessionCleared, true);
});

test("a placeholder session whose customer exists on the server falls back to passcode login", async () => {
  customerExists(true);

  assert.deepEqual(await recoverIncompleteRegistration(placeholderUser, MOBILE), {
    kind: "PASSCODE_LOGIN",
    mobile: MOBILE,
  });
});

test("completing registration clears the progress record", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  reply(201, { accessToken: "a", refreshToken: "r", custId: "CUST-1", name: "Asha", mobileNumber: MOBILE });
  useAuthStore.setState({ mobileNumber: MOBILE });

  const res = await useAuthStore.getState().register(
    {
      name: "Asha",
      email: "asha@example.com",
      customerType: "Individual",
      dob: "1990-01-01",
      gender: "Female",
      fatherSpouseName: "X",
      pan: "ABCDE1234F",
      aadhaar: "123456789012",
      address: "1 Street",
      addressLine1: "1 Street",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
    },
    "246810",
    true,
  );

  assert.equal(res.success, true, JSON.stringify(res));
  assert.equal(await registration.get(), null);
});

test("logout clears the progress record", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);

  useAuthStore.getState().logout();
  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.equal(await registration.get(), null);
});

// ===============================================================================================
// BUG-LOGIN-004: stale lockout presentation
// ===============================================================================================

const lockPasscode = async () => {
  reply(429, { message: "locked", code: "PASSCODE_LOCKED", retryAfterSeconds: 900 });
  await passcodeService.verifyPasscode(MOBILE, "111111");
};

test("biometric success clears the error and countdown shown on the login screen", async () => {
  await lockPasscode();
  useAuthStore.setState({
    mobileNumber: MOBILE,
    passcodeLockoutUntil: START + 900_000,
    otpLockoutUntil: START + 900_000,
    error: "Too many incorrect passcode attempts. Try again in 15:00.",
    passcode: "111111",
  });

  useAuthStore.getState().resetLoginPresentation();

  const state = useAuthStore.getState();
  assert.equal(state.passcodeLockoutUntil, null);
  assert.equal(state.otpLockoutUntil, null);
  assert.equal(state.error, null);
  assert.equal(state.passcode, "");
});

test("logout leaves no stale lockout UI for the next login screen", async () => {
  await lockPasscode();
  useAuthStore.setState({
    isLoggedIn: true,
    mobileNumber: MOBILE,
    passcodeLockoutUntil: START + 900_000,
    otpLockoutUntil: START + 900_000,
    error: "Too many incorrect passcode attempts. Try again in 15:00.",
  });

  useAuthStore.getState().logout();

  const state = useAuthStore.getState();
  assert.equal(state.passcodeLockoutUntil, null);
  assert.equal(state.otpLockoutUntil, null);
  assert.equal(state.error, null);
  assert.equal(state.isLoggedIn, false);
});

test("a genuine active lockout survives the reset and is shown again on the next login screen", async () => {
  await lockPasscode();
  useAuthStore.setState({ mobileNumber: MOBILE, passcodeLockoutUntil: START + 900_000 });

  useAuthStore.getState().resetLoginPresentation();
  assert.equal(useAuthStore.getState().passcodeLockoutUntil, null);

  advance(120);
  await useAuthStore.getState().refreshPasscodeLockout();

  assert.equal(useAuthStore.getState().passcodeLockoutUntil, START + 900_000);
  const verify = await passcodeService.verifyPasscode(MOBILE, "246810");
  assert.equal(verify.isLockedOut, true, "the lock is still enforced after the presentation reset");
  assert.equal(requests.length, 1, "and enforced without another server call");
});

test("a lockout that has genuinely expired is not shown again", async () => {
  await lockPasscode();
  useAuthStore.setState({ mobileNumber: MOBILE, passcodeLockoutUntil: START + 900_000 });
  useAuthStore.getState().resetLoginPresentation();

  advance(900);
  await useAuthStore.getState().refreshPasscodeLockout();

  assert.equal(useAuthStore.getState().passcodeLockoutUntil, null);
});

test("after biometric login and logout a still-active lockout is re-read from the stored state", async () => {
  await lockPasscode();
  useAuthStore.setState({ mobileNumber: MOBILE, passcodeLockoutUntil: START + 900_000, isLoggedIn: true });

  useAuthStore.getState().resetLoginPresentation(); // fingerprint success
  useAuthStore.getState().logout();
  assert.equal(useAuthStore.getState().passcodeLockoutUntil, null);

  advance(300);
  useAuthStore.setState({ mobileNumber: MOBILE }); // user enters the number again
  await useAuthStore.getState().refreshPasscodeLockout();

  assert.equal(useAuthStore.getState().passcodeLockoutUntil, START + 900_000);
});

// ===============================================================================================
// Batch 2.1: the server-issued registration proof
// ===============================================================================================

const profile = {
  name: "Asha",
  email: "asha@example.com",
  customerType: "Individual",
  dob: "1990-01-01",
  gender: "Female",
  fatherSpouseName: "X",
  pan: "ABCDE1234F",
  aadhaar: "123456789012",
  address: "1 Street",
  addressLine1: "1 Street",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411001",
};

const registerNow = () => {
  useAuthStore.setState({ mobileNumber: MOBILE });
  return useAuthStore.getState().register(profile, "246810", true);
};

const proofRefusal = (code: string) => reply(403, { status: 403, error: "Forbidden", message: "refused", code });

test("registration sends the stored proof in the X-Registration-Proof header", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  reply(201, { accessToken: "a", refreshToken: "r", custId: "CUST-1", name: "Asha", mobileNumber: MOBILE });

  const res = await registerNow();

  assert.equal(res.success, true);
  const registerCall = requests.find((r) => r.url.endsWith("/customer/register"));
  assert.equal(registerCall?.headers["X-Registration-Proof"], PROOF);
  assert.equal(JSON.stringify(registerCall?.body).includes(PROOF), false, "the proof is a header, not part of the body");
});

test("without a stored proof no header is sent and the server's refusal sends the user back to OTP", async () => {
  proofRefusal("REGISTRATION_PROOF_REQUIRED");

  const res = await registerNow();

  const registerCall = requests.find((r) => r.url.endsWith("/customer/register"));
  assert.equal(registerCall?.headers["X-Registration-Proof"], undefined);
  assert.equal(res.success, false);
  assert.equal(res.requiresReverification, true);
  assert.equal(useAuthStore.getState().authFlowState, "ENTER_MOBILE");
});

test("every refused-proof code clears the stale record and asks for a new verification", async () => {
  for (const code of [
    "REGISTRATION_PROOF_INVALID",
    "REGISTRATION_PROOF_EXPIRED",
    "REGISTRATION_PROOF_ALREADY_USED",
    "REGISTRATION_PROOF_MOBILE_MISMATCH",
  ]) {
    await registration.markOtpVerified(MOBILE, PROOF, 1800);
    proofRefusal(code);

    const res = await registerNow();

    assert.equal(res.success, false, code);
    assert.equal(res.requiresReverification, true, code);
    assert.equal(res.error, "Your mobile number verification has expired. Please verify your number again.", code);
    assert.equal(await registration.get(), null, `${code} must clear the stored proof`);
  }
});

test("an unrelated registration failure keeps the proof so the user can correct the form and retry", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 1800);
  reply(409, { message: "Email already registered", field: "email" });

  const res = await registerNow();

  assert.equal(res.success, false);
  assert.equal(res.requiresReverification, undefined);
  assert.equal((await registration.get())?.proof, PROOF);
});

test("the proof is only kept in secure storage, never in async storage or the user record", async () => {
  reply(200, {
    success: true,
    isExistingUser: false,
    customerExists: false,
    hasPasscode: false,
    registrationProof: PROOF,
    registrationProofExpiresInSeconds: 1800,
  });
  useAuthStore.getState().setMobileNumber(MOBILE);
  await useAuthStore.getState().verifyOtp("123456");

  assert.equal([...harness.asyncStore.values()].some((v) => v.includes(PROOF)), false);
  assert.equal(JSON.stringify([...harness.userStore.values()]).includes(PROOF), false);
  assert.equal([...harness.secureStore.values()].some((v) => v.includes(PROOF)), true);
});

test("the proof never appears in logs", async () => {
  reply(200, {
    success: true,
    isExistingUser: false,
    customerExists: false,
    hasPasscode: false,
    registrationProof: PROOF,
    registrationProofExpiresInSeconds: 1800,
  });
  useAuthStore.getState().setMobileNumber(MOBILE);
  await useAuthStore.getState().verifyOtp("123456");
  reply(201, { accessToken: "a", refreshToken: "r", custId: "CUST-1", name: "Asha", mobileNumber: MOBILE });
  await registerNow();

  assert.equal(harness.logs.some((line) => line.includes(PROOF)), false);
});

test("a returning customer's OTP verification stores no proof", async () => {
  reply(200, { success: true, isExistingUser: true, customerExists: true, hasPasscode: true, message: "ok" });
  useAuthStore.getState().setMobileNumber(MOBILE);

  const res = await useAuthStore.getState().verifyOtp("123456");

  assert.equal(res.requiresPasscode, true);
  assert.equal(await registration.get(), null);
});

test("a stored proof is not resumed once the server's lifetime for it has passed", async () => {
  await registration.markOtpVerified(MOBILE, PROOF, 60); // server said: valid for 60 seconds
  advance(90);
  await launchApp();
  customerExists(false);

  assert.deepEqual(await recoverIncompleteRegistration(placeholderUser, MOBILE), { kind: "RESTART" });
});
