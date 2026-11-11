export interface TestResult {
  scenarioNumber: number;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export type RecordFunction = (
  scenarioNumber: number,
  name: string,
  passed: boolean,
  details?: string,
  error?: string
) => void;
