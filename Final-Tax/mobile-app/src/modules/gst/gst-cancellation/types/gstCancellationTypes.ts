export interface CancellationDoc {
  uri: string;
  name: string;
  size: string;
  mimeType?: string;
}

export interface CancellationFormData {
  gstin: string;
  reason: string;
  otherReason: string;
  cancellationDate: string;
  closingStock: string;
  pendingLiabilities: string;
  lastGstr3b: string;
  supportingDoc: CancellationDoc | null;
  isVoluntaryUnderOneYear: boolean | null;
  areAllReturnsFiled: boolean | null;
  isFinalReturnDeclared: boolean;
}

export const INITIAL_CANCELLATION_FORM: CancellationFormData = {
  gstin: "",
  reason: "",
  otherReason: "",
  cancellationDate: "",
  closingStock: "",
  pendingLiabilities: "",
  lastGstr3b: "",
  supportingDoc: null,
  isVoluntaryUnderOneYear: null,
  areAllReturnsFiled: null,
  isFinalReturnDeclared: false,
};

export type CancellationStep = "FORM" | "REVIEW" | "SUCCESS";

export interface CancellationSubmissionResult {
  arn: string;
  date: string;
  appId: string;
}

export interface CancellationDto {
  customerId?: string;
  gstin: string;
  reasonForCancellation: string;
  dateCancellationIsSought: string | null;
  closingStockAndInputTaxReversal: string;
  pendingDuesLiabilities: string;
  lastGstr3bFiledArnPeriod: string;
  supportingProofDocument?: any;
}
