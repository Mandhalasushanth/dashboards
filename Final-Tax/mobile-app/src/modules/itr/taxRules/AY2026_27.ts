import { TaxRuleVersionConfig } from "./types";

export const AY2026_27: TaxRuleVersionConfig = {
  assessmentYear: "2026-2027",
  financialYear: "2025-2026",
  label: "AY 2026-27 (FY 2025-26)",
  isCurrentAY: false,
  newRegime: {
    standardDeduction: 75000,
    rebate87AThreshold: 1200000,
    rebate87AMax: 60000,
    slabs: [
      { min: 0, max: 400000, rate: 0, description: "Up to ₹4 Lakhs: Nil" },
      { min: 400000, max: 800000, rate: 0.05, description: "₹4 Lakhs to ₹8 Lakhs: 5%" },
      { min: 800000, max: 1200000, rate: 0.10, description: "₹8 Lakhs to ₹12 Lakhs: 10%" },
      { min: 1200000, max: 1600000, rate: 0.15, description: "₹12 Lakhs to ₹16 Lakhs: 15%" },
      { min: 1600000, max: 2000000, rate: 0.20, description: "₹16 Lakhs to ₹20 Lakhs: 20%" },
      { min: 2000000, max: 2400000, rate: 0.25, description: "₹20 Lakhs to ₹24 Lakhs: 25%" },
      { min: 2400000, max: null, rate: 0.30, description: "Above ₹24 Lakhs: 30%" },
    ],
    notes: [
      "Tax slabs commence at ₹4 Lakhs providing increased threshold exemption.",
      "Standard deduction of ₹75,000 for salaried individuals applied automatically.",
      "Expanded Section 87A rebate covers taxable income up to ₹12,00,000 (tax liability is ₹0).",
    ],
  },
  oldRegime: {
    standardDeduction: 50000,
    rebate87AThreshold: 500000,
    rebate87AMax: 12500,
    slabs: [
      { min: 0, max: 250000, rate: 0, description: "Up to ₹2.5 Lakhs: Nil" },
      { min: 250000, max: 500000, rate: 0.05, description: "₹2.5 Lakhs to ₹5 Lakhs: 5%" },
      { min: 500000, max: 1000000, rate: 0.20, description: "₹5 Lakhs to ₹10 Lakhs: 20%" },
      { min: 1000000, max: null, rate: 0.30, description: "Above ₹10 Lakhs: 30%" },
    ],
    notes: [
      "Standard deduction of ₹50,000 for salaried employees.",
      "Claim Section 80C investments (EPF, PPF, LIC, ELSS up to ₹1.5 Lakhs).",
      "Claim Section 80D health insurance & 24(b) home loan interest.",
    ],
  },
  deductionCaps: {
    sec80c: 150000,
    sec80dNormal: 25000,
    sec80dSenior: 50000,
    sec24bSelfOccupied: 200000,
    sec80ccd1b: 50000,
    sec80tta: 10000,
  },
  presumptiveRates: {
    sec44adDigital: 0.06,
    sec44adNonDigital: 0.08,
    sec44ada: 0.50,
  },
};
