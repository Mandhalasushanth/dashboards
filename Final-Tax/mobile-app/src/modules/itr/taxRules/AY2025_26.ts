import { TaxRuleVersionConfig } from "./types";

export const AY2025_26: TaxRuleVersionConfig = {
  assessmentYear: "2025-2026",
  financialYear: "2024-2025",
  label: "AY 2025-26 (FY 2024-25)",
  isCurrentAY: true,
  newRegime: {
    standardDeduction: 75000,
    rebate87AThreshold: 700000,
    rebate87AMax: 25000,
    slabs: [
      { min: 0, max: 300000, rate: 0, description: "Up to ₹3 Lakhs: Nil" },
      { min: 300000, max: 700000, rate: 0.05, description: "₹3 Lakhs to ₹7 Lakhs: 5%" },
      { min: 700000, max: 1000000, rate: 0.10, description: "₹7 Lakhs to ₹10 Lakhs: 10%" },
      { min: 1000000, max: 1200000, rate: 0.15, description: "₹10 Lakhs to ₹12 Lakhs: 15%" },
      { min: 1200000, max: 1500000, rate: 0.20, description: "₹12 Lakhs to ₹15 Lakhs: 20%" },
      { min: 1500000, max: null, rate: 0.30, description: "Above ₹15 Lakhs: 30%" },
    ],
    notes: [
      "Standard deduction of ₹75,000 for eligible salaried employees automatically applied.",
      "Section 87A rebate covers income up to ₹7,00,000 (tax liability is ₹0).",
      "Realigned slab tax rates providing substantial tax savings for middle-income earners.",
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
      "Claim Section 80C deductions (EPF, PPF, LIC, ELSS, Housing loan principal up to ₹1.5L).",
      "Claim Section 80D health insurance & 24(b) home loan interest (up to ₹2L).",
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
