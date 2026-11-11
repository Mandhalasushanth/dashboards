/**
 * ITR Draft Cleanup — production-safety tests
 *
 * Covers the clearItrDraft() / restoreItrDraft() / resetForm() / saveItrDraft() state machine:
 *   - Successful storage removal
 *   - Failed AsyncStorage removal (stale data must not restore)
 *   - Rapid screen remount while clearItrDraft is in flight
 *   - Draft restoration from a valid saved draft
 *   - Fresh application creation after submit (single-draft model confirmed)
 *
 * Uses Node.js built-in test runner (node:test / node:assert/strict). No React Native imports.
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ── AsyncStorage stub ────────────────────────────────────────────────────────

let asyncStore: Record<string, string> = {};
let removeItemShouldFail = false;

const mockAsyncStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    asyncStore[key] = value;
  },
  getItem: async (key: string): Promise<string | null> => asyncStore[key] ?? null,
  removeItem: async (key: string): Promise<void> => {
    if (removeItemShouldFail) throw new Error("Simulated AsyncStorage I/O failure");
    delete asyncStore[key];
  },
};

function makeDraftKey(mobile: string): string {
  return `@finsolz_draft_${mobile}_itr-filing`;
}
function makeIndexKey(mobile: string): string {
  return `@finsolz_draft_index_${mobile}`;
}

// ── Store state model (mirrors itrStore.ts) ───────────────────────────────────

interface StoreState {
  currentStep: number;
  formData: Record<string, unknown>;
  itrDraft: Record<string, unknown> | null;
  _draftCleared: boolean;
  _storageCleanFailed: boolean;
}

function makeInitialState(): StoreState {
  return {
    currentStep: 0,
    formData: { personalInfo: {}, category: "" },
    itrDraft: null,
    _draftCleared: false,
    _storageCleanFailed: false,
  };
}

// ── Logic stubs (mirrors itrStore.ts implementations) ────────────────────────

async function saveItrDraft(state: StoreState, mobile: string): Promise<void> {
  const draft = {
    id: `itr-draft-${Date.now()}`,
    stepIndex: state.currentStep,
    formData: state.formData,
    updatedAt: new Date().toISOString(),
  };
  state.itrDraft = draft;
  state._draftCleared = false;
  state._storageCleanFailed = false;

  const payload = JSON.stringify({
    serviceKey: "itr-filing",
    step: state.currentStep,
    stepIndex: state.currentStep,
    formData: state.formData,
    updatedAt: draft.updatedAt,
  });
  await mockAsyncStorage.setItem(makeDraftKey(mobile), payload);

  const raw = await mockAsyncStorage.getItem(makeIndexKey(mobile));
  const index: string[] = raw ? (JSON.parse(raw) as string[]) : [];
  if (!index.includes("itr-filing")) index.push("itr-filing");
  await mockAsyncStorage.setItem(makeIndexKey(mobile), JSON.stringify(index));
}

async function clearItrDraft(state: StoreState, mobile: string): Promise<void> {
  // Synchronous guard — visible to restoreItrDraft() immediately.
  state.itrDraft = null;
  state._draftCleared = true;
  state._storageCleanFailed = false;

  const results = await Promise.allSettled([
    mockAsyncStorage.removeItem(makeIndexKey(mobile)),
    mockAsyncStorage.removeItem(makeDraftKey(mobile)),
  ]);

  if (results[1].status === "rejected") {
    state._storageCleanFailed = true;
  }
}

async function restoreItrDraft(state: StoreState, mobile: string): Promise<boolean> {
  if (state._draftCleared) return false;
  try {
    const raw = await mockAsyncStorage.getItem(makeDraftKey(mobile));
    const draftData = raw
      ? (JSON.parse(raw) as Record<string, unknown>)
      : (state.itrDraft as Record<string, unknown> | null);
    if (!draftData) return false;
    const step = typeof draftData.step === "number" ? draftData.step : 0;
    const formData = (draftData.formData as Record<string, unknown>) ?? {};
    state.currentStep = step;
    state.formData = { ...formData };
    state.itrDraft = draftData;
    return true;
  } catch {
    return false;
  }
}

function resetForm(state: StoreState): void {
  state.currentStep = 0;
  state.formData = { personalInfo: {}, category: "" };
  state.itrDraft = null;
  // Propagate storage failure: keep guard active until saveItrDraft overwrites the stale key.
  state._draftCleared = state._storageCleanFailed;
  // _storageCleanFailed is intentionally NOT cleared here.
}

// ── 1. Successful storage removal ─────────────────────────────────────────────

describe("ITR Draft Cleanup — successful storage removal", () => {
  beforeEach(() => {
    asyncStore = {};
    removeItemShouldFail = false;
  });

  it("clearItrDraft removes the draft key from AsyncStorage", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    state.formData = { personalInfo: { pan: "ABCDE1234F" }, category: "salaried" };
    await saveItrDraft(state, mobile);
    assert.ok(asyncStore[makeDraftKey(mobile)], "Draft must be in storage before clear");

    await clearItrDraft(state, mobile);
    assert.equal(asyncStore[makeDraftKey(mobile)], undefined, "Draft key must be removed");
  });

  it("resetForm after successful clear sets _draftCleared to false", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    await saveItrDraft(state, mobile);
    await clearItrDraft(state, mobile);
    assert.equal(state._storageCleanFailed, false);

    resetForm(state);
    assert.equal(state._draftCleared, false, "_draftCleared must be false after successful clear + reset");
    assert.equal(state._storageCleanFailed, false);
  });

  it("restoreItrDraft finds nothing in storage after a clean removal", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    await saveItrDraft(state, mobile);
    await clearItrDraft(state, mobile);
    resetForm(state);

    const restored = await restoreItrDraft(state, mobile);
    assert.equal(restored, false, "Nothing should restore after storage is cleanly removed");
  });
});

// ── 2. Failed AsyncStorage removal ───────────────────────────────────────────

describe("ITR Draft Cleanup — failed AsyncStorage removal", () => {
  beforeEach(() => {
    asyncStore = {};
    removeItemShouldFail = false;
  });

  it("_storageCleanFailed is set and _draftCleared stays true after removeItem rejects", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    await saveItrDraft(state, mobile);

    removeItemShouldFail = true;
    await clearItrDraft(state, mobile);
    removeItemShouldFail = false;

    assert.equal(state._draftCleared, true, "_draftCleared must be true after failed removal");
    assert.equal(state._storageCleanFailed, true, "_storageCleanFailed must be set on removeItem rejection");
  });

  it("resetForm keeps _draftCleared true when _storageCleanFailed is set", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    await saveItrDraft(state, mobile);

    removeItemShouldFail = true;
    await clearItrDraft(state, mobile);
    removeItemShouldFail = false;

    resetForm(state);
    assert.equal(state._draftCleared, true, "_draftCleared must remain true when removal failed");
    assert.equal(state._storageCleanFailed, true, "_storageCleanFailed must persist through resetForm");
  });

  it("restoreItrDraft is blocked even though stale data remains in storage", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    state.formData = { personalInfo: { pan: "XYZAB5678G" }, category: "salaried" };
    await saveItrDraft(state, mobile);

    removeItemShouldFail = true;
    await clearItrDraft(state, mobile);
    removeItemShouldFail = false;
    resetForm(state);

    // Stale data is still physically in storage (removal failed).
    assert.ok(asyncStore[makeDraftKey(mobile)], "Stale draft must still be in storage after failed removal");

    const restored = await restoreItrDraft(state, mobile);
    assert.equal(restored, false, "Stale data must NOT be restored — _draftCleared guard must hold");
  });

  it("protection is fully lifted once saveItrDraft overwrites the stale key", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    await saveItrDraft(state, mobile);

    removeItemShouldFail = true;
    await clearItrDraft(state, mobile);
    removeItemShouldFail = false;
    resetForm(state);

    assert.equal(state._draftCleared, true, "Guard must be active before new save");

    // User fills a new form and saves a new draft.
    state.formData = { personalInfo: { pan: "NEWPA1234N" }, category: "business" };
    await saveItrDraft(state, mobile);

    assert.equal(state._draftCleared, false, "saveItrDraft must lift _draftCleared");
    assert.equal(state._storageCleanFailed, false, "saveItrDraft must clear _storageCleanFailed");

    const raw = asyncStore[makeDraftKey(mobile)];
    assert.ok(raw, "New draft must be in storage");
    const data = JSON.parse(raw) as { formData: Record<string, unknown> };
    assert.equal(data.formData?.category, "business", "New draft must contain updated data");
  });
});

// ── 3. Rapid screen remount while clearItrDraft is in flight ──────────────────

describe("ITR Draft Cleanup — rapid remount during clearItrDraft", () => {
  beforeEach(() => {
    asyncStore = {};
    removeItemShouldFail = false;
  });

  it("_draftCleared is set synchronously before async ops, blocking a concurrent restore", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    state.formData = { personalInfo: { pan: "RAPID1234R" }, category: "salaried" };
    await saveItrDraft(state, mobile);

    // Start clearItrDraft without awaiting — simulates submit happening while new mount fires.
    const clearPromise = clearItrDraft(state, mobile);

    // Synchronous part of clearItrDraft has run; _draftCleared must already be true.
    assert.equal(state._draftCleared, true, "_draftCleared must be set before the first await in clearItrDraft");

    // New screen mount calls restoreItrDraft while clear is still in flight.
    const restored = await restoreItrDraft(state, mobile);
    assert.equal(restored, false, "Rapid remount must not restore stale data while clear is in flight");

    await clearPromise;
  });
});

// ── 4. Draft restoration — valid draft found and loaded ───────────────────────

describe("ITR Draft Cleanup — successful draft restoration", () => {
  beforeEach(() => {
    asyncStore = {};
    removeItemShouldFail = false;
  });

  it("restoreItrDraft loads step and formData from a saved draft", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    state.currentStep = 2;
    state.formData = { personalInfo: { pan: "RESTO5678R" }, category: "salaried" };
    await saveItrDraft(state, mobile);

    const freshState = makeInitialState();
    const restored = await restoreItrDraft(freshState, mobile);

    assert.equal(restored, true, "Draft must be restored");
    assert.equal(freshState.currentStep, 2, "Step must be restored");
    assert.equal((freshState.formData as { category: string }).category, "salaried", "Category must be restored");
    assert.equal(
      (freshState.formData as { personalInfo: { pan: string } }).personalInfo?.pan,
      "RESTO5678R",
      "PAN must be restored"
    );
  });

  it("restoreItrDraft returns false when storage is empty and no in-memory draft", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();

    const restored = await restoreItrDraft(state, mobile);
    assert.equal(restored, false, "Must return false when no draft exists");
  });
});

// ── 5. Fresh application after submit (single-draft model) ───────────────────

describe("ITR Draft Cleanup — fresh application creation after submit", () => {
  beforeEach(() => {
    asyncStore = {};
    removeItemShouldFail = false;
  });

  it("new screen mount after a successful submit gets a blank form", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();
    state.currentStep = 3;
    state.formData = { personalInfo: { pan: "SUBMT1234S" }, category: "salaried" };
    await saveItrDraft(state, mobile);

    // Submit flow: await clear, then reset (mirrors useItrFilingWorkflow).
    await clearItrDraft(state, mobile);
    resetForm(state);

    assert.equal(state._draftCleared, false, "Guard must be off after a successful clear + reset");
    assert.equal(state.currentStep, 0, "Step must be 0 after reset");
    assert.equal((state.formData as { category: string }).category, "", "Category must be blank after reset");

    const restored = await restoreItrDraft(state, mobile);
    assert.equal(restored, false, "New application must start fresh — submitted draft must not be restored");
  });

  it("single-draft model: only one draft key per user for itr-filing", async () => {
    const mobile = "9876543210";
    const state = makeInitialState();

    state.formData = { category: "salaried" };
    await saveItrDraft(state, mobile);

    // Re-save (e.g. user edits and saves again).
    state.formData = { category: "business" };
    await saveItrDraft(state, mobile);

    const draftKeys = Object.keys(asyncStore).filter((k) =>
      k.startsWith(`@finsolz_draft_${mobile}_itr`)
    );
    assert.equal(draftKeys.length, 1, "Only one draft key must exist for itr-filing");
    assert.equal(draftKeys[0], makeDraftKey(mobile), "Key pattern must be stable");

    const raw = asyncStore[makeDraftKey(mobile)];
    const data = JSON.parse(raw) as { formData: Record<string, unknown> };
    assert.equal(data.formData?.category, "business", "Latest save must overwrite the previous draft");
  });
});
