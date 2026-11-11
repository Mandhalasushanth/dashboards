import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterNumericAcknowledgementNumber,
  validateOriginalItrAckNumber,
  isOriginalItrAckNumberValid,
} from "../../modules/itr/revisedItr/utils/acknowledgementValidation";

describe("Revised ITR — Original ITR Acknowledgement Number Real-Time Filtering & Validation", () => {
  describe("1. Real-Time Numeric Filtering (Typing & Pasting)", () => {
    it("accepts purely numeric keystrokes up to 15 digits", () => {
      assert.strictEqual(filterNumericAcknowledgementNumber("6"), "6");
      assert.strictEqual(filterNumericAcknowledgementNumber("66467"), "66467");
      assert.strictEqual(filterNumericAcknowledgementNumber("664676467986868"), "664676467986868");
    });

    it("immediately strips non-numeric characters (letters, emojis, spaces, commas, symbols)", () => {
      // Letters
      assert.strictEqual(filterNumericAcknowledgementNumber("66467A"), "66467");
      assert.strictEqual(filterNumericAcknowledgementNumber("abc66467xyz"), "66467");
      assert.strictEqual(filterNumericAcknowledgementNumber("ITR123456789012"), "123456789012");

      // Emojis
      assert.strictEqual(filterNumericAcknowledgementNumber("66467🎉986868"), "66467986868");
      assert.strictEqual(filterNumericAcknowledgementNumber("🚀12345🔥"), "12345");

      // Spaces
      assert.strictEqual(filterNumericAcknowledgementNumber(" 6646 7646 7986 868 "), "664676467986868");
      assert.strictEqual(filterNumericAcknowledgementNumber("   "), "");

      // Commas
      assert.strictEqual(filterNumericAcknowledgementNumber("664,676,467,986,868"), "664676467986868");

      // Decimal points and symbols
      assert.strictEqual(filterNumericAcknowledgementNumber("66467.6467986868"), "664676467986868");
      assert.strictEqual(filterNumericAcknowledgementNumber("6646-7646-7986-868@"), "664676467986868");
      assert.strictEqual(filterNumericAcknowledgementNumber("!@#$%^&*()_+="), "");
    });

    it("applies filtering when users paste mixed alphanumeric or formatted text", () => {
      const pasted = "Original Ack: 6646-7646-7986-868 (AY 2026-27)";
      const filtered = filterNumericAcknowledgementNumber(pasted);
      // Extracts only the digits up to 15
      assert.match(filtered, /^\d+$/);
      assert.strictEqual(filtered.length <= 15, true);
      assert.strictEqual(filtered, "664676467986868");
    });

    it("enforces a strict maximum of 15 digits", () => {
      // 16 digits truncated to 15
      const sixteenDigits = "1234567890123456";
      assert.strictEqual(filterNumericAcknowledgementNumber(sixteenDigits), "123456789012345");
      assert.strictEqual(filterNumericAcknowledgementNumber(sixteenDigits).length, 15);

      // 25 digits truncated to 15
      const longInput = "9876543210123456789012345";
      assert.strictEqual(filterNumericAcknowledgementNumber(longInput), "987654321012345");
      assert.strictEqual(filterNumericAcknowledgementNumber(longInput).length, 15);
    });

    it("handles backspace / deleting characters naturally", () => {
      let current = "664676467986868"; // 15 digits
      // Delete last digit
      current = filterNumericAcknowledgementNumber(current.slice(0, -1));
      assert.strictEqual(current, "66467646798686");
      assert.strictEqual(current.length, 14);

      // Delete all
      current = filterNumericAcknowledgementNumber("");
      assert.strictEqual(current, "");
      assert.strictEqual(current.length, 0);
    });
  });

  describe("2. Validation Rules & Inline Error Feedback", () => {
    it("returns required error for empty string", () => {
      const res = validateOriginalItrAckNumber("");
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.error, "Please enter the 15-digit Acknowledgement Number.");
    });

    it("returns length error for less than 15 digits (e.g. 14 digits)", () => {
      const res = validateOriginalItrAckNumber("12345678901234");
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.error, "Acknowledgement number must be exactly 15 digits.");
    });

    it("returns success (error: null) for exactly 15 numeric digits", () => {
      const res = validateOriginalItrAckNumber("664676467986868");
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.error, null);
    });

    it("validates that raw strings with unstripped characters are marked invalid", () => {
      const res = validateOriginalItrAckNumber("66467646798686A");
      assert.strictEqual(res.isValid, false);
      assert.match(res.error ?? "", /Letters, spaces, commas, and special characters are not allowed/);
    });
  });

  describe("3. Continue CTA Enablement State", () => {
    it("isOriginalItrAckNumberValid is true only for exactly 15 digits (0-9)", () => {
      assert.strictEqual(isOriginalItrAckNumberValid("664676467986868"), true);
      assert.strictEqual(isOriginalItrAckNumberValid("000000000000000"), true);
      assert.strictEqual(isOriginalItrAckNumberValid("12345678901234"), false); // 14 digits
      assert.strictEqual(isOriginalItrAckNumberValid("1234567890123456"), false); // 16 digits
      assert.strictEqual(isOriginalItrAckNumberValid(""), false);
      assert.strictEqual(isOriginalItrAckNumberValid("66467646798686A"), false);
    });

    it("controlled input simulation: typing invalid chars leaves value pure numeric", () => {
      let state = "";
      const simulateType = (input: string) => {
        state = filterNumericAcknowledgementNumber(input);
      };

      // Type 14 digits
      simulateType("12345678901234");
      assert.strictEqual(state, "12345678901234");
      assert.strictEqual(isOriginalItrAckNumberValid(state), false);

      // Attempt to type a letter 'X'
      simulateType(state + "X");
      assert.strictEqual(state, "12345678901234"); // 'X' immediately stripped
      assert.strictEqual(isOriginalItrAckNumberValid(state), false);

      // Type 15th digit '5'
      simulateType(state + "5");
      assert.strictEqual(state, "123456789012345");
      assert.strictEqual(isOriginalItrAckNumberValid(state), true);

      // Attempt to type a 16th digit '6'
      simulateType(state + "6");
      assert.strictEqual(state, "123456789012345"); // Capped at 15
      assert.strictEqual(isOriginalItrAckNumberValid(state), true);
    });
  });
});
