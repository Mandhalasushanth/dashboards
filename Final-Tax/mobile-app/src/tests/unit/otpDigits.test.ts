/// <reference types="node" />
/**
 * BUG-OTP-002: individually editable OTP digits.
 * Run with: node scripts/run-auth-lockout-tests.cjs src/tests/unit/otpDigits.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  OTP_LENGTH,
  backspaceInEmptyBox,
  digitsFromOtp,
  editDigit,
  firstEmptyIndex,
  joinDigits,
  resolveDigits,
  type OtpDigits,
} from "../../modules/authentication/hooks/otpDigits";

/**
 * Mirrors what useOtpDigits does around the pure rules: the boxes the user edited, the OTP the
 * parent (auth store) holds, and where focus goes. A box that holds a digit reports a delete as
 * empty text; an empty box reports Backspace as a key press.
 */
class OtpBoxes {
  edited: OtpDigits;
  parentOtp: string;
  focus = 0;

  constructor(otp = "") {
    this.parentOtp = otp;
    this.edited = digitsFromOtp(otp);
  }

  get digits(): OtpDigits {
    return resolveDigits(this.edited, this.parentOtp);
  }

  get text(): string {
    return this.digits.join("");
  }

  type(index: number, text: string) {
    const result = editDigit(this.digits, index, text);
    this.edited = result.digits;
    this.parentOtp = joinDigits(result.digits);
    this.focus = result.focusIndex;
  }

  backspace(index: number) {
    if (this.digits[index] !== "") {
      this.type(index, "");
      return;
    }
    const result = backspaceInEmptyBox(this.digits, index);
    if (result) {
      this.edited = result.digits;
      this.parentOtp = joinDigits(result.digits);
      this.focus = result.focusIndex;
    }
  }

  /** The parent replaced the OTP (cleared after a resend, or autofilled). */
  parentSets(otp: string) {
    this.parentOtp = otp;
  }

  /** The Verify button is enabled only for a full six-digit OTP. */
  get canSubmit(): boolean {
    return this.parentOtp.length === OTP_LENGTH;
  }
}

const full = () => new OtpBoxes("123456");

// ---- replacing a single digit ------------------------------------------------------------------

test("replacing the first digit changes only that digit", () => {
  const boxes = full();
  boxes.type(0, "9");
  assert.equal(boxes.text, "923456");
  assert.equal(boxes.focus, 1);
  assert.equal(boxes.canSubmit, true);
});

test("replacing a middle digit leaves the digits after it in place", () => {
  const boxes = full();
  boxes.type(2, "7");
  assert.equal(boxes.text, "127456");
  assert.deepEqual(boxes.digits, ["1", "2", "7", "4", "5", "6"]);
  assert.equal(boxes.focus, 3);
  assert.equal(boxes.canSubmit, true);
});

test("replacing the last digit keeps focus on the last box", () => {
  const boxes = full();
  boxes.type(5, "0");
  assert.equal(boxes.text, "123450");
  assert.equal(boxes.focus, 5);
});

test("replacing works when the box did not select its old digit (old digit + new, or new + old)", () => {
  const append = full();
  append.type(2, "37");
  assert.equal(append.text, "127456");

  const prepend = full();
  prepend.type(2, "73");
  assert.equal(prepend.text, "127456");

  const same = full();
  same.type(2, "33");
  assert.equal(same.text, "123456");
});

test("any box can be replaced in any order", () => {
  const boxes = full();
  boxes.type(4, "0");
  boxes.type(1, "9");
  boxes.type(3, "8");
  assert.equal(boxes.text, "193806");
});

// ---- typing forward ----------------------------------------------------------------------------

test("typing digit by digit fills the boxes and moves focus forward", () => {
  const boxes = new OtpBoxes();
  const focusAfter: number[] = [];
  "482913".split("").forEach((digit, i) => {
    boxes.type(i, digit);
    focusAfter.push(boxes.focus);
  });
  assert.equal(boxes.text, "482913");
  assert.deepEqual(focusAfter, [1, 2, 3, 4, 5, 5]);
  assert.equal(boxes.canSubmit, true);
});

test("non-digit input is ignored, including a paste of letters over a digit", () => {
  const boxes = full();
  boxes.type(2, "x");
  boxes.type(3, "abc");
  boxes.type(4, " ");
  assert.equal(boxes.text, "123456");
});

// ---- paste and autofill ------------------------------------------------------------------------

test("a pasted 6-digit code fills every box, whichever box it lands in", () => {
  for (const index of [0, 2, 5]) {
    const boxes = new OtpBoxes();
    boxes.type(index, "654321");
    assert.equal(boxes.text, "654321", `pasted into box ${index}`);
    assert.equal(boxes.focus, 5);
    assert.equal(boxes.canSubmit, true);
  }
});

test("a pasted code replaces an existing one and tolerates spaces and dashes", () => {
  const boxes = full();
  boxes.type(0, "987 654");
  assert.equal(boxes.text, "987654");
  boxes.type(0, "111-222");
  assert.equal(boxes.text, "111222");
});

test("a code longer than six digits is cut to the first six", () => {
  const boxes = new OtpBoxes();
  boxes.type(0, "12345678");
  assert.equal(boxes.text, "123456");
});

test("a short paste fills from the box it lands in and never touches earlier boxes", () => {
  const boxes = new OtpBoxes("12");
  boxes.type(2, "345");
  assert.equal(boxes.text, "12345");
  assert.deepEqual(boxes.digits, ["1", "2", "3", "4", "5", ""]);
  assert.equal(boxes.focus, 5);
  assert.equal(boxes.canSubmit, false);
});

test("a paste running past the last box only fills the boxes that exist", () => {
  const boxes = new OtpBoxes("1234");
  boxes.type(4, "789");
  assert.equal(boxes.text, "123478");
  assert.equal(boxes.focus, 5);
});

// ---- backspace ---------------------------------------------------------------------------------

test("backspace in a box that has a digit clears only that digit", () => {
  const boxes = full();
  boxes.backspace(2);
  assert.deepEqual(boxes.digits, ["1", "2", "", "4", "5", "6"]);
  assert.equal(boxes.focus, 2, "stays on the cleared box");
  assert.equal(boxes.text, "12456");
});

test("the cleared box can then be refilled without moving the digits after it", () => {
  const boxes = full();
  boxes.backspace(2);
  boxes.type(2, "9");
  assert.deepEqual(boxes.digits, ["1", "2", "9", "4", "5", "6"]);
  assert.equal(boxes.canSubmit, true);
});

test("backspace in an empty box steps back and clears the previous digit", () => {
  const boxes = new OtpBoxes("123");
  boxes.backspace(3);
  assert.deepEqual(boxes.digits, ["1", "2", "", "", "", ""]);
  assert.equal(boxes.focus, 2);
  boxes.backspace(2);
  assert.deepEqual(boxes.digits, ["1", "", "", "", "", ""]);
  assert.equal(boxes.focus, 1);
});

test("backspace in the first empty box does nothing", () => {
  const boxes = new OtpBoxes();
  boxes.backspace(0);
  assert.equal(boxes.text, "");
  assert.equal(backspaceInEmptyBox(boxes.digits, 0), null);
});

test("holding backspace walks back through the whole code", () => {
  const boxes = full();
  for (let i = 5; i >= 0; i--) boxes.backspace(i);
  assert.equal(boxes.text, "");
  assert.equal(boxes.canSubmit, false);
});

// ---- submit rules ------------------------------------------------------------------------------

test("an incomplete OTP cannot be submitted, including one with a gap", () => {
  const partial = new OtpBoxes("1234");
  assert.equal(partial.canSubmit, false);

  const gap = full();
  gap.backspace(0);
  assert.equal(gap.text, "23456");
  assert.equal(gap.canSubmit, false, "a hole must not slide the other digits into a valid-looking code");

  gap.type(0, "1");
  assert.equal(gap.canSubmit, true);
});

test("the submitted OTP is exactly the six digits shown, in order", () => {
  const boxes = full();
  boxes.type(1, "0");
  boxes.type(4, "9");
  assert.equal(boxes.parentOtp, "103496");
});

// ---- parent resets (resend, autofill) ---------------------------------------------------------

test("when the parent clears the OTP (after a resend) the boxes empty and edits start clean", () => {
  const boxes = full();
  boxes.parentSets("");
  assert.deepEqual(boxes.digits, ["", "", "", "", "", ""]);
  boxes.type(1, "5");
  assert.deepEqual(boxes.digits, ["", "5", "", "", "", ""]);
});

test("when the parent supplies an OTP the boxes show it", () => {
  const boxes = new OtpBoxes();
  boxes.parentSets("654321");
  assert.equal(boxes.text, "654321");
  boxes.type(0, "7");
  assert.equal(boxes.text, "754321");
});

test("digitsFromOtp pads, strips non-digits and caps at six", () => {
  assert.deepEqual(digitsFromOtp(""), ["", "", "", "", "", ""]);
  assert.deepEqual(digitsFromOtp("12"), ["1", "2", "", "", "", ""]);
  assert.deepEqual(digitsFromOtp("1a2-3"), ["1", "2", "3", "", "", ""]);
  assert.deepEqual(digitsFromOtp("1234567"), ["1", "2", "3", "4", "5", "6"]);
});

test("firstEmptyIndex finds the next box to fill", () => {
  assert.equal(firstEmptyIndex(digitsFromOtp("")), 0);
  assert.equal(firstEmptyIndex(digitsFromOtp("123")), 3);
  assert.equal(firstEmptyIndex(["1", "", "3", "4", "5", "6"]), 1);
  assert.equal(firstEmptyIndex(digitsFromOtp("123456")), 5);
});

// ---- the component keeps its other behaviour ---------------------------------------------------

test("OTPSection renders six editable boxes and keeps lockout, resend and submit behaviour", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/modules/authentication/components/OTPSection/OTPSection.tsx"),
    "utf8",
  );
  assert.ok(source.includes("otpDigits.digits.map"), "one input per digit");
  assert.ok(source.includes("onChangeText={(text) => otpDigits.handleChangeText(i, text)}"));
  assert.ok(source.includes("onKeyPress"), "backspace navigation");
  assert.ok(source.includes("selectTextOnFocus"), "tapping a box selects its digit so typing replaces it");
  assert.ok(source.includes("keyboardType=\"number-pad\""));
  assert.ok(source.includes("editable={!locked}"), "locked while the server lockout is active");
  assert.ok(source.includes("textContentType={i === 0 ? \"oneTimeCode\" : \"none\"}"), "SMS autofill still offered");
  assert.ok(source.includes("accessibilityLabel={`Digit ${i + 1} of ${OTP_LENGTH}`}"));
  assert.ok(source.includes("disabled={loading || locked || otp.length !== 6}"), "Verify needs a full code");
  assert.ok(source.includes("onPress={() => onVerify(otp)}"));
  assert.ok(source.includes("<LockoutNotice"), "lockout countdown");
  assert.ok(source.includes("formatCountdown(timer)"), "resend countdown");
  assert.ok(source.includes("onPress={onResend}"), "resend link");
  assert.equal(source.includes("hiddenInput"), false, "the single hidden input is gone");
});

test("the auth flow still passes lockout, timer and resend into the one OTP component", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/modules/authentication/components/AuthFlowSections/AuthFlowSections.tsx"),
    "utf8",
  );
  assert.equal((source.match(/<OTPSection/g) || []).length, 2, "login OTP and forgot-passcode OTP both use it");
  assert.equal((source.match(/lockoutUntil=\{otpLockoutUntil\}/g) || []).length, 2);
  assert.equal((source.match(/onResend=\{resendOtp\}/g) || []).length, 2);
});
