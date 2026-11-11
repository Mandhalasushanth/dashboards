/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// ===============================================================================================
// Finsolz GST Filing — Edit Mode Navigation & Back Button Visibility Unit Tests
// - Normal filing: Back button is visible on Step 0 and Step 1.
// - Step 2 (Review): Review screen already has showBack={false} (currentStep !== 2).
// - Clicking Edit from Review (Filing Details or Tax Computation -> Step 0): Back button is hidden.
// - Clicking Edit from Review (Documents -> Step 1): Back button is hidden.
// - Returning to Review via Update & Review: isEditMode resets and returns to Review.
// ===============================================================================================

interface MockHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  showBack: boolean;
  onBack?: () => void;
}

const computeFilingHeaderProps = (
  currentStep: number,
  isEditMode: boolean,
  handleBack: () => void,
  stepLabels: readonly string[]
): MockHeaderProps => ({
  currentStep: currentStep + 1,
  totalSteps: 3,
  stepLabel: stepLabels[currentStep] || "Filing",
  showBack: !isEditMode && currentStep !== 2,
  onBack: isEditMode ? undefined : handleBack,
});

test("GstFilingScreen: source file wires showBack and onBack to isEditMode", () => {
  const filePath = path.join(
    process.cwd(),
    "src/modules/gst/gst-filing/screens/GstFilingScreen/GstFilingScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("showBack={!isEditMode && currentStep !== 2}"),
    "GstFilingScreen must pass showBack={!isEditMode && currentStep !== 2} to GstStepHeader"
  );
  assert.ok(
    content.includes("onBack={isEditMode ? undefined : handleBack}"),
    "GstFilingScreen must pass onBack={isEditMode ? undefined : handleBack} to GstStepHeader"
  );
  assert.ok(
    content.includes("isEditMode,"),
    "GstFilingScreen must destructure isEditMode from useGstFiling"
  );
});

test("gstold GstFilingScreen: source file wires showBack and onBack to isEditMode", () => {
  const filePath = path.join(
    process.cwd(),
    "src/modules/gstold/gst-filing/screens/GstFilingScreen/GstFilingScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("showBack={!isEditMode && currentStep !== 2}"),
    "gstold GstFilingScreen must pass showBack={!isEditMode && currentStep !== 2} to GstStepHeader"
  );
  assert.ok(
    content.includes("onBack={isEditMode ? undefined : handleBack}"),
    "gstold GstFilingScreen must pass onBack={isEditMode ? undefined : handleBack} to GstStepHeader"
  );
  assert.ok(
    content.includes("isEditMode,"),
    "gstold GstFilingScreen must destructure isEditMode from useGstFiling"
  );
});

test("Normal filing flow: Back button is visible on Step 0 and Step 1, hidden on Step 2", () => {
  const stepLabels = ["Filing Period & Nature", "Upload Invoices & Data", "Review & Tax Computation"];
  let backClicked = false;
  const dummyBack = () => {
    backClicked = true;
  };

  // Step 0: Normal flow
  let headerProps = computeFilingHeaderProps(0, false, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, true, "Step 0 in normal flow must show back button");
  assert.equal(typeof headerProps.onBack, "function", "Step 0 in normal flow must wire onBack");
  headerProps.onBack?.();
  assert.equal(backClicked, true);

  // Step 1: Normal flow
  backClicked = false;
  headerProps = computeFilingHeaderProps(1, false, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, true, "Step 1 in normal flow must show back button");
  assert.equal(typeof headerProps.onBack, "function", "Step 1 in normal flow must wire onBack");
  headerProps.onBack?.();
  assert.equal(backClicked, true);

  // Step 2: Review in normal flow
  headerProps = computeFilingHeaderProps(2, false, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, false, "Step 2 (Review) must hide back button");
});

test("Edit from Review: Back button is hidden on Step 0 when editing Filing Details or Tax Computation", () => {
  const stepLabels = ["Filing Period & Nature", "Upload Invoices & Data", "Review & Tax Computation"];
  const dummyBack = () => {};

  // Entering edit mode from Review for Filing Details / Tax Computation -> navigates to Step 0 with isEditMode=true
  const headerProps = computeFilingHeaderProps(0, true, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, false, "Header on Step 0 during edit must hide Back button");
  assert.equal(headerProps.onBack, undefined, "Header on Step 0 during edit must not wire onBack");
});

test("Edit from Review: Back button is hidden on Step 1 when editing Documents", () => {
  const stepLabels = ["Filing Period & Nature", "Upload Invoices & Data", "Review & Tax Computation"];
  const dummyBack = () => {};

  // Entering edit mode from Review for Documents -> navigates to Step 1 with isEditMode=true
  const headerProps = computeFilingHeaderProps(1, true, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, false, "Header on Step 1 during edit must hide Back button");
  assert.equal(headerProps.onBack, undefined, "Header on Step 1 during edit must not wire onBack");
});

test("Returning to Review: resets edit mode and restores Review state", () => {
  const stepLabels = ["Filing Period & Nature", "Upload Invoices & Data", "Review & Tax Computation"];
  const dummyBack = () => {};

  // After Update & Review: isEditMode=false, currentStep=2
  const headerProps = computeFilingHeaderProps(2, false, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, false, "Review step retains showBack=false");
});
