import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateGstinFull, validateGstinLive, isValidGstin as isValidGstinFromValidation } from "../../modules/gst/utils/gstValidation";
import { validateGstin as sharedValidateGstin, isValidGstin as sharedIsValidGstin } from "../../shared/validators/gstValidators";
import { validateGstin as indianTaxValidateGstin } from "../../shared/validators/indianTaxValidators";
import { validateGstin as filingValidateGstin } from "../../modules/gst/gst-filing/utils/gstFilingValidation";
import { validateGstin as msmeValidateGstin } from "../../modules/loans/msme/validation/msmeLoanValidation";
import { GstValidators } from "../../modules/gst/utils/gstValidators";
import { validateGstinInput } from "../../modules/gst/gst-amendment/utils/gstAmendmentValidation";

// All state codes valid, PAN entity types valid (A B C F G H J L P T)
const VALID_GSTINS = [
  "07AAAPZ1234A1Z0", // Delhi (07), P = individual
  "27AABCU9603R1ZP", // Maharashtra (27), C = company
  "19AAACR5055K1ZB", // West Bengal (19), C = company
  "27AABCU9603R1Z0", // Maharashtra (27), C = company, different checksum
  "07AAAPZ1234A1Z5", // Delhi (07), P = individual, different checksum
  "22AABCP1234F1Z5", // Chhattisgarh (22), C = company
  "29AABCG1234F1Z5", // Karnataka (29), C = company
];

// Invalid: wrong length, bad state code, bad PAN entity type, bad structure
const INVALID_GSTINS = [
  "07AAAPZ1234A1Z",    // 14 chars — too short
  "07AAAPZ1234A1Z0X",  // 16 chars — too long
  "07123PZ1234A1Z0",   // digits at PAN letter positions
  "07AAAPZ1234A1A0",   // no 'Z' at position 14
  "U62010TS2025PTC",   // no numeric state code prefix
  "07AAADZ1234A1Z0",   // D at PAN entity type position (not in ABCFGHJLPT)
  "99AAAPZ1234A1Z0",   // state code 99 — not in active domestic set
  "25AAAPZ1234A1Z0",   // state code 25 — legacy/excluded
  "28AAAPZ1234A1Z0",   // state code 28 — defunct
];

describe("GSTIN cross-module validation — all validators produce consistent results", () => {
  describe("valid GSTINs accepted by all validators", () => {
    VALID_GSTINS.forEach((gstin) => {
      it(`${gstin}: validateGstinFull returns null`, () => {
        assert.equal(validateGstinFull(gstin), null);
      });

      it(`${gstin}: isValidGstin (gstValidation) returns true`, () => {
        assert.equal(isValidGstinFromValidation(gstin), true);
      });

      it(`${gstin}: shared validateGstin (touched) returns null`, () => {
        assert.equal(sharedValidateGstin(gstin, true), null);
      });

      it(`${gstin}: shared isValidGstin returns true`, () => {
        assert.equal(sharedIsValidGstin(gstin), true);
      });

      it(`${gstin}: indianTaxValidators validateGstin returns true`, () => {
        assert.equal(indianTaxValidateGstin(gstin), true);
      });

      it(`${gstin}: filing validateGstin (touched) returns null`, () => {
        assert.equal(filingValidateGstin(gstin, true), null);
      });

      it(`${gstin}: GstValidators.isValidGstin returns true`, () => {
        assert.equal(GstValidators.isValidGstin(gstin), true);
      });

      it(`${gstin}: amendment validateGstinInput returns isValid:true`, () => {
        assert.equal(validateGstinInput(gstin).isValid, true);
      });

      it(`${gstin}: msme validateGstin (Registered) returns undefined`, () => {
        assert.equal(msmeValidateGstin(gstin, "Registered"), undefined);
      });
    });
  });

  describe("invalid GSTINs rejected by all validators", () => {
    INVALID_GSTINS.forEach((gstin) => {
      it(`"${gstin}": validateGstinFull returns error`, () => {
        assert.ok(validateGstinFull(gstin) !== null);
      });

      it(`"${gstin}": sharedIsValidGstin returns false`, () => {
        assert.equal(sharedIsValidGstin(gstin), false);
      });

      it(`"${gstin}": indianTaxValidators validateGstin returns false`, () => {
        assert.equal(indianTaxValidateGstin(gstin), false);
      });

      it(`"${gstin}": GstValidators.isValidGstin returns false`, () => {
        assert.equal(GstValidators.isValidGstin(gstin), false);
      });

      it(`"${gstin}": amendment validateGstinInput returns isValid:false`, () => {
        assert.equal(validateGstinInput(gstin).isValid, false);
      });
    });
  });

  describe("MSME validator skips check when not registered", () => {
    it("returns undefined for any GSTIN when status is not Registered", () => {
      assert.equal(msmeValidateGstin("INVALID", "Not Registered"), undefined);
      assert.equal(msmeValidateGstin("INVALID", ""), undefined);
    });

    it("returns error for invalid GSTIN when status is Registered", () => {
      assert.ok(msmeValidateGstin("INVALID_GSTIN_X", "Registered") !== undefined);
    });
  });

  describe("partial-validation behaviour (isTouched = false)", () => {
    it("shared validateGstin returns null for 14-char partial when untouched", () => {
      assert.equal(sharedValidateGstin("07AAAPZ1234A1Z", false), null);
    });

    it("filing validateGstin returns null for 14-char partial when untouched", () => {
      assert.equal(filingValidateGstin("07AAAPZ1234A1Z", false), null);
    });

    it("shared validateGstin returns error for 14-char partial when touched", () => {
      assert.ok(sharedValidateGstin("07AAAPZ1234A1Z", true) !== null);
    });
  });

  describe("strict PAN entity type and state code validation", () => {
    // --- valid PAN entity types (all 10 accepted) ---
    const VALID_ENTITY_TYPES: Array<[string, string]> = [
      ["A", "AOP"],
      ["B", "BOI"],
      ["C", "Company"],
      ["F", "Firm/LLP"],
      ["G", "Government"],
      ["H", "HUF"],
      ["J", "Artificial Juridical Person"],
      ["L", "Local Authority"],
      ["P", "Individual"],
      ["T", "Trust"],
    ];

    VALID_ENTITY_TYPES.forEach(([type, label]) => {
      it(`PAN entity type ${type} (${label}) accepted`, () => {
        // GSTIN: state=22, PAN chars 1-3=AAB, entity=type, PAN 5=C, digits=1234, PAN10=F, entity#=1, Z, check=5
        assert.equal(validateGstinFull(`22AAB${type}C1234F1Z5`), null);
      });
    });

    // --- invalid PAN entity type characters rejected ---
    const INVALID_ENTITY_TYPES = ["D", "E", "I", "K", "M", "N", "O", "Q", "R", "S", "U", "V", "W", "X", "Y", "Z"];

    INVALID_ENTITY_TYPES.forEach((type) => {
      it(`invalid PAN entity type ${type} rejected`, () => {
        assert.ok(validateGstinFull(`22AAB${type}C1234F1Z5`) !== null);
      });
    });

    // --- invalid 4th PAN character examples ---
    it("GSTIN with D at PAN entity type position is rejected", () => {
      assert.ok(validateGstinFull("22AABDC1234F1Z5") !== null);
    });

    it("GSTIN with X at PAN entity type position is rejected", () => {
      assert.ok(validateGstinFull("22AABXC1234F1Z5") !== null);
    });

    // --- invalid PAN digit positions (letters where digits are required) ---
    it("letter at PAN digit position 1 (pos 8 of GSTIN) rejected", () => {
      // 22AABCPX234F1Z5 — pos 8 = X, must be digit
      assert.ok(validateGstinFull("22AABCPX234F1Z5") !== null);
    });

    it("letter at PAN digit position 4 (pos 11 of GSTIN) rejected", () => {
      // 22AABCP123XF1Z5 — pos 11 = X, must be digit
      assert.ok(validateGstinFull("22AABCP123XF1Z5") !== null);
    });

    // --- invalid PAN 10th character (digit instead of letter at position 12) ---
    it("digit at PAN 10th character position (pos 12 of GSTIN) rejected", () => {
      // 22AABCP123451Z5 — pos 12 = 5 (digit), must be letter
      assert.ok(validateGstinFull("22AABCP123451Z5") !== null);
    });

    // --- invalid GST state codes ---
    it("state code 00 rejected", () => {
      assert.ok(validateGstinFull("00AABCP1234F1Z5") !== null);
    });

    it("defunct state code 28 rejected", () => {
      assert.ok(validateGstinFull("28AABCP1234F1Z5") !== null);
    });

    it("legacy state code 25 rejected", () => {
      assert.ok(validateGstinFull("25AABCP1234F1Z5") !== null);
    });

    it("out-of-range state code 99 rejected", () => {
      assert.ok(validateGstinFull("99AABCP1234F1Z5") !== null);
    });

    // --- invalid GSTIN structure ---
    it("GSTIN without Z at position 14 rejected", () => {
      assert.ok(validateGstinFull("07AAAPZ1234A1A0") !== null);
    });

    it("GSTIN with entity number 0 (must be 1-9 or A-Z) rejected", () => {
      // pos 13 = 0 — entity number [1-9A-Z] does not allow 0
      assert.ok(validateGstinFull("22AABCP123AF0Z5") !== null);
    });

    // --- invalid checksum but structurally valid GSTIN must PASS (no checksum calculation) ---
    it("structurally valid GSTIN with any numeric checksum passes (no checksum validation)", () => {
      assert.equal(validateGstinFull("22AABCP1234F1Z9"), null);
      assert.equal(validateGstinFull("22AABCP1234F1Z0"), null);
    });

    it("structurally valid GSTIN with letter checksum passes (no checksum validation)", () => {
      assert.equal(validateGstinFull("22AABCP1234F1ZA"), null);
      assert.equal(validateGstinFull("22AABCP1234F1ZZ"), null);
    });

    // --- cross-module consistency for strict validation ---
    it("all validators consistently reject invalid PAN entity type D", () => {
      const badGstin = "22AABDC1234F1Z5";
      assert.ok(validateGstinFull(badGstin) !== null);
      assert.equal(sharedIsValidGstin(badGstin), false);
      assert.equal(indianTaxValidateGstin(badGstin), false);
      assert.equal(GstValidators.isValidGstin(badGstin), false);
      assert.equal(validateGstinInput(badGstin).isValid, false);
    });

    it("all validators consistently accept valid PAN entity type P", () => {
      const goodGstin = "22AABCP1234F1Z5";
      assert.equal(validateGstinFull(goodGstin), null);
      assert.equal(sharedIsValidGstin(goodGstin), true);
      assert.equal(indianTaxValidateGstin(goodGstin), true);
      assert.equal(GstValidators.isValidGstin(goodGstin), true);
      assert.equal(validateGstinInput(goodGstin).isValid, true);
    });

    it("all validators consistently reject invalid state code 28", () => {
      const badState = "28AABCP1234F1Z5";
      assert.ok(validateGstinFull(badState) !== null);
      assert.equal(sharedIsValidGstin(badState), false);
      assert.equal(indianTaxValidateGstin(badState), false);
      assert.equal(GstValidators.isValidGstin(badState), false);
      assert.equal(validateGstinInput(badState).isValid, false);
    });
  });

  describe("validateGstinLive — progressive live validation", () => {
    // Empty / no input returns null (no error while empty)
    it("empty string returns null", () => {
      assert.equal(validateGstinLive(""), null);
    });

    it("single character returns null (not enough to validate)", () => {
      assert.equal(validateGstinLive("2"), null);
    });

    // Valid partial input returns null at each position
    it("partial valid GSTIN '07' returns null", () => {
      assert.equal(validateGstinLive("07"), null);
    });

    it("partial valid GSTIN '07AAA' returns null", () => {
      assert.equal(validateGstinLive("07AAA"), null);
    });

    it("partial valid GSTIN '07AAAP' (6 chars, valid entity type P) returns null", () => {
      assert.equal(validateGstinLive("07AAAP"), null);
    });

    it("partial valid GSTIN '07AAAPZ' (7 chars) returns null", () => {
      assert.equal(validateGstinLive("07AAAPZ"), null);
    });

    it("partial valid GSTIN '07AAAPZ12' (9 chars) returns null", () => {
      assert.equal(validateGstinLive("07AAAPZ12"), null);
    });

    // Invalid state code detected immediately at position 2
    it("invalid state code '00' detected immediately at 2 chars", () => {
      assert.ok(validateGstinLive("00") !== null);
    });

    it("invalid state code '28' detected immediately at 2 chars", () => {
      assert.ok(validateGstinLive("28") !== null);
    });

    it("invalid state code '99' detected immediately at 2 chars", () => {
      assert.ok(validateGstinLive("99") !== null);
    });

    // Invalid PAN entity type detected immediately at position 6
    it("invalid entity type D at position 6 returns PAN format error immediately", () => {
      const err = validateGstinLive("07AAAD");
      assert.ok(err !== null);
      assert.equal(err, "Enter a valid PAN format in the GSTIN.");
    });

    it("invalid entity type E at position 6 returns PAN format error immediately", () => {
      assert.equal(validateGstinLive("07AAAE"), "Enter a valid PAN format in the GSTIN.");
    });

    it("invalid entity type X at position 6 returns PAN format error immediately", () => {
      assert.equal(validateGstinLive("07AAAX"), "Enter a valid PAN format in the GSTIN.");
    });

    it("valid entity type P at position 6 returns null (no error)", () => {
      assert.equal(validateGstinLive("07AAAP"), null);
    });

    it("valid entity type C at position 6 returns null (no error)", () => {
      assert.equal(validateGstinLive("22AABCC"), null);
    });

    // Error disappears when invalid entity type is corrected
    it("correcting invalid entity type D to P removes the error", () => {
      // Wrong: D at position 6
      assert.equal(validateGstinLive("07AAAD"), "Enter a valid PAN format in the GSTIN.");
      // Corrected: P at position 6
      assert.equal(validateGstinLive("07AAAP"), null);
    });

    // All 10 valid entity types return null at position 6
    const LIVE_VALID_ENTITY_TYPES = ["A", "B", "C", "F", "G", "H", "J", "L", "P", "T"];
    LIVE_VALID_ENTITY_TYPES.forEach((type) => {
      it(`entity type ${type} at position 6 (live) returns null`, () => {
        assert.equal(validateGstinLive(`22AAB${type}`), null);
      });
    });

    // All invalid entity types return PAN format error at position 6
    const LIVE_INVALID_ENTITY_TYPES = ["D", "E", "I", "K", "M", "N", "O", "Q", "R", "S", "U", "V", "W", "X", "Y", "Z"];
    LIVE_INVALID_ENTITY_TYPES.forEach((type) => {
      it(`invalid entity type ${type} at position 6 (live) returns PAN error`, () => {
        assert.equal(validateGstinLive(`22AAB${type}`), "Enter a valid PAN format in the GSTIN.");
      });
    });

    // Non-digit at PAN digit position detected while typing
    it("letter at PAN digit position 8 returns error while typing", () => {
      assert.ok(validateGstinLive("07AAAPZX") !== null);
    });

    // Full valid 15-char GSTIN returns null via live validator
    it("complete valid 15-char GSTIN returns null via validateGstinLive", () => {
      assert.equal(validateGstinLive("07AAAPZ1234A1Z5"), null);
      assert.equal(validateGstinLive("22AABCP1234F1Z5"), null);
    });

    // Complete invalid 15-char GSTIN returns error via live validator
    it("complete invalid 15-char GSTIN returns error via validateGstinLive", () => {
      assert.ok(validateGstinLive("28AABCP1234F1Z5") !== null);
      assert.ok(validateGstinLive("07AAADZ1234A1Z0") !== null);
    });

    // Live validator does not perform checksum — structurally valid passes
    it("structurally valid GSTIN with any checksum passes live validation", () => {
      assert.equal(validateGstinLive("22AABCP1234F1Z9"), null);
      assert.equal(validateGstinLive("22AABCP1234F1ZA"), null);
    });
  });
});
