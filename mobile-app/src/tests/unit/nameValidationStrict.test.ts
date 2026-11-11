import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  sanitizeNameInput,
  sanitizeNameOnBlur,
  isValidName,
  getNameValidationError,
  STRICT_NAME_REGEX,
} from "../../shared/validators/nameValidator";

describe("Bug 2 — Strict Validation for All Name Fields", () => {
  describe("1. Real-time Input Sanitization (sanitizeNameInput)", () => {
    it("accepts valid single-word and multi-word English alphabetic names", () => {
      assert.equal(sanitizeNameInput("John"), "John");
      assert.equal(sanitizeNameInput("John Doe"), "John Doe");
      assert.equal(sanitizeNameInput("State Bank of India"), "State Bank of India");
      assert.equal(sanitizeNameInput("Acme Technologies Limited"), "Acme Technologies Limited");
    });

    it("accepts mixed case letters", () => {
      assert.equal(sanitizeNameInput("hDfC"), "hDfC");
      assert.equal(sanitizeNameInput("McDONALD"), "McDONALD");
    });

    it("rejects leading spaces immediately", () => {
      assert.equal(sanitizeNameInput(" "), "");
      assert.equal(sanitizeNameInput("   "), "");
      assert.equal(sanitizeNameInput(" John"), "John");
      assert.equal(sanitizeNameInput("   State Bank"), "State Bank");
    });

    it("allows a single trailing space while actively typing the next word", () => {
      assert.equal(sanitizeNameInput("John "), "John ");
      assert.equal(sanitizeNameInput("State Bank "), "State Bank ");
    });

    it("rejects consecutive spaces immediately and collapses them to a single space", () => {
      assert.equal(sanitizeNameInput("John  "), "John ");
      assert.equal(sanitizeNameInput("John   "), "John ");
      assert.equal(sanitizeNameInput("John  Doe"), "John Doe");
      assert.equal(sanitizeNameInput("State    Bank   of     India"), "State Bank of India");
    });

    it("rejects numbers immediately", () => {
      assert.equal(sanitizeNameInput("123"), "");
      assert.equal(sanitizeNameInput("John123"), "John");
      assert.equal(sanitizeNameInput("3M India"), "M India");
      assert.equal(sanitizeNameInput("HDFC01"), "HDFC");
      assert.equal(sanitizeNameInput("Acme 2024 Tech"), "Acme  Tech".replace(/\s+/g, " "));
    });

    it("rejects dots and periods immediately (no punctuation exceptions)", () => {
      assert.equal(sanitizeNameInput("P.S. Enterprises"), "PS Enterprises");
      assert.equal(sanitizeNameInput("St. John"), "St John");
      assert.equal(sanitizeNameInput("Acme Inc."), "Acme Inc");
    });

    it("rejects commas immediately", () => {
      assert.equal(sanitizeNameInput("Acme, Inc"), "Acme Inc");
      assert.equal(sanitizeNameInput("Doe, John"), "Doe John");
    });

    it("rejects hyphens and dashes immediately", () => {
      assert.equal(sanitizeNameInput("Tata-Sons"), "TataSons");
      assert.equal(sanitizeNameInput("Indo-German Tech"), "IndoGerman Tech");
    });

    it("rejects apostrophes and quotes immediately", () => {
      assert.equal(sanitizeNameInput("O'Brian"), "OBrian");
      assert.equal(sanitizeNameInput("McDonald's"), "McDonalds");
    });

    it("rejects ampersands (&) and symbols immediately", () => {
      assert.equal(sanitizeNameInput("Tata & Sons"), "Tata  Sons".replace(/\s+/g, " "));
      assert.equal(sanitizeNameInput("AT&T"), "ATT");
      assert.equal(sanitizeNameInput("Bank@#$!%"), "Bank");
      assert.equal(sanitizeNameInput("ICICI_BANK"), "ICICIBANK");
    });

    it("rejects emojis and unicode symbols immediately", () => {
      assert.equal(sanitizeNameInput("John 😀"), "John ");
      assert.equal(sanitizeNameInput("🚀 Rocket Corp"), "Rocket Corp");
      assert.equal(sanitizeNameInput("🏦 State Bank 🇮🇳"), "State Bank ");
    });

    it("rejects non-English alphabetic scripts (Hindi, Devanagari, Arabic, Chinese)", () => {
      assert.equal(sanitizeNameInput("भारतीय स्टेट बैंक"), "");
      assert.equal(sanitizeNameInput("بنك"), "");
      assert.equal(sanitizeNameInput("中国银行"), "");
    });

    it("handles null, undefined and empty string safely", () => {
      assert.equal(sanitizeNameInput(""), "");
      assert.equal(sanitizeNameInput(null), "");
      assert.equal(sanitizeNameInput(undefined), "");
    });
  });

  describe("2. On-Blur and Submission Sanitization (sanitizeNameOnBlur)", () => {
    it("strips trailing spaces on blur", () => {
      assert.equal(sanitizeNameOnBlur("John "), "John");
      assert.equal(sanitizeNameOnBlur("State Bank of India   "), "State Bank of India");
    });

    it("sanitizes invalid characters and trims completely", () => {
      assert.equal(sanitizeNameOnBlur("  John. Doe 123  "), "John Doe");
      assert.equal(sanitizeNameOnBlur("  P.S. Enterprises & Co.  "), "PS Enterprises  Co".replace(/\s+/g, " ").trim());
    });
  });

  describe("3. Strict Validity Validation (isValidName)", () => {
    it("accepts valid names conforming to letters and single spaces", () => {
      assert.equal(isValidName("John Doe"), true);
      assert.equal(isValidName("State Bank of India"), true);
      assert.equal(isValidName("Acme Technologies"), true);
      assert.equal(isValidName("Al"), true);
    });

    it("rejects names shorter than minLength", () => {
      assert.equal(isValidName("A", 2), false);
      assert.equal(isValidName("", 2), false);
      assert.equal(isValidName(null, 2), false);
      assert.equal(isValidName(undefined, 2), false);
    });

    it("rejects names longer than maxLength", () => {
      const longName = "A".repeat(101);
      assert.equal(isValidName(longName, 2, 100), false);
    });

    it("rejects whitespace-only or empty strings", () => {
      assert.equal(isValidName("   "), false);
      assert.equal(isValidName(""), false);
    });

    it("rejects consecutive spaces", () => {
      assert.equal(isValidName("John  Doe"), false);
      assert.equal(isValidName("State   Bank"), false);
    });

    it("rejects punctuation, numbers, symbols and emojis", () => {
      assert.equal(isValidName("John.Doe"), false);
      assert.equal(isValidName("John123"), false);
      assert.equal(isValidName("Tata & Sons"), false);
      assert.equal(isValidName("O'Brian"), false);
      assert.equal(isValidName("Indo-German"), false);
      assert.equal(isValidName("John 😀"), false);
    });
  });

  describe("4. Field-Specific Error Messaging (getNameValidationError)", () => {
    it("returns required message for missing required fields", () => {
      assert.equal(getNameValidationError("", "Employer Legal Name"), "Employer Legal Name is required");
      assert.equal(getNameValidationError("   ", "Business Legal Name"), "Business Legal Name is required");
      assert.equal(getNameValidationError(null, "Account Holder Name"), "Account Holder Name is required");
      assert.equal(getNameValidationError(undefined, "Bank Name"), "Bank Name is required");
    });

    it("returns null for empty optional fields", () => {
      assert.equal(getNameValidationError("", "Branch Name", { required: false }), null);
      assert.equal(getNameValidationError(null, "Branch Name", { required: false }), null);
    });

    it("returns length error if name is too short", () => {
      assert.equal(getNameValidationError("A", "Bank Name", { minLength: 2 }), "Bank Name must be at least 2 characters");
    });

    it("returns length error if name exceeds maxLength", () => {
      assert.equal(
        getNameValidationError("A".repeat(65), "Branch Name", { maxLength: 60 }),
        "Branch Name must not exceed 60 characters"
      );
    });

    it("returns format error if name contains disallowed characters", () => {
      assert.equal(
        getNameValidationError("Tata & Sons", "Company Name"),
        "Company Name must contain English letters and single spaces only"
      );
      assert.equal(
        getNameValidationError("John.Doe", "Personal Name"),
        "Personal Name must contain English letters and single spaces only"
      );
      assert.equal(
        getNameValidationError("Acme 123", "Business Legal Name"),
        "Business Legal Name must contain English letters and single spaces only"
      );
    });

    it("returns null for completely valid name", () => {
      assert.equal(getNameValidationError("State Bank of India", "Bank Name"), null);
      assert.equal(getNameValidationError("John Doe", "Account Holder Name"), null);
    });
  });

  describe("5. Wiring Verification Across All Target Components", () => {
    const baseDir = path.resolve(__dirname, "../../..");

    it("verifies Step2SalaryIncome.tsx wires sanitizeNameInput and sanitizeNameOnBlur to employerName", () => {
      const file = path.join(
        baseDir,
        "src/modules/itr/itr-filing/components/Step2IncomeSources/components/Step2SalaryIncome.tsx"
      );
      const code = fs.readFileSync(file, "utf-8");
      assert.ok(code.includes("sanitizeNameInput"), "Must import or call sanitizeNameInput");
      assert.ok(code.includes("sanitizeNameOnBlur"), "Must import or call sanitizeNameOnBlur");
      assert.ok(code.includes("employerName: sanitizeNameInput(val)"));
    });

    it("verifies validateIncomeSources.ts enforces isValidName on employerLegalName", () => {
      const file = path.join(
        baseDir,
        "src/modules/itr/itr-filing/components/Step2IncomeSources/utils/validateIncomeSources.ts"
      );
      const code = fs.readFileSync(file, "utf-8");
      assert.ok(code.includes("isValidName(sources.salary.employerName, 2, 100)"));
    });

    it("verifies BankSelectorModal.tsx sanitizes both bankName and branchName", () => {
      const file = path.join(
        baseDir,
        "src/modules/itr/components/BankSelectorModal/BankSelectorModal.tsx"
      );
      const code = fs.readFileSync(file, "utf-8");
      assert.ok(code.includes("handleBranchNameChange"));
      assert.ok(code.includes("sanitizeNameOnBlur(branchName)"));
      assert.ok(code.includes("isValidName(cleanBranchName, 2, 60)"));
    });

    it("verifies BusinessDetailsSection.tsx sanitizes legalName", () => {
      const file = path.join(
        baseDir,
        "src/modules/itr/tds/screens/TdsRefundFormScreen/BusinessDetailsSection.tsx"
      );
      const code = fs.readFileSync(file, "utf-8");
      assert.ok(code.includes("sanitizeNameInput(t)"));
      assert.ok(code.includes("sanitizeNameOnBlur(business.legalName)"));
    });

    it("verifies RefundBankAccountSection.tsx sanitizes accountHolderName, bankName and branchName", () => {
      const file = path.join(
        baseDir,
        "src/modules/itr/tds/screens/TdsRefundFormScreen/RefundBankAccountSection.tsx"
      );
      const code = fs.readFileSync(file, "utf-8");
      assert.ok(code.includes("sanitizeNameInput(t)"));
      assert.ok(code.includes("sanitizeNameOnBlur(bank.accountHolderName)"));
      assert.ok(code.includes("sanitizeNameOnBlur(bank.bankName)"));
      assert.ok(code.includes("sanitizeNameOnBlur(bank.branchName)"));
    });

    it("verifies tdsCustomerSchema.ts uses isValidName for fullName, legalName, accountHolderName, and bankName", () => {
      const file = path.join(
        baseDir,
        "src/modules/itr/tds/validation/tdsCustomerSchema.ts"
      );
      const code = fs.readFileSync(file, "utf-8");
      assert.ok(code.includes("isValidName(personal.fullName.trim()"));
      assert.ok(code.includes("isValidName(trimmed"));
      assert.ok(code.includes("isValidName(bank.accountHolderName.trim()"));
      assert.ok(code.includes("isValidName(bank.bankName.trim()"));
    });

    it("verifies Step1PersonalInfo.tsx validates personalInfo.name, bankName and branchName", () => {
      const file = path.join(
        baseDir,
        "src/modules/itr/itr-filing/components/Step1PersonalInfo/Step1PersonalInfo.tsx"
      );
      const code = fs.readFileSync(file, "utf-8");
      assert.ok(code.includes("isValidName(personalInfo.name.trim()"));
      assert.ok(code.includes("isValidBankName(bankDetails.bankName.trim())"));
      assert.ok(code.includes("isValidName(bankDetails.branchName.trim()"));
    });
  });

  describe("6. Prefilled Data Integrity & Validation Path", () => {
    it("accepts valid prefilled profile names without modification", () => {
      const prefilled = "Prakash Sharma";
      assert.equal(isValidName(prefilled), true);
      assert.equal(sanitizeNameOnBlur(prefilled), prefilled);
    });

    it("identifies prefilled names with dots as invalid without silent destruction", () => {
      const prefilled = "Prakash S. Sharma";
      assert.equal(isValidName(prefilled), false);
      const error = getNameValidationError(prefilled, "Full Legal Name");
      assert.equal(error, "Full Legal Name must contain English letters and single spaces only");
      // Original data remains intact for the user to view and correct
      assert.equal(prefilled, "Prakash S. Sharma");
    });

    it("identifies prefilled names with numbers as invalid", () => {
      const prefilled = "Prakash 007";
      assert.equal(isValidName(prefilled), false);
      assert.equal(
        getNameValidationError(prefilled, "Full Legal Name"),
        "Full Legal Name must contain English letters and single spaces only"
      );
    });

    it("identifies prefilled names with emojis as invalid", () => {
      const prefilled = "Prakash 🌟";
      assert.equal(isValidName(prefilled), false);
      assert.equal(
        getNameValidationError(prefilled, "Full Legal Name"),
        "Full Legal Name must contain English letters and single spaces only"
      );
    });

    it("identifies prefilled names with repeated/consecutive spaces as invalid", () => {
      const prefilled = "Prakash  Sharma";
      assert.equal(isValidName(prefilled), false);
      assert.equal(
        getNameValidationError(prefilled, "Full Legal Name"),
        "Full Legal Name must contain English letters and single spaces only"
      );
    });
  });
});
