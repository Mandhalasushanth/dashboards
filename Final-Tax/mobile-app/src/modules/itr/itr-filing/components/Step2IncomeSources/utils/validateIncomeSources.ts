import { Alert } from "react-native";
import { IncomeSourcesState } from "../../../types/itrFiling.types";
import { isValidName } from "@/shared/validators/nameValidator";

/**
 * Validates step 2 income source fields prior to proceeding to step 3.
 * Returns true if valid, or false if an alert was triggered.
 */
export function validateIncomeSources(sources: IncomeSourcesState): boolean {
  const hasAnyIncome =
    sources.salary.enabled ||
    sources.houseProperty.enabled ||
    sources.business.enabled ||
    sources.capitalGains.enabled ||
    sources.otherSources.enabled;

  if (!hasAnyIncome) {
    Alert.alert(
      "Income Source Required",
      "Please select at least one income source to proceed."
    );
    return false;
  }

  if (sources.salary.enabled) {
    if (!sources.salary.employerName?.trim()) {
      Alert.alert("Salary Details Required", "Employer Legal Name is mandatory.");
      return false;
    }
    if (!isValidName(sources.salary.employerName, 2, 100)) {
      Alert.alert(
        "Salary Details Required",
        "Employer Legal Name must contain English letters and single spaces only (minimum 2 characters)."
      );
      return false;
    }
    if (!sources.salary.grossSalary?.trim()) {
      Alert.alert("Salary Details Required", "Gross Salary (Annual) is mandatory.");
      return false;
    }
    // BUG_ITR_026/031: Gross salary must be > 0
    if (parseFloat(sources.salary.grossSalary || "0") === 0) {
      Alert.alert("Salary Details Required", "Gross Salary must be greater than zero.");
      return false;
    }
    if (!sources.salary.allowances?.trim()) {
      Alert.alert("Salary Details Required", "Exempt Allowances is mandatory (enter 0 if not applicable).");
      return false;
    }
    if (!sources.salary.tdsDeducted?.trim()) {
      Alert.alert("Salary Details Required", "TDS Deducted by Employer is mandatory (enter 0 if not applicable).");
      return false;
    }
    // BUG_ITR_036/037: Exempt allowances must not exceed gross salary
    const grossSal = parseFloat(sources.salary.grossSalary || "0") || 0;
    const exemptAll = parseFloat(sources.salary.allowances || "0") || 0;
    if (exemptAll > grossSal) {
      Alert.alert("Invalid Salary Data", "Exempt Allowances cannot exceed Gross Salary.");
      return false;
    }
    // BUG_ITR_041: TDS deducted must not exceed gross salary
    const tdsAmt = parseFloat(sources.salary.tdsDeducted || "0") || 0;
    if (tdsAmt > grossSal) {
      Alert.alert("Invalid Salary Data", "TDS Deducted by Employer cannot exceed Gross Salary.");
      return false;
    }
  }

  if (sources.houseProperty.enabled) {
    if (sources.houseProperty.propertyType === "let_out") {
      if (!sources.houseProperty.annualRentReceived?.trim()) {
        Alert.alert("House Property Details Required", "Annual Rent Received is mandatory for let-out property.");
        return false;
      }
      // BUG_ITR_043/044: Annual rent must be > 0 for let-out property
      if (parseFloat(sources.houseProperty.annualRentReceived || "0") === 0) {
        Alert.alert("House Property Details Required", "Annual Rent Received must be greater than zero for let-out property.");
        return false;
      }
      if (!sources.houseProperty.municipalTaxesPaid?.trim()) {
        Alert.alert("House Property Details Required", "Municipal Taxes Paid is mandatory (enter 0 if none).");
        return false;
      }
      // BUG_ITR_045: Municipal taxes must not exceed annual rent received
      const annualRent = parseFloat(sources.houseProperty.annualRentReceived || "0") || 0;
      const munTax = parseFloat(sources.houseProperty.municipalTaxesPaid || "0") || 0;
      if (munTax > annualRent) {
        Alert.alert("Invalid House Property Data", "Municipal Taxes Paid cannot exceed Annual Rent Received.");
        return false;
      }
    }
    if (!sources.houseProperty.homeLoanInterest?.trim()) {
      Alert.alert("House Property Details Required", "Home Loan Interest Paid is mandatory (enter 0 if no loan).");
      return false;
    }
    // BUG_ITR_042/051: Home loan interest deduction for self-occupied is limited to ₹2,00,000 (Sec 24b)
    if (sources.houseProperty.propertyType === "self_occupied") {
      const loanInt = parseFloat(sources.houseProperty.homeLoanInterest || "0") || 0;
      if (loanInt > 200000) {
        Alert.alert(
          "Home Loan Interest Limit",
          "Under Section 24(b), the deduction for Home Loan Interest on a self-occupied property is limited to ₹2,00,000. Please enter the eligible amount."
        );
        return false;
      }
    }
  }

  if (sources.business.enabled) {
    if (!sources.business.businessType) {
      Alert.alert("Business Details Required", "Please select how you report this business.");
      return false;
    }
    if (!sources.business.grossTurnover?.trim()) {
      Alert.alert("Business Details Required", "Gross Turnover is mandatory for Business / Profession income.");
      return false;
    }
    if ((parseFloat(sources.business.grossTurnover || "0") || 0) === 0) {
      Alert.alert("Business Details Required", "Gross Turnover must be greater than zero.");
      return false;
    }
    if (!sources.business.declaredProfit?.trim()) {
      Alert.alert("Business Details Required", "Declared Profit is mandatory (enter 0 if none).");
      return false;
    }
    // BUG_ITR_055/056: Declared profit must not exceed gross turnover
    const turnover = parseFloat(sources.business.grossTurnover || "0") || 0;
    const profit = parseFloat(sources.business.declaredProfit || "0") || 0;
    if (profit > turnover) {
      Alert.alert("Invalid Business Data", "Declared Net Profit cannot exceed Gross Turnover.");
      return false;
    }
  }

  if (sources.capitalGains.enabled) {
    const hasAnyAsset =
      sources.capitalGains.hasEquityMf ||
      sources.capitalGains.hasFnoIntraday ||
      sources.capitalGains.hasPropertyAssets ||
      sources.capitalGains.hasCryptoVda;
    if (!hasAnyAsset) {
      Alert.alert("Capital Gains Required", "Please select at least one asset type traded.");
      return false;
    }
    if (!sources.capitalGains.shortTermGains?.trim()) {
      Alert.alert("Capital Gains Details Required", "Short-Term Gains (STCG) is mandatory (enter 0 if none).");
      return false;
    }
    if (!sources.capitalGains.longTermGains?.trim()) {
      Alert.alert("Capital Gains Details Required", "Long-Term Gains (LTCG) is mandatory (enter 0 if none).");
      return false;
    }
    const stcg = parseFloat(sources.capitalGains.shortTermGains || "0") || 0;
    const ltcg = parseFloat(sources.capitalGains.longTermGains || "0") || 0;
    if (stcg + ltcg === 0) {
      Alert.alert(
        "Capital Gains Details Required",
        "At least one of Short-Term Gains (STCG) or Long-Term Gains (LTCG) must be greater than zero."
      );
      return false;
    }
  }

  if (sources.otherSources.enabled) {
    if (!sources.otherSources.savingsInterest?.trim()) {
      Alert.alert("Other Sources Required", "Savings Bank Interest is mandatory (enter 0 if none).");
      return false;
    }
    if (!sources.otherSources.fdInterest?.trim()) {
      Alert.alert("Other Sources Required", "FD / Term Interest is mandatory (enter 0 if none).");
      return false;
    }
    if (!sources.otherSources.dividendIncome?.trim()) {
      Alert.alert("Other Sources Required", "Dividend Income is mandatory (enter 0 if none).");
      return false;
    }
    if (!sources.otherSources.familyPension?.trim()) {
      Alert.alert("Other Sources Required", "Family Pension is mandatory (enter 0 if none).");
      return false;
    }
    if (!sources.otherSources.otherIncome?.trim()) {
      Alert.alert("Other Sources Required", "Other Miscellaneous income is mandatory (enter 0 if none).");
      return false;
    }
  }

  return true;
}

