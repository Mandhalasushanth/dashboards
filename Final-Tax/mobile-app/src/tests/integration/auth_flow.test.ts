import type { TestResult } from "./auth_flow_types";
import { runScenarios1to6 } from "./auth_flow_scenarios_1_6";
import { runScenarios7to12 } from "./auth_flow_scenarios_7_12";

export * from "./auth_flow_types";

export async function runAllAuthIntegrationTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}> {
  const results: TestResult[] = [];

  const record = (
    scenarioNumber: number,
    name: string,
    passed: boolean,
    details?: string,
    error?: string
  ) => {
    results.push({ scenarioNumber, name, passed, details, error });
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`[Scenario ${scenarioNumber}] ${status}: ${name}`);
    if (details) console.log(`   Details: ${details}`);
    if (error) console.log(`   Error: ${error}`);
  };

  console.log("\n==================================================");
  console.log("RUNNING FINSOLZ AUTH INTEGRATION TESTS (12 SCENARIOS)");
  console.log("==================================================\n");

  await runScenarios1to6(record);
  await runScenarios7to12(record);

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n==================================================");
  console.log(
    `INTEGRATION TESTS SUMMARY: ${passedCount}/${results.length} PASSED (${failedCount} FAILED)`
  );
  console.log("==================================================\n");

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

export const AuthFlowIntegrationTest = {
  name: "Auth Flow Integration Tests",
  run: runAllAuthIntegrationTests,
};

export default AuthFlowIntegrationTest;
