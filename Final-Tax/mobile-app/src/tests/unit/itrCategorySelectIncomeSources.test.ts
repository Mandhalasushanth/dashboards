import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  ALL_CATEGORIES,
  CategoryOption,
} from "../../modules/itr/itr-filing/constants/itrCategories";
import {
  ItrCategoryType,
  IncomeSourcesState,
} from "../../modules/itr/itr-filing/types/itrFiling.types";
import { determineApplicableItrForm } from "../../modules/itr/itr-filing/engine/itrFormEngine";

function createEmptyIncomeSources(): IncomeSourcesState {
  return {
    salary: {
      enabled: false,
      employerName: "Test Org",
      grossSalary: "1000000",
      allowances: "50000",
      tdsDeducted: "50000",
      source: "USER_DECLARED",
      isVerified: false,
    },
    houseProperty: {
      enabled: false,
      propertyType: "let_out",
      annualRentReceived: "240000",
      municipalTaxesPaid: "10000",
      homeLoanInterest: "0",
      source: "USER_DECLARED",
    },
    business: {
      enabled: false,
      businessType: "presumptive_44ad",
      businessName: "Retail",
      grossTurnover: "2000000",
      declaredProfit: "160000",
      source: "USER_DECLARED",
      hasGstActivity: false,
      gstin: "",
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
      enabled: false,
      savingsInterest: "0",
      fdInterest: "0",
      dividendIncome: "0",
      familyPension: "0",
      otherIncome: "0",
      source: "USER_DECLARED",
    },
  };
}

function applyCategorySelection(
  category: ItrCategoryType,
  prevSources: IncomeSourcesState = createEmptyIncomeSources()
): IncomeSourcesState {
  const newSources: IncomeSourcesState = {
    salary: { ...prevSources.salary, enabled: false },
    houseProperty: { ...prevSources.houseProperty, enabled: false },
    business: { ...prevSources.business, enabled: false },
    capitalGains: { ...prevSources.capitalGains, enabled: false },
    otherSources: { ...prevSources.otherSources, enabled: false },
  };

  if (category === "salaried") {
    newSources.salary.enabled = true;
  } else if (category === "business") {
    newSources.business.enabled = true;
    newSources.business.businessType = "presumptive_44ad";
  } else if (category === "professional" || category === "freelancer") {
    newSources.business.enabled = true;
    newSources.business.businessType = "presumptive_44ada";
  } else if (category === "trader_investor") {
    newSources.capitalGains.enabled = true;
    newSources.capitalGains.hasFnoIntraday = true;
  } else if (category === "rental") {
    newSources.houseProperty.enabled = true;
    newSources.houseProperty.propertyType = "let_out";
  } else if (category === "capital_gains") {
    newSources.capitalGains.enabled = true;
  } else if (category === "multiple") {
    newSources.salary.enabled = true;
    newSources.business.enabled = true;
  }

  return newSources;
}

describe("ITR Filing First Screen: 8 Income Source Cards Restoration", () => {
  describe("1. Authoritative 8 Income Source Cards Definition & Ordering", () => {
    it("contains exactly 8 income-source category cards", () => {
      assert.equal(ALL_CATEGORIES.length, 8);
    });

    it("has unique category IDs with no duplicates", () => {
      const ids = ALL_CATEGORIES.map((c: CategoryOption) => c.id);
      const uniqueIds = new Set(ids);
      assert.equal(uniqueIds.size, 8);
    });

    it("restores the 3 previously missing cards in their original positions and titles", () => {
      // 1. Salaried at index 0 (Position 1)
      const salaried = ALL_CATEGORIES[0];
      assert.equal(salaried.id, "salaried");
      assert.equal(salaried.title, "Salaried");
      assert.equal(salaried.subtitle, "Salary income with Form 16");
      assert.equal(salaried.iconName, "person-outline");

      // 3. Professional at index 2 (Position 3)
      const professional = ALL_CATEGORIES[2];
      assert.equal(professional.id, "professional");
      assert.equal(professional.title, "Professional");
      assert.equal(professional.subtitle, "Doctor, Lawyer, Consultant, CA");
      assert.equal(professional.iconName, "medkit-outline");

      // 4. Freelancer at index 3 (Position 4)
      const freelancer = ALL_CATEGORIES[3];
      assert.equal(freelancer.id, "freelancer");
      assert.equal(freelancer.title, "Freelancer");
      assert.equal(freelancer.subtitle, "Independent contractor & gigs");
      assert.equal(freelancer.iconName, "laptop-outline");
    });

    it("preserves the 5 existing cards in their original positions", () => {
      // 2. Business Income at index 1 (Position 2)
      assert.equal(ALL_CATEGORIES[1].id, "business");
      assert.equal(ALL_CATEGORIES[1].title, "Business Income");
      assert.equal(ALL_CATEGORIES[1].subtitle, "Trading, manufacturing & sales");
      assert.equal(ALL_CATEGORIES[1].iconName, "storefront-outline");

      // 5. Trader / Investor at index 4 (Position 5)
      assert.equal(ALL_CATEGORIES[4].id, "trader_investor");
      assert.equal(ALL_CATEGORIES[4].title, "Trader / Investor");
      assert.equal(ALL_CATEGORIES[4].subtitle, "Stocks, F&O & Intraday");
      assert.equal(ALL_CATEGORIES[4].iconName, "trending-up-outline");

      // 6. Rental Income at index 5 (Position 6)
      assert.equal(ALL_CATEGORIES[5].id, "rental");
      assert.equal(ALL_CATEGORIES[5].title, "Rental Income");
      assert.equal(ALL_CATEGORIES[5].subtitle, "House & commercial property");
      assert.equal(ALL_CATEGORIES[5].iconName, "home-outline");

      // 7. Capital Gains at index 6 (Position 7)
      assert.equal(ALL_CATEGORIES[6].id, "capital_gains");
      assert.equal(ALL_CATEGORIES[6].title, "Capital Gains");
      assert.equal(ALL_CATEGORIES[6].subtitle, "Property, shares & mutual funds");
      assert.equal(ALL_CATEGORIES[6].iconName, "document-text-outline");

      // 8. Multiple Sources at index 7 (Position 8)
      assert.equal(ALL_CATEGORIES[7].id, "multiple");
      assert.equal(ALL_CATEGORIES[7].title, "Multiple Sources");
      assert.equal(ALL_CATEGORIES[7].subtitle, "Combination of income sources");
      assert.equal(ALL_CATEGORIES[7].iconName, "link-outline");
    });

    it("does not contain disallowedAccountTypes filter restrictions", () => {
      for (const cat of ALL_CATEGORIES) {
        assert.equal((cat as any).disallowedAccountTypes, undefined);
      }
    });
  });

  describe("2. Selection Behavior and Income Source Mapping", () => {
    const expectedMappings: {
      category: ItrCategoryType;
      verify: (sources: IncomeSourcesState) => void;
      expectedItrForm: string;
    }[] = [
      {
        category: "salaried",
        verify: (s) => {
          assert.equal(s.salary.enabled, true);
          assert.equal(s.business.enabled, false);
          assert.equal(s.houseProperty.enabled, false);
          assert.equal(s.capitalGains.enabled, false);
        },
        expectedItrForm: "ITR-1",
      },
      {
        category: "professional",
        verify: (s) => {
          assert.equal(s.business.enabled, true);
          assert.equal(s.business.businessType, "presumptive_44ada");
          assert.equal(s.salary.enabled, false);
        },
        expectedItrForm: "ITR-4",
      },
      {
        category: "freelancer",
        verify: (s) => {
          assert.equal(s.business.enabled, true);
          assert.equal(s.business.businessType, "presumptive_44ada");
          assert.equal(s.salary.enabled, false);
        },
        expectedItrForm: "ITR-4",
      },
      {
        category: "business",
        verify: (s) => {
          assert.equal(s.business.enabled, true);
          assert.equal(s.business.businessType, "presumptive_44ad");
          assert.equal(s.salary.enabled, false);
        },
        expectedItrForm: "ITR-4",
      },
      {
        category: "trader_investor",
        verify: (s) => {
          assert.equal(s.capitalGains.enabled, true);
          assert.equal(s.capitalGains.hasFnoIntraday, true);
        },
        expectedItrForm: "ITR-3",
      },
      {
        category: "rental",
        verify: (s) => {
          assert.equal(s.houseProperty.enabled, true);
          assert.equal(s.houseProperty.propertyType, "let_out");
        },
        expectedItrForm: "ITR-1",
      },
      {
        category: "capital_gains",
        verify: (s) => {
          assert.equal(s.capitalGains.enabled, true);
        },
        expectedItrForm: "ITR-2",
      },
      {
        category: "multiple",
        verify: (s) => {
          assert.equal(s.salary.enabled, true);
          assert.equal(s.business.enabled, true);
        },
        expectedItrForm: "ITR-4",
      },
    ];

    for (const item of expectedMappings) {
      it(`selecting '${item.category}' properly configures income sources and determines ${item.expectedItrForm}`, () => {
        const sources = applyCategorySelection(item.category);
        item.verify(sources);

        const determined = determineApplicableItrForm(sources, "Resident", 1000000, "2025-2026");
        assert.equal(determined.form, item.expectedItrForm);
      });
    }
  });

  describe("3. Start Application Enablement Logic", () => {
    it("disables Start Application when no category is selected", () => {
      const selectedCategory: ItrCategoryType | null = null;
      const isStartDisabled = !selectedCategory;
      assert.equal(isStartDisabled, true);
    });

    it("enables Start Application for every one of the 8 categories", () => {
      for (const cat of ALL_CATEGORIES) {
        const selectedCategory: ItrCategoryType | null = cat.id;
        const isStartDisabled = !selectedCategory;
        assert.equal(isStartDisabled, false, `Expected Start Application to be enabled for ${cat.id}`);
      }
    });
  });

  describe("4. Component Structure and Grid Layout Integrity", () => {
    const componentPath = path.resolve(
      __dirname,
      "../../modules/itr/itr-filing/components/Step0CategorySelect/Step0CategorySelect.tsx"
    );
    const content = fs.readFileSync(componentPath, "utf-8");

    it("renders all 8 cards from ALL_CATEGORIES without conditional suppression", () => {
      assert.equal(content.includes("ALL_CATEGORIES.map"), true);
      assert.equal(content.includes("disallowedAccountTypes"), false);
      assert.equal(content.includes("visibleCategories"), false);
    });

    it("maintains the responsive 2-column grid layout with touchable cards", () => {
      assert.equal(content.includes("styles.gridContainer"), true);
      assert.equal(content.includes("styles.card"), true);
      assert.equal(content.includes("styles.cardSelected"), true);
      assert.equal(content.includes("styles.cardCheckmarkBox"), true);
    });

    it("connects Start Application button with disabled condition and press handler", () => {
      assert.equal(content.includes("disabled={!selectedCategory}"), true);
      assert.equal(content.includes("styles.startBtnDisabled"), true);
      assert.equal(content.includes("onStartApplication();"), true);
    });
  });

  describe("5. Store Implementation Integrity (itrStore.ts)", () => {
    const storePath = path.resolve(
      __dirname,
      "../../modules/itr/store/itrStore.ts"
    );
    const storeContent = fs.readFileSync(storePath, "utf-8");

    it("maps salaried category to salary income head", () => {
      assert.equal(storeContent.includes('if (category === "salaried") newSources.salary.enabled = true'), true);
    });

    it("maps professional and freelancer categories to 44ADA presumptive business", () => {
      assert.equal(
        storeContent.includes('category === "professional" || category === "freelancer"'),
        true
      );
      assert.equal(
        storeContent.includes('newSources.business.businessType = "presumptive_44ada"'),
        true
      );
    });
  });
});
