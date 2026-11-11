import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const CALC_SECTION_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/components/GstFilingPeriodStep/GstCalculationMethodSection.tsx"
);
const CALC_SECTION_OLD_PATH = path.resolve(
  process.cwd(),
  "src/modules/gstold/gst-filing/components/GstFilingPeriodStep/GstCalculationMethodSection.tsx"
);
const HOOK_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/hooks/useGstFilingForm.ts"
);
const HOOK_OLD_PATH = path.resolve(
  process.cwd(),
  "src/modules/gstold/gst-filing/hooks/useGstFilingForm.ts"
);
const STEP_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.tsx"
);
const VALIDATION_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/utils/gstFilingValidation.ts"
);

test("GstCalculationMethodSection displays red mandatory asterisk (*) for all 3 estimated fields", () => {
  const code = fs.readFileSync(CALC_SECTION_PATH, "utf8");
  const checkList = [code];
  if (fs.existsSync(CALC_SECTION_OLD_PATH)) {
    checkList.push(fs.readFileSync(CALC_SECTION_OLD_PATH, "utf8"));
  }

  checkList.forEach((content) => {
    assert.ok(
      content.includes("Estimated Taxable Sales (₹) <Text style={styles.star}>*</Text>"),
      "Sales label must have mandatory asterisk"
    );
    assert.ok(
      content.includes("Estimated Taxable Purchases (₹) <Text style={styles.star}>*</Text>"),
      "Purchases label must have mandatory asterisk"
    );
    assert.ok(
      content.includes("Estimated Eligible ITC (₹) <Text style={styles.star}>*</Text>"),
      "Eligible ITC label must have mandatory asterisk"
    );
  });
});

test("validateEstimatedAmount function implementation supports isRequired flag", () => {
  const valCode = fs.readFileSync(VALIDATION_PATH, "utf8");
  assert.ok(
    valCode.includes("isRequired = false"),
    "validateEstimatedAmount must accept isRequired parameter"
  );
  assert.ok(
    valCode.includes("return isRequired ? `Enter ${fieldName}` : null;"),
    "validateEstimatedAmount must return `Enter ${fieldName}` when required and empty"
  );
  assert.ok(
    valCode.includes('return "Amount cannot be negative";'),
    "validateEstimatedAmount must reject negative amounts"
  );
  assert.ok(
    valCode.includes('return "Enter a valid amount";'),
    "validateEstimatedAmount must reject invalid characters"
  );
});

test("useGstFilingForm enforces mandatory validation only when manual_estimates is chosen", () => {
  const hookCode = fs.readFileSync(HOOK_PATH, "utf8");
  const checkList = [hookCode];
  if (fs.existsSync(HOOK_OLD_PATH)) {
    checkList.push(fs.readFileSync(HOOK_OLD_PATH, "utf8"));
  }

  checkList.forEach((content) => {
    assert.ok(
      content.includes('periodData.calculationMethod === "manual_estimates"'),
      "Hook must check calculationMethod === manual_estimates"
    );
    assert.ok(
      content.includes('validateEstimatedAmount(periodData.taxableSales, "sales", true)'),
      "Hook must validate taxableSales as required for manual_estimates"
    );
    assert.ok(
      content.includes('validateEstimatedAmount(periodData.taxablePurchases, "purchases", true)'),
      "Hook must validate taxablePurchases as required for manual_estimates"
    );
    assert.ok(
      content.includes('validateEstimatedAmount(periodData.eligibleItc, "eligible ITC", true)'),
      "Hook must validate eligibleItc as required for manual_estimates"
    );
  });
});

test("GstFilingPeriodStep triggers onBlur validation with isManual condition", () => {
  const stepCode = fs.readFileSync(STEP_PATH, "utf8");
  assert.ok(
    stepCode.includes('const isManual = data.calculationMethod === "manual_estimates"'),
    "GstFilingPeriodStep must determine isManual from calculationMethod"
  );
  assert.ok(
    stepCode.includes('validateEstimatedAmount(data.taxableSales, "sales", isManual)'),
    "taxableSales onBlur must pass isManual flag"
  );
  assert.ok(
    stepCode.includes('validateEstimatedAmount(data.taxablePurchases, "purchases", isManual)'),
    "taxablePurchases onBlur must pass isManual flag"
  );
  assert.ok(
    stepCode.includes('validateEstimatedAmount(data.eligibleItc, "eligible ITC", isManual)'),
    "eligibleItc onBlur must pass isManual flag"
  );
});
