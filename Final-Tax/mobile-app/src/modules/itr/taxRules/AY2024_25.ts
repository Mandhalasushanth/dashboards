import { TaxRuleVersionConfig } from "./types";

export const AY2024_25: TaxRuleVersionConfig = {
  assessmentYear: "2024-2025",
  financialYear: "2023-2024",
  label: "AY 2024-25 (FY 2023-24)",
  isCurrentAY: false,
  newRegime: {
    standardDeduction: 50000,
    rebate87AThreshold: 700000,
    rebate87AMax: 25000,
    slabs: [
      { min: 0, max: 300000, rate: 0, description: "Up to ₹3 Lakhs: Nil" },
      { min: 300000, max: 600000, rate: 0.05, description: "₹3 Lakhs to ₹6 Lakhs: 5%" },
      { min: 600000, max: 900000, rate: 0.10, description: "₹6 Lakhs to ₹9 Lakhs: 10%" },
      { min: 900000, max: 1200000, rate: 0.15, description: "₹9 Lakhs to ₹12 Lakhs: 15%" },
      { min: 1200000, max: 1500000, rate: 0.20, description: "₹12 Lakhs to ₹15 Lakhs: 20%" },
      { min: 1500000, max: null, rate: 0.30, description: "Above ₹15 Lakhs: 30%" },
    ],
    notes: [
      "Standard deduction of ₹50,000 for salaried employees automatically applied.",
      "Section 87A rebate covers taxable income up to ₹7,00,000 (tax liability is ₹0).",
      "Lower tax slab rates across income brackets without Chapter VI-A deductions.",
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
      "Claim Section 80C deductions (EPF, PPF, LIC, ELSS up to ₹1.5 Lakhs).",
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
