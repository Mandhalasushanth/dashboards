import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateSingleField,
  validateAllRevisedFields,
} from "../../modules/itr/revisedItr/utils/revisedFieldValidation";

describe("Revised ITR — Step 3 Real-Time Field Validation", () => {
  describe("validateSingleField", () => {
    it("requires salaryBusinessIncome for missed_income", () => {
      const errEmpty = validateSingleField("salaryBusinessIncome", "", "missed_income");
      assert.strictEqual(errEmpty, "Salary / Business income is required.");

      const errValid = validateSingleField("salaryBusinessIncome", "850000", "missed_income");
      assert.strictEqual(errValid, undefined);
    });

    it("requires taxableIncome for all income/deduction scenarios", () => {
      const errEmpty = validateSingleField("taxableIncome", "", "missed_income");
      assert.strictEqual(errEmpty, "Taxable income is required.");

      const errZero = validateSingleField("taxableIncome", "0", "missed_income");
      assert.strictEqual(errZero, undefined);

      const errValid = validateSingleField("taxableIncome", "720000", "wrong_deduction");
      assert.strictEqual(errValid, undefined);
    });

    it("enforces Section 80C statutory limit of ₹1,50,000", () => {
      const errWithinLimit = validateSingleField("sec80c", "150000", "wrong_deduction");
      assert.strictEqual(errWithinLimit, undefined);

      const errAboveLimit = validateSingleField("sec80c", "180000", "wrong_deduction");
      assert.strictEqual(errAboveLimit, "Section 80C deduction cannot exceed ₹1,50,000.");
    });

    it("enforces Section 80D limit of ₹1,00,000", () => {
      const errWithinLimit = validateSingleField("sec80d", "75000", "wrong_deduction");
      assert.strictEqual(errWithinLimit, undefined);

      const errAboveLimit = validateSingleField("sec80d", "125000", "wrong_deduction");
      assert.strictEqual(errAboveLimit, "Section 80D deduction cannot exceed ₹1,00,000.");
    });

    it("enforces Section 24 Home Loan Interest limit of ₹2,00,000", () => {
      const errWithinLimit = validateSingleField("homeLoanInterest", "200000", "wrong_deduction");
      assert.strictEqual(errWithinLimit, undefined);

      const errAboveLimit = validateSingleField("homeLoanInterest", "250000", "wrong_deduction");
      assert.strictEqual(errAboveLimit, "Home loan interest deduction cannot exceed ₹2,00,000.");
    });

    it("validates bank account number length (9 to 18 digits)", () => {
      const errTooShort = validateSingleField("bankAccount", "12345", "incorrect_bank");
      assert.ok(errTooShort && errTooShort.includes("between 9 and 18"));

      const errValid = validateSingleField("bankAccount", "123456789012", "incorrect_bank");
      assert.strictEqual(errValid, undefined);
    });

    it("validates IFSC code structure", () => {
      const errInvalid = validateSingleField("ifsc", "INVALID123", "incorrect_bank");
      assert.ok(errInvalid && errInvalid.includes("11-character"));

      const errValid = validateSingleField("ifsc", "SBIN0001234", "incorrect_bank");
      assert.strictEqual(errValid, undefined);
    });
  });

  describe("validateAllRevisedFields", () => {
    it("flags missing fields for missed_income", () => {
      const errors = validateAllRevisedFields({}, "missed_income");
      assert.ok(errors.salaryBusinessIncome);
      assert.ok(errors.taxableIncome);
    });

    it("passes when valid missed_income fields are entered", () => {
      const errors = validateAllRevisedFields(
        { salaryBusinessIncome: "900000", taxableIncome: "750000" },
        "missed_income"
      );
      assert.strictEqual(Object.keys(errors).length, 0);
    });

    it("requires at least one deduction and taxable income for wrong_deduction", () => {
      const errors = validateAllRevisedFields({}, "wrong_deduction");
      assert.ok(errors.taxableIncome);
      assert.ok(errors.sec80c);
    });

    it("passes when valid deduction and taxable income are present", () => {
      const errors = validateAllRevisedFields(
        { taxableIncome: "600000", sec80c: "120000" },
        "wrong_deduction"
      );
      assert.strictEqual(Object.keys(errors).length, 0);
    });

    it("validates refund bank details for incorrect_bank", () => {
      const errors = validateAllRevisedFields({}, "incorrect_bank");
      assert.ok(errors.bankAccount);
      assert.ok(errors.ifsc);
    });

    it("passes when valid bank details are present", () => {
      const errors = validateAllRevisedFields(
        { bankAccount: "987654321012", ifsc: "HDFC0000123" },
        "incorrect_bank"
      );
      assert.strictEqual(Object.keys(errors).length, 0);
    });
  });
});
