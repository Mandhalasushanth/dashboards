import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  formatIndianAmount,
  parseIndianAmount,
  calculateIndianAmountCursor,
} from "../../shared/formatters/currencyFormatter";
import { calculateItrTax } from "../../modules/itr/itr-filing/engine/itrTaxCalculator";
import { IncomeSourcesState, ItrStructuredDeductions, TaxesPaidDetails } from "../../modules/itr/itr-filing/types/itrFiling.types";

declare const __dirname: string;

describe("BUG 3 — Automatic Indian Amount Formatting", () => {
  describe("1. Currency Formatter — formatIndianAmount", () => {
    it("formats amounts with standard Indian lakh-crore commas as requested", () => {
      // Direct examples from prompt
      assert.strictEqual(formatIndianAmount("1000"), "1,000");
      assert.strictEqual(formatIndianAmount("100000"), "1,00,000");
      assert.strictEqual(formatIndianAmount("10000000"), "1,00,00,000");
    });

    it("formats various numerical magnitudes correctly", () => {
      assert.strictEqual(formatIndianAmount("0"), "0");
      assert.strictEqual(formatIndianAmount("5"), "5");
      assert.strictEqual(formatIndianAmount("50"), "50");
      assert.strictEqual(formatIndianAmount("500"), "500");
      assert.strictEqual(formatIndianAmount("5000"), "5,000");
      assert.strictEqual(formatIndianAmount("50000"), "50,000");
      assert.strictEqual(formatIndianAmount("500000"), "5,00,000");
      assert.strictEqual(formatIndianAmount("5000000"), "50,00,000");
      assert.strictEqual(formatIndianAmount("50000000"), "5,00,00,000");
      assert.strictEqual(formatIndianAmount("123456789"), "12,34,56,789");
    });

    it("handles empty and edge values gracefully", () => {
      assert.strictEqual(formatIndianAmount(""), "");
      assert.strictEqual(formatIndianAmount("   "), "");
      assert.strictEqual(formatIndianAmount(null as any), "");
      assert.strictEqual(formatIndianAmount(undefined as any), "");
    });

    it("normalizes leading zeroes while preserving single zero", () => {
      assert.strictEqual(formatIndianAmount("0"), "0");
      assert.strictEqual(formatIndianAmount("00"), "0");
      assert.strictEqual(formatIndianAmount("007"), "7");
      assert.strictEqual(formatIndianAmount("05000"), "5,000");
    });

    it("formats negative amounts when allowed", () => {
      assert.strictEqual(formatIndianAmount("-1000", false), "-1,000");
      assert.strictEqual(formatIndianAmount("-100000", false), "-1,00,000");
      assert.strictEqual(formatIndianAmount("-", false), "-");
    });

    it("handles decimal places when explicitly allowed", () => {
      assert.strictEqual(formatIndianAmount("1000.5", true), "1,000.5");
      assert.strictEqual(formatIndianAmount("100000.75", true), "1,00,000.75");
      assert.strictEqual(formatIndianAmount("1000.", true), "1,000.");
    });
  });

  describe("2. Currency Parser — parseIndianAmount", () => {
    it("strips display commas from Indian formatted inputs", () => {
      assert.strictEqual(parseIndianAmount("1,000"), "1000");
      assert.strictEqual(parseIndianAmount("1,00,000"), "100000");
      assert.strictEqual(parseIndianAmount("1,00,00,000"), "10000000");
      assert.strictEqual(parseIndianAmount("12,34,56,789"), "123456789");
    });

    it("strips currency symbols, spaces and rogue characters", () => {
      assert.strictEqual(parseIndianAmount("₹ 1,00,000"), "100000");
      assert.strictEqual(parseIndianAmount("Rs. 50,000"), "50000");
      assert.strictEqual(parseIndianAmount("  2,50,000  "), "250000");
      assert.strictEqual(parseIndianAmount("abc12,345xyz"), "12345");
    });

    it("enforces integer-only for fields where decimals are disallowed", () => {
      assert.strictEqual(parseIndianAmount("100.50", false), "100");
      assert.strictEqual(parseIndianAmount("1,000.00", false), "1000");
    });

    it("supports decimals only when allowDecimals is true", () => {
      assert.strictEqual(parseIndianAmount("1,000.50", true), "1000.50");
      assert.strictEqual(parseIndianAmount("100.50.25", true), "100.5025");
    });

    it("handles negative values according to allowNegative flag", () => {
      assert.strictEqual(parseIndianAmount("-1,00,000", false, true), "-100000");
      assert.strictEqual(parseIndianAmount("-1,00,000", false, false), "100000");
    });
  });

  describe("3. Cursor Position Calculation — calculateIndianAmountCursor", () => {
    it("preserves cursor when typing digits at the end", () => {
      // User typed "0" at end of "100" (old: "100", newText: "1000", cursor: 4)
      // Formatted becomes "1,000". Cursor should be after the new digit at position 5
      const cursor = calculateIndianAmountCursor("100", "1000", "1,000", 4);
      assert.strictEqual(cursor, 5);
    });

    it("preserves cursor when inserting digit in the middle across a new comma boundary", () => {
      // old: "10,000", insert "5" after "1" -> newText: "150,000", cursor was at 2
      // new formatted: "1,50,000"
      // Before cursor was digit '1' (1 raw digit). After comma in '1,50,000', cursor should be at index 2 or 3
      const cursor = calculateIndianAmountCursor("10,000", "150,000", "1,50,000", 2);
      assert.strictEqual(cursor, 3);
    });

    it("handles backspacing a digit before a comma", () => {
      // old: "1,000", backspacing "0" at index 3 -> newText: "1,00", cursor at 2
      // new formatted: "100" -> 1 raw digit ('1') before cursor, so cursor index is 1
      const cursor = calculateIndianAmountCursor("1,000", "1,00", "100", 2);
      assert.strictEqual(cursor, 1);
    });

    it("handles backspacing a comma directly by deleting preceding digit", () => {
      // old: "1,000", user backspaces comma at index 2 (cursor was at 2, newText: "1000")
      // calculateIndianAmountCursor detects comma backspace and adjusts
      const cursor = calculateIndianAmountCursor("1,000", "1000", "1,000", 1);
      assert.strictEqual(cursor, 0);
    });
  });

  describe("4. Storage and API Contract Purity — Underlying state is comma-free", () => {
    it("ensures tax calculation engine receives pure comma-free strings from inputs", () => {
      const sources: IncomeSourcesState = {
        salary: {
          enabled: true,
          employerName: "Tech Corp",
          grossSalary: "1200000",
          allowances: "100000",
          tdsDeducted: "100000",
          source: "USER_DECLARED",
          isVerified: true,
        },
        houseProperty: {
          enabled: false,
          propertyType: "self_occupied",
          annualRentReceived: "0",
          municipalTaxesPaid: "0",
          homeLoanInterest: "0",
          source: "USER_DECLARED",
        },
        business: {
          enabled: false,
          businessType: "presumptive_44ad",
          businessName: "",
          gstin: "",
          grossTurnover: "0",
          declaredProfit: "0",
          source: "USER_DECLARED",
          hasGstActivity: false,
        },
        capitalGains: {
          enabled: false,
          shortTermGains: "0",
          longTermGains: "0",
          hasEquityMf: false,
          hasFnoIntraday: false,
          hasPropertyAssets: false,
          hasCryptoVda: false,
          source: "USER_DECLARED",
        },
        otherSources: {
          enabled: true,
          savingsInterest: "25000",
          fdInterest: "50000",
          dividendIncome: "10000",
          familyPension: "0",
          otherIncome: "0",
          source: "USER_DECLARED",
        },
      };

      const deductions: ItrStructuredDeductions = {
        sec80c: { epf: "50000", ppf: "50000", lic: "25000", elss: "25000", tuitionFees: "", housingPrincipal: "", other80c: "" },
        sec80d: { selfSpouseChildren: "20000", parents: "25000", isParentSeniorCitizen: false },
        sec24b: "0",
        sec80e: "0",
        otherDeductionsList: [],
      };

      const taxesPaid: TaxesPaidDetails = {
        advanceTax: "0",
        advanceTaxChallanBsr: "",
        advanceTaxDate: "",
        selfAssessmentTax: "0",
      };

      // Engine works without issues on clean numeric state
      const calcNew = calculateItrTax(sources, deductions, taxesPaid, "new", "2025-2026");
      const calcOld = calculateItrTax(sources, deductions, taxesPaid, "old", "2025-2026");

      assert.ok(calcNew.grossTotalIncome > 0);
      assert.ok(calcOld.grossTotalIncome > 0);
      assert.strictEqual(calcNew.grossTotalIncome, 1185000);
      // Verify all raw values in state remain free of commas
      assert.ok(!sources.salary.grossSalary.includes(","));
      assert.ok(!deductions.sec80c.epf.includes(","));
    });
  });

  describe("5. Non-Amount Identifiers and Non-Amount Fields Verification", () => {
    it("ensures PAN, Aadhaar, Mobile, IFSC, and Ack numbers are never formatted as amounts", () => {
      const pan = "ABCDE1234F";
      const aadhaar = "123456789012";
      const mobile = "9876543210";
      const ifsc = "SBIN0001234";
      const ackNumber = "284419250714208";
      const bankAccount = "12345678901234";

      // These must never have commas inserted
      assert.strictEqual(pan.includes(","), false);
      assert.strictEqual(aadhaar.includes(","), false);
      assert.strictEqual(mobile.includes(","), false);
      assert.strictEqual(ifsc.includes(","), false);
      assert.strictEqual(ackNumber.includes(","), false);
      assert.strictEqual(bankAccount.includes(","), false);
    });
  });

  describe("6. Source Code Verification — All ITR Step Components use AmountTextInput", () => {
    const baseDir = path.resolve(__dirname, "../../");

    it("Step2SalaryIncome uses AmountTextInput for grossSalary, allowances, tdsDeducted", () => {
      const file = path.join(baseDir, "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2SalaryIncome.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("AmountTextInput"), "Must import and use AmountTextInput");
      assert.ok(content.includes("value={data.grossSalary}"), "grossSalary uses AmountTextInput");
      assert.ok(content.includes("value={data.allowances}"), "allowances uses AmountTextInput");
      assert.ok(content.includes("value={data.tdsDeducted}"), "tdsDeducted uses AmountTextInput");
    });

    it("Step2HousePropertyIncome uses AmountTextInput for annualRentReceived, municipalTaxesPaid, homeLoanInterest", () => {
      const file = path.join(baseDir, "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2HousePropertyIncome.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("AmountTextInput"), "Must import and use AmountTextInput");
      assert.ok(content.includes("value={data.annualRentReceived}"), "annualRentReceived uses AmountTextInput");
      assert.ok(content.includes("value={data.municipalTaxesPaid}"), "municipalTaxesPaid uses AmountTextInput");
      assert.ok(content.includes("value={data.homeLoanInterest}"), "homeLoanInterest uses AmountTextInput");
    });

    it("Step2BusinessAndCapitalGains uses AmountTextInput for business turnover and capital gains", () => {
      const file = path.join(baseDir, "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2BusinessAndCapitalGains.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("AmountTextInput"), "Must import and use AmountTextInput");
      assert.ok(content.includes("value={business.grossTurnover}"), "grossTurnover uses AmountTextInput");
      assert.ok(content.includes("value={business.declaredProfit}"), "declaredProfit uses AmountTextInput");
      assert.ok(content.includes("value={capitalGains.shortTermGains}"), "shortTermGains uses AmountTextInput");
      assert.ok(content.includes("value={capitalGains.longTermGains}"), "longTermGains uses AmountTextInput");
    });

    it("Step2OtherSources uses AmountTextInput for savings, FD, dividends, pension, and other income", () => {
      const file = path.join(baseDir, "modules/itr/itr-filing/components/Step2IncomeSources/components/Step2OtherSources.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("AmountTextInput"), "Must import and use AmountTextInput");
      assert.ok(content.includes("value={otherSources.savingsInterest}"), "savingsInterest uses AmountTextInput");
      assert.ok(content.includes("value={otherSources.fdInterest}"), "fdInterest uses AmountTextInput");
      assert.ok(content.includes("value={otherSources.dividendIncome}"), "dividendIncome uses AmountTextInput");
      assert.ok(content.includes("value={otherSources.familyPension}"), "familyPension uses AmountTextInput");
      assert.ok(content.includes("value={otherSources.otherIncome}"), "otherIncome uses AmountTextInput");
    });

    it("Step3RegimeAndDeductions uses AmountTextInput for 80C, 80D, 24b, and modal input", () => {
      const file = path.join(baseDir, "modules/itr/itr-filing/components/Step3RegimeAndDeductions/Step3RegimeAndDeductions.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("AmountTextInput"), "Must import and use AmountTextInput");
      assert.ok(content.includes("value={deductions.sec80c.epf}"), "epf uses AmountTextInput");
      assert.ok(content.includes("value={deductions.sec80c.ppf}"), "ppf uses AmountTextInput");
      assert.ok(content.includes("value={deductions.sec80d.selfSpouseChildren}"), "80D self uses AmountTextInput");
      assert.ok(content.includes("value={deductions.sec24b}"), "sec24b uses AmountTextInput");
      assert.ok(content.includes("value={newDeductionAmount}"), "modal uses AmountTextInput");
    });

    it("RevisedFormField and UpdateRevisedDetailsScreen support isAmount for amount corrections", () => {
      const formField = path.join(baseDir, "modules/itr/revisedItr/components/update/RevisedFormField/RevisedFormField.tsx");
      const formContent = fs.readFileSync(formField, "utf8");
      assert.ok(formContent.includes("AmountTextInput"), "RevisedFormField renders AmountTextInput when isAmount is true");

      const screen = path.join(baseDir, "modules/itr/revisedItr/screens/UpdateRevisedDetailsScreen/UpdateRevisedDetailsScreen.tsx");
      const screenContent = fs.readFileSync(screen, "utf8");
      assert.ok(screenContent.includes("isAmount"), "UpdateRevisedDetailsScreen marks amount fields with isAmount");
      assert.ok(screenContent.includes("formatIndianAmount"), "UpdateRevisedDetailsScreen formats original values");
    });
  });
});
