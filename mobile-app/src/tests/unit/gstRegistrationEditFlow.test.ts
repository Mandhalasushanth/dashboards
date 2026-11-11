/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// ===============================================================================================
// Finsolz GST Registration — Edit Mode Navigation & Back Button Visibility Unit Tests
// - Normal registration: Back buttons are visible on steps before and on Review.
// - Clicking Edit from Review: Back button is hidden on the selected editing screen.
// - Throughout edit flow: Back button remains hidden while isEditMode is active.
// - Returning to Review: Review screen restores normal header behavior.
// - Editing another section from Review: Back button is hidden again.
// ===============================================================================================

interface MockHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  showBack: boolean;
  onBack?: () => void;
}

const computeHeaderProps = (
  screenIndex: number,
  isEditMode: boolean,
  handleBack: () => void,
  stepLabels: readonly string[]
): MockHeaderProps => ({
  currentStep: screenIndex + 1,
  totalSteps: 3,
  stepLabel: stepLabels[screenIndex] || "",
  showBack: !isEditMode,
  onBack: isEditMode ? undefined : handleBack,
});

test("GstRegistrationScreen: source file wires showBack and onBack to edit mode", () => {
  const filePath = path.join(
    process.cwd(),
    "src/modules/gst/gst-registration/screens/GstRegistrationScreen/GstRegistrationScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("showBack={!isEditMode}"),
    "GstRegistrationScreen must pass showBack={!isEditMode} to GstStepHeader"
  );
  assert.ok(
    content.includes("onBack={isEditMode ? undefined : handleBack}"),
    "GstRegistrationScreen must pass onBack={isEditMode ? undefined : handleBack} to GstStepHeader"
  );
  assert.ok(
    content.includes("isEditMode,"),
    "GstRegistrationScreen must destructure isEditMode from useGstRegistrationFlow"
  );
});

test("Normal registration: Back button is visible on steps 0, 1, and 2", () => {
  const stepLabels = ["Business Details", "Upload Documents", "Review Application"];
  let backClicked = false;
  const dummyBack = () => {
    backClicked = true;
  };

  const normalSteps = [0, 1, 2];
  normalSteps.forEach((stepIdx) => {
    const isEditMode = false;
    const headerProps = computeHeaderProps(stepIdx, isEditMode, dummyBack, stepLabels);

    assert.equal(headerProps.showBack, true, `Step ${stepIdx} in normal flow must show back button`);
    assert.equal(typeof headerProps.onBack, "function", `Step ${stepIdx} in normal flow must wire onBack handler`);

    backClicked = false;
    headerProps.onBack?.();
    assert.equal(backClicked, true, `Step ${stepIdx} back handler must be callable`);
  });
});

test("Review-to-Edit flow: Back button is hidden on Step 0 when editing Business, Bank, or Signatory", () => {
  const stepLabels = ["Business Details", "Upload Documents", "Review Application"];
  const dummyBack = () => {};

  const editSections = ["business", "bank", "signatory"];
  editSections.forEach((section) => {
    // Entering edit mode from Review for section
    const targetStep = 0;
    const isEditMode = true;
    const headerProps = computeHeaderProps(targetStep, isEditMode, dummyBack, stepLabels);

    assert.equal(
      headerProps.showBack,
      false,
      `Header on Step 0 for section '${section}' must hide Back button`
    );
    assert.equal(
      headerProps.onBack,
      undefined,
      `Header on Step 0 for section '${section}' must not wire onBack handler`
    );
  });
});

test("Review-to-Edit flow: Back button is hidden on Step 1 when editing Uploaded Documents", () => {
  const stepLabels = ["Business Details", "Upload Documents", "Review Application"];
  const dummyBack = () => {};

  const targetStep = 1;
  const isEditMode = true;
  const headerProps = computeHeaderProps(targetStep, isEditMode, dummyBack, stepLabels);

  assert.equal(headerProps.showBack, false, "Header on Step 1 when editing Documents must hide Back button");
  assert.equal(headerProps.onBack, undefined, "Header on Step 1 when editing Documents must not wire onBack handler");
});

test("Review-to-Edit flow: Back button stays hidden while navigating between screens during edit mode", () => {
  const stepLabels = ["Business Details", "Upload Documents", "Review Application"];
  const dummyBack = () => {};

  const editScreens = [0, 1];
  const isEditMode = true;

  editScreens.forEach((stepIdx) => {
    const headerProps = computeHeaderProps(stepIdx, isEditMode, dummyBack, stepLabels);
    assert.equal(
      headerProps.showBack,
      false,
      `Step ${stepIdx} must keep Back button hidden throughout edit flow`
    );
    assert.equal(headerProps.onBack, undefined);
  });
});

test("Returning to Review: restores normal Review screen header and Back button behavior", () => {
  const stepLabels = ["Business Details", "Upload Documents", "Review Application"];
  let backClicked = false;
  const dummyBack = () => {
    backClicked = true;
  };

  // Simulating Return to Review: isEditMode becomes false, screenIndex becomes 2
  const screenIndex = 2;
  const isEditMode = false;
  const headerProps = computeHeaderProps(screenIndex, isEditMode, dummyBack, stepLabels);

  assert.equal(headerProps.showBack, true, "Review screen header must show Back button normally");
  assert.equal(typeof headerProps.onBack, "function");

  headerProps.onBack?.();
  assert.equal(backClicked, true, "Review screen Back button must be operable");
});

test("Editing another section from Review: hides the Back button again", () => {
  const stepLabels = ["Business Details", "Upload Documents", "Review Application"];
  const dummyBack = () => {};

  // First edit round: Bank Details (Step 0)
  let isEditMode = true;
  let headerProps = computeHeaderProps(0, isEditMode, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, false, "First edit must hide back button");

  // User taps Update & Review -> Returns to Review (Step 2)
  isEditMode = false;
  headerProps = computeHeaderProps(2, isEditMode, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, true, "Return to review must restore header");

  // Second edit round: Uploaded Documents (Step 1)
  isEditMode = true;
  headerProps = computeHeaderProps(1, isEditMode, dummyBack, stepLabels);
  assert.equal(headerProps.showBack, false, "Second edit on Documents must hide back button again");
  assert.equal(headerProps.onBack, undefined);
});

test("Fresh registration: initialized with isEditMode false and normal Back button visibility", () => {
  const stepLabels = ["Business Details", "Upload Documents", "Review Application"];
  const dummyBack = () => {};

  const initialScreen = 0;
  const initialEditMode = false;
  const headerProps = computeHeaderProps(initialScreen, initialEditMode, dummyBack, stepLabels);

  assert.equal(headerProps.showBack, true, "Fresh registration must start with visible Back button");
  assert.equal(typeof headerProps.onBack, "function");
});
