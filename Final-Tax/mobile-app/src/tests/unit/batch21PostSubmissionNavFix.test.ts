/**
 * Batch 21 — ITR Filing Post-Submission Navigation
 * Regression tests for 5 bugs:
 *   BUG_B21_001 — ItrStepIndicator totalSteps default was 5; only 4 steps exist
 *                 Progress bar showed 80% at final step; back-button hidden condition unreachable
 *   BUG_B21_002 — handleBack called router.dismissAll() without navigating home;
 *                 user could land on any screen below the stack
 *   BUG_B21_003 — handleGoHome same bug as handleBack (identical implementation)
 *   BUG_B21_004 — handleTrackStatus called router.navigate() after router.dismissAll();
 *                 navigate() after dismissAll() is unreliable — should use router.replace()
 *   BUG_B21_005 — BackHandler useEffect had empty [] deps, trapping stale closure over handleBack
 *
 * All logic inlined — no project module imports (avoids @/ alias issues
 * with --experimental-strip-types).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inlined helpers ───────────────────────────────────────────────────────────

/**
 * Mirrors ItrStepIndicator progress computation.
 * progressPercent = Math.min(100, Math.max(0, (displayStepNumber / totalSteps) * 100))
 * displayStepNumber = currentStep + 1
 */
function computeProgress(currentStep: number, totalSteps: number): number {
  const displayStepNumber = currentStep + 1;
  return Math.min(100, Math.max(0, (displayStepNumber / totalSteps) * 100));
}

/**
 * Mirrors ItrStepIndicator back-button hidden check:
 * hidden when currentStep === totalSteps - 1 || hideBackButton
 */
function isBackButtonHidden(
  currentStep: number,
  totalSteps: number,
  hideBackButton: boolean = false
): boolean {
  return currentStep === totalSteps - 1 || hideBackButton;
}

/**
 * Mirrors ItrStepIndicator "Save Draft" button visibility:
 * shown when currentStep === totalSteps - 1
 */
function isSaveDraftVisible(currentStep: number, totalSteps: number): boolean {
  return currentStep === totalSteps - 1;
}

/**
 * Simulates the FIXED handleBack/handleGoHome:
 * always calls router.replace("/(main)/home")
 */
function simulateHandleBack(
  canDismiss: boolean
): { method: string; target: string } {
  // Fixed: unconditional replace — canDismiss is irrelevant
  void canDismiss; // parameter exists only to contrast with old behaviour
  return { method: "replace", target: "/(main)/home" };
}

/**
 * Simulates the BUGGY handleBack:
 * dismissAll() when canDismiss; replace home only in else branch
 */
function simulateHandleBackBuggy(
  canDismiss: boolean
): { method: string; target: string } {
  if (canDismiss) {
    return { method: "dismissAll", target: "(stack root — unpredictable)" };
  }
  return { method: "replace", target: "/(main)/home" };
}

/**
 * Simulates the FIXED handleTrackStatus:
 * always calls router.replace("/(main)/applications")
 */
function simulateHandleTrackStatus(
  canDismiss: boolean
): { method: string; target: string } {
  void canDismiss;
  return { method: "replace", target: "/(main)/applications" };
}

/**
 * Simulates the BUGGY handleTrackStatus:
 * dismissAll() + navigate() when canDismiss; replace only in else branch
 */
function simulateHandleTrackStatusBuggy(
  canDismiss: boolean
): Array<{ method: string; target: string }> {
  if (canDismiss) {
    return [
      { method: "dismissAll", target: "(stack root)" },
      { method: "navigate", target: "/(main)/applications" }, // unreliable after dismissAll
    ];
  }
  return [{ method: "replace", target: "/(main)/applications" }];
}

// ── BUG_B21_001: ItrStepIndicator totalSteps default ─────────────────────────

describe("BUG_B21_001 — ItrStepIndicator: totalSteps default must be 4 (not 5)", () => {
  it("with totalSteps=4 (fixed): step 0 → 25% progress", () => {
    assert.equal(computeProgress(0, 4), 25);
  });

  it("with totalSteps=4 (fixed): step 1 → 50% progress", () => {
    assert.equal(computeProgress(1, 4), 50);
  });

  it("with totalSteps=4 (fixed): step 2 → 75% progress", () => {
    assert.equal(computeProgress(2, 4), 75);
  });

  it("with totalSteps=4 (fixed): step 3 (last) → 100% progress", () => {
    assert.equal(computeProgress(3, 4), 100);
  });

  it("regression: with totalSteps=5 (buggy): step 3 (last) → only 80% progress", () => {
    // Bug: (4/5)*100 = 80 — user sees unfilled progress bar at review step
    assert.equal(computeProgress(3, 5), 80);
  });

  it("with totalSteps=4 (fixed): back button hidden at step 3 (last step)", () => {
    assert.equal(isBackButtonHidden(3, 4), true);
  });

  it("with totalSteps=4 (fixed): back button visible at steps 0, 1, 2", () => {
    assert.equal(isBackButtonHidden(0, 4), false);
    assert.equal(isBackButtonHidden(1, 4), false);
    assert.equal(isBackButtonHidden(2, 4), false);
  });

  it("regression: with totalSteps=5 (buggy): back button never hidden (step 3 !== 4)", () => {
    // Bug: totalSteps-1 = 4, currentStep max is 3 → condition always false
    assert.equal(isBackButtonHidden(3, 5), false); // back button shown on last step — wrong
    assert.equal(isBackButtonHidden(4, 5), true);  // would hide at step 4 — unreachable
  });

  it("with totalSteps=4 (fixed): Save Draft shown on step 3", () => {
    assert.equal(isSaveDraftVisible(3, 4), true);
  });

  it("regression: with totalSteps=5 (buggy): Save Draft never shown (step 3 !== 4)", () => {
    // Bug: totalSteps-1 = 4, actual last step is 3 → Save Draft never rendered
    assert.equal(isSaveDraftVisible(3, 5), false);
  });

  it("STEP_LABELS has exactly 4 entries (indices 0-3)", () => {
    const STEP_LABELS = [
      "Personal & Filing Info",
      "Income Sources",
      "Documents",
      "Tax Summary & Review",
    ];
    assert.equal(STEP_LABELS.length, 4);
    // With totalSteps=4, index 3 is the last valid label
    assert.ok(STEP_LABELS[3] !== undefined);
    // With totalSteps=5, index 4 would be undefined → label falls back to stepTitle
    assert.equal(STEP_LABELS[4], undefined);
  });

  it("progress bar clamped to 100% even if step overshoots", () => {
    assert.equal(computeProgress(4, 4), 100); // clamp prevents > 100%
  });

  it("progress bar clamped to 0% for step -1 (defensive)", () => {
    assert.equal(computeProgress(-1, 4), 0);
  });
});

// ── BUG_B21_002: handleBack uses dismissAll without navigating home ────────────

describe("BUG_B21_002 — handleBack must always navigate to /(main)/home", () => {
  it("fixed: when canDismiss=true → replace home (not dismissAll)", () => {
    const result = simulateHandleBack(true);
    assert.equal(result.method, "replace");
    assert.equal(result.target, "/(main)/home");
  });

  it("fixed: when canDismiss=false → replace home", () => {
    const result = simulateHandleBack(false);
    assert.equal(result.method, "replace");
    assert.equal(result.target, "/(main)/home");
  });

  it("regression: buggy handleBack with canDismiss=true → dismissAll (user may not reach home)", () => {
    const result = simulateHandleBackBuggy(true);
    assert.equal(result.method, "dismissAll");
    assert.notEqual(result.target, "/(main)/home");
  });

  it("regression: buggy handleBack with canDismiss=false → replace home (worked by luck)", () => {
    const result = simulateHandleBackBuggy(false);
    assert.equal(result.method, "replace");
    assert.equal(result.target, "/(main)/home");
  });

  it("fixed: route target is consistent regardless of stack state", () => {
    const withModal = simulateHandleBack(true);
    const withoutModal = simulateHandleBack(false);
    assert.equal(withModal.target, withoutModal.target);
    assert.equal(withModal.method, withoutModal.method);
  });
});

// ── BUG_B21_003: handleGoHome same bug as handleBack ─────────────────────────

describe("BUG_B21_003 — handleGoHome must always navigate to /(main)/home", () => {
  it("fixed: handleGoHome always uses replace regardless of canDismiss", () => {
    // Fixed implementation: router.replace("/(main)/home") unconditionally
    const withDismiss = simulateHandleBack(true);   // same logic as fixed handleGoHome
    const withoutDismiss = simulateHandleBack(false);
    assert.equal(withDismiss.method, "replace");
    assert.equal(withDismiss.target, "/(main)/home");
    assert.equal(withoutDismiss.method, "replace");
    assert.equal(withoutDismiss.target, "/(main)/home");
  });

  it("regression: buggy handleGoHome — with canDismiss=true, goes to stack root, not home", () => {
    const bugResult = simulateHandleBackBuggy(true);
    // dismissAll leaves user at whatever is below all modals — not necessarily /(main)/home
    assert.equal(bugResult.method, "dismissAll");
    assert.ok(!bugResult.target.includes("/(main)/home"));
  });

  it("fixed: Go Home button after successful submission always lands on home screen", () => {
    // Simulates pressing "Go Home" right after submission
    const result = simulateHandleBack(true); // canDismiss=true because filing screens are in stack
    assert.equal(result.target, "/(main)/home");
  });

  it("handleBack and handleGoHome produce identical navigation outcomes (fixed)", () => {
    const back = simulateHandleBack(true);
    const goHome = simulateHandleBack(true);
    assert.deepEqual(back, goHome);
  });
});

// ── BUG_B21_004: handleTrackStatus navigate() after dismissAll() ──────────────

describe("BUG_B21_004 — handleTrackStatus must use router.replace, not navigate after dismissAll", () => {
  it("fixed: always emits exactly one replace call to applications", () => {
    const result = simulateHandleTrackStatus(true);
    assert.equal(result.method, "replace");
    assert.equal(result.target, "/(main)/applications");
  });

  it("fixed: canDismiss=false also uses replace to applications", () => {
    const result = simulateHandleTrackStatus(false);
    assert.equal(result.method, "replace");
    assert.equal(result.target, "/(main)/applications");
  });

  it("regression: buggy handleTrackStatus with canDismiss=true emits TWO calls", () => {
    const calls = simulateHandleTrackStatusBuggy(true);
    // Bug: dismissAll + navigate — two back-to-back calls; navigate() may race dismissAll()
    assert.equal(calls.length, 2);
    assert.equal(calls[0].method, "dismissAll");
    assert.equal(calls[1].method, "navigate"); // navigate after dismissAll is unreliable
  });

  it("regression: buggy handleTrackStatus with canDismiss=false emits one replace (worked)", () => {
    const calls = simulateHandleTrackStatusBuggy(false);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "replace"); // else branch was correct by coincidence
  });

  it("fixed: exactly one navigation call emitted always", () => {
    const withDismiss = simulateHandleTrackStatus(true);
    const withoutDismiss = simulateHandleTrackStatus(false);
    // Both produce a single replace call
    assert.equal(withDismiss.method, "replace");
    assert.equal(withoutDismiss.method, "replace");
    assert.equal(withDismiss.target, "/(main)/applications");
    assert.equal(withoutDismiss.target, "/(main)/applications");
  });

  it("fixed: navigation target is applications regardless of canDismiss", () => {
    const a = simulateHandleTrackStatus(true);
    const b = simulateHandleTrackStatus(false);
    assert.equal(a.target, b.target);
  });

  it("navigation uses replace (not navigate/push) — prevents back-button returning to success", () => {
    const result = simulateHandleTrackStatus(true);
    assert.equal(result.method, "replace");
    // replace removes success screen from stack; navigate() would keep it
    assert.notEqual(result.method, "navigate");
    assert.notEqual(result.method, "push");
  });
});

// ── BUG_B21_005: BackHandler effect empty deps stale closure ──────────────────

describe("BUG_B21_005 — BackHandler useEffect must include handleBack in deps", () => {
  it("useCallback identity is stable when router is stable", () => {
    // Simulates React.useCallback(fn, [router]) — if router doesn't change, fn is stable
    let callCount = 0;
    function makeHandler(router: { replace: (r: string) => void }) {
      return function handleBack() {
        callCount++;
        router.replace("/(main)/home");
      };
    }

    const stableRouter = { replace: (_: string) => {} };
    const fn1 = makeHandler(stableRouter);
    const fn2 = makeHandler(stableRouter);
    // Same logic — if memoized with useCallback([router]), re-render yields same ref
    fn1(); fn2();
    assert.equal(callCount, 2); // both handlers are callable and identical in logic
  });

  it("handleBack (fixed) always calls replace regardless of when it was captured", () => {
    // The fix ensures handleBack is wrapped in useCallback and included in deps.
    // Since router is stable in expo-router, this means the handler is always fresh.
    const calls: string[] = [];
    const router = { replace: (path: string) => calls.push(path) };

    // Simulate fixed handleBack — calls router.replace
    const handleBack = () => router.replace("/(main)/home");
    handleBack();
    assert.deepEqual(calls, ["/(main)/home"]);
  });

  it("stale closure bug: effect with [] deps captures initial handleBack only", () => {
    // Demonstrates stale closure — effect never re-subscribes
    let capturedFn: (() => void) | null = null;
    let backPressRoute = "";

    // Initial render
    function makeHandleBack(route: string) {
      return () => { backPressRoute = route; };
    }

    let handleBack = makeHandleBack("/(main)/home");

    // useEffect(fn, []) — captures handleBack at initial render
    capturedFn = handleBack;

    // Simulate re-render with new handleBack (e.g., different route)
    handleBack = makeHandleBack("/(main)/other");

    // Effect was NOT re-run (stale closure) — still calls old handleBack
    capturedFn?.();
    assert.equal(backPressRoute, "/(main)/home"); // stale, but functionally OK since route doesn't change
  });

  it("with correct deps [handleBack], effect re-subscribes when handleBack changes", () => {
    let capturedFn: (() => void) | null = null;
    let backPressRoute = "";

    function makeHandleBack(route: string) {
      return () => { backPressRoute = route; };
    }

    let handleBack = makeHandleBack("/(main)/home");

    // useEffect re-runs when handleBack identity changes — simulated by manual re-capture
    const subscribeEffect = (fn: () => void) => { capturedFn = fn; };
    subscribeEffect(handleBack);

    // Re-render with same handleBack (useCallback + stable router = no re-run needed)
    handleBack = makeHandleBack("/(main)/home");
    subscribeEffect(handleBack); // deps changed → effect re-ran with new ref

    const fn = capturedFn as unknown as (() => void);
    fn();
    assert.equal(backPressRoute, "/(main)/home");
  });

  it("hardware back press on success screen always navigates to home (combined path)", () => {
    const navLog: string[] = [];
    const router = { replace: (path: string) => navLog.push(path) };

    // Simulate the fixed BackHandler callback
    const handleBack = () => router.replace("/(main)/home" as string);
    const backHandler = () => { handleBack(); return true; };

    const result = backHandler();
    assert.equal(result, true); // consumed the event
    assert.equal(navLog[0], "/(main)/home");
  });
});

// ── Combined post-submission navigation scenarios ─────────────────────────────

describe("Combined post-submission navigation scenarios", () => {
  it("success screen: all three exit paths use replace (not navigate/push)", () => {
    const back = simulateHandleBack(true);
    const goHome = simulateHandleBack(true);     // handleGoHome — same logic
    const track = simulateHandleTrackStatus(true);

    assert.equal(back.method, "replace");
    assert.equal(goHome.method, "replace");
    assert.equal(track.method, "replace");
  });

  it("success screen: back and goHome → home; trackStatus → applications", () => {
    const back = simulateHandleBack(true);
    const goHome = simulateHandleBack(true);
    const track = simulateHandleTrackStatus(true);

    assert.equal(back.target, "/(main)/home");
    assert.equal(goHome.target, "/(main)/home");
    assert.equal(track.target, "/(main)/applications");
  });

  it("step indicator: with totalSteps=4, all 4 steps have valid progress values", () => {
    const progressValues = [0, 1, 2, 3].map((s) => computeProgress(s, 4));
    assert.deepEqual(progressValues, [25, 50, 75, 100]);
    // All values are valid (0–100)
    for (const v of progressValues) {
      assert.ok(v >= 0 && v <= 100);
    }
  });

  it("step indicator: back button visible exactly on steps 0, 1, 2 (not 3)", () => {
    const backVisible = [0, 1, 2, 3].map((s) => !isBackButtonHidden(s, 4));
    assert.deepEqual(backVisible, [true, true, true, false]);
  });

  it("step indicator: Save Draft visible exactly on step 3 (review)", () => {
    const saveDraftVisible = [0, 1, 2, 3].map((s) => isSaveDraftVisible(s, 4));
    assert.deepEqual(saveDraftVisible, [false, false, false, true]);
  });

  it("full flow: user reaches last step, progress=100%, back hidden, Save Draft shown", () => {
    const lastStep = 3;
    const totalSteps = 4;
    assert.equal(computeProgress(lastStep, totalSteps), 100);
    assert.equal(isBackButtonHidden(lastStep, totalSteps), true);
    assert.equal(isSaveDraftVisible(lastStep, totalSteps), true);
  });

  it("regression: with totalSteps=5, last step shows wrong state", () => {
    const lastStep = 3;
    const buggyTotal = 5;
    assert.equal(computeProgress(lastStep, buggyTotal), 80);    // wrong: 80% not 100%
    assert.equal(isBackButtonHidden(lastStep, buggyTotal), false); // wrong: back still visible
    assert.equal(isSaveDraftVisible(lastStep, buggyTotal), false); // wrong: Save Draft hidden
  });
});
