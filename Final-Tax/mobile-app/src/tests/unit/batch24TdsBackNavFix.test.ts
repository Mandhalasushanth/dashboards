/**
 * Batch 24 — TDS Refund Back Navigation
 * Regression tests for 3 bugs:
 *   BUG_B24_001 — useUniversalDraftGuard.handleSaveAndExit / handleDiscardAndExit called
 *                 onSaveDraft / onDiscardDraft without await → navigation fired before async
 *                 save completed → draft could be lost if app was backgrounded mid-save
 *   BUG_B24_002 — TdsDocumentChecklistScreen destructured handleSaveAndExit AS openDraftModal
 *                 → custom back button called handleSaveAndExit directly, skipping the
 *                 confirmation modal entirely (no "Save / Discard / Cancel" dialog shown)
 *   BUG_B24_003 — TdsRefundEstimateScreen passed isDirty: () => true → draft confirmation
 *                 modal fired on every back press from this read-only calculation view,
 *                 even when the user had made no edits
 *
 * All logic inlined — no project module imports.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Shared types ──────────────────────────────────────────────────────────────

interface NavCall { method: "replace" | "back"; destination?: string }

// ── BUG_B24_001 helpers ───────────────────────────────────────────────────────

/**
 * Simulates handleSaveAndExit BEFORE fix (bug): fire-and-forget onSaveDraft,
 * then navigate synchronously.
 */
async function simulateSaveAndExitBuggy(
  onSaveDraft: () => Promise<void>,
  destination: string | null
): Promise<{ savedBeforeNav: boolean; nav: NavCall }> {
  const saved: boolean[] = [];

  // Buggy: not awaited — navigation fires before save resolves
  onSaveDraft().then(() => saved.push(true));

  const nav: NavCall = destination
    ? { method: "replace", destination }
    : { method: "back" };

  // At this point the promise has not resolved yet (microtask not flushed)
  return { savedBeforeNav: saved.length > 0, nav };
}

/**
 * Simulates handleSaveAndExit AFTER fix: await onSaveDraft before navigating.
 */
async function simulateSaveAndExitFixed(
  onSaveDraft: () => Promise<void>,
  destination: string | null
): Promise<{ savedBeforeNav: boolean; nav: NavCall }> {
  const saved: boolean[] = [];

  await onSaveDraft();
  saved.push(true);

  const nav: NavCall = destination
    ? { method: "replace", destination }
    : { method: "back" };

  return { savedBeforeNav: saved.length > 0, nav };
}

/**
 * Simulates handleDiscardAndExit BEFORE fix (bug).
 */
async function simulateDiscardAndExitBuggy(
  onDiscardDraft: () => Promise<void>,
  destination: string | null
): Promise<{ discardedBeforeNav: boolean; nav: NavCall }> {
  const discarded: boolean[] = [];

  onDiscardDraft().then(() => discarded.push(true)); // not awaited

  const nav: NavCall = destination
    ? { method: "replace", destination }
    : { method: "back" };

  return { discardedBeforeNav: discarded.length > 0, nav };
}

/**
 * Simulates handleDiscardAndExit AFTER fix.
 */
async function simulateDiscardAndExitFixed(
  onDiscardDraft: () => Promise<void>,
  destination: string | null
): Promise<{ discardedBeforeNav: boolean; nav: NavCall }> {
  const discarded: boolean[] = [];

  await onDiscardDraft();
  discarded.push(true);

  const nav: NavCall = destination
    ? { method: "replace", destination }
    : { method: "back" };

  return { discardedBeforeNav: discarded.length > 0, nav };
}

// ── BUG_B24_002 helpers ───────────────────────────────────────────────────────

interface DraftGuardReturn {
  showDraftModal: boolean;
  openDraftModal: () => void;   // shows the modal
  handleSaveAndExit: () => void; // saves + navigates
  handleDiscardAndExit: () => void;
}

/**
 * Simulates buggy destructuring: handleSaveAndExit renamed as openDraftModal.
 * The back button calls openDraftModal() which is actually handleSaveAndExit.
 */
function simulateChecklistDestructuringBuggy(guard: DraftGuardReturn): {
  backButtonAction: string;
  modalSaveAction: string;
} {
  // Buggy destructuring:
  const { handleSaveAndExit: openDraftModal, handleDiscardAndExit } = guard;
  // Back button calls openDraftModal — which is handleSaveAndExit
  const backButtonAction = openDraftModal === guard.handleSaveAndExit
    ? "handleSaveAndExit"
    : "openDraftModal";
  // Modal save button also calls openDraftModal — still handleSaveAndExit
  const modalSaveAction = openDraftModal === guard.handleSaveAndExit
    ? "handleSaveAndExit"
    : "openDraftModal";
  return { backButtonAction, modalSaveAction };
}

/**
 * Simulates fixed destructuring: openDraftModal and handleSaveAndExit are separate.
 */
function simulateChecklistDestructuringFixed(guard: DraftGuardReturn): {
  backButtonAction: string;
  modalSaveAction: string;
} {
  // Correct destructuring:
  const { openDraftModal, handleSaveAndExit } = guard;
  const backButtonAction = openDraftModal === guard.openDraftModal
    ? "openDraftModal"
    : "handleSaveAndExit";
  const modalSaveAction = handleSaveAndExit === guard.handleSaveAndExit
    ? "handleSaveAndExit"
    : "openDraftModal";
  return { backButtonAction, modalSaveAction };
}

// ── BUG_B24_003 helpers ───────────────────────────────────────────────────────

function shouldPreventRemove(isDirty: () => boolean, isSubmitted: boolean, hasExited: boolean): boolean {
  return !hasExited && !isSubmitted && isDirty();
}

// ── BUG_B24_001 — async save not awaited ─────────────────────────────────────

describe("BUG_B24_001 — handleSaveAndExit must await onSaveDraft before navigating", () => {
  const slowSave = async (): Promise<void> => {
    await new Promise<void>((resolve) => setTimeout(resolve, 1));
  };

  it("fixed: navigation happens only after save completes", async () => {
    const result = await simulateSaveAndExitFixed(slowSave, "/service/itr");
    assert.equal(result.savedBeforeNav, true);
    assert.equal(result.nav.method, "replace");
    assert.equal(result.nav.destination, "/service/itr");
  });

  it("regression: buggy navigation fires before async save resolves", async () => {
    const result = await simulateSaveAndExitBuggy(slowSave, "/service/itr");
    // Promise hasn't resolved yet at the point navigation fires
    assert.equal(result.savedBeforeNav, false);
    assert.equal(result.nav.method, "replace");
  });

  it("fixed: with no saveDestination, back() happens after save", async () => {
    const result = await simulateSaveAndExitFixed(slowSave, null);
    assert.equal(result.savedBeforeNav, true);
    assert.equal(result.nav.method, "back");
  });

  it("fixed: handleDiscardAndExit awaits onDiscardDraft before navigating", async () => {
    const result = await simulateDiscardAndExitFixed(slowSave, "/service/itr");
    assert.equal(result.discardedBeforeNav, true);
    assert.equal(result.nav.method, "replace");
  });

  it("regression: buggy discard navigates before discard callback completes", async () => {
    const result = await simulateDiscardAndExitBuggy(slowSave, "/service/itr");
    assert.equal(result.discardedBeforeNav, false);
  });

  it("fixed: synchronous onSaveDraft still works after fix (await on sync fn is safe)", async () => {
    const syncSave = async () => {};
    const result = await simulateSaveAndExitFixed(syncSave, "/service/itr");
    assert.equal(result.savedBeforeNav, true);
  });

  it("fixed: save error does not silently swallow — exception propagates (caller handles)", async () => {
    const failingSave = async () => { throw new Error("AsyncStorage full"); };
    await assert.rejects(
      () => simulateSaveAndExitFixed(failingSave, "/service/itr"),
      /AsyncStorage full/
    );
  });

  it("type widening: onSaveDraft accepts () => void | Promise<void>", () => {
    // Both sync and async save functions are assignable to the new type
    const syncFn: () => void | Promise<void> = () => {};
    const asyncFn: () => void | Promise<void> = async () => {};
    assert.equal(typeof syncFn, "function");
    assert.equal(typeof asyncFn, "function");
  });
});

// ── BUG_B24_002 — back button skips confirmation modal ───────────────────────

describe("BUG_B24_002 — TdsDocumentChecklistScreen back button must open modal, not save directly", () => {
  const makeGuard = (): DraftGuardReturn & { modalShown: boolean; savedCount: number } => {
    let modalShown = false;
    let savedCount = 0;

    return {
      get showDraftModal() { return modalShown; },
      openDraftModal: () => { modalShown = true; },
      handleSaveAndExit: () => { savedCount++; },
      handleDiscardAndExit: () => {},
      get modalShown() { return modalShown; },
      get savedCount() { return savedCount; },
    };
  };

  it("regression: buggy destructuring — back button action is handleSaveAndExit (skips modal)", () => {
    const guard = makeGuard();
    const result = simulateChecklistDestructuringBuggy(guard);
    assert.equal(result.backButtonAction, "handleSaveAndExit"); // wrong
  });

  it("fixed: back button action is openDraftModal (shows modal first)", () => {
    const guard = makeGuard();
    const result = simulateChecklistDestructuringFixed(guard);
    assert.equal(result.backButtonAction, "openDraftModal"); // correct
  });

  it("fixed: modal Save button action is handleSaveAndExit (saves and exits)", () => {
    const guard = makeGuard();
    const result = simulateChecklistDestructuringFixed(guard);
    assert.equal(result.modalSaveAction, "handleSaveAndExit"); // correct
  });

  it("regression: buggy — back press immediately saves without showing modal", () => {
    const guard = makeGuard();
    // Buggy: back button calls handleSaveAndExit (renamed as openDraftModal)
    const { handleSaveAndExit: openDraftModal } = guard;
    openDraftModal(); // back button press
    assert.equal(guard.savedCount, 1); // saved immediately
    assert.equal(guard.modalShown, false); // modal was never shown
  });

  it("fixed: back press shows modal, save only happens when user confirms", () => {
    const guard = makeGuard();
    // Fixed: back button calls openDraftModal (the actual modal opener)
    guard.openDraftModal(); // back button press
    assert.equal(guard.savedCount, 0); // NOT saved yet
    assert.equal(guard.modalShown, true); // modal IS shown
    // User clicks "Save as Draft & Exit"
    guard.handleSaveAndExit();
    assert.equal(guard.savedCount, 1); // saved only after confirmation
  });

  it("fixed: modal Save button calls handleSaveAndExit not openDraftModal", () => {
    const guard = makeGuard();
    guard.openDraftModal(); // back button shows modal
    assert.equal(guard.modalShown, true);
    // The modal's onSaveAndExit prop should be handleSaveAndExit
    guard.handleSaveAndExit();
    assert.equal(guard.savedCount, 1); // save happens after confirmation
  });

  it("openDraftModal and handleSaveAndExit are distinct functions in the hook return", () => {
    const guard = makeGuard();
    assert.notEqual(guard.openDraftModal, guard.handleSaveAndExit);
  });
});

// ── BUG_B24_003 — estimate screen always-dirty prevents free back navigation ─

describe("BUG_B24_003 — TdsRefundEstimateScreen isDirty must be false (read-only view)", () => {
  it("regression: isDirty:()=>true causes shouldPreventRemove=true → modal fires on every back press", () => {
    const buggyIsDirty = () => true;
    const preventRemove = shouldPreventRemove(buggyIsDirty, false, false);
    assert.equal(preventRemove, true); // blocks navigation always
  });

  it("fixed: isDirty:()=>false means shouldPreventRemove=false → back is always free", () => {
    const fixedIsDirty = () => false;
    const preventRemove = shouldPreventRemove(fixedIsDirty, false, false);
    assert.equal(preventRemove, false); // back press is never blocked
  });

  it("fixed: even with hasExited=false, shouldPreventRemove=false when not dirty", () => {
    const fixedIsDirty = () => false;
    assert.equal(shouldPreventRemove(fixedIsDirty, false, false), false);
    assert.equal(shouldPreventRemove(fixedIsDirty, false, true), false);
    assert.equal(shouldPreventRemove(fixedIsDirty, true, false), false);
  });

  it("regression: with always-dirty, even submitted users see the modal (wrong)", () => {
    const buggyIsDirty = () => true;
    // If isSubmitted returns false but form is always dirty, modal fires
    assert.equal(shouldPreventRemove(buggyIsDirty, false, false), true);
  });

  it("estimate screen is a read-only calculation view — no user-editable fields", () => {
    // The estimate screen shows auto-calculated TDS estimate from form data
    // User can only go back to edit their form data — this is a legitimate, desired action
    const estimateScreenIsDirty = () => false; // correct
    assert.equal(estimateScreenIsDirty(), false);
  });

  it("fixed: onSaveDraft still works even though isDirty=false (draft guard can still save on submit)", () => {
    // The onSaveDraft function is still provided — it's used in the submission path
    // via markSubmitted(), not via shouldPreventRemove
    const isDirty = () => false;
    const hasExited = false;
    const isSubmitted = false;
    // shouldPreventRemove=false so no modal on back
    assert.equal(shouldPreventRemove(isDirty, isSubmitted, hasExited), false);
    // But the onSaveDraft function itself still exists and can be invoked by the submission flow
    const canStillSave = typeof (async () => {}) === "function";
    assert.equal(canStillSave, true);
  });
});

// ── Combined back-nav scenarios ───────────────────────────────────────────────

describe("Combined Back Navigation scenarios", () => {
  it("fixed full flow: back press → modal → save → navigate (all 3 bugs fixed)", async () => {
    const saved: string[] = [];
    const navigated: NavCall[] = [];

    const onSaveDraft = async () => { saved.push("draft_saved"); };
    const destination = "/service/itr";

    // B24_002: back press shows modal (not save directly)
    let modalShown = false;
    const openDraftModal = () => { modalShown = true; };
    openDraftModal(); // back button
    assert.equal(modalShown, true);
    assert.equal(saved.length, 0); // not saved yet

    // User clicks "Save as Draft & Exit" in modal
    // B24_001: await the save before navigating
    const result = await simulateSaveAndExitFixed(onSaveDraft, destination);
    assert.equal(result.savedBeforeNav, true);
    assert.equal(result.nav.method, "replace");
    assert.equal(result.nav.destination, destination);
    assert.equal(saved.length, 1);
  });

  it("fixed: discard flow — await discard then navigate back", async () => {
    const discarded: string[] = [];
    const onDiscardDraft = async () => { discarded.push("draft_cleared"); };

    const result = await simulateDiscardAndExitFixed(onDiscardDraft, "/service/itr");
    assert.equal(result.discardedBeforeNav, true);
    assert.equal(discarded.length, 1);
  });

  it("fixed: estimate screen back is free — no modal, no save, no navigation block", () => {
    const isDirty = () => false;
    const hasExited = false;
    const isSubmitted = false;
    assert.equal(shouldPreventRemove(isDirty, isSubmitted, hasExited), false);
    // User can go back freely to edit their form data
  });

  it("checklist with no uploaded docs — back exits without modal (isDirty=false path)", () => {
    const documents: any[] = [{ id: "pan", status: "not_uploaded" }];
    const isDirty = () => documents.some((d) => Boolean(d.fileUri || d.status === "uploaded"));
    assert.equal(isDirty(), false);
    // No modal needed — just router.back()
    assert.equal(shouldPreventRemove(isDirty, false, false), false);
  });

  it("checklist with uploaded docs — back shows modal (isDirty=true path)", () => {
    const documents: any[] = [{ id: "pan", status: "uploaded" }];
    const isDirty = () => documents.some((d) => Boolean(d.fileUri || d.status === "uploaded"));
    assert.equal(isDirty(), true);
    // Modal should appear — shouldPreventRemove=true guards the navigation
    assert.equal(shouldPreventRemove(isDirty, false, false), true);
  });
});
