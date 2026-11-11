export interface TaxSlab {
  min: number;
  max: number | null;
  rate: number;
  description: string;
}

export interface RegimeRules {
  standardDeduction: number;
  rebate87AThreshold: number;
  rebate87AMax: number;
  slabs: TaxSlab[];
  notes: string[];
}

export interface DeductionCaps {
  sec80c: number;
  sec80dNormal: number;
  sec80dSenior: number;
  sec24bSelfOccupied: number;
  sec80ccd1b: number;
  sec80tta: number;
}

export interface PresumptiveRates {
  sec44adDigital: number;
  sec44adNonDigital: number;
  sec44ada: number;
}

export interface TaxRuleVersionConfig {
  assessmentYear: string;
  financialYear: string;
  label: string;
  isCurrentAY: boolean;
  newRegime: RegimeRules;
  oldRegime: RegimeRules;
  deductionCaps: DeductionCaps;
  presumptiveRates: PresumptiveRates;
}
