import { TdsCustomerIncomeFormData } from "../types/customerIncome.types";
import { TaxCalculationBreakdown } from "../types/estimate.types";
import { parsePositiveNumber } from "../utils/tdsValidation";

export const CA_DISCLAIMER_TEXT =
  "Preliminary estimate based on the information provided. Final refund/tax payable will be determined after CA verification, ITR filing and Income Tax Department processing.";

export const tdsCalculationService = {
  /**
   * Pure tax calculation engine implementing Indian Income Tax Act provisions.
   * Supports both New Regime (u/s 115BAC) and Old Regime.
   */
  calculate: (formData: TdsCustomerIncomeFormData): TaxCalculationBreakdown => {
    try {
      const { income } = formData;

      const salary = parsePositiveNumber(income.salaryIncome);
      const other = parsePositiveNumber(income.otherIncome);
      const interest = parsePositiveNumber(income.interestIncome);
      const rental = income.hasRentalIncome ? parsePositiveNumber(income.rentalIncome) : 0;
      const municipalTax = income.hasRentalIncome ? parsePositiveNumber(income.municipalTaxesPaid) : 0;
      const stcg = income.hasCapitalGains ? parsePositiveNumber(income.shortTermCapitalGains) : 0;
      const ltcg = income.hasCapitalGains ? parsePositiveNumber(income.longTermCapitalGains) : 0;
      const business = income.hasBusinessIncome ? parsePositiveNumber(income.netBusinessProfit) : 0;

      // Rental Net Income = Gross Rent - Municipal taxes - 30% standard deduction
      let netRentalIncome = 0;
      if (rental > 0) {
        const netAnnualValue = Math.max(0, rental - municipalTax);
        const standardRentDeduction = netAnnualValue * 0.3;
        netRentalIncome = Math.max(0, netAnnualValue - standardRentDeduction);
      }

      const grossTotalIncome =
        salary + other + interest + netRentalIncome + stcg + ltcg + business;

      const isOldRegime = income.taxRegime === "OLD";

      // Standard Deduction: for salary
      let standardDeduction = 0;
      if (salary > 0) {
        const maxStd = isOldRegime ? 50000 : 75000;
        standardDeduction = Math.min(salary, maxStd);
      }

      // Chapter VI-A Deductions
      let chapterVIADeductions = 0;
      if (isOldRegime && income.hasDeductions) {
        const d80C = Math.min(150000, parsePositiveNumber(income.deductions80C));
        const d80D = Math.min(50000, parsePositiveNumber(income.deductions80D));
        const d80G = parsePositiveNumber(income.donations80G);
        const otherDed = parsePositiveNumber(income.otherDeductions);
        chapterVIADeductions = d80C + d80D + d80G + otherDed;
      }

      // Section 24(b) Home Loan Interest on Self-occupied property (only under Old Regime)
      let homeLoanDeduction = 0;
      if (isOldRegime && income.hasHomeLoan) {
        homeLoanDeduction = Math.min(200000, parsePositiveNumber(income.homeLoanInterestSec24b));
      }

      const totalEligibleDeductions = Math.min(
        grossTotalIncome,
        standardDeduction + chapterVIADeductions + homeLoanDeduction
      );

      const taxableIncome = Math.max(0, grossTotalIncome - totalEligibleDeductions);

      // Slab Tax Calculation
      let slabTax = 0;
      let rebate87A = 0;

      if (isOldRegime) {
        if (taxableIncome > 250000) slabTax += (Math.min(taxableIncome, 500000) - 250000) * 0.05;
        if (taxableIncome > 500000) slabTax += (Math.min(taxableIncome, 1000000) - 500000) * 0.20;
        if (taxableIncome > 1000000) slabTax += (taxableIncome - 1000000) * 0.30;
        if (taxableIncome <= 500000) rebate87A = Math.min(slabTax, 12500);
      } else {
        if (taxableIncome > 300000) slabTax += (Math.min(taxableIncome, 700000) - 300000) * 0.05;
        if (taxableIncome > 700000) slabTax += (Math.min(taxableIncome, 1000000) - 700000) * 0.10;
        if (taxableIncome > 1000000) slabTax += (Math.min(taxableIncome, 1200000) - 1000000) * 0.15;
        if (taxableIncome > 1200000) slabTax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
        if (taxableIncome > 1500000) slabTax += (taxableIncome - 1500000) * 0.30;
        if (taxableIncome <= 700000) rebate87A = Math.min(slabTax, 25000);
      }

      const taxAfterRebate = Math.max(0, slabTax - rebate87A);
      const cess = Math.round(taxAfterRebate * 0.04);
      const estimatedTaxLiability = Math.round(taxAfterRebate + cess);

      const totalTaxCredits = Math.round(
        parsePositiveNumber(income.totalTdsDeducted) +
        parsePositiveNumber(income.tcsAmount) +
        parsePositiveNumber(income.advanceTaxPaid) +
        parsePositiveNumber(income.selfAssessmentTaxPaid)
      );

      const estimatedRefund = totalTaxCredits >= estimatedTaxLiability ? totalTaxCredits - estimatedTaxLiability : 0;
      const estimatedTaxPayable = totalTaxCredits < estimatedTaxLiability ? estimatedTaxLiability - totalTaxCredits : 0;

      const serviceFee = estimatedRefund > 0 ? Math.min(4999, Math.max(499, Math.round(estimatedRefund * 0.10))) : 499;
      const gstAmount = Math.round(serviceFee * 0.18);

      return {
        grossTotalIncome: Math.round(grossTotalIncome),
        standardDeduction: Math.round(standardDeduction),
        chapterVIAEligibleDeductions: Math.round(chapterVIADeductions + homeLoanDeduction),
        totalEligibleDeductions: Math.round(totalEligibleDeductions),
        taxableIncome: Math.round(taxableIncome),
        slabTax: Math.round(slabTax),
        rebate87A: Math.round(rebate87A),
        taxAfterRebate: Math.round(taxAfterRebate),
        cess,
        estimatedTaxLiability,
        tdsDeducted: Math.round(parsePositiveNumber(income.totalTdsDeducted)),
        tcsAmount: Math.round(parsePositiveNumber(income.tcsAmount)),
        advanceTaxPaid: Math.round(parsePositiveNumber(income.advanceTaxPaid)),
        selfAssessmentTaxPaid: Math.round(parsePositiveNumber(income.selfAssessmentTaxPaid)),
        totalTaxCredits,
        estimatedRefund,
        estimatedTaxPayable,
        isAdditionalTaxPayable: estimatedTaxPayable > 0,
        serviceFee,
        gstAmount,
        totalPayableFee: serviceFee + gstAmount,
        disclaimer: CA_DISCLAIMER_TEXT,
      };
    } catch (error) {
      console.error("Calculation Error:", error);
      // Return safe fallback to prevent crashes
      return {
        grossTotalIncome: 0, standardDeduction: 0, chapterVIAEligibleDeductions: 0, totalEligibleDeductions: 0,
        taxableIncome: 0, slabTax: 0, rebate87A: 0, taxAfterRebate: 0, cess: 0, estimatedTaxLiability: 0,
        tdsDeducted: 0, tcsAmount: 0, advanceTaxPaid: 0, selfAssessmentTaxPaid: 0, totalTaxCredits: 0,
        estimatedRefund: 0, estimatedTaxPayable: 0, isAdditionalTaxPayable: false, serviceFee: 499, gstAmount: 90, totalPayableFee: 589,
        disclaimer: "Calculation failed due to an error.",
      };
    }
  },
};

export default tdsCalculationService;
