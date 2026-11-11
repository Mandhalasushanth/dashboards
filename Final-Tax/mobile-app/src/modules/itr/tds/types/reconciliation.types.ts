export interface TdsReconciliationItem {
  source: string;
  reportedAmount: number;
  enteredAmount: number;
  difference: number;
  hasMismatch: boolean;
  notes?: string;
}

export interface TdsReconciliationSummary {
  hasMismatch: boolean;
  totalReportedTds: number;
  totalEnteredTds: number;
  netDifference: number;
  items: TdsReconciliationItem[];
}
