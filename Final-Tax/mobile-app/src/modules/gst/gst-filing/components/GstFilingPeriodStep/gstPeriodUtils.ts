import {
  generateFinancialYears,
  getCurrentFinancialYear,
} from "@/modules/gst/utils/gstDateUtils";

export const FILING_PERIODS = ["Monthly", "Quarterly", "Annual"] as const;

export const FILING_NATURE_OPTIONS = ["Regular Return", "Nil Return"] as const;

export const FINANCIAL_YEARS = [
  "FY 2026-27",
  "FY 2025-26",
  "FY 2024-25",
  "FY 2023-24",
  "FY 2022-23",
  "FY 2021-22",
  "FY 2020-21",
  "FY 2019-20",
  "FY 2018-19",
  "FY 2017-18",
];

export const getFilingPeriodsForFrequency = (
  frequency: string,
  financialYear: string = getCurrentFinancialYear("FY ")
): string[] => {
  const match = financialYear.match(/(\d{4})-(\d{2})/);
  let y1 = 2025;
  let y2 = 2026;
  if (match) {
    y1 = parseInt(match[1], 10);
    const prefix = match[1].slice(0, 2);
    y2 = parseInt(`${prefix}${match[2]}`, 10);
  }

  if (frequency === "Quarterly") {
    return [
      `Q1 (Apr–Jun ${y1})`,
      `Q2 (Jul–Sep ${y1})`,
      `Q3 (Oct–Dec ${y1})`,
      `Q4 (Jan–Mar ${y2})`,
    ];
  }

  if (frequency === "Annual") {
    return [`${financialYear} (Full Year Return)`];
  }

  return [
    `April ${y1}`,
    `May ${y1}`,
    `June ${y1}`,
    `July ${y1}`,
    `August ${y1}`,
    `September ${y1}`,
    `October ${y1}`,
    `November ${y1}`,
    `December ${y1}`,
    `January ${y2}`,
    `February ${y2}`,
    `March ${y2}`,
  ];
};

export const getReturnTypesForFrequency = (frequency: string): string[] => {
  if (frequency === "Quarterly") {
    return [
      "GSTR-1 (QRMP — Quarterly)",
      "GSTR-3B (QRMP — Quarterly)",
    ];
  }
  if (frequency === "Annual") {
    return [
      "GSTR-1 (Outward Supplies)",
      "GSTR-3B (Summary Return)",
    ];
  }
  return [
    "GSTR-1 (Outward Supplies)",
    "GSTR-3B (Monthly Summary Return)",
  ];
};
