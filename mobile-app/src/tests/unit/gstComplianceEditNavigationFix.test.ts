import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

test("GstComplianceScreen: edit banner 'Editing Application Details' and Back to Review button are removed", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  // Verify banner text is completely removed
  assert.ok(
    !content.includes("Editing Application Details"),
    "Banner text 'Editing Application Details' should be completely removed"
  );

  // Verify 'Back to Review' button is removed
  assert.ok(
    !content.includes("Back to Review"),
    "'Back to Review' button should be removed from GstComplianceScreen"
  );
  assert.ok(
    !content.includes("returnToReviewBtn"),
    "returnToReviewBtn should not be rendered in GstComplianceScreen"
  );
});

test("gstold GstComplianceScreen: edit banner 'Editing Application Details' and Back to Review button are removed (if present)", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/modules/gstold/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx"
  );
  if (!fs.existsSync(filePath)) {
    assert.ok(true);
    return;
  }
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    !content.includes("Editing Application Details"),
    "gstold banner text 'Editing Application Details' should be completely removed"
  );

  assert.ok(
    !content.includes("Back to Review"),
    "'Back to Review' button should be removed from gstold GstComplianceScreen"
  );
  assert.ok(
    !content.includes("returnToReviewBtn"),
    "gstold returnToReviewBtn should not be rendered in GstComplianceScreen"
  );
});

test("GstComplianceReviewStep styles: value and valueMultiline are right-aligned", () => {
  const f1 = path.resolve(
    process.cwd(),
    "src/modules/gst/gst-compliance/components/GstComplianceReviewStep/GstComplianceReviewStep.styles.ts"
  );
  const f2 = path.resolve(
    process.cwd(),
    "src/modules/gstold/gst-compliance/components/GstComplianceReviewStep/GstComplianceReviewStep.styles.ts"
  );

  const files = [f1];
  if (fs.existsSync(f2)) files.push(f2);

  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    assert.ok(
      content.includes('value: {\n    fontSize: 13.5,\n    color: BrandColors.TEXT_PRIMARY,\n    fontWeight: "600",\n    textAlign: "right",') ||
      content.includes('textAlign: "right",'),
      "Styles should specify textAlign: 'right' for values"
    );
    assert.ok(
      content.replace(/\r\n/g, "\n").includes('valueMultiline: {\n    textAlign: "right",\n    lineHeight: 18,\n  }'),
      `File ${f} should have valueMultiline right-aligned`
    );
  }
});

test("GstComplianceScreen: source file wires showBack and onBackPress to isEditMode", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes("showBack={!isEditMode && currentStep !== 1}"),
    "ComplianceHeader should hide back button during edit mode and on review step"
  );

  assert.ok(
    content.includes("onBackPress={isEditMode ? undefined : handleBack}"),
    "ComplianceHeader onBackPress should be undefined when in edit mode"
  );

  assert.ok(
    !content.includes('key={currentStep === 1 ? "review-step" : "form-step"}'),
    "KeyboardAwareScrollView should not use dynamic step key to avoid remounting white cards and causing flickering"
  );
});

test("RequestTypeSection: removes reanimated fading in favor of instant native stable card rendering", () => {
  const f1 = path.resolve(
    process.cwd(),
    "src/modules/gst/gst-compliance/components/RequestTypeSection/RequestTypeSection.tsx"
  );
  const f2 = path.resolve(
    process.cwd(),
    "src/modules/gstold/gst-compliance/components/RequestTypeSection/RequestTypeSection.tsx"
  );

  const files = [f1];
  if (fs.existsSync(f2)) files.push(f2);

  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    assert.ok(
      !content.includes("FadeInDown"),
      `File ${f} should not use FadeInDown which causes downward sliding`
    );
    assert.ok(
      !content.includes("FadeOutUp"),
      `File ${f} should not use FadeOutUp which causes upward sliding`
    );
    assert.ok(
      !content.includes("react-native-reanimated"),
      `File ${f} should not use react-native-reanimated transitions which cause white card flickering when entering edit mode`
    );
  }
});
