/**
 * GST Date Utilities
 *
 * Provides financial year calculations, filing periods, and quarter helpers
 * adhering to standard Indian Government GST fiscal calendar rules
 * (Financial Year: 1st April to 31st March).
 */

/**
 * Returns the current or target Indian Financial Year formatted as string (e.g. "2025-26" or "FY 2025-26").
 *
 * @param prefix Optional prefix to prepend to the FY string (e.g. "FY ")
 * @param date Optional reference date (defaults to current date)
 */
export function getCurrentFinancialYear(
  prefixOrDate?: string | Date,
  dateArg?: Date
): string {
  let prefix = "";
  let date = new Date();

  if (typeof prefixOrDate === "string") {
    prefix = prefixOrDate;
    if (dateArg instanceof Date && !isNaN(dateArg.getTime())) {
      date = dateArg;
    }
  } else if (prefixOrDate instanceof Date && !isNaN(prefixOrDate.getTime())) {
    date = prefixOrDate;
  }

  const month = date.getMonth(); // 0 = Jan, ..., 3 = Apr, ..., 11 = Dec
  const year = date.getFullYear();

  // In India, FY starts in April (month >= 3)
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const endYearShort = String(endYear).slice(-2);

  return `${prefix}${startYear}-${endYearShort}`;
}

/**
 * Generates an array of financial years in descending order starting from the active FY.
 *
 * @param count Number of financial years to generate (default: 4)
 * @param prefix Optional prefix prepended to each year string (default: "FY ")
 * @param fromDate Optional starting date (default: current date)
 */
export function generateFinancialYears(
  count: number = 4,
  prefix: string = "FY ",
  fromDate: Date = new Date()
): string[] {
  const month = fromDate.getMonth();
  const year = fromDate.getFullYear();
  const baseStartYear = month >= 3 ? year : year - 1;

  return Array.from({ length: count }, (_, i) => {
    const startYear = baseStartYear - i;
    const endYear = startYear + 1;
    const endYearShort = String(endYear).slice(-2);
    return `${prefix}${startYear}-${endYearShort}`;
  });
}

/**
 * Parses a financial year string like "FY 2025-26", "2025-26", or "2025-2026"
 * into numerical start and end calendar years.
 */
export function parseFinancialYear(
  fyString: string
): { startYear: number; endYear: number } | null {
  if (!fyString) return null;

  const match = fyString.match(/(\d{4})\s*[-/]\s*(\d{2,4})/);
  if (!match) return null;

  const startYear = parseInt(match[1], 10);
  let endYearPart = match[2];

  let endYear: number;
  if (endYearPart.length === 2) {
    const century = match[1].slice(0, 2);
    endYear = parseInt(`${century}${endYearPart}`, 10);
  } else {
    endYear = parseInt(endYearPart, 10);
  }

  if (isNaN(startYear) || isNaN(endYear)) return null;

  return { startYear, endYear };
}

/**
 * Returns the Date range (April 1 to March 31) for a given financial year.
 */
export function getFinancialYearDates(
  fyString: string
): { startDate: Date; endDate: Date } | null {
  const parsed = parseFinancialYear(fyString);
  if (!parsed) return null;

  const startDate = new Date(parsed.startYear, 3, 1, 0, 0, 0, 0); // April 1
  const endDate = new Date(parsed.endYear, 2, 31, 23, 59, 59, 999); // March 31

  return { startDate, endDate };
}

/**
 * Checks whether a given Date falls within a specific financial year.
 */
export function isDateInFinancialYear(date: Date, fyString: string): boolean {
  if (!date || isNaN(date.getTime())) return false;
  const range = getFinancialYearDates(fyString);
  if (!range) return false;

  const time = date.getTime();
  return time >= range.startDate.getTime() && time <= range.endDate.getTime();
}

/**
 * Determines the quarter (Q1..Q4) for a given 0-indexed month number.
 * Q1: Apr–Jun (months 3, 4, 5)
 * Q2: Jul–Sep (months 6, 7, 8)
 * Q3: Oct–Dec (months 9, 10, 11)
 * Q4: Jan–Mar (months 0, 1, 2)
 */
export function getQuarterForMonth(month: number): "Q1" | "Q2" | "Q3" | "Q4" {
  if (month >= 3 && month <= 5) return "Q1";
  if (month >= 6 && month <= 8) return "Q2";
  if (month >= 9 && month <= 11) return "Q3";
  return "Q4";
}

/**
 * Gets the current filing quarter details for a date.
 */
export function getFilingQuarter(date: Date = new Date()): {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  label: string;
  financialYear: string;
} {
  const month = date.getMonth();
  const quarter = getQuarterForMonth(month);
  const fy = getCurrentFinancialYear("FY ", date);

  const quarterLabels: Record<"Q1" | "Q2" | "Q3" | "Q4", string> = {
    Q1: "Q1 (Apr–Jun)",
    Q2: "Q2 (Jul–Sep)",
    Q3: "Q3 (Oct–Dec)",
    Q4: "Q4 (Jan–Mar)",
  };

  return {
    quarter,
    label: quarterLabels[quarter],
    financialYear: fy,
  };
}

/**
 * Returns the previous financial year string (e.g. "FY 2024-25" if current is 2025-26).
 */
export function getPreviousFinancialYear(
  prefix: string = "FY ",
  date: Date = new Date()
): string {
  const parsed = parseFinancialYear(getCurrentFinancialYear("", date));
  if (!parsed) return "";
  const prevStart = parsed.startYear - 1;
  const prevEnd = prevStart + 1;
  return `${prefix}${prevStart}-${String(prevEnd).slice(-2)}`;
}

/**
 * Returns the next financial year string (e.g. "FY 2026-27" if current is 2025-26).
 */
export function getNextFinancialYear(
  prefix: string = "FY ",
  date: Date = new Date()
): string {
  const parsed = parseFinancialYear(getCurrentFinancialYear("", date));
  if (!parsed) return "";
  const nextStart = parsed.startYear + 1;
  const nextEnd = nextStart + 1;
  return `${prefix}${nextStart}-${String(nextEnd).slice(-2)}`;
}

export const gstDateUtils = {
  getCurrentFinancialYear,
  generateFinancialYears,
  parseFinancialYear,
  getFinancialYearDates,
  isDateInFinancialYear,
  getQuarterForMonth,
  getFilingQuarter,
  getPreviousFinancialYear,
  getNextFinancialYear,
};

export default gstDateUtils;
