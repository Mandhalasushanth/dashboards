import { AssessmentYearItem } from "../types/previousYear.types";

export const ASSESSMENT_YEARS: AssessmentYearItem[] = [
  {
    id: "ay-2025-26",
    year: "AY 2025–26",
    subtitle: "Belated return filing period has ended.",
    status: "closed",
    isEligible: false,
  },
  {
    id: "ay-2024-25",
    year: "AY 2024–25",
    subtitle: "Updated Return (ITR-U) can be filed until 31 March 2027.",
    status: "eligible",
    isEligible: true,
  },
  {
    id: "ay-2023-24",
    year: "AY 2023–24",
    subtitle: "Updated Return (ITR-U) can be filed until 31 March 2026.",
    status: "eligible",
    isEligible: true,
  },
  {
    id: "ay-2022-23",
    year: "AY 2022–23",
    subtitle: "Filing window has closed.",
    status: "closed",
    isEligible: false,
  },
];
