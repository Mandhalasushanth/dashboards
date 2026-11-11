import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { determineApplicableItrForm } from "../../modules/itr/itr-filing/engine/itrFormEngine";
import { IncomeSourcesState } from "../../modules/itr/itr-filing/types/itrFiling.types";

function createInitialSources(): IncomeSourcesState {
  return {
    salary: {
      enabled: true,
      employerName: "Acme Corp",
      employerType: "private",
      grossSalary: "1200000",
      allowances: "100000",
      deductions16: "50000",
      standardDeduction: "50000",
      professionalTax: "2400",
      tdsDeducted: "120000",
    },
    houseProperty: {
      enabled: false,
      propertyType: "self_occupied",
      annualRentReceived: "0",
      municipalTaxes: "0",
      homeLoanInterest: "0",
      standardDeduction: "0",
      netIncome: "0",
    },
    business: {
      enabled: false,
      businessType: "presumptive_44ad",
      businessName: "",
      grossTurnover: "0",
      declaredProfit: "0",
      presumptiveRate: 8,
    },
    capitalGains: {
      enabled: false,
      shortTermGains: "0",
      longTermGains: "0",
      hasEquityMf: false,
      hasFnoIntraday: false,
      hasPropertyAssets: false,
      hasCryptoVda: false,
    },
    otherSources: {
      enabled: false,
      savingsInterest: "0",
      fdInterest: "0",
      dividendIncome: "0",
      familyPension: "0",
      otherIncome: "0",
    },
  };
}

describe("BUG 2 — Remove Applicable Return Form Card from Step 2", () => {
  describe("1. Source Code Verification — UI Card Removal in Step2IncomeSources.tsx", () => {
    const compPath = path.resolve(
      __dirname,
      "../../modules/itr/itr-filing/components/Step2IncomeSources/Step2IncomeSources.tsx"
    );
    const content = fs.readFileSync(compPath, "utf-8");

    it("does NOT contain 'Applicable Return Form' heading", () => {
      assert.ok(
        !content.includes("Applicable Return Form"),
        "Step 2 must not render the 'Applicable Return Form' title"
      );
    });

    it("does NOT reference determination card or form badge styles in JSX", () => {
      assert.ok(!content.includes("styles.determinationCard"));
      assert.ok(!content.includes("styles.determinationHeaderRow"));
      assert.ok(!content.includes("styles.determinationTitleCol"));
      assert.ok(!content.includes("styles.determinationTitle"));
      assert.ok(!content.includes("styles.formBadge"));
      assert.ok(!content.includes("styles.formBadgeText"));
      assert.ok(!content.includes("styles.determinationRationale"));
      assert.ok(!content.includes("styles.determinationCriteriaList"));
      assert.ok(!content.includes("styles.determinationCriteriaRow"));
      assert.ok(!content.includes("styles.determinationCriteriaText"));
    });

    it("does NOT render ITR form badge, rationale, or criteria checks in Step 2", () => {
      assert.ok(!content.includes("determinedForm.form"));
      assert.ok(!content.includes("determinedForm.rationale"));
      assert.ok(!content.includes("determinedForm.criteriaChecks"));
    });

    it("begins screen directly with Income Sources & Activity section", () => {
      assert.ok(
        content.includes("<Text style={styles.sectionTitle}>Income Sources & Activity</Text>")
      );
    });

    it("preserves Step2IncomeSourcesProps interface with optional determinedForm to maintain caller contracts", () => {
      assert.ok(
        content.includes("determinedForm?: DeterminedFormInfo"),
        "Step2IncomeSourcesProps must maintain determinedForm prop for backwards compatibility"
      );
    });
  });

  describe("2. Style Verification — Associated Card Styles Removed in Step2IncomeSources.styles.ts", () => {
    const stylesPath = path.resolve(
      __dirname,
      "../../modules/itr/itr-filing/components/Step2IncomeSources/Step2IncomeSources.styles.ts"
    );
    const content = fs.readFileSync(stylesPath, "utf-8");

    it("does NOT contain determinationCard styling", () => {
      assert.ok(!content.includes("determinationCard:"));
    });

    it("does NOT contain determinationHeaderRow or determinationTitleCol", () => {
      assert.ok(!content.includes("determinationHeaderRow:"));
      assert.ok(!content.includes("determinationTitleCol:"));
    });

    it("does NOT contain formBadge or formBadgeText styling", () => {
      assert.ok(!content.includes("formBadge:"));
      assert.ok(!content.includes("formBadgeText:"));
    });

    it("does NOT contain determinationRationale or determinationCriteriaList styling", () => {
      assert.ok(!content.includes("determinationRationale:"));
      assert.ok(!content.includes("determinationCriteriaList:"));
      assert.ok(!content.includes("determinationCriteriaRow:"));
      assert.ok(!content.includes("determinationCriteriaText:"));
    });

    it("preserves container, sectionTitle, sectionSubtitle, and chip styles", () => {
      assert.ok(content.includes("container:"));
      assert.ok(content.includes("sectionTitle:"));
      assert.ok(content.includes("sectionSubtitle:"));
      assert.ok(content.includes("sourceSelectorCard:"));
      assert.ok(content.includes("sourceChipsRow:"));
      assert.ok(content.includes("sourceChip:"));
    });
  });

  describe("3. Engine Logic Verification — ITR Form Determination Calculation Preserved", () => {
    it("correctly determines ITR-1 (Sahaj) for resident salaried individuals", () => {
      const sources = createInitialSources();
      const result = determineApplicableItrForm(sources, "Resident", 1200000, "2025-2026");
      assert.equal(result.form, "ITR-1");
      assert.ok(result.formTitle.includes("ITR-1"));
      assert.ok(result.criteriaChecks && result.criteriaChecks.length > 0);
    });

    it("correctly determines ITR-2 for individuals with capital gains", () => {
      const sources = createInitialSources();
      sources.capitalGains.enabled = true;
      sources.capitalGains.hasEquityMf = true;
      sources.capitalGains.shortTermGains = "50000";
      const result = determineApplicableItrForm(sources, "Resident", 1250000, "2025-2026");
      assert.equal(result.form, "ITR-2");
    });

    it("correctly determines ITR-3 for business income with regular books or F&O trading", () => {
      const sources = createInitialSources();
      sources.business.enabled = true;
      sources.business.businessType = "regular_books";
      sources.business.grossTurnover = "2500000";
      sources.business.declaredProfit = "500000";
      const result = determineApplicableItrForm(sources, "Resident", 2500000, "2025-2026");
      assert.equal(result.form, "ITR-3");
    });

    it("correctly determines ITR-4 (Sugam) for presumptive business income under 44AD", () => {
      const sources = createInitialSources();
      sources.business.enabled = true;
      sources.business.businessType = "presumptive_44ad";
      sources.business.grossTurnover = "2000000";
      sources.business.declaredProfit = "200000";
      const result = determineApplicableItrForm(sources, "Resident", 2000000, "2025-2026");
      assert.equal(result.form, "ITR-4");
    });
  });

  describe("4. Step 2 Income Sources Selection & Validation Functionality Preserved", () => {
    const compPath = path.resolve(
      __dirname,
      "../../modules/itr/itr-filing/components/Step2IncomeSources/Step2IncomeSources.tsx"
    );
    const content = fs.readFileSync(compPath, "utf-8");

    it("preserves income source chip triggers (salary, houseProperty, business, capitalGains, otherSources)", () => {
      assert.ok(content.includes("onUpdateSalary({ enabled: !sources.salary.enabled })"));
      assert.ok(
        content.includes("onUpdateHouseProperty({ enabled: !sources.houseProperty.enabled })")
      );
      assert.ok(content.includes("onUpdateBusiness({ enabled: !sources.business.enabled })"));
      assert.ok(
        content.includes("onUpdateCapitalGains({ enabled: !sources.capitalGains.enabled })")
      );
      assert.ok(
        content.includes("onUpdateOtherSources({ enabled: !sources.otherSources.enabled })")
      );
    });

    it("preserves child sub-forms for enabled sections", () => {
      assert.ok(content.includes("<Step2SalaryIncome"));
      assert.ok(content.includes("<Step2HousePropertyIncome"));
      assert.ok(content.includes("<BusinessIncomeForm"));
      assert.ok(content.includes("<CapitalGainsIncomeForm"));
      assert.ok(content.includes("<OtherSourcesIncomeForm"));
    });

    it("preserves Continue and Update & Continue action buttons", () => {
      assert.ok(content.includes("Confirm & Continue to Deductions"));
      assert.ok(content.includes("Update & Continue"));
      assert.ok(content.includes("handleProceed"));
    });

    it("preserves full input validation rules before proceeding", () => {
      assert.ok(content.includes("const validateInputs = (): boolean => {"));
      assert.ok(content.includes("Income Source Required"));
      assert.ok(content.includes("Salary Details Required"));
      assert.ok(content.includes("Business Details Required"));
      assert.ok(content.includes("Capital Gains Details Required"));
      assert.ok(content.includes("Other Sources Required"));
    });
  });
});

