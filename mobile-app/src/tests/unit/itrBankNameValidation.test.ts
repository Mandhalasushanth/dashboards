import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  sanitizeBankName,
  isValidBankName,
} from "../../modules/itr/components/BankSelectorModal/bankValidation";

describe("ITR Filing First-Screen — Bank Name Input Validation & Sanitization", () => {
  describe("1. Valid Bank Names (Accepted)", () => {
    it("accepts 'State Bank of India'", () => {
      const input = "State Bank of India";
      const sanitized = sanitizeBankName(input);
      assert.equal(sanitized, "State Bank of India");
      assert.equal(isValidBankName(sanitized), true);
    });

    it("accepts 'Kotak Mahindra Bank'", () => {
      const input = "Kotak Mahindra Bank";
      const sanitized = sanitizeBankName(input);
      assert.equal(sanitized, "Kotak Mahindra Bank");
      assert.equal(isValidBankName(sanitized), true);
    });

    it("accepts standard Indian banks", () => {
      const banks = [
        "HDFC Bank",
        "ICICI Bank",
        "Axis Bank",
        "Punjab National Bank",
        "Bank of Baroda",
        "Canara Bank",
        "Union Bank of India",
        "IndusInd Bank",
        "SBI",
      ];
      for (const name of banks) {
        const sanitized = sanitizeBankName(name);
        assert.equal(sanitized, name);
        assert.equal(isValidBankName(sanitized), true, `Expected ${name} to be valid`);
      }
    });

    it("accepts lowercase, uppercase, and mixed case alphabetic characters", () => {
      assert.equal(sanitizeBankName("hdfc bank"), "hdfc bank");
      assert.equal(sanitizeBankName("HDFC BANK"), "HDFC BANK");
      assert.equal(sanitizeBankName("sBi"), "sBi");
    });
  });

  describe("2. Immediate Rejection of Numbers", () => {
    it("rejects standalone digits and number strings", () => {
      assert.equal(sanitizeBankName("1"), "");
      assert.equal(sanitizeBankName("12345"), "");
      assert.equal(sanitizeBankName("9876543210"), "");
    });

    it("immediately strips digits appended to bank names", () => {
      assert.equal(sanitizeBankName("State123"), "State");
      assert.equal(sanitizeBankName("HDFC01"), "HDFC");
    });

    it("strips numbers embedded between words and preserves spacing", () => {
      assert.equal(sanitizeBankName("State 123 Bank"), "State Bank");
      assert.equal(sanitizeBankName("Kotak 1 Mahindra 2 Bank"), "Kotak Mahindra Bank");
    });

    it("strips leading numbers and prevents leading spaces", () => {
      assert.equal(sanitizeBankName("123State"), "State");
      assert.equal(sanitizeBankName("123 State Bank"), "State Bank");
    });
  });

  describe("3. Immediate Rejection of Emojis and Unicode Symbols", () => {
    it("rejects standalone emojis", () => {
      assert.equal(sanitizeBankName("😀"), "");
      assert.equal(sanitizeBankName("🏦"), "");
      assert.equal(sanitizeBankName("😀😁😂"), "");
    });

    it("strips emojis embedded within or around bank names", () => {
      assert.equal(sanitizeBankName("State😀Bank"), "StateBank");
      assert.equal(sanitizeBankName("Kotak Mahindra Bank 🚀"), "Kotak Mahindra Bank ");
      assert.equal(sanitizeBankName("🏦 State Bank of India 🇮🇳"), "State Bank of India ");
    });

    it("rejects non-English alphabetic scripts (Devanagari, Arabic, etc.)", () => {
      assert.equal(sanitizeBankName("भारतीय स्टेट बैंक"), "");
      assert.equal(sanitizeBankName("بنك"), "");
    });
  });

  describe("4. Immediate Rejection of Special Characters and Punctuation", () => {
    it("rejects symbols (&, ., -, @, #, $, %, etc.)", () => {
      assert.equal(sanitizeBankName("State & Bank"), "State Bank");
      assert.equal(sanitizeBankName("HDFC.Bank"), "HDFCBank");
      assert.equal(sanitizeBankName("Kotak-Mahindra-Bank"), "KotakMahindraBank");
      assert.equal(sanitizeBankName("Bank@#$!%"), "Bank");
      assert.equal(sanitizeBankName("ICICI_BANK"), "ICICIBANK");
      assert.equal(sanitizeBankName("Axis/Bank"), "AxisBank");
      assert.equal(sanitizeBankName("Canara (Bank)"), "Canara Bank");
      assert.equal(sanitizeBankName("Bank's"), "Banks");
      assert.equal(sanitizeBankName("SBI, Branch"), "SBI Branch");
    });
  });

  describe("5. Spacing Controls (Leading & Consecutive Spaces)", () => {
    it("prevents leading space when starting on empty input", () => {
      assert.equal(sanitizeBankName(" "), "");
      assert.equal(sanitizeBankName("   "), "");
    });

    it("strips leading spaces before words", () => {
      assert.equal(sanitizeBankName(" State"), "State");
      assert.equal(sanitizeBankName("   State Bank"), "State Bank");
    });

    it("allows a single trailing space while actively typing the next word", () => {
      assert.equal(sanitizeBankName("State "), "State ");
      assert.equal(sanitizeBankName("State Bank "), "State Bank ");
    });

    it("collapses multiple consecutive spaces to a single space immediately", () => {
      assert.equal(sanitizeBankName("State  "), "State ");
      assert.equal(sanitizeBankName("State   "), "State ");
      assert.equal(sanitizeBankName("State  Bank"), "State Bank");
      assert.equal(sanitizeBankName("State    Bank    of    India"), "State Bank of India");
    });
  });

  describe("6. Pasted Text Sanitization", () => {
    it("sanitizes complex pasted text with leading spaces, digits, emojis and symbols", () => {
      const pasted = "  123  State   Bank 🏦 of   India 999!  ";
      const sanitized = sanitizeBankName(pasted);
      assert.equal(sanitized, "State Bank of India ");
      assert.equal(sanitized.trim(), "State Bank of India");
      assert.equal(isValidBankName(sanitized), true);
    });

    it("sanitizes pasted text with tabs and newlines into single spaces", () => {
      const pasted = "\tState\nBank\r\nof\tIndia\n";
      const sanitized = sanitizeBankName(pasted);
      assert.equal(sanitized, "State Bank of India ");
      assert.equal(sanitized.trim(), "State Bank of India");
    });

    it("returns empty string when pasting solely invalid content", () => {
      assert.equal(sanitizeBankName("   12345 !@#$%^&*()   "), "");
      assert.equal(sanitizeBankName("😀🎉🔥 123"), "");
    });
  });

  describe("7. Bank Name Submission Validation (isValidBankName)", () => {
    it("accepts valid bank names between 2 and 100 characters", () => {
      assert.equal(isValidBankName("State Bank of India"), true);
      assert.equal(isValidBankName("Kotak Mahindra Bank"), true);
      assert.equal(isValidBankName("SBI"), true);
      assert.equal(isValidBankName("Canara"), true);
    });

    it("rejects empty, null, or whitespace-only inputs", () => {
      assert.equal(isValidBankName(""), false);
      assert.equal(isValidBankName("   "), false);
      // @ts-expect-error test undefined/null safety
      assert.equal(isValidBankName(undefined), false);
    });

    it("rejects names shorter than 2 characters", () => {
      assert.equal(isValidBankName("A"), false);
    });

    it("rejects names containing digits, emojis or symbols", () => {
      assert.equal(isValidBankName("State Bank 123"), false);
      assert.equal(isValidBankName("State Bank 😀"), false);
      assert.equal(isValidBankName("State & Bank"), false);
      assert.equal(isValidBankName("State-Bank"), false);
    });

    it("rejects un-collapsed consecutive spaces", () => {
      assert.equal(isValidBankName("State  Bank"), false);
    });
  });

  describe("8. Source Code Verification — BankSelectorModal Component Wiring", () => {
    const modalPath = path.resolve(
      __dirname,
      "../../modules/itr/components/BankSelectorModal/BankSelectorModal.tsx"
    );
    const content = fs.readFileSync(modalPath, "utf-8");

    it("imports sanitizeBankName and isValidBankName", () => {
      assert.ok(
        content.includes('import { sanitizeBankName, isValidBankName } from "./bankValidation"'),
        "BankSelectorModal.tsx must import sanitizeBankName and isValidBankName"
      );
    });

    it("binds Bank Name TextInput to controlled state and handleBankNameChange", () => {
      assert.ok(
        content.includes("onChangeText={handleBankNameChange}"),
        "Bank Name TextInput must bind onChangeText to handleBankNameChange"
      );
      assert.ok(
        content.includes("value={bankName}"),
        "Bank Name TextInput must be controlled with value={bankName}"
      );
    });

    it("initializes bankName state with sanitized initialBank?.bankName", () => {
      assert.ok(
        content.includes("sanitizeBankName(initialBank.bankName)"),
        "bankName state must sanitize initialBank.bankName upon mount"
      );
    });

    it("validates bank name using isValidBankName during handleSaveBank", () => {
      assert.ok(
        content.includes("if (!isValidBankName(cleanBankName))"),
        "handleSaveBank must check isValidBankName"
      );
    });

    it("removed old permissive regex that allowed numbers and special characters", () => {
      assert.ok(
        !content.includes("/[^A-Za-z0-9\\s&.-]/g"),
        "Old permissive regex allowing digits and special chars must be completely removed"
      );
      assert.ok(
        !content.includes("^[a-zA-Z0-9\\s&.-]{2,100}$"),
        "Old permissive validation regex must be removed"
      );
    });
  });
});

