import {
  IncomeSourcesState,
  ItrStructuredDeductions,
  TaxesPaidDetails,
  TaxRegimeType,
  TaxCalculationBreakdown,
} from "../types/itrFiling.types";
import { getTaxRulesForAY, TaxSlab } from "../../taxRules";

const parseNum = (val?: string | number): number => {
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num);
};

/**
 * Pure functional slab tax calculator using array reduce.
 * Zero loops.
 */
function computeTaxFromSlabs(taxableIncome: number, slabs: TaxSlab[]): number {
  if (taxableIncome <= 0) return 0;

  return slabs.reduce((accTax, slab) => {
    if (taxableIncome <= slab.min) {
      return accTax;
    }

    const upperLimit = slab.max !== null ? Math.min(taxableIncome, slab.max) : taxableIncome;
    const taxableInThisSlab = Math.max(0, upperLimit - slab.min);
    const taxInThisSlab = taxableInThisSlab * slab.rate;

    return accTax + taxInThisSlab;
  }, 0);
}

export function calculateItrTax(
  sources: IncomeSourcesState,
  deductions: ItrStructuredDeductions,
  taxesPaid: TaxesPaidDetails,
  chosenRegime: TaxRegimeType,
  assessmentYear: string = "2025-2026"
): TaxCalculationBreakdown {
  const rules = getTaxRulesForAY(assessmentYear);

  // 1. Gross Income components
  const salaryGross = sources.salary.enabled ? parseNum(sources.salary.grossSalary) : 0;
  const allowances = sources.salary.enabled ? parseNum(sources.salary.allowances) : 0;
  const netSalaryBeforeStd = Math.max(0, salaryGross - allowances);

  // House Property
  let housePropertyIncome = 0;
  if (sources.houseProperty.enabled) {
    const rent = parseNum(sources.houseProperty.annualRentReceived);
    const taxes = parseNum(sources.houseProperty.municipalTaxesPaid);
    const homeLoan = parseNum(sources.houseProperty.homeLoanInterest);

    if (sources.houseProperty.propertyType === "let_out") {
      const netAnnualValue = Math.max(0, rent - taxes);
      const standard30Percent = netAnnualValue * 0.30;
      housePropertyIncome = netAnnualValue - standard30Percent - homeLoan;
    } else {
      // Self-occupied: loss is limited to section 24b cap
      housePropertyIncome = -Math.min(rules.deductionCaps.sec24bSelfOccupied, homeLoan);
    }
  }

  // Business income
  let businessIncome = 0;
  if (sources.business.enabled) {
    const declaredProfit = parseNum(sources.business.declaredProfit);
    const turnover = parseNum(sources.business.grossTurnover);

    if (sources.business.businessType === "presumptive_44ad") {
      const minProfit = turnover * rules.presumptiveRates.sec44adDigital;
      businessIncome = declaredProfit > 0 ? declaredProfit : minProfit;
    } else if (sources.business.businessType === "presumptive_44ada") {
      const minProfit = turnover * rules.presumptiveRates.sec44ada;
      businessIncome = declaredProfit > 0 ? declaredProfit : minProfit;
    } else {
      businessIncome = declaredProfit;
    }
  }

  // Capital Gains
  const capitalGainsIncome = sources.capitalGains.enabled
    ? parseNum(sources.capitalGains.shortTermGains) + parseNum(sources.capitalGains.longTermGains)
    : 0;

  // Other Sources
  const otherIncome = sources.otherSources.enabled
    ? parseNum(sources.otherSources.savingsInterest) +
      parseNum(sources.otherSources.fdInterest) +
      parseNum(sources.otherSources.dividendIncome) +
      parseNum(sources.otherSources.familyPension) +
      parseNum(sources.otherSources.otherIncome)
    : 0;

  const grossTotalIncome = Math.max(
    0,
    netSalaryBeforeStd + housePropertyIncome + businessIncome + capitalGainsIncome + otherIncome
  );

  // 2. Standard Deductions based on AY versioning
  const newRegimeStdDeduction = sources.salary.enabled
    ? Math.min(rules.newRegime.standardDeduction, netSalaryBeforeStd)
    : 0;

  const oldRegimeStdDeduction = sources.salary.enabled
    ? Math.min(rules.oldRegime.standardDeduction, netSalaryBeforeStd)
    : 0;

  // 3. Chapter VI-A Deductions (Old Regime)
  const raw80c =
    parseNum(deductions.sec80c.epf) +
    parseNum(deductions.sec80c.ppf) +
    parseNum(deductions.sec80c.lic) +
    parseNum(deductions.sec80c.elss) +
    parseNum(deductions.sec80c.tuitionFees) +
    parseNum(deductions.sec80c.housingPrincipal) +
    parseNum(deductions.sec80c.other80c);
  const eligible80c = Math.min(rules.deductionCaps.sec80c, raw80c);

  const raw80dSelf = parseNum(deductions.sec80d.selfSpouseChildren);
  const raw80dParents = parseNum(deductions.sec80d.parents);
  const parentCap = deductions.sec80d.isParentSeniorCitizen
    ? rules.deductionCaps.sec80dSenior
    : rules.deductionCaps.sec80dNormal;
  const eligible80d =
    Math.min(rules.deductionCaps.sec80dNormal, raw80dSelf) +
    Math.min(parentCap, raw80dParents);

  const eligible80e = parseNum(deductions.sec80e);

  const additionalDeductionsTotal = deductions.otherDeductionsList.reduce(
    (sum, item) => sum + parseNum(item.amount),
    0
  );

  const totalChapterVIA = eligible80c + eligible80d + eligible80e + additionalDeductionsTotal;

  // 4. Taxable Incomes
  const taxableIncomeNew = Math.max(0, grossTotalIncome - newRegimeStdDeduction);
  const taxableIncomeOld = Math.max(0, grossTotalIncome - oldRegimeStdDeduction - totalChapterVIA);

  // 5. New Regime Tax Computation
  let grossTaxNew = computeTaxFromSlabs(taxableIncomeNew, rules.newRegime.slabs);
  let rebate87ANew = 0;
  if (taxableIncomeNew <= rules.newRegime.rebate87AThreshold) {
    rebate87ANew = Math.min(grossTaxNew, rules.newRegime.rebate87AMax);
  }
  const taxAfterRebateNew = Math.max(0, grossTaxNew - rebate87ANew);
  const cessNew = Math.round(taxAfterRebateNew * 0.04);
  const totalTaxNew = taxAfterRebateNew + cessNew;

  // 6. Old Regime Tax Computation
  let grossTaxOld = computeTaxFromSlabs(taxableIncomeOld, rules.oldRegime.slabs);
  let rebate87AOld = 0;
  if (taxableIncomeOld <= rules.oldRegime.rebate87AThreshold) {
    rebate87AOld = Math.min(grossTaxOld, rules.oldRegime.rebate87AMax);
  }
  const taxAfterRebateOld = Math.max(0, grossTaxOld - rebate87AOld);
  const cessOld = Math.round(taxAfterRebateOld * 0.04);
  const totalTaxOld = taxAfterRebateOld + cessOld;

  // 7. Active regime assignments
  const isNew = chosenRegime === "new";
  const standardDeduction = isNew ? newRegimeStdDeduction : oldRegimeStdDeduction;
  const totalDeductions = isNew ? standardDeduction : standardDeduction + totalChapterVIA;
  const taxableIncome = isNew ? taxableIncomeNew : taxableIncomeOld;
  const grossTaxLiability = isNew ? grossTaxNew : grossTaxOld;
  const rebate87A = isNew ? rebate87ANew : rebate87AOld;
  const taxAfterRebate = isNew ? taxAfterRebateNew : taxAfterRebateOld;
  const cess = isNew ? cessNew : cessOld;
  const totalTaxLiability = isNew ? totalTaxNew : totalTaxOld;

  // 8. Taxes Paid & TDS
  const tdsCredits = sources.salary.enabled ? parseNum(sources.salary.tdsDeducted) : 0;
  const advanceTaxPaid = parseNum(taxesPaid.advanceTax);
  const selfAssessmentTaxPaid = parseNum(taxesPaid.selfAssessmentTax);
  const totalTaxesPaid = tdsCredits + advanceTaxPaid + selfAssessmentTaxPaid;

  // 9. Final refund or payable
  const netDifference = totalTaxLiability - totalTaxesPaid;
  const finalAmount = Math.abs(netDifference);
  const finalType = netDifference < 0 ? "REFUND" : netDifference > 0 ? "PAYABLE" : "NIL";

  // 10. Regime Recommendation & Transparent Comparison
  const recommendedRegime: TaxRegimeType = totalTaxNew <= totalTaxOld ? "new" : "old";
  const savingsAmount = Math.abs(totalTaxNew - totalTaxOld);

  const savingsExplanation =
    savingsAmount === 0
      ? `Both tax regimes result in identical tax liability for ${rules.label}.`
      : totalTaxNew < totalTaxOld
      ? `New Tax Regime saves ₹${savingsAmount.toLocaleString("en-IN")} for ${rules.label} due to lower tax slab rates.`
      : `Old Tax Regime saves ₹${savingsAmount.toLocaleString("en-IN")} for ${rules.label} by leveraging your deductions.`;

  return {
    assessmentYear: rules.assessmentYear,
    financialYear: rules.financialYear,
    grossTotalIncome,
    standardDeduction,
    newRegimeStdDeduction,
    oldRegimeStdDeduction,
    totalChapterVIA: isNew ? 0 : totalChapterVIA,
    totalDeductions,
    taxableIncome,
    taxUnderNewRegime: totalTaxNew,
    taxUnderOldRegime: totalTaxOld,
    grossTaxLiability,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTaxLiability,
    tdsCredits,
    advanceTaxPaid,
    selfAssessmentTaxPaid,
    totalTaxesPaid,
    finalAmount,
    finalType,
    recommendedRegime,
    savingsAmount,
    savingsExplanation,
  };
}
