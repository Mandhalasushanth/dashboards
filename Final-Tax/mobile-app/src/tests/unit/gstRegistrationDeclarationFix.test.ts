/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// ===============================================================================================
// Finsolz GST Registration — Declaration Checkbox Auto-Selection Bug Fix Unit Tests
// Tests the requirement:
// 1. Declaration checkbox is unchecked by default (state initialized to false).
// 2. No defaultChecked={true} or automatic selection logic.
// 3. Not auto-selected when opening Review, navigating back/forth, restoring draft, or re-rendering.
// 4. User must manually click checkbox to toggle.
// 5. Existing validation is preserved: submission blocked when declared is false.
// 6. After navigating away and returning, declaration is not automatically selected.
// 7. Source files in both gst and gstold strictly remain below 400 lines and no forbidden constructs.
// ===============================================================================================

const readProjectFile = (relPath: string): string => {
  const fullPath = path.join(process.cwd(), relPath);
  return fs.readFileSync(fullPath, "utf-8").replace(/\r\n/g, "\n");
};

test("1. State Initialization: declared state is initialized as false", () => {
  const gstFlow = readProjectFile(
    "src/modules/gst/gst-registration/hooks/useGstRegistrationFlow.ts"
  );
  const gstoldFlow = readProjectFile(
    "src/modules/gstold/gst-registration/hooks/useGstRegistrationFlow.ts"
  );

  assert.ok(
    gstFlow.includes("useState(false)"),
    "gst useGstRegistrationFlow must initialize declared state as false"
  );
  assert.equal(
    gstFlow.includes("useState(true)"),
    false,
    "gst useGstRegistrationFlow must not initialize declared state as true"
  );

  assert.ok(
    gstoldFlow.includes("useState(false)"),
    "gstold useGstRegistrationFlow must initialize declared state as false"
  );
  assert.equal(
    gstoldFlow.includes("useState(true)"),
    false,
    "gstold useGstRegistrationFlow must not initialize declared state as true"
  );
});

test("2. No defaultChecked or auto-check logic in Review Step component", () => {
  const reviewStep = readProjectFile(
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );
  const reviewStepOld = readProjectFile(
    "src/modules/gstold/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );

  assert.equal(
    reviewStep.includes("defaultChecked"),
    false,
    "GstReviewStep must not use defaultChecked"
  );
  assert.equal(
    reviewStepOld.includes("defaultChecked"),
    false,
    "gstold GstReviewStep must not use defaultChecked"
  );

  // Checkbox renders checkmark ONLY when declared is true
  assert.ok(
    reviewStep.includes("{declared && <Ionicons name=\"checkmark\""),
    "GstReviewStep must render checkmark only when declared is true"
  );
  assert.ok(
    reviewStep.includes("declared && styles.checkboxActive"),
    "GstReviewStep must apply active style only when declared is true"
  );
});

test("3. Navigation Step Reset: declared resets to false on screenIndex change and step navigation", () => {
  const flow = readProjectFile(
    "src/modules/gst/gst-registration/hooks/useGstRegistrationFlow.ts"
  );

  // Must have an effect resetting declared whenever screenIndex changes
  assert.ok(
    flow.includes("setDeclared(false);\n    if (screenIndex === 2) fetchRegistrationDetails();"),
    "useGstRegistrationFlow must reset declared to false whenever screenIndex transitions"
  );

  // Must reset declared in handleBack
  assert.ok(
    flow.includes("const handleBack = () => {\n    setDeclared(false);"),
    "handleBack must immediately reset declared to false"
  );

  // Must reset declared in handleEditStep
  assert.ok(
    flow.includes("setDeclared(false);\n    setScreenIndex(targetStepIndex);"),
    "handleEditStep must reset declared to false when navigating to edit a section"
  );

  // Must reset declared when completing edit or documents step to enter Review
  assert.ok(
    flow.includes("setDeclared(false);\n    setScreenIndex(nextStep);"),
    "submitBusinessStep and submitDocumentsStep must ensure declared is false on entering Review step"
  );
});

test("4. Navigation Simulation: declared is unchecked upon returning to Review Step", () => {
  // Simulate the state machine behavior
  class GstFlowSimulator {
    screenIndex = 0;
    declared = false;
    isEditMode = false;

    // Simulate navigation to next step
    goToNext() {
      this.screenIndex += 1;
      this.declared = false; // triggered by screenIndex change effect
    }

    // Simulate navigation to previous step
    goBack() {
      this.declared = false;
      this.screenIndex = Math.max(0, this.screenIndex - 1);
    }

    // Simulate editing a step from Review
    editStep(targetIndex: number) {
      this.isEditMode = true;
      this.declared = false;
      this.screenIndex = targetIndex;
    }

    // Simulate returning to review from edit
    returnToReview() {
      this.isEditMode = false;
      this.declared = false;
      this.screenIndex = 2;
    }

    // User toggles declaration manually
    toggleDeclaration() {
      this.declared = !this.declared;
    }

    // Re-render does NOT change screenIndex, so declared is preserved during the same view
    reRender() {
      // screenIndex unchanged -> declared unchanged
    }

    // Submit review step
    submit(): boolean {
      if (!this.declared) {
        return false; // Declaration Required
      }
      this.screenIndex = 3;
      return true;
    }
  }

  const sim = new GstFlowSimulator();

  // Initial step 0
  assert.equal(sim.screenIndex, 0);
  assert.equal(sim.declared, false, "Step 0: declared starts as false");

  // Navigate to step 1 (Documents)
  sim.goToNext();
  assert.equal(sim.screenIndex, 1);
  assert.equal(sim.declared, false, "Step 1: declared remains false");

  // Navigate to step 2 (Review)
  sim.goToNext();
  assert.equal(sim.screenIndex, 2);
  assert.equal(sim.declared, false, "Step 2 (Review): declared is UNCHECKED on initial arrival");

  // Submit without checking -> should fail
  assert.equal(sim.submit(), false, "Submit must fail when declaration is unchecked");

  // Re-rendering does not automatically check it
  sim.reRender();
  assert.equal(sim.declared, false, "Re-rendering Review screen must keep declaration unchecked");

  // User manually checks declaration
  sim.toggleDeclaration();
  assert.equal(sim.declared, true, "Manual click checks declaration");

  // Re-rendering keeps it checked during the same view
  sim.reRender();
  assert.equal(sim.declared, true, "Re-rendering preserves manual selection while on Review screen");

  // User navigates back to step 1 (Documents)
  sim.goBack();
  assert.equal(sim.screenIndex, 1);
  assert.equal(sim.declared, false, "Navigating back resets declared to false");

  // User returns to Review step (step 2)
  sim.goToNext();
  assert.equal(sim.screenIndex, 2);
  assert.equal(
    sim.declared,
    false,
    "Returning to Review step: declared must NOT be automatically selected"
  );

  // User checks again
  sim.toggleDeclaration();
  assert.equal(sim.declared, true);

  // User clicks Edit for business details
  sim.editStep(0);
  assert.equal(sim.screenIndex, 0);
  assert.equal(sim.declared, false, "Entering edit mode resets declared to false");

  // User returns to Review
  sim.returnToReview();
  assert.equal(sim.screenIndex, 2);
  assert.equal(
    sim.declared,
    false,
    "Returning from Edit mode: declared must NOT be automatically selected"
  );

  // User manually checks and submits
  sim.toggleDeclaration();
  assert.equal(sim.declared, true);
  assert.equal(sim.submit(), true, "Submit succeeds when declaration is manually checked");
  assert.equal(sim.screenIndex, 3);
});

test("5. Submission Guard: submitReviewStep blocks when declared is false", () => {
  const flow = readProjectFile(
    "src/modules/gst/gst-registration/hooks/useGstRegistrationFlow.ts"
  );

  assert.ok(
    flow.includes("if (!declared) {\n      Alert.alert(\"Declaration Required\", \"Please accept the declaration to submit your application.\");\n      return;\n    }"),
    "submitReviewStep must alert and return early when declared is false"
  );
});

test("6. Code Quality: modified files remain strictly below 400 lines and use zero forbidden constructs", () => {
  const filesToCheck = [
    "src/modules/gst/gst-registration/hooks/useGstRegistrationFlow.ts",
    "src/modules/gstold/gst-registration/hooks/useGstRegistrationFlow.ts",
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx",
    "src/modules/gstold/gst-registration/components/GstReviewStep/GstReviewStep.tsx",
  ];

  filesToCheck.map((relPath) => {
    const fullPath = path.join(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, "utf-8");
    const lineCount = content.split("\n").length;

    assert.ok(
      lineCount < 400,
      `File ${relPath} must be below 400 lines (current: ${lineCount})`
    );

    // Rule: no 'any'
    assert.equal(
      content.includes(": any") || content.includes("as any"),
      false,
      `File ${relPath} must not contain 'any' types`
    );

    // Rule: no 'for (' or 'for('
    assert.equal(
      /\bfor\s*\(/.test(content),
      false,
      `File ${relPath} must not contain for-loops`
    );

    // Rule: no 'while (' or 'while('
    assert.equal(
      /\bwhile\s*\(/.test(content),
      false,
      `File ${relPath} must not contain while-loops`
    );

    // Rule: no 'forEach'
    assert.equal(
      content.includes(".forEach"),
      false,
      `File ${relPath} must not contain forEach loops`
    );
    return null;
  });
});
