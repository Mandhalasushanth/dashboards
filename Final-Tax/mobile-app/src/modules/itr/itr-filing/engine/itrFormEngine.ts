import {
  IncomeSourcesState,
  ResidentialStatus,
  DeterminedFormInfo,
  ItrCriteriaCheck,
} from "../types/itrFiling.types";

/**
 * Pure functional engine that evaluates taxpayer facts and returns
 * the exact applicable ITR Form (ITR-1 / ITR-2 / ITR-3 / ITR-4) with
 * statutory rationale and granular criteria checks.
 */
export function determineApplicableItrForm(
  sources: IncomeSourcesState,
  residentialStatus: ResidentialStatus,
  grossTotal: number = 0,
  assessmentYear: string = "2025-2026"
): DeterminedFormInfo {
  const isResident = residentialStatus === "Resident" || !residentialStatus;
  const hasSalary = sources.salary.enabled;
  const hasHouseProperty = sources.houseProperty.enabled;
  const hasBusiness = sources.business.enabled;
  const hasCapitalGains = sources.capitalGains.enabled;
  const hasFnoIntraday = hasCapitalGains && sources.capitalGains.hasFnoIntraday;
  const hasCrypto = hasCapitalGains && sources.capitalGains.hasCryptoVda;
  const isHighIncome = grossTotal > 5000000;

  const isRegularBusiness =
    hasBusiness &&
    (sources.business.businessType === "regular_books" ||
      sources.business.businessType === "not_sure");

  const isPresumptiveBusiness =
    hasBusiness &&
    (sources.business.businessType === "presumptive_44ad" ||
      sources.business.businessType === "presumptive_44ada");

  // 1. Check for ITR-3
  // Applies to individuals/HUFs with regular business, professional books, F&O/intraday trading,
  // or presumptive business filers who also have capital gains.
  if (isRegularBusiness || hasFnoIntraday || (isPresumptiveBusiness && hasCapitalGains)) {
    const checks: ItrCriteriaCheck[] = [
      {
        id: "biz_detected",
        label: hasFnoIntraday
          ? "F&O / Intraday trading activity detected (taxed as business income)"
          : "Business / Professional income with regular books detected",
        met: true,
      },
      {
        id: "form_match",
        label: "Mandatory filing under ITR-3 as per Income Tax Department rules",
        met: true,
      },
      {
        id: "residency",
        label: isResident ? "Resident individual" : `${residentialStatus} individual status`,
        met: true,
      },
    ];

    return {
      form: "ITR-3",
      formTitle: `ITR-3 (Business & Professional Income)`,
      rationale: hasFnoIntraday
        ? "Based on your F&O or Intraday trading activity, ITR-3 applies."
        : "Based on business or professional income with regular books, ITR-3 applies.",
      criteriaChecks: checks,
    };
  }

  // 2. Check for ITR-4 (Sugam)
  // Resident individuals/HUFs/firms with presumptive business (44AD, 44ADA) up to ₹50L,
  // without capital gains or multiple house properties.
  if (isPresumptiveBusiness && isResident && !hasCapitalGains && !isHighIncome) {
    const checks: ItrCriteriaCheck[] = [
      {
        id: "presumptive",
        label: `Presumptive taxation selected (${sources.business.businessType === "presumptive_44ada" ? "Section 44ADA" : "Section 44AD"})`,
        met: true,
      },
      {
        id: "no_cg",
        label: "No capital gains or trading income",
        met: true,
      },
      {
        id: "turnover_limit",
        label: "Total income is within statutory threshold (<= ₹50 Lakhs)",
        met: true,
      },
      {
        id: "residency",
        label: "Resident individual status confirmed",
        met: true,
      },
    ];

    return {
      form: "ITR-4",
      formTitle: `ITR-4 (Sugam - Presumptive Income)`,
      rationale:
        "Based on presumptive business or professional income under Section 44AD / 44ADA up to ₹50 Lakhs, ITR-4 applies.",
      criteriaChecks: checks,
    };
  }

  // 3. Check for ITR-2
  // Individuals/HUFs not having business/profession income, but having capital gains,
  // crypto/VDA, multiple house properties, NRI/RNOR status, or total income exceeding ₹50 Lakhs.
  if (hasCapitalGains || !isResident || isHighIncome || hasCrypto) {
    const checks: ItrCriteriaCheck[] = [
      {
        id: "no_biz",
        label: "No business or professional income declared",
        met: true,
      },
      {
        id: "cg_or_status",
        label: hasCapitalGains
          ? "Capital gains from investments or property declared"
          : !isResident
          ? `${residentialStatus} tax status applies`
          : "Total gross income exceeds ₹50 Lakhs",
        met: true,
      },
      {
        id: "status_check",
        label: hasCrypto
          ? "Virtual Digital Assets (Crypto / VDA) declared"
          : isResident
          ? "Resident individual status"
          : `${residentialStatus} status verified`,
        met: true,
      },
    ];

    return {
      form: "ITR-2",
      formTitle: `ITR-2 (Capital Gains & Other Incomes)`,
      rationale: hasCapitalGains
        ? "Based on your capital gains without business income, ITR-2 applies."
        : !isResident
        ? `Based on your ${residentialStatus} tax status, ITR-2 applies.`
        : isHighIncome
        ? "Based on total income exceeding ₹50 Lakhs, ITR-2 applies."
        : "Based on your income profile, ITR-2 applies.",
      criteriaChecks: checks,
    };
  }

  // 4. Default: ITR-1 (Sahaj)
  // Standard return for resident individuals having salary, one house property, and other sources up to ₹50L.
  const checks: ItrCriteriaCheck[] = [
    {
      id: "salary_other",
      label: hasSalary ? "Salary / Pension income declared" : "Other sources income declared",
      met: true,
    },
    {
      id: "no_biz",
      label: "No business or professional income declared",
      met: true,
    },
    {
      id: "no_cg",
      label: "No capital gains or trading declared",
      met: true,
    },
    {
      id: "residency",
      label: "Resident individual with income <= ₹50 Lakhs",
      met: true,
    },
  ];

  return {
    form: "ITR-1",
    formTitle: `ITR-1 (Sahaj - Salary & Other Income)`,
    rationale:
      "Based on your salary and interest income up to ₹50 Lakhs as a resident, ITR-1 applies.",
    criteriaChecks: checks,
  };
}
