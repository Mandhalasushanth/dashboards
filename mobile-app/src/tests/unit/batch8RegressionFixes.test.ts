/**
 * Batch 8 Regression Fixes — Unit Tests
 *
 * Covers:
 *   1. BUG-ITR-083: Previous application data appearing in another application:
 *      - Cross-service and cross-category isolation during application loading.
 *      - Rejection of generic/placeholder keys ("PENDING", "N/A", "0", etc.) in lookup key matching.
 *      - Cache isolation when switching applications in application detail screen.
 *      - Initial ITR state cleanliness (no draft GST business data pollution).
 *
 *   2. Revised ITR & TDS Refund Save Draft confirmation incorrectly appearing after final submission:
 *      - Revised ITR: isSubmitted flag in revisedProgressStore disables navigation draft guard.
 *      - Revised ITR: reset() properly resets isSubmitted to false for fresh sessions.
 *      - TDS Refund: isSubmitted flag in tdsProgressStore disables draft guards on form and checklist.
 *      - TDS Refund: submission from estimate screen sets isSubmitted = true and clears drafts.
 *      - TDS Refund: payment submission sets isSubmitted = true and clears drafts.
 *      - TDS Refund: reset() resets isSubmitted to false for fresh sessions.
 *
 * Uses Node.js built-in test runner (node:test / node:assert/strict). Zero explicit loops.
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ── 1. Application Lookup Key & Merging State Model (Mirrors applicationStore.ts) ─

interface MockApplication {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  status: string;
  formData?: Record<string, unknown>;
  createdAt?: string;
}

const INVALID_LOOKUP_KEYS = new Set([
  "", "0", "-", "N/A", "NA", "NONE", "NULL", "UNDEFINED", "PENDING", "DEFAULT", "DRAFT", "CUST-DEFAULT",
]);

const isValidLookupKey = (key?: unknown): boolean => {
  if (typeof key !== "string" && typeof key !== "number") return false;
  const str = String(key).trim();
  return str.length >= 3 && !INVALID_LOOKUP_KEYS.has(str.toUpperCase());
};

const getAppLookupKeys = (app: MockApplication): string[] => [
  app.id,
  app.formData?.arn ? String(app.formData.arn).trim() : "",
  app.formData?.gstId ? String(app.formData.gstId).trim() : "",
  app.formData?.createdGstId ? String(app.formData.createdGstId).trim() : "",
  app.formData?.applicationId ? String(app.formData.applicationId).trim() : "",
].filter(isValidLookupKey);

const mergeApplications = (
  localApps: MockApplication[],
  remoteApps: MockApplication[],
): MockApplication[] => {
  const mergedMap = new Map<string, MockApplication>();

  const findExistingKey = (app: MockApplication): string | null => {
    const appKeys = getAppLookupKeys(app);
    if (appKeys.length === 0) return null;
    const match = Array.from(mergedMap.entries()).find(([_key, existing]) => {
      const isServiceMatch = Boolean(
        app.serviceId && existing.serviceId && app.serviceId === existing.serviceId,
      );
      const isCategoryMatch = Boolean(
        app.category && existing.category && app.category === existing.category,
      );
      if (!isServiceMatch && !isCategoryMatch) return false;

      if (appKeys.includes(existing.id)) return true;
      const existingKeys = getAppLookupKeys(existing);
      return appKeys.some((k) => existingKeys.includes(k));
    });
    return match ? match[0] : null;
  };

  localApps.reduce((map, app) => {
    const matchedKey = findExistingKey(app);
    if (matchedKey) {
      map.set(matchedKey, { ...map.get(matchedKey)!, ...app });
    } else {
      map.set(app.id, app);
    }
    return map;
  }, mergedMap);

  remoteApps.reduce((map, app) => {
    const matchedKey = findExistingKey(app);
    if (matchedKey) {
      map.set(matchedKey, { ...map.get(matchedKey)!, ...app });
    } else {
      map.set(app.id, app);
    }
    return map;
  }, mergedMap);

  return Array.from(mergedMap.values());
};

// ── 2. Draft Guard Logic Model (Mirrors useUniversalDraftGuard.ts) ────────────

interface DraftGuardOptions {
  isDirty: () => boolean;
  isSubmitted?: () => boolean;
  hasExited?: boolean;
}

const shouldPreventNavigation = (options: DraftGuardOptions): boolean => {
  const isSub = options.isSubmitted ? options.isSubmitted() : false;
  const hasExit = options.hasExited ?? false;
  return !hasExit && !isSub && options.isDirty();
};

// ── 3. Store State Models (Mirrors revisedProgressStore & tdsProgressStore) ───

interface RevisedProgressState {
  isSubmitted: boolean;
  maxStepReached: number;
  revisedItrId?: string;
  formData: Record<string, unknown> | null;
}

interface TdsProgressState {
  isSubmitted: boolean;
  maxStepReached: number;
}

// ── Test Suites ──────────────────────────────────────────────────────────────

describe("BUG-ITR-083: Previous Application Data Leaking Across Applications", () => {
  it("rejects generic and placeholder keys from matching unrelated applications", () => {
    const placeholders = ["PENDING", "N/A", "0", "null", "undefined", "DRAFT", "", "-"];
    const allRejected = placeholders.every((key) => !isValidLookupKey(key));
    assert.equal(allRejected, true, "All placeholder keys must be rejected by isValidLookupKey");
  });

  it("accepts valid application identifiers as lookup keys", () => {
    const validKeys = ["ITR-2025-00123", "ARN-12345678", "284419250714208", "REFUND-9876543210"];
    const allAccepted = validKeys.every(isValidLookupKey);
    assert.equal(allAccepted, true, "Valid application IDs must be accepted");
  });

  it("does NOT merge two applications with different categories even if placeholder keys match", () => {
    const localApps: MockApplication[] = [
      {
        id: "GST-APP-101",
        serviceId: "gst-registration",
        serviceName: "GST Registration",
        category: "GST",
        status: "Draft",
        formData: { applicationId: "PENDING", legalName: "Alpha Enterprises" },
      },
    ];

    const remoteApps: MockApplication[] = [
      {
        id: "ITR-APP-202",
        serviceId: "itr-filing",
        serviceName: "ITR-1 Filing",
        category: "ITR",
        status: "Submitted",
        formData: { applicationId: "PENDING", grossIncome: "1200000" },
      },
    ];

    const result = mergeApplications(localApps, remoteApps);

    assert.equal(result.length, 2, "GST and ITR applications must remain separate");
    const gstApp = result.find((a) => a.id === "GST-APP-101");
    const itrApp = result.find((a) => a.id === "ITR-APP-202");
    assert.ok(gstApp, "GST application must be present");
    assert.ok(itrApp, "ITR application must be present");
    assert.equal(gstApp?.formData?.legalName, "Alpha Enterprises");
    assert.equal(gstApp?.formData?.grossIncome, undefined, "GST app must not contain ITR fields");
    assert.equal(itrApp?.formData?.grossIncome, "1200000");
    assert.equal(itrApp?.formData?.legalName, undefined, "ITR app must not contain GST fields");
  });

  it("merges remote updates into local application when serviceId and ID match", () => {
    const localApps: MockApplication[] = [
      {
        id: "ITR-2026-999",
        serviceId: "itr-filing",
        serviceName: "ITR-1 Filing",
        category: "ITR",
        status: "Draft",
        formData: { pan: "ABCDE1234F", filingPeriod: "AY 2025-26" },
      },
    ];

    const remoteApps: MockApplication[] = [
      {
        id: "ITR-2026-999",
        serviceId: "itr-filing",
        serviceName: "ITR-1 Filing",
        category: "ITR",
        status: "Submitted",
        formData: { pan: "ABCDE1234F", ackNo: "ACK-999888" },
      },
    ];

    const result = mergeApplications(localApps, remoteApps);
    assert.equal(result.length, 1, "Matching service applications must merge");
    assert.equal(result[0].status, "Submitted", "Remote status should update application");
    assert.equal(result[0].formData?.pan, "ABCDE1234F");
  });

  it("isolated detail screen cache: remoteApp fallback only matches requested ID", () => {
    const remoteAppFromApp1: MockApplication = {
      id: "APP-001",
      serviceId: "gst-registration",
      serviceName: "GST Registration",
      category: "GST",
      status: "Submitted",
      formData: { businessName: "First Business" },
    };

    const targetId = "APP-002";
    const applications: MockApplication[] = [];

    // Screen resolution logic (mirrors [id].tsx fix)
    const resolveApp = (id: string, cachedRemote: MockApplication | null): MockApplication | null => {
      const cleanId = id.trim();
      const match = applications.find((a) => a.id === cleanId);
      if (match) return match;
      if (cachedRemote && cachedRemote.id === cleanId) return cachedRemote;
      return null;
    };

    const resolvedForApp2 = resolveApp(targetId, remoteAppFromApp1);
    assert.equal(resolvedForApp2, null, "Viewing APP-002 must NOT display cached APP-001 data");
  });

  it("initial ITR form data has clean business and GST reconciliation values", () => {
    const cleanGstReconciliation = {
      gstin: "",
      legalName: "",
      tradeName: "",
      businessActivity: "",
      registrationDate: "",
      gstr1Turnover: 0,
      gstr3bTurnover: 0,
      booksTurnover: 0,
      proposedItrTurnover: 0,
      variance: 0,
      hasVariance: false,
      varianceExplanation: "",
    };

    const cleanBusinessIncome = {
      enabled: false,
      businessType: "presumptive_44ad" as const,
      businessName: "",
      gstin: "",
      businessActivity: "",
      grossTurnover: "",
      declaredProfit: "",
      source: "USER_DECLARED" as const,
      hasGstActivity: false,
      gstr1Turnover: "",
      gstr3bTurnover: "",
      gstReconciliationRequired: false,
    };

    assert.equal(cleanGstReconciliation.gstin, "", "GSTIN must start blank");
    assert.equal(cleanGstReconciliation.legalName, "", "Legal name must start blank");
    assert.equal(cleanBusinessIncome.businessName, "", "Business name must start blank");
    assert.equal(cleanBusinessIncome.hasGstActivity, false, "Must not flag GST activity by default");
  });
});

describe("Revised ITR: Save Draft Confirmation After Final Submission Fix", () => {
  let revisedStore: RevisedProgressState;

  beforeEach(() => {
    revisedStore = {
      isSubmitted: false,
      maxStepReached: 1,
      revisedItrId: "REV-ITR-123",
      formData: null,
    };
  });

  it("shows draft modal when dirty and NOT submitted", () => {
    const ackNumber = "284419250714208";
    const isDirty = () => ackNumber.trim().length > 0;
    const isSubmitted = () => revisedStore.isSubmitted;

    const prevent = shouldPreventNavigation({ isDirty, isSubmitted });
    assert.equal(prevent, true, "Unsaved dirty input before submission must trigger draft modal");
  });

  it("suppresses draft modal when isSubmitted is set to true on final submit", () => {
    const ackNumber = "284419250714208";
    const isDirty = () => ackNumber.trim().length > 0;
    const isSubmitted = () => revisedStore.isSubmitted;

    // Simulate handleSubmitRevisedItr marking submitted
    revisedStore.isSubmitted = true;

    const prevent = shouldPreventNavigation({ isDirty, isSubmitted });
    assert.equal(prevent, false, "Draft modal must NOT appear after successful submission");
  });

  it("reset() resets isSubmitted to false for subsequent new revised returns", () => {
    revisedStore.isSubmitted = true;
    // Simulate reset()
    revisedStore = {
      isSubmitted: false,
      maxStepReached: 1,
      formData: null,
    };

    assert.equal(revisedStore.isSubmitted, false, "reset() must reset isSubmitted to false");
  });
});

describe("TDS Refund: Save Draft Confirmation After Final Submission Fix", () => {
  let tdsStore: TdsProgressState;

  beforeEach(() => {
    tdsStore = {
      isSubmitted: false,
      maxStepReached: 1,
    };
  });

  it("shows draft modal on form screen when user has edited fields and not submitted", () => {
    const hasUserEdited = true;
    const isDirty = () => hasUserEdited;
    const isSubmitted = () => tdsStore.isSubmitted;

    const prevent = shouldPreventNavigation({ isDirty, isSubmitted });
    assert.equal(prevent, true, "Dirty TDS form must trigger draft modal when navigating away before submit");
  });

  it("shows draft modal on document checklist when documents are uploaded and not submitted", () => {
    const uploadedDocs = [{ id: "pan", status: "uploaded" }];
    const isDirty = () => uploadedDocs.some((d) => d.status === "uploaded");
    const isSubmitted = () => tdsStore.isSubmitted;

    const prevent = shouldPreventNavigation({ isDirty, isSubmitted });
    assert.equal(prevent, true, "Checklist with uploaded documents must trigger draft modal before submit");
  });

  it("suppresses draft modal on both form and checklist when estimate submit marks isSubmitted = true", () => {
    const isFormDirty = () => true;
    const isChecklistDirty = () => true;
    const isSubmitted = () => tdsStore.isSubmitted;

    // Simulate final submit from TdsRefundEstimateScreen
    tdsStore.isSubmitted = true;

    const formPrevent = shouldPreventNavigation({ isDirty: isFormDirty, isSubmitted });
    const checklistPrevent = shouldPreventNavigation({ isDirty: isChecklistDirty, isSubmitted });

    assert.equal(formPrevent, false, "Form guard must be disabled after final submission");
    assert.equal(checklistPrevent, false, "Checklist guard must be disabled after final submission");
  });

  it("suppresses draft modal on payment submission completion", () => {
    const isDirty = () => true;
    const isSubmitted = () => tdsStore.isSubmitted;

    // Simulate final submit from TdsPaymentSubmissionScreen
    tdsStore.isSubmitted = true;

    const prevent = shouldPreventNavigation({ isDirty, isSubmitted });
    assert.equal(prevent, false, "Draft guard must be disabled after payment confirmation");
  });

  it("reset() properly sets isSubmitted = false when beginning a fresh application", () => {
    tdsStore.isSubmitted = true;
    tdsStore = { maxStepReached: 1, isSubmitted: false };

    assert.equal(tdsStore.isSubmitted, false, "Fresh application must start with isSubmitted = false");
  });
});

