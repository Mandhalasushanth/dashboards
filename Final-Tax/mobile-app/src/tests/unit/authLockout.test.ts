/**
 * Auth lockout / rate-limit regression tests (BUG-OTP-001, BUG-OTP-003, BUG-LOGIN-003).
 * Run with: node scripts/run-auth-lockout-tests.cjs
 *
 * The real authService -> authApi -> apiClient and passcodeService -> secureStorage stacks run
 * against a scripted fetch that returns the same JSON and headers the backend sends.
 */
/// <reference types="node" />
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import { formatCountdown, lockoutMessage, secondsUntil } from "../../modules/authentication/services/lockoutPolicy";

type AuthServiceModule = typeof import("../../modules/authentication/services/authService");
type PasscodeServiceModule = typeof import("../../modules/authentication/services/passcodeService");

interface Harness {
  secureStore: Map<string, string>;
  freshLaunch: () => void;
}
const harness = (globalThis as unknown as { __authTest: Harness }).__authTest;

const MOBILE = "9876543210";
const START = Date.UTC(2026, 0, 1, 10, 0, 0);

// ---- controllable clock ----------------------------------------------------------------------
const realNow = Date.now;
let now = START;
Date.now = () => now;
const advance = (seconds: number) => {
  now += seconds * 1000;
};

// ---- scripted backend ------------------------------------------------------------------------
interface ScriptedResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}
import { isPublicEndpoint } from "../../core/api/apiClient";

const queue: ScriptedResponse[] = [];
const requests: { url: string; body: Record<string, unknown>; headers?: Record<string, string> }[] = [];

globalThis.fetch = (async (url: string, init?: { body?: string; headers?: Record<string, string> }) => {
  requests.push({ url, body: init?.body ? JSON.parse(init.body) : {}, headers: init?.headers });
  const next = queue.shift();
  if (!next) throw new Error(`Unscripted request to ${url}`);
  const text = typeof next.body === "string" ? next.body : JSON.stringify(next.body);
  const headers = next.headers ?? {};
  return {
    ok: next.status >= 200 && next.status < 300,
    status: next.status,
    statusText: String(next.status),
    headers: { get: (name: string) => headers[name] ?? null },
    text: async () => text,
  };
}) as unknown as typeof fetch;

const reply = (status: number, body: unknown, headers?: Record<string, string>) => {
  queue.push({ status, body, headers });
};

// Responses exactly as the backend produces them.
const otpLocked = (retry = 900) =>
  reply(
    429,
    {
      success: false,
      code: "OTP_LOCKED",
      message: `Too many incorrect OTP attempts. Please try again in ${Math.ceil(retry / 60)} minutes.`,
      retryAfterSeconds: retry,
      remainingAttempts: 0,
    },
    { "Retry-After": String(retry) },
  );
const otpWrong = (remaining: number) =>
  reply(400, {
    success: false,
    code: "OTP_INVALID",
    message: `Invalid OTP. ${remaining} attempts remaining.`,
    remainingAttempts: remaining,
  });
const otpVerified = () =>
  reply(200, {
    success: true,
    isExistingUser: true,
    customerExists: true,
    hasPasscode: true,
    message: "OTP verified successfully",
  });
const resendLimited = (retry: number) =>
  reply(
    429,
    {
      success: false,
      code: "OTP_RESEND_LIMITED",
      message: `Too many OTP requests. Please try again in ${retry} seconds.`,
      retryAfterSeconds: retry,
    },
    { "Retry-After": String(retry) },
  );
const passcodeWrong = (remaining: number) =>
  reply(401, {
    status: 401,
    error: "Unauthorized",
    message: "Invalid credentials",
    code: "INVALID_CREDENTIALS",
    remainingAttempts: remaining,
  });
const passcodeLocked = (retry = 900) =>
  reply(
    429,
    {
      status: 429,
      message: "Too many incorrect passcode attempts. Please try again in 15 minutes.",
      code: "PASSCODE_LOCKED",
      retryAfterSeconds: retry,
      remainingAttempts: 0,
    },
    { "Retry-After": String(retry) },
  );
const loginOk = () =>
  reply(200, {
    accessToken: "access",
    refreshToken: "refresh",
    custId: "CUST-1",
    name: "Asha",
    mobileNumber: MOBILE,
  });

// ---- app under test --------------------------------------------------------------------------
let authService: AuthServiceModule["authService"];
let passcodeService: PasscodeServiceModule["passcodeService"];
let apiClient: typeof import("../../core/api/apiClient").apiClient;
let tokenManager: typeof import("../../core/authentication/tokenManager").tokenManager;

/** Simulates killing and relaunching the app: all modules are re-evaluated, device storage stays. */
async function launchApp() {
  harness.freshLaunch();
  authService = (await import("../../modules/authentication/services/authService")).authService;
  passcodeService = (await import("../../modules/authentication/services/passcodeService")).passcodeService;
  apiClient = (await import("../../core/api/apiClient")).apiClient;
  tokenManager = (await import("../../core/authentication/tokenManager")).tokenManager;
}

beforeEach(async () => {
  now = START;
  queue.length = 0;
  requests.length = 0;
  harness.secureStore.clear();
  await launchApp();
});

const networkCalls = () => requests.length;

// ===============================================================================================
// Formatting helpers
// ===============================================================================================

test("formatCountdown renders m:ss and h:mm:ss", () => {
  assert.equal(formatCountdown(0), "0:00");
  assert.equal(formatCountdown(9), "0:09");
  assert.equal(formatCountdown(30), "0:30");
  assert.equal(formatCountdown(872), "14:32");
  assert.equal(formatCountdown(900), "15:00");
  assert.equal(formatCountdown(3725), "1:02:05");
  assert.equal(formatCountdown(-5), "0:00");
});

test("secondsUntil rounds up and never goes negative", () => {
  assert.equal(secondsUntil(START + 1500, START), 2);
  assert.equal(secondsUntil(START - 1000, START), 0);
});

test("lockoutMessage names the wait for each kind of limit", () => {
  assert.equal(lockoutMessage("otp-verify", 900), "Too many incorrect OTP attempts. Try again in 15:00.");
  assert.equal(lockoutMessage("otp-resend", 20), "Too many OTP requests. Try again in 0:20.");
  assert.equal(lockoutMessage("passcode", 872), "Too many incorrect passcode attempts. Try again in 14:32.");
});

// ===============================================================================================
// BUG-OTP-001: OTP verification locks for 15 minutes
// ===============================================================================================

test("wrong OTP shows the server's remaining-attempts message", async () => {
  otpWrong(2);

  const res = await authService.verifyOtp(MOBILE, "000000");

  assert.equal(res.success, false);
  assert.equal(res.message, "Invalid OTP. 2 attempts remaining.");
  assert.equal(res.lockedUntil, undefined);
});

test("third wrong OTP locks for 15 minutes and shows an accurate countdown", async () => {
  otpLocked(900);

  const res = await authService.verifyOtp(MOBILE, "000000");

  assert.equal(res.success, false);
  assert.equal(res.code, "OTP_LOCKED");
  assert.equal(res.lockedUntil, START + 900_000);
  assert.equal(res.message, "Too many incorrect OTP attempts. Try again in 15:00.");
});

test("while locked the correct OTP is not even sent to the server", async () => {
  otpLocked(900);
  await authService.verifyOtp(MOBILE, "000000");
  const callsAfterLock = networkCalls();

  advance(60);
  const res = await authService.verifyOtp(MOBILE, "123456");

  assert.equal(res.success, false);
  assert.equal(res.code, "OTP_LOCKED");
  assert.equal(res.message, "Too many incorrect OTP attempts. Try again in 14:00.");
  assert.equal(networkCalls(), callsAfterLock);
});

test("requesting a new OTP during the lockout is refused locally and cannot bypass it", async () => {
  otpLocked(900);
  await authService.verifyOtp(MOBILE, "000000");
  const callsAfterLock = networkCalls();

  advance(120);
  const res = await authService.sendOtp(MOBILE);

  assert.equal(res.success, false);
  assert.equal(res.code, "OTP_LOCKED");
  assert.equal(res.message, "Too many incorrect OTP attempts. Try again in 13:00.");
  assert.equal(networkCalls(), callsAfterLock);
});

test("forgot-passcode OTP requests respect the same lockout", async () => {
  otpLocked(900);
  await authService.verifyOtp(MOBILE, "000000");
  const callsAfterLock = networkCalls();

  const res = await authService.forgotPasscode(MOBILE);

  assert.equal(res.success, false);
  assert.equal(res.code, "OTP_LOCKED");
  assert.equal(networkCalls(), callsAfterLock);
});

test("the OTP lockout survives an app restart", async () => {
  otpLocked(900);
  await authService.verifyOtp(MOBILE, "000000");
  const callsAfterLock = networkCalls();

  advance(300);
  await launchApp();
  const res = await authService.verifyOtp(MOBILE, "123456");

  assert.equal(res.code, "OTP_LOCKED");
  assert.equal(res.message, "Too many incorrect OTP attempts. Try again in 10:00.");
  assert.equal(networkCalls(), callsAfterLock);
});

test("clearing local storage cannot bypass the OTP lockout: the server still refuses", async () => {
  otpLocked(900);
  await authService.verifyOtp(MOBILE, "000000");

  harness.secureStore.clear();
  await launchApp();
  advance(60);
  otpLocked(840);
  const res = await authService.verifyOtp(MOBILE, "123456");

  assert.equal(res.success, false);
  assert.equal(res.code, "OTP_LOCKED");
  assert.equal(res.message, "Too many incorrect OTP attempts. Try again in 14:00.");
});

test("after the lockout expires the app talks to the server again", async () => {
  otpLocked(900);
  await authService.verifyOtp(MOBILE, "000000");

  advance(899);
  assert.equal((await authService.verifyOtp(MOBILE, "123456")).code, "OTP_LOCKED");

  advance(1);
  otpVerified();
  const res = await authService.verifyOtp(MOBILE, "123456");

  assert.equal(res.success, true);
  assert.equal(res.customerExists, true);
});

test("a stored lockout far in the future (changed device clock) is ignored and the server decides", async () => {
  harness.secureStore.set(`finsolz_secure_otp_lockout_until_${MOBILE}`, String(START + 3 * 24 * 3600 * 1000));
  otpVerified();

  const res = await authService.verifyOtp(MOBILE, "123456");

  assert.equal(res.success, true);
});

test("a successful verification clears the stored lockout", async () => {
  otpLocked(900);
  await authService.verifyOtp(MOBILE, "000000");
  advance(900);
  otpVerified();
  await authService.verifyOtp(MOBILE, "123456");

  assert.equal(harness.secureStore.has(`finsolz_secure_otp_lockout_until_${MOBILE}`), false);
});

// ===============================================================================================
// BUG-OTP-003: resend limits
// ===============================================================================================

test("a resend refused by the server's rate limit reports the wait without locking verification", async () => {
  resendLimited(20);

  const res = await authService.sendOtp(MOBILE);

  assert.equal(res.success, false);
  assert.equal(res.code, "OTP_RESEND_LIMITED");
  assert.equal(res.retryAfterSeconds, 20);
  assert.equal(res.message, "Too many OTP requests. Try again in 0:20.");
  assert.equal(res.lockedUntil, undefined);
  assert.equal(harness.secureStore.has(`finsolz_secure_otp_lockout_until_${MOBILE}`), false);
});

test("a long hourly resend limit is shown as a clock, not as seconds", async () => {
  resendLimited(3445);

  const res = await authService.sendOtp(MOBILE);

  assert.equal(res.message, "Too many OTP requests. Try again in 57:25.");
});

test("a normal send still succeeds", async () => {
  reply(200, "OTP sent successfully");

  const res = await authService.sendOtp(MOBILE);

  assert.equal(res.success, true);
  assert.equal(requests[0].url, "http://backend.test/otp/generate");
});

test("the retry time comes from Retry-After when the body does not carry it", async () => {
  reply(429, { success: false, code: "OTP_RESEND_LIMITED", message: "slow down" }, { "Retry-After": "45" });

  const res = await authService.sendOtp(MOBILE);

  assert.equal(res.retryAfterSeconds, 45);
  assert.equal(res.message, "Too many OTP requests. Try again in 0:45.");
});

// ===============================================================================================
// BUG-LOGIN-003: passcode lockout lasts the configured duration
// ===============================================================================================

test("server-imposed passcode lockout lasts 15 minutes, not 30 seconds", async () => {
  passcodeLocked(900);

  const first = await passcodeService.verifyPasscode(MOBILE, "111111");
  assert.equal(first.isLockedOut, true);
  assert.equal(first.lockedUntil, START + 900_000);
  assert.equal(first.error, "Too many incorrect passcode attempts. Try again in 15:00.");

  const callsAfterLock = networkCalls();

  advance(31);
  const afterThirtySeconds = await passcodeService.verifyPasscode(MOBILE, "246810");
  assert.equal(afterThirtySeconds.isLockedOut, true, "must still be locked 31s later");
  assert.equal(afterThirtySeconds.error, "Too many incorrect passcode attempts. Try again in 14:29.");

  advance(900 - 31 - 1); // one second before the 15-minute mark
  assert.equal((await passcodeService.verifyPasscode(MOBILE, "246810")).isLockedOut, true);

  assert.equal(networkCalls(), callsAfterLock, "locked attempts must not hit the server");

  advance(1);
  loginOk();
  const afterExpiry = await passcodeService.verifyPasscode(MOBILE, "246810");
  assert.equal(afterExpiry.success, true);
});

test("five wrong passcodes lock for 15 minutes even when only 401s come back", async () => {
  for (let remaining = 4; remaining >= 1; remaining--) {
    passcodeWrong(remaining);
    const res = await passcodeService.verifyPasscode(MOBILE, "111111");
    assert.equal(res.isLockedOut, undefined);
    assert.equal(res.error, `Incorrect passcode. ${remaining} attempt(s) remaining.`);
  }

  passcodeWrong(0);
  const fifth = await passcodeService.verifyPasscode(MOBILE, "111111");

  assert.equal(fifth.isLockedOut, true);
  assert.equal(fifth.lockoutRemainingSeconds, 900);
  assert.equal(fifth.lockedUntil, START + 900_000);
});

test("the passcode lockout survives an app restart", async () => {
  passcodeLocked(900);
  await passcodeService.verifyPasscode(MOBILE, "111111");
  const callsAfterLock = networkCalls();

  advance(300);
  await launchApp();
  const res = await passcodeService.verifyPasscode(MOBILE, "246810");

  assert.equal(res.isLockedOut, true);
  assert.equal(res.error, "Too many incorrect passcode attempts. Try again in 10:00.");
  assert.equal(networkCalls(), callsAfterLock);
});

test("clearing local storage cannot bypass the passcode lockout: the server still refuses", async () => {
  passcodeLocked(900);
  await passcodeService.verifyPasscode(MOBILE, "111111");

  harness.secureStore.clear();
  await launchApp();
  advance(60);
  passcodeLocked(840);
  const res = await passcodeService.verifyPasscode(MOBILE, "246810");

  assert.equal(res.isLockedOut, true);
  assert.equal(res.error, "Too many incorrect passcode attempts. Try again in 14:00.");
});

test("a lockout reported with only a Retry-After header is honoured", async () => {
  reply(429, { message: "locked", code: "PASSCODE_LOCKED" }, { "Retry-After": "600" });

  const res = await passcodeService.verifyPasscode(MOBILE, "111111");

  assert.equal(res.lockoutRemainingSeconds, 600);
  assert.equal(res.lockedUntil, START + 600_000);
});

test("checkLockout reports the remaining time for the UI after a restart", async () => {
  passcodeLocked(900);
  await passcodeService.verifyPasscode(MOBILE, "111111");
  advance(100);
  await launchApp();

  const lock = await passcodeService.checkLockout(MOBILE);

  assert.equal(lock.isLocked, true);
  assert.equal(lock.remainingSeconds, 800);
  assert.equal(lock.lockedUntil, START + 900_000);
});

test("a stored passcode lockout far in the future (changed device clock) is dropped", async () => {
  harness.secureStore.set(`finsolz_secure_passcode_lockout_until_${MOBILE}`, String(START + 3 * 24 * 3600 * 1000));

  const lock = await passcodeService.checkLockout(MOBILE);

  assert.equal(lock.isLocked, false);
});

test("a correct passcode logs in and clears the failure state", async () => {
  passcodeWrong(4);
  await passcodeService.verifyPasscode(MOBILE, "111111");
  loginOk();

  const res = await passcodeService.verifyPasscode(MOBILE, "246810");

  assert.equal(res.success, true);
  assert.equal(harness.secureStore.has(`finsolz_secure_passcode_failed_attempts_${MOBILE}`), false);
  assert.equal(harness.secureStore.has(`finsolz_secure_passcode_lockout_until_${MOBILE}`), false);
});

test("a network failure still counts as a failed attempt locally", async () => {
  // No scripted response: fetch throws, like an unreachable server.
  const res = await passcodeService.verifyPasscode(MOBILE, "111111");

  assert.equal(res.success, false);
  assert.equal(res.error, "Incorrect passcode. 4 attempt(s) remaining.");
});

test("isPublicEndpoint correctly classifies public auth endpoints", () => {
  assert.equal(isPublicEndpoint("/otp/generate"), true);
  assert.equal(isPublicEndpoint("/otp/verify"), true);
  assert.equal(isPublicEndpoint("/customer/exists/9876543210"), true);
  assert.equal(isPublicEndpoint("/customer/login"), true);
  assert.equal(isPublicEndpoint("/customer/register"), true);
  assert.equal(isPublicEndpoint("http://backend.test/otp/generate"), true);
  assert.equal(isPublicEndpoint("http://backend.test/customer/exists/9876543210"), true);
  assert.equal(isPublicEndpoint("/customer/profile"), false);
  assert.equal(isPublicEndpoint("/auth/validate"), false);
});

test("public endpoints do not send Authorization Bearer token even when token is stored", async () => {
  // Put a token in storage
  await tokenManager.setAccessToken("mock.jwt.token");
  requests.length = 0;
  reply(200, "OTP generated successfully");

  const res = await authService.sendOtp(MOBILE);

  assert.equal(res.success, true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url.endsWith("/otp/generate"), true);
  // Authorization header must NOT be present
  const authHeader = requests[0].headers?.Authorization || requests[0].headers?.authorization;
  assert.equal(authHeader, undefined);

  await tokenManager.clearTokens();
});

function createTestJwt(expSecondsFromNow = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const payload = Buffer.from(JSON.stringify({ sub: "CUST123", exp, name: "Test" })).toString("base64url");
  return `${header}.${payload}.mockSignature`;
}

test("access token is attached to protected endpoints when token is present and valid", async () => {
  const validToken = createTestJwt(3600);
  await tokenManager.setAccessToken(validToken);

  requests.length = 0;
  reply(200, { customerId: "CUST123", name: "Test User" });

  const res = await apiClient.get<any>("/customer/details/CUST123");

  assert.equal(res.customerId, "CUST123");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url.endsWith("/customer/details/CUST123"), true);
  assert.equal(requests[0].headers?.Authorization, `Bearer ${validToken}`);

  await tokenManager.clearTokens();
});

test("token rotation happens when access token is expired (proactive refresh before protected endpoint)", async () => {
  // Store an expired access token and a valid refresh token
  const expiredToken = createTestJwt(-100); // expired 100s ago
  const oldRefreshToken = "old-refresh-token-uuid-1";
  await tokenManager.setAccessToken(expiredToken);
  await tokenManager.setRefreshToken(oldRefreshToken);

  const newRotatedToken = createTestJwt(3600);
  const newRotatedRefreshToken = "new-refresh-token-uuid-2";

  requests.length = 0;
  // 1. Response for POST /auth/refresh
  reply(200, {
    accessToken: newRotatedToken,
    refreshToken: newRotatedRefreshToken,
    tokenType: "Bearer",
  });
  // 2. Response for the actual protected request
  reply(200, { customerId: "CUST123", profileCompleted: true });

  const res = await apiClient.get<any>("/customer/profile");

  assert.equal(res.profileCompleted, true);
  // Verify 2 requests were made: 1) refresh, 2) protected call with fresh token
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url.endsWith("/auth/refresh"), true);
  assert.equal(requests[0].body.refreshToken, oldRefreshToken);
  assert.equal(requests[1].url.endsWith("/customer/profile"), true);
  assert.equal(requests[1].headers?.Authorization, `Bearer ${newRotatedToken}`);

  // Verify tokens were rotated in storage
  const storedAccess = await tokenManager.getAccessToken();
  const storedRefresh = await tokenManager.getRefreshToken();
  assert.equal(storedAccess, newRotatedToken);
  assert.equal(storedRefresh, newRotatedRefreshToken);

  await tokenManager.clearTokens();
});

test("token rotation happens on 401 response and retries request with new rotated token", async () => {
  const currentToken = createTestJwt(300);
  const currentRefresh = "current-refresh-token-abc";
  await tokenManager.setAccessToken(currentToken);
  await tokenManager.setRefreshToken(currentRefresh);

  const nextRotatedAccess = createTestJwt(3600);
  const nextRotatedRefresh = "next-refresh-token-xyz";

  requests.length = 0;
  // 1. First attempt to protected endpoint returns 401 Unauthorized
  reply(401, { error: "Unauthorized", code: "TOKEN_EXPIRED", message: "Token expired" });
  // 2. Refresh endpoint succeeds with rotated tokens
  reply(200, {
    accessToken: nextRotatedAccess,
    refreshToken: nextRotatedRefresh,
    tokenType: "Bearer",
  });
  // 3. Retry of protected endpoint succeeds
  reply(200, { status: "OK", data: "loan-app-1" });

  const res = await apiClient.get<any>("/loan/vehicle/application/1");

  assert.equal(res.data, "loan-app-1");
  assert.equal(requests.length, 3);
  // Request 1: protected endpoint with original token
  assert.equal(requests[0].url.endsWith("/loan/vehicle/application/1"), true);
  assert.equal(requests[0].headers?.Authorization, `Bearer ${currentToken}`);
  // Request 2: /auth/refresh
  assert.equal(requests[1].url.endsWith("/auth/refresh"), true);
  assert.equal(requests[1].body.refreshToken, currentRefresh);
  // Request 3: retry of protected endpoint with ROTATED new token
  assert.equal(requests[2].url.endsWith("/loan/vehicle/application/1"), true);
  assert.equal(requests[2].headers?.Authorization, `Bearer ${nextRotatedAccess}`);

  // Verify storage was updated with rotated tokens
  assert.equal(await tokenManager.getAccessToken(), nextRotatedAccess);
  assert.equal(await tokenManager.getRefreshToken(), nextRotatedRefresh);

  await tokenManager.clearTokens();
});

test.after(() => {
  Date.now = realNow;
});

