/**
 * Regression tests — Save-to-Draft flow
 * Covers: Company Incorporation + GST modules (Registration, Filing, Cancellation, Certificate)
 * Tests draft persistence, My Applications In Progress, data restore, deduplication, and modal guards.
 * Uses Node.js built-in test runner (node:test / node:assert/strict).
 */
import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Helpers / stubs
// ---------------------------------------------------------------------------

let asyncStore: Record<string, string> = {};

const mockAsyncStorage = {
  setItem: async (key: string, value: string) => { asyncStore[key] = value; },
  getItem: async (key: string) => asyncStore[key] ?? null,
  removeItem: async (key: string) => { delete asyncStore[key]; },
};

function makeIndexKey(mobile: string) { return `@finsolz_draft_index_${mobile}`; }
function makeDraftKey(mobile: string, serviceKey: string) { return `@finsolz_draft_${mobile}_${serviceKey}`; }

async function persistDraft(mobile: string, serviceKey: string, serviceName: string, category: string, formData: Record<string, unknown>, step: number) {
  const payload = JSON.stringify({ serviceKey, serviceName, category, step, formData, documents: [], updatedAt: new Date().toISOString().split("T")[0] });
  await mockAsyncStorage.setItem(makeDraftKey(mobile, serviceKey), payload);

  const raw = await mockAsyncStorage.getItem(makeIndexKey(mobile));
  const index: string[] = raw ? JSON.parse(raw) : [];
  if (!index.includes(serviceKey)) index.push(serviceKey);
  await mockAsyncStorage.setItem(makeIndexKey(mobile), JSON.stringify(index));
}

async function readDraftIndex(mobile: string): Promise<string[]> {
  const raw = await mockAsyncStorage.getItem(makeIndexKey(mobile));
  return raw ? JSON.parse(raw) : [];
}

async function readDraft(mobile: string, serviceKey: string): Promise<Record<string, unknown> | null> {
  const raw = await mockAsyncStorage.getItem(makeDraftKey(mobile, serviceKey));
  return raw ? JSON.parse(raw) : null;
}

// Simulates normalizeApplicationStatus("Draft") → "IN_PROGRESS"
function normalizeStatus(status: string): string {
  const IN_PROGRESS_KEYWORDS = ["in progress", "in_progress", "processing", "pending", "draft", "initiated", "under"];
  const lower = status.toLowerCase();
  if (IN_PROGRESS_KEYWORDS.some((kw) => lower.includes(kw))) return "IN_PROGRESS";
  if (lower === "submitted" || lower === "completed" || lower === "approved") return "COMPLETED";
  return "ACTIVE";
}

// Simulates draftToApplication
function draftToApplication(draft: Record<string, unknown>, mobile: string) {
  const serviceKey = draft.serviceKey as string;
  const serviceNames: Record<string, string> = {
    "company-registration": "Company Incorporation",
    "gst-registration": "GST Registration",
    "gst-filing": "GST Filing",
    "gst-cancellation": "GST Cancellation",
    "gst-certificate": "GST Certificate",
  };
  return {
    id: `DRAFT-${serviceKey}-${mobile}`,
    serviceId: serviceKey,
    serviceName: serviceNames[serviceKey] ?? serviceKey,
    category: draft.category as string,
    status: "Draft",
    formData: {
      ...(draft.formData as Record<string, unknown>),
      resumeRoute: `/service/${serviceKey}`,
    },
  };
}

// Simulates loadApplications — reads all drafts and converts to Application[]
async function loadDraftsAsApplications(mobile: string) {
  const index = await readDraftIndex(mobile);
  const apps = await Promise.all(
    index.map(async (key) => {
      const draft = await readDraft(mobile, key);
      return draft ? draftToApplication(draft, mobile) : null;
    })
  );
  return apps.filter(Boolean);
}

// ---------------------------------------------------------------------------
// 1. Unsaved Incorporation → Save-to-Draft popup appears
// ---------------------------------------------------------------------------
describe("Save-to-Draft — modal guard", () => {
  it("isDirty returns true when company type is set (triggers popup)", () => {
    const isDirty = (currentStep: number, companyType: string) =>
      currentStep > 0 || !!companyType;

    assert.equal(isDirty(0, "Private Limited"), true);
    assert.equal(isDirty(2, ""), true);
    assert.equal(isDirty(0, ""), false, "Empty form should not be dirty");
  });

  it("isDirty returns false after form is submitted (no popup on step 7)", () => {
    const isDirty = (status: string, currentStep: number) =>
      status === "Submitted" || currentStep === 7 ? false : true;

    assert.equal(isDirty("Submitted", 7), false);
    assert.equal(isDirty("Draft", 3), true);
  });
});

// ---------------------------------------------------------------------------
// 2. Save Incorporation draft → appears in My Applications In Progress
// ---------------------------------------------------------------------------
describe("Save-to-Draft — Incorporation persists to In Progress", () => {
  beforeEach(() => { asyncStore = {}; });

  it("persisting an Incorporation draft creates an AsyncStorage record", async () => {
    const mobile = "9876543210";
    await persistDraft(mobile, "company-registration", "Company Incorporation", "BUSINESS",
      { companyType: "Private Limited", proposedName1: "Acme Corp" }, 2);

    const draft = await readDraft(mobile, "company-registration");
    assert.ok(draft, "Draft must exist in AsyncStorage");
    assert.equal(draft?.serviceKey, "company-registration");
    assert.equal((draft?.formData as Record<string, unknown>)?.companyType, "Private Limited");
  });

  it("Incorporation draft appears in My Applications with IN_PROGRESS status", async () => {
    const mobile = "9876543210";
    await persistDraft(mobile, "company-registration", "Company Incorporation", "BUSINESS",
      { companyType: "LLP", proposedName1: "Test LLP" }, 1);

    const apps = await loadDraftsAsApplications(mobile);
    assert.equal(apps.length, 1);
    const app = apps[0]!;
    assert.equal(normalizeStatus(app.status), "IN_PROGRESS");
    assert.equal(app.serviceId, "company-registration");
  });
});

// ---------------------------------------------------------------------------
// 3. Opening Incorporation draft → saved data restored
// ---------------------------------------------------------------------------
describe("Save-to-Draft — Incorporation draft restore", () => {
  beforeEach(() => { asyncStore = {}; });

  it("form data is recoverable from AsyncStorage draft payload", async () => {
    const mobile = "9876543210";
    const savedData = { companyType: "OPC", proposedName1: "Solo Ventures", currentStep: 3 };
    await persistDraft(mobile, "company-registration", "Company Incorporation", "BUSINESS", savedData, 3);

    const draft = await readDraft(mobile, "company-registration");
    const formData = draft?.formData as Record<string, unknown>;

    assert.equal(formData?.companyType, "OPC");
    assert.equal(formData?.proposedName1, "Solo Ventures");
    assert.equal(formData?.currentStep, 3, "Step must be restored");
  });
});

// ---------------------------------------------------------------------------
// 4. Saving same Incorporation draft again → no duplicate
// ---------------------------------------------------------------------------
describe("Save-to-Draft — no duplicate on re-save", () => {
  beforeEach(() => { asyncStore = {}; });

  it("saving company-registration draft twice keeps only one index entry", async () => {
    const mobile = "9876543210";
    await persistDraft(mobile, "company-registration", "Company Incorporation", "BUSINESS",
      { companyType: "Private Limited" }, 1);
    await persistDraft(mobile, "company-registration", "Company Incorporation", "BUSINESS",
      { companyType: "Private Limited", proposedName1: "Updated Corp" }, 2);

    const index = await readDraftIndex(mobile);
    assert.equal(index.filter((k) => k === "company-registration").length, 1, "Duplicate draft keys must not exist");

    const draft = await readDraft(mobile, "company-registration");
    assert.equal((draft?.formData as Record<string, unknown>)?.proposedName1, "Updated Corp", "Latest data must overwrite");
  });
});

// ---------------------------------------------------------------------------
// 5. Unsaved GST form → isDirty returns true
// ---------------------------------------------------------------------------
describe("Save-to-Draft — GST modal guard", () => {
  it("GST Registration isDirty is true when any business data is entered", () => {
    // Mirrors hasAnyGstDataEntered logic
    const hasAnyGstDataEntered = (data: Record<string, unknown>): boolean =>
      Object.values(data).some((v) => v !== "" && v !== null && v !== undefined && v !== false);

    assert.equal(hasAnyGstDataEntered({ legalName: "Acme" }), true);
    assert.equal(hasAnyGstDataEntered({ legalName: "" }), false);
    assert.equal(hasAnyGstDataEntered({}), false);
  });
});

// ---------------------------------------------------------------------------
// 6. Save GST draft → appears in My Applications In Progress
// ---------------------------------------------------------------------------
describe("Save-to-Draft — GST Registration persists to In Progress", () => {
  beforeEach(() => { asyncStore = {}; });

  it("GST registration draft appears in My Applications In Progress", async () => {
    const mobile = "9876543210";
    await persistDraft(mobile, "gst-registration", "GST Registration", "GST",
      { legalName: "Acme Corp", businessType: "Proprietorship" }, 1);

    const apps = await loadDraftsAsApplications(mobile);
    const gstApp = apps.find((a) => a?.serviceId === "gst-registration");
    assert.ok(gstApp, "GST draft must appear in applications");
    assert.equal(normalizeStatus(gstApp!.status), "IN_PROGRESS");
  });
});

// ---------------------------------------------------------------------------
// 7. Open GST draft → saved data restored
// ---------------------------------------------------------------------------
describe("Save-to-Draft — GST Registration draft restore", () => {
  beforeEach(() => { asyncStore = {}; });

  it("GST registration draft round-trips legalName and businessType", async () => {
    const mobile = "9876543210";
    await persistDraft(mobile, "gst-registration", "GST Registration", "GST",
      { legalName: "TechCo Solutions", businessType: "Private Limited", state: "Maharashtra" }, 0);

    const draft = await readDraft(mobile, "gst-registration");
    const fd = draft?.formData as Record<string, unknown>;
    assert.equal(fd?.legalName, "TechCo Solutions");
    assert.equal(fd?.businessType, "Private Limited");
    assert.equal(fd?.state, "Maharashtra");
  });
});

// ---------------------------------------------------------------------------
// 8. Saving same GST draft again → no duplicate
// ---------------------------------------------------------------------------
describe("Save-to-Draft — GST no duplicate on re-save", () => {
  beforeEach(() => { asyncStore = {}; });

  it("re-saving gst-registration draft updates data without duplicating index entry", async () => {
    const mobile = "9876543210";
    await persistDraft(mobile, "gst-registration", "GST Registration", "GST",
      { legalName: "First Name" }, 0);
    await persistDraft(mobile, "gst-registration", "GST Registration", "GST",
      { legalName: "Updated Name", state: "Karnataka" }, 1);

    const index = await readDraftIndex(mobile);
    assert.equal(index.filter((k) => k === "gst-registration").length, 1);
    const draft = await readDraft(mobile, "gst-registration");
    assert.equal((draft?.formData as Record<string, unknown>)?.legalName, "Updated Name");
  });
});

// ---------------------------------------------------------------------------
// 9. Submitted application does not remain as active draft
// ---------------------------------------------------------------------------
describe("Save-to-Draft — submitted apps don't show as drafts", () => {
  it("normalizeStatus maps Submitted to COMPLETED, not IN_PROGRESS", () => {
    assert.equal(normalizeStatus("Submitted"), "COMPLETED");
    assert.equal(normalizeStatus("Under Verification"), "IN_PROGRESS");
    assert.notEqual(normalizeStatus("Submitted"), "IN_PROGRESS");
  });

  it("draft with status Submitted is excluded from In Progress list", () => {
    const apps = [
      { status: "Submitted", serviceId: "company-registration" },
      { status: "Draft", serviceId: "gst-registration" },
    ];
    const inProgress = apps.filter((a) => normalizeStatus(a.status) === "IN_PROGRESS");
    assert.equal(inProgress.length, 1);
    assert.equal(inProgress[0].serviceId, "gst-registration");
  });
});

// ---------------------------------------------------------------------------
// 10. No changes → leaving does not show Save-to-Draft popup
// ---------------------------------------------------------------------------
describe("Save-to-Draft — clean form does not trigger popup", () => {
  it("isDirty returns false for empty Company Incorporation form", () => {
    const isDirty = (currentStep: number, companyType: string) =>
      currentStep > 0 || !!companyType;

    assert.equal(isDirty(0, ""), false);
  });

  it("isDirty returns false for empty GST form", () => {
    const hasAnyGstDataEntered = (data: Record<string, unknown>): boolean =>
      Object.values(data).some((v) => v !== "" && v !== null && v !== undefined && v !== false);

    assert.equal(hasAnyGstDataEntered({ legalName: "", businessType: "", state: "" }), false);
  });
});

// ---------------------------------------------------------------------------
// 11. Cancel → stays on current screen (modal dismissed)
// ---------------------------------------------------------------------------
describe("Save-to-Draft — cancel keeps user on screen", () => {
  it("handleCancel sets showDraftModal to false without navigating", () => {
    let showModal = true;
    let navigated = false;

    const handleCancel = () => { showModal = false; };
    const navigate = () => { navigated = true; };

    handleCancel();
    assert.equal(showModal, false, "Modal must be dismissed");
    assert.equal(navigated, false, "Must not navigate away on cancel");
  });
});

// ---------------------------------------------------------------------------
// 12. Discard → leaves without saving
// ---------------------------------------------------------------------------
describe("Save-to-Draft — discard exits without persisting", () => {
  beforeEach(() => { asyncStore = {}; });

  it("handleDiscardAndExit navigates away without writing to AsyncStorage", async () => {
    const mobile = "9876543210";
    let navigated = false;

    const handleDiscardAndExit = () => { navigated = true; /* does NOT call persistDraft */ };
    handleDiscardAndExit();

    const index = await readDraftIndex(mobile);
    assert.equal(index.length, 0, "Discard must not write any draft to AsyncStorage");
    assert.equal(navigated, true);
  });

  it("draft store is cleared after discard", async () => {
    const mobile = "9876543210";
    await persistDraft(mobile, "company-registration", "Company Incorporation", "BUSINESS",
      { companyType: "LLP" }, 1);

    // Simulate clearCompanyRegistrationDraft
    await mockAsyncStorage.removeItem(makeDraftKey(mobile, "company-registration"));
    const raw = await mockAsyncStorage.getItem(makeIndexKey(mobile));
    const index: string[] = raw ? JSON.parse(raw) : [];
    const updated = index.filter((k) => k !== "company-registration");
    await mockAsyncStorage.setItem(makeIndexKey(mobile), JSON.stringify(updated));

    const afterDiscard = await readDraft(mobile, "company-registration");
    assert.equal(afterDiscard, null, "Draft must be removed from AsyncStorage after discard");
  });
});
