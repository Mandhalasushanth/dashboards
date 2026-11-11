import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// ===============================================================================================
// Finsolz ITR Filing — Bug 3: Auto-Scroll to Bank Details from Tax Summary Review
// ===============================================================================================

const srcPath = (...segments: string[]): string =>
  path.join(__dirname, "..", "..", ...segments);

const readSrc = (...segments: string[]): string =>
  fs.readFileSync(srcPath(...segments), "utf-8");

test("BUG 3 — 1. Step5TaxSummaryReview passes 'bank' section identifier on Bank Edit action", () => {
  const reviewContent = readSrc(
    "modules",
    "itr",
    "itr-filing",
    "components",
    "Step5TaxSummaryReview",
    "Step5TaxSummaryReview.tsx"
  );

  // Interface must support optional section argument
  assert.ok(
    /onEditStep:\s*\(stepIndex:\s*number,\s*section\?:\s*string\)\s*=>\s*void/.test(reviewContent),
    "Step5TaxSummaryReviewProps must define onEditStep with optional section parameter"
  );

  // Refund Bank Account card must call onEditStep(0, 'bank')
  assert.ok(
    reviewContent.includes('onEditStep(0, "bank")'),
    "Refund Bank Account Edit link must call onEditStep(0, 'bank')"
  );

  // Filing & Taxpayer Details must call onEditStep(0) without section
  assert.ok(
    reviewContent.includes("onEditStep(0)") && !reviewContent.includes('onEditStep(0, "taxpayer")'),
    "Filing & Taxpayer Details Edit link must call onEditStep(0) to scroll to top"
  );

  // Declared Income Breakdown must call onEditStep(1)
  assert.ok(
    reviewContent.includes("onEditStep(1)"),
    "Declared Income Breakdown Edit link must navigate to step 1"
  );
});

test("BUG 3 — 2. Step1PersonalInfo exposes onSectionLayout and measures Refund Bank Account card", () => {
  const typesContent = readSrc(
    "modules",
    "itr",
    "itr-filing",
    "components",
    "Step1PersonalInfo",
    "Step1PersonalInfo.types.ts"
  );

  assert.ok(
    /onSectionLayout\?:\s*\(section:\s*string,\s*y:\s*number\)\s*=>\s*void/.test(typesContent),
    "Step1PersonalInfoProps must include onSectionLayout callback"
  );

  const step1Content = readSrc(
    "modules",
    "itr",
    "itr-filing",
    "components",
    "Step1PersonalInfo",
    "Step1PersonalInfo.tsx"
  );

  assert.ok(
    step1Content.includes("onSectionLayout,"),
    "Step1PersonalInfo component must destructure onSectionLayout from props"
  );

  assert.ok(
    step1Content.includes('onSectionLayout?.("bank", e.nativeEvent.layout.y)'),
    "Refund Bank Account card must attach onLayout that reports ('bank', y)"
  );
});

test("BUG 3 — 3. ItrFilingScreen coordinates section layout, suppresses scroll-to-top, and scrolls to bank", () => {
  const screenContent = readSrc(
    "modules",
    "itr",
    "itr-filing",
    "screens",
    "ItrFilingScreen",
    "ItrFilingScreen.tsx"
  );

  // Must track target section and freshly measured container & section coordinates
  assert.ok(
    screenContent.includes("targetSectionRef = useRef<string | null>(null)"),
    "ItrFilingScreen must maintain targetSectionRef"
  );
  assert.ok(
    screenContent.includes("step1ContainerYRef = useRef<number | null>(null)"),
    "ItrFilingScreen must maintain step1ContainerYRef for accurate contentContainer coordinates"
  );
  assert.ok(
    screenContent.includes("sectionRelativeYRef = useRef<Record<string, number | null>>({})"),
    "ItrFilingScreen must maintain sectionRelativeYRef"
  );
  assert.ok(
    screenContent.includes("scrollAnimFrameRef = useRef<number | null>(null)"),
    "ItrFilingScreen must maintain scrollAnimFrameRef for clean cancellable frame scheduling"
  );

  // Must wrap Step1 in container onLayout
  assert.ok(
    screenContent.includes("onLayout={handleStep1ContainerLayout}"),
    "Step1PersonalInfo must be wrapped with handleStep1ContainerLayout"
  );
  assert.ok(
    screenContent.includes("onSectionLayout={handleSectionLayout}"),
    "Step1PersonalInfo must receive handleSectionLayout"
  );

  // Step5TaxSummaryReview must receive handleEditStep
  assert.ok(
    screenContent.includes("onEditStep={handleEditStep}"),
    "Step5TaxSummaryReview must receive handleEditStep"
  );

  // Suppress scroll-to-top when targetSectionRef is set
  assert.ok(
    screenContent.includes("if (targetSectionRef.current)"),
    "Step transition useEffect must check targetSectionRef before scrolling to 0"
  );

  // Header clearance offset
  assert.ok(
    screenContent.includes("Math.max(0, finalY - 16)"),
    "dispatchTargetedScrollIfReady must leave breathing room for the header (finalY - 16)"
  );
});

test("BUG 3 — 4. Execution Simulation: Dual-measurement requirement & single-dispatch coordinator", () => {
  const mockScrollView = {
    scrollLog: [] as { y: number; animated: boolean }[],
    scrollTo(opts: { y: number; animated: boolean }) {
      this.scrollLog.push(opts);
    },
  };

  let currentStep = 3; // On Review screen
  let targetSection: string | null = null;
  let containerY: number | null = null;
  const sectionRelativeY: Record<string, number | null> = {};

  const dispatchTargetedScrollIfReady = () => {
    if (currentStep !== 0) return;
    if (!targetSection) return;
    const relY = sectionRelativeY[targetSection];
    if (typeof containerY !== "number" || typeof relY !== "number") {
      return; // Still waiting for other measurement
    }
    const finalY = containerY + relY;
    targetSection = null; // Cleared before scheduling
    // Simulate frame callback
    if (currentStep === 0) {
      mockScrollView.scrollTo({
        y: Math.max(0, finalY - 16),
        animated: true,
      });
    }
  };

  const handleSectionLayout = (section: string, relativeY: number) => {
    sectionRelativeY[section] = relativeY;
    dispatchTargetedScrollIfReady();
  };

  const handleStep1ContainerLayout = (parentY: number) => {
    containerY = parentY;
    dispatchTargetedScrollIfReady();
  };

  const handleEditStep = (stepIdx: number, section?: string) => {
    targetSection = section || null;
    if (stepIdx === 0 && section) {
      containerY = null;
      sectionRelativeY[section] = null;
    }
    currentStep = stepIdx;
  };

  // --- Scenario A: User clicks "Edit Bank Details" from Review ---
  handleEditStep(0, "bank");
  assert.equal(currentStep, 0);
  assert.equal(targetSection, "bank");
  assert.equal(containerY, null);
  assert.equal(sectionRelativeY["bank"], null);

  // Step 1 container layouts first at y=0, but section is not yet measured
  handleStep1ContainerLayout(0);
  // Must NOT scroll yet because section measurement is pending
  assert.equal(mockScrollView.scrollLog.length, 0);
  assert.equal(targetSection, "bank");

  // Step 1 Bank card layouts second at y=850
  handleSectionLayout("bank", 850);
  // Now BOTH are available -> scrolls to 850 - 16 = 834
  assert.deepEqual(mockScrollView.scrollLog, [{ y: 834, animated: true }]);
  // Target is cleared
  assert.equal(targetSection, null);

  // Subsequent layout events (e.g. dynamic rerender) must NOT trigger duplicate scrolls
  handleSectionLayout("bank", 850);
  handleStep1ContainerLayout(0);
  assert.equal(mockScrollView.scrollLog.length, 1, "Duplicate scroll must not be dispatched");

  // --- Scenario B: User returns to Review and clicks "Edit Filing Details" ---
  currentStep = 3;
  handleEditStep(0); // No section
  assert.equal(targetSection, null);

  // Transition effect fires scroll to 0 when no target is pending
  if (!targetSection) {
    mockScrollView.scrollTo({ y: 0, animated: true });
  }
  assert.deepEqual(mockScrollView.scrollLog, [
    { y: 834, animated: true },
    { y: 0, animated: true },
  ]);

  // Layout events on Filing Details step must NOT trigger bank scroll
  handleStep1ContainerLayout(0);
  handleSectionLayout("bank", 850);
  assert.equal(mockScrollView.scrollLog.length, 2);

  // --- Scenario C: Repeated Navigation back to Bank Details ---
  currentStep = 3;
  handleEditStep(0, "bank");
  assert.equal(targetSection, "bank");
  // Measurements are invalidated on navigation
  assert.equal(containerY, null);
  assert.equal(sectionRelativeY["bank"], null);

  // Layout fires in reverse order this time: section first, then container
  handleSectionLayout("bank", 860);
  assert.equal(mockScrollView.scrollLog.length, 2, "Must not scroll when container Y is missing");

  handleStep1ContainerLayout(0);
  assert.deepEqual(mockScrollView.scrollLog, [
    { y: 834, animated: true },
    { y: 0, animated: true },
    { y: 844, animated: true }, // 860 - 16 = 844
  ]);
  assert.equal(targetSection, null);

  // --- Scenario D: Navigating away before layout completes ---
  currentStep = 3;
  handleEditStep(0, "bank");
  // User rapidly clicks back before layout fires
  currentStep = 3;
  // If delayed layout arrives, it must be guarded by currentStep === 0
  handleStep1ContainerLayout(0);
  handleSectionLayout("bank", 860);
  assert.equal(mockScrollView.scrollLog.length, 3, "Must not scroll when user left Step 1");
});

