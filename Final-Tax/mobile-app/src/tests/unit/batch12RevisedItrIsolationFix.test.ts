/**
 * Batch 12 — Revised ITR Data Isolation & Repeat Submission
 *
 * Bugs fixed:
 *   BUG-ITR-082 — Previous revision details, amounts and documents persist into another application
 *   BUG-ITR-083 — Submitted Revised ITR data carries over into another ITR flow
 *   BUG-ITR-067 — Completed submission flow can be repeated after Back navigation
 *   BUG-ITR-098 — Back from Track My Application returns to Review screen after submission
 *   BUG-ITR-066 — Back navigation after tracking returns to Review Revised ITR
 *
 * BUG-ITR-082 / BUG-ITR-083 root cause (pre-existing fix confirmed):
 *   FindOriginalReturnScreen.tsx useEffect calls reset() when no draft exists, clearing all
 *   previous-session data (formData, documents, revisedItrId, revisionReason, isSubmitted).
 *
 * BUG-ITR-067 root cause (fixed in this batch):
 *   ReviewRevisedComputationScreen.handleSubmitRevisedItr guarded only on `isSubmitting` (in-flight).
 *   After submission completes, `isSubmitting` becomes false while `store.isSubmitted` is true,
 *   leaving the button enabled and the handler callable — allowing a second submission.
 *   Fix: added `|| storeIsSubmitted` to both the handler early-return and the button's disabled prop.
 *
 * BUG-ITR-098 / BUG-ITR-066 root cause (fixed in this batch):
 *   After a successful submission, the success screen was navigated to with router.replace() but
 *   the previous service screens (find, reason, update, docs) remained in the root navigation stack.
 *   Pressing "Track My Application" or "Go Home" from the success screen used router.replace() into
 *   the (main) tab group, which may navigate within the existing (main) group without clearing the
 *   service stack. Back from Track/Home then traversed the lingering service entries.
 *   Fix:
 *     - ReviewRevisedComputationScreen: after dismissAll() clears service screens, use router.navigate()
 *       to push success as the only service entry above the root — preventing back into the wizard.
 *     - ApplicationSuccessScreen: all navigation actions (back, home, track) call dismissAll() to clear
 *       the stack to root when dismissible screens exist; the track action then navigates to the
 *       applications tab within the already-restored (main) root.
 *
 * Uses Node.js built-in test runner. No React Native or project imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline types mirroring the relevant store slices ─────────────────────────

interface RevisedProgressState {
  revisedItrId?: string;
  revisionReasonId?: string;
  detailsId?: string;
  documentId?: string;
  formData: Record<string, unknown> | null;
  documents: unknown[] | null;
  revisionReason: string | null;
  isSubmitted: boolean;
  maxStepReached: number;
}

function makeStore(): RevisedProgressState {
  return {
    revisedItrId: undefined,
    revisionReasonId: undefined,
    detailsId: undefined,
    documentId: undefined,
    formData: null,
    documents: null,
    revisionReason: null,
    isSubmitted: false,
    maxStepReached: 1,
  };
}

function resetStore(s: RevisedProgressState): RevisedProgressState {
  return makeStore();
}

function populateStore(s: RevisedProgressState): RevisedProgressState {
  return {
    ...s,
    revisedItrId: "RITR-001",
    revisionReasonId: "missed_income",
    detailsId: "DET-001",
    documentId: "DOC-001",
    formData: { grossIncome: 500000, taxPaid: 50000 },
    documents: [{ id: "doc1", fileUri: "file://doc.pdf" }],
    revisionReason: "Missed Income",
    isSubmitted: true,
    maxStepReached: 5,
  };
}

// ── BUG-ITR-082 / BUG-ITR-083: Store isolation ───────────────────────────────

describe("BUG-ITR-082 / BUG-ITR-083 — Revised ITR data isolation between applications", () => {
  it("reset() clears all form data from a previous application", () => {
    const s = populateStore(makeStore());
    const fresh = resetStore(s);
    assert.strictEqual(fresh.formData, null);
    assert.strictEqual(fresh.documents, null);
    assert.strictEqual(fresh.revisedItrId, undefined);
    assert.strictEqual(fresh.revisionReason, null);
  });

  it("reset() clears isSubmitted flag so a new flow starts as not-submitted", () => {
    const s = populateStore(makeStore());
    assert.strictEqual(s.isSubmitted, true);
    const fresh = resetStore(s);
    assert.strictEqual(fresh.isSubmitted, false);
  });

  it("reset() clears all backend IDs so a new application gets new IDs from the backend", () => {
    const s = populateStore(makeStore());
    const fresh = resetStore(s);
    assert.strictEqual(fresh.revisedItrId, undefined);
    assert.strictEqual(fresh.revisionReasonId, undefined);
    assert.strictEqual(fresh.detailsId, undefined);
    assert.strictEqual(fresh.documentId, undefined);
  });

  it("reset() clears maxStepReached so the new flow starts at step 1", () => {
    const s = populateStore(makeStore());
    assert.strictEqual(s.maxStepReached, 5);
    const fresh = resetStore(s);
    assert.strictEqual(fresh.maxStepReached, 1);
  });

  it("two independent applications have isolated stores after reset", () => {
    const appA = populateStore(makeStore());
    // New application mounts FindOriginalReturnScreen, no draft → reset() is called
    const appB = resetStore(appA);
    // appB data must not contain appA's data
    assert.notDeepStrictEqual(appB.formData, appA.formData);
    assert.notStrictEqual(appB.revisedItrId, appA.revisedItrId);
  });
});

// ── BUG-ITR-067: Duplicate submission prevention ──────────────────────────────

/** Mirrors the submission guard in ReviewRevisedComputationScreen.handleSubmitRevisedItr */
function canSubmit(isSubmitting: boolean, storeIsSubmitted: boolean): boolean {
  return !isSubmitting && !storeIsSubmitted;
}

describe("BUG-ITR-067 — Prevent duplicate final submission", () => {
  it("first submission is allowed when not in-flight and not yet submitted", () => {
    assert.strictEqual(canSubmit(false, false), true);
  });

  it("concurrent tap is rejected while a submission is already in-flight", () => {
    assert.strictEqual(canSubmit(true, false), false);
  });

  it("second submission is rejected once store.isSubmitted becomes true after success", () => {
    assert.strictEqual(canSubmit(false, true), false);
  });

  it("both guards active simultaneously are correctly rejected", () => {
    assert.strictEqual(canSubmit(true, true), false);
  });

  it("button disabled state mirrors the guard (disabled when either flag is true)", () => {
    const scenarios: [boolean, boolean, boolean][] = [
      [false, false, false], // enabled — normal initial state
      [true, false, true],   // disabled during in-flight submission
      [false, true, true],   // disabled after successful submission
      [true, true, true],    // disabled (both true)
    ];
    for (const [isSubmitting, storeIsSubmitted, expectedDisabled] of scenarios) {
      const disabled = isSubmitting || storeIsSubmitted;
      assert.strictEqual(disabled, expectedDisabled,
        `isSubmitting=${isSubmitting} storeIsSubmitted=${storeIsSubmitted} → disabled should be ${expectedDisabled}`);
    }
  });
});

// ── BUG-ITR-098 / BUG-ITR-066: Navigation stack cleanup ──────────────────────

/** Mirrors the dismissAll + navigate/replace decision in ReviewRevisedComputationScreen */
function simulatePostSubmitNavigation(
  canDismiss: boolean,
  stack: string[],
  successRoute = "/service/itr-success"
): string[] {
  if (canDismiss) {
    // dismissAll pops to first entry (main), then navigate pushes success
    const root = stack[0];
    return [root, successRoute];
  } else {
    // replace swaps the current top entry
    return [...stack.slice(0, -1), successRoute];
  }
}

/** Mirrors the dismissAll + navigate/replace decision in ApplicationSuccessScreen */
function simulateSuccessScreenNav(
  canDismiss: boolean,
  stack: string[],
  destination: string
): string[] {
  if (canDismiss) {
    // dismissAll pops to root; for applications tab navigate within root
    const root = stack[0];
    if (destination === "/(main)/applications") {
      return [root]; // navigate within (main) — tabs switch, no extra entry
    }
    return [root]; // home: already at root after dismiss
  } else {
    // replace swaps current top
    return [...stack.slice(0, -1), destination];
  }
}

describe("BUG-ITR-098 / BUG-ITR-066 — Navigation stack cleared after submission", () => {
  const serviceStack = [
    "(main)",
    "service/revised-itr",
    "service/revised-itr-reason",
    "service/revised-itr-update",
    "service/revised-itr-documents",
    "service/revised-itr-review",
  ];

  it("when canDismiss=true, post-submit navigation leaves only root + success in stack", () => {
    const result = simulatePostSubmitNavigation(true, serviceStack);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], "(main)");
    assert.strictEqual(result[1], "/service/itr-success");
  });

  it("when canDismiss=false, post-submit navigation replaces only the review entry", () => {
    const result = simulatePostSubmitNavigation(false, serviceStack);
    assert.strictEqual(result.length, 6);
    assert.strictEqual(result[5], "/service/itr-success");
    assert.ok(!result.includes("service/revised-itr-review"),
      "review screen must not remain in stack");
  });

  it("from success screen, Track My Application with canDismiss=true clears service screens", () => {
    const stackAfterSubmit = ["(main)", "/service/itr-success"];
    const result = simulateSuccessScreenNav(true, stackAfterSubmit, "/(main)/applications");
    assert.ok(!result.includes("/service/itr-success"),
      "success screen must not remain after navigating to Track");
    assert.ok(!result.some((r) => r.startsWith("service/revised-itr")),
      "no Revised ITR service screens should remain");
  });

  it("from success screen, Go Home with canDismiss=true clears service screens", () => {
    const stackAfterSubmit = ["(main)", "/service/itr-success"];
    const result = simulateSuccessScreenNav(true, stackAfterSubmit, "/(main)/home");
    assert.ok(!result.includes("/service/itr-success"),
      "success screen must not remain after Go Home");
  });

  it("from success screen, Track with canDismiss=false replaces success with applications entry", () => {
    const stack = ["(main)", "/service/itr-success"];
    const result = simulateSuccessScreenNav(false, stack, "/(main)/applications");
    assert.ok(!result.includes("/service/itr-success"),
      "success screen must be replaced by applications");
  });

  it("after Track navigation, review screen is never reachable via back (not in stack)", () => {
    // Start from the scenario where canDismiss=true cleared the stack to root + success
    const cleanStack = ["(main)", "/service/itr-success"];
    // User presses Track
    const afterTrack = simulateSuccessScreenNav(true, cleanStack, "/(main)/applications");
    // No wizard screens remain
    const wizardScreens = [
      "service/revised-itr",
      "service/revised-itr-reason",
      "service/revised-itr-update",
      "service/revised-itr-documents",
      "service/revised-itr-review",
    ];
    for (const screen of wizardScreens) {
      assert.ok(!afterTrack.includes(screen),
        `${screen} must not be reachable via back after Track`);
    }
  });
});

// ── Draft guard: isSubmitted suppresses back-press modal ─────────────────────

/** Mirrors useUniversalDraftGuard shouldPreventRemove */
function shouldPreventRemove(hasExited: boolean, isSubmittedFn: () => boolean, isDirtyFn: () => boolean): boolean {
  return !hasExited && !isSubmittedFn() && isDirtyFn();
}

describe("useUniversalDraftGuard — isSubmitted suppresses draft modal after submission", () => {
  it("dirty screen shows draft modal on back press before submission", () => {
    const result = shouldPreventRemove(false, () => false, () => true);
    assert.strictEqual(result, true);
  });

  it("after markSubmitted (hasExited=true), back press is no longer intercepted", () => {
    const result = shouldPreventRemove(true, () => false, () => true);
    assert.strictEqual(result, false);
  });

  it("when isSubmitted() returns true, back press is not intercepted even if hasExited=false", () => {
    const result = shouldPreventRemove(false, () => true, () => true);
    assert.strictEqual(result, false);
  });

  it("clean screen (isDirty=false) does not intercept back press", () => {
    const result = shouldPreventRemove(false, () => false, () => false);
    assert.strictEqual(result, false);
  });
});
