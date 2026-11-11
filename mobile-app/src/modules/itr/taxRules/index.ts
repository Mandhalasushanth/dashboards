import { TaxRuleVersionConfig } from "./types";
import { AY2024_25 } from "./AY2024_25";
import { AY2025_26 } from "./AY2025_26";
import { AY2026_27 } from "./AY2026_27";

export * from "./types";
export { AY2024_25 } from "./AY2024_25";
export { AY2025_26 } from "./AY2025_26";
export { AY2026_27 } from "./AY2026_27";

export interface AssessmentYearOption {
  id: string;
  label: string;
  sub: string;
  financialYear: string;
  isCurrent: boolean;
}

/**
 * Dynamically derives the active Assessment Year based on live calendar date.
 * In India, filing for the financial year ending March 31 of year Y runs in AY Y-(Y+1).
 * If April or later, AY is Y-(Y+1). If Jan-Mar, AY is (Y-1)-Y.
 */
export function getCurrentAssessmentYear(currentDate: Date = new Date()): string {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = Jan, 3 = Apr
  const ayStartYear = month >= 3 ? year : year - 1;
  const ayEndYear = ayStartYear + 1;
  return `${ayStartYear}-${ayEndYear}`;
}

/**
 * Returns dynamic list of assessment years relative to live calendar date.
 */
export function getSupportedAssessmentYears(currentDate: Date = new Date()): AssessmentYearOption[] {
  const currentAY = getCurrentAssessmentYear(currentDate);
  const parts = currentAY.split("-").map(Number);
  const startYear = isNaN(parts[0]) ? 2026 : parts[0];
  const endYear = isNaN(parts[1]) ? startYear + 1 : parts[1];

  return [
    {
      id: `${startYear}-${endYear}`,
      label: `AY ${startYear}-${String(endYear).slice(-2)}`,
      sub: `FY ${startYear - 1}-${String(startYear).slice(-2)} (Current Filing)`,
      financialYear: `${startYear - 1}-${startYear}`,
      isCurrent: true,
    },
    {
      id: `${startYear + 1}-${endYear + 1}`,
      label: `AY ${startYear + 1}-${String(endYear + 1).slice(-2)}`,
      sub: `FY ${startYear}-${String(endYear).slice(-2)} (Advance Estimation)`,
      financialYear: `${startYear}-${endYear}`,
      isCurrent: false,
    },
    {
      id: `${startYear - 1}-${endYear - 1}`,
      label: `AY ${startYear - 1}-${String(endYear - 1).slice(-2)}`,
      sub: `FY ${startYear - 2}-${String(startYear - 1).slice(-2)} (Prior / Belated)`,
      financialYear: `${startYear - 2}-${startYear - 1}`,
      isCurrent: false,
    },
  ];
}

export const SUPPORTED_ASSESSMENT_YEARS = getSupportedAssessmentYears();

/**
 * Returns past-inclusive assessment years in descending order (current first, then prior years).
 * Unlike getSupportedAssessmentYears(), no advance-estimation year is included.
 * Use this for Revised ITR, belated filing, or any context restricted to already-filed years.
 */
export function getPastAssessmentYears(
  count: number = 3,
  currentDate: Date = new Date()
): AssessmentYearOption[] {
  const currentAY = getCurrentAssessmentYear(currentDate);
  const parts = currentAY.split("-").map(Number);
  const startYear = isNaN(parts[0]) ? 2026 : parts[0];
  const endYear = isNaN(parts[1]) ? startYear + 1 : parts[1];

  return Array.from({ length: count }, (_, i) => ({
    id: `${startYear - i}-${endYear - i}`,
    label: `AY ${startYear - i}-${String(endYear - i).slice(-2)}`,
    sub:
      i === 0
        ? `FY ${startYear - i - 1}-${String(startYear - i).slice(-2)} (Current Filing)`
        : `FY ${startYear - i - 1}-${String(startYear - i).slice(-2)} (Prior / Belated)`,
    financialYear: `${startYear - i - 1}-${startYear - i}`,
    isCurrent: i === 0,
  }));
}

const TAX_RULES_MAP: Record<string, TaxRuleVersionConfig> = {
  "2024-2025": AY2024_25,
  "2025-2026": AY2025_26,
  "2026-2027": AY2026_27,
  "AY 2024-25": AY2024_25,
  "AY 2025-26": AY2025_26,
  "AY 2026-27": AY2026_27,
};

/**
 * Pure functional getter for AY tax rule configuration.
 * Dynamically resolves to latest statutory version for future years.
 */
export function getTaxRulesForAY(assessmentYear?: string): TaxRuleVersionConfig {
  if (!assessmentYear) return AY2026_27;
  const normalized = assessmentYear.trim();
  if (TAX_RULES_MAP[normalized]) {
    return TAX_RULES_MAP[normalized];
  }

  // Extract start year
  const match = normalized.match(/(\d{4})/);
  if (match) {
    const yr = Number(match[1]);
    if (yr >= 2026) return AY2026_27;
    if (yr <= 2024) return AY2024_25;
  }

  return AY2025_26;
}
