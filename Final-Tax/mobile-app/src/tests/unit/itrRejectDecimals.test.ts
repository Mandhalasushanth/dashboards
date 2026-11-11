import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  parseIndianAmount,
  formatIndianAmount,
  toRawNumericString,
} from "../../shared/formatters/currencyFormatter";

declare const __dirname: string;

describe("BUG 4 — Reject Decimal Points in Numeric Fields", () => {
  describe("1. Currency Parser — parseIndianAmount (Pasting & Integer-Only Rules)", () => {
    it("pasting values such as '100.50' drops the decimal point and fractional portion", () => {
      assert.strictEqual(parseIndianAmount("100.50", false), "100");
      assert.strictEqual(parseIndianAmount("100.75", false), "100");
      assert.strictEqual(parseIndianAmount("1,000.00", false), "1000");
      assert.strictEqual(parseIndianAmount("1,00,000.50", false), "100000");
      assert.strictEqual(parseIndianAmount("50000.99", false), "50000");
    });

    it("pasting edge-case decimal strings cleanly removes fractional parts", () => {
      assert.strictEqual(parseIndianAmount("0.99", false), "0");
      assert.strictEqual(parseIndianAmount(".50", false), "");
      assert.strictEqual(parseIndianAmount("100.", false), "100");
      assert.strictEqual(parseIndianAmount("100.50.25", false), "100");
      assert.strictEqual(parseIndianAmount("₹ 1,00,000.50", false), "100000");
      assert.strictEqual(parseIndianAmount("Rs. 25,000.75", false), "25000");
    });

    it("preserves negative amounts without fractional parts when allowNegative is true", () => {
      assert.strictEqual(parseIndianAmount("-100.50", false, true), "-100");
      assert.strictEqual(parseIndianAmount("-1,000.25", false, true), "-1000");
      assert.strictEqual(parseIndianAmount("-0.50", false, true), "-0");
    });

    it("preserves decimal points and fractions only when allowDecimals is explicitly true", () => {
      assert.strictEqual(parseIndianAmount("100.50", true), "100.50");
      assert.strictEqual(parseIndianAmount("1,00,000.75", true), "100000.75");
    });
  });

  describe("2. Currency Formatter — formatIndianAmount with Integer-Only Settings", () => {
    it("formats integer-only numbers by discarding any decimals", () => {
      assert.strictEqual(formatIndianAmount("100.50", false), "100");
      assert.strictEqual(formatIndianAmount("100000.75", false), "1,00,000");
      assert.strictEqual(formatIndianAmount("10000000.99", false), "1,00,00,000");
    });

    it("formats with decimal fractions when allowDecimals is true", () => {
      assert.strictEqual(formatIndianAmount("1000.5", true), "1,000.5");
      assert.strictEqual(formatIndianAmount("100000.75", true), "1,00,000.75");
    });
  });

  describe("3. Raw Numeric String Helper — toRawNumericString with Integer Limits", () => {
    it("discards fraction when maxDecimals is 0", () => {
      assert.strictEqual(toRawNumericString("100.50", 0), "100");
      assert.strictEqual(toRawNumericString("1,000.75", 0), "1000");
    });

    it("preserves fraction when maxDecimals > 0", () => {
      assert.strictEqual(toRawNumericString("100.50", 2), "100.50");
    });
  });

  describe("4. AmountTextInput Typing Behavior — Immediate Rejection of '.'", () => {
    // Simulate AmountTextInput.handleChangeText logic for typing vs pasting
    function simulateAmountTextInputChange(
      currentRaw: string,
      currentDisplay: string,
      incomingText: string,
      allowDecimals: boolean = false
    ): { raw: string; formatted: string; rejected: boolean } {
      let cleanText = incomingText;
      let rejected = false;

      if (!allowDecimals && incomingText.includes(".")) {
        const rawWithoutDots = incomingText.replace(/\./g, "");
        const digitsOnly = rawWithoutDots.replace(/[^0-9]/g, "");
        const oldDigits = currentRaw.replace(/[^0-9]/g, "");
        if (digitsOnly === oldDigits) {
          cleanText = rawWithoutDots;
          rejected = true;
        }
      }

      const raw = parseIndianAmount(cleanText, allowDecimals);
      const formatted = formatIndianAmount(raw, allowDecimals);
      return { raw, formatted, rejected };
    }

    it("immediately rejects typing '.' on an empty field", () => {
      const result = simulateAmountTextInputChange("", "", ".");
      assert.strictEqual(result.rejected, true);
      assert.strictEqual(result.raw, "");
      assert.strictEqual(result.formatted, "");
    });

    it("immediately rejects typing '.' at the end of a number", () => {
      const result = simulateAmountTextInputChange("1000", "1,000", "1,000.");
      assert.strictEqual(result.rejected, true);
      assert.strictEqual(result.raw, "1000");
      assert.strictEqual(result.formatted, "1,000");
    });

    it("immediately rejects typing '.' in the middle of a number without deleting digits", () => {
      const result = simulateAmountTextInputChange("1234", "1,234", "12.,34");
      assert.strictEqual(result.rejected, true);
      assert.strictEqual(result.raw, "1234");
      assert.strictEqual(result.formatted, "1,234");
    });

    it("immediately strips decimal and fraction when pasting into an existing field", () => {
      const result = simulateAmountTextInputChange("500", "500", "100.50");
      assert.strictEqual(result.rejected, false);
      assert.strictEqual(result.raw, "100");
      assert.strictEqual(result.formatted, "100");
    });
  });

  describe("5. Component Audit — All ITR Filing numeric fields enforce integer-only by default", () => {
    const baseDir = path.resolve(__dirname, "../../");

    it("AmountTextInput component defaults allowDecimals to false", () => {
      const file = path.join(baseDir, "shared/components/AmountTextInput/AmountTextInput.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("allowDecimals = false"), "Default allowDecimals must be false");
      assert.ok(content.includes("digitsOnly === oldDigits"), "Must reject '.' typing keystroke immediately");
    });

    it("Step 2 amount inputs do not enable decimals", () => {
      const files = [
        "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2SalaryIncome.tsx",
        "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2HousePropertyIncome.tsx",
        "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2BusinessAndCapitalGains.tsx",
        "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2OtherSources.tsx",
      ];
      for (const rel of files) {
        const content = fs.readFileSync(path.join(baseDir, rel), "utf8");
        assert.ok(!content.includes("allowDecimals={true}"), `${rel} must not allow decimals`);
      }
    });

    it("Step 3 deduction inputs do not enable decimals", () => {
      const file = path.join(baseDir, "modules/itr/itr-filing/components/Step3RegimeAndDeductions/Step3RegimeAndDeductions.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(!content.includes("allowDecimals={true}"), "Step3 deductions must not allow decimals");
    });

    it("Revised ITR amount correction inputs do not enable decimals", () => {
      const file = path.join(baseDir, "modules/itr/revisedItr/screens/UpdateRevisedDetailsScreen/UpdateRevisedDetailsScreen.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(!content.includes("allowDecimals={true}"), "Revised ITR fields must not allow decimals");
    });
  });
});
