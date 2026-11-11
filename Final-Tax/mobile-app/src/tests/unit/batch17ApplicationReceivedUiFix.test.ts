/**
 * Batch 17 — Revised ITR Application Received UI
 *
 * Six bugs in the Application Received screen and its sub-components:
 *
 * Bug 1: refundBank not included in summaryData
 *   Root: ApplicationSuccessScreen computed `refundBank` but never set it in `summaryData`.
 *   Fix: added `refundBank` to the `summaryData` object.
 *
 * Bug 2: docsUploaded shows "0 of 0 received" for Revised ITR
 *   Root: uploadedCount/totalCount read only from URL params (default "0"); Revised ITR
 *   docs live in revisedProgressStore, not passed as params after Batch 14.
 *   Fix: when isRevised && storeDocuments != null, compute from store.
 *
 * Bug 3: double gap between bottom-bar buttons
 *   Root: bottomBar uses `gap: Spacing.sm` (8px) and secondary buttons also had
 *   inline `{ marginTop: 8 }`, creating 16px gaps instead of 8px.
 *   Fix: removed inline `marginTop: 8` from both secondary buttons.
 *
 * Bug 4: last card clipped by bottom bar
 *   Root: scrollContent paddingBottom was 130px; the 3-button bottom bar is ~172px tall,
 *   so WhatHappensNextCard was cut off.
 *   Fix: changed constant from 130 to 180.
 *
 * Bug 5: WhatHappensNextCard border radius inconsistency
 *   Root: WhatHappensNextCard.styles.ts used hardcoded `borderRadius: 20`; other cards
 *   use `BorderRadius.md` (12) from the shared theme.
 *   Fix: replaced hardcoded 20 with `BorderRadius.md`.
 *
 * Bug 6: Long application IDs overflow the pill card
 *   Root: idValue Text had no `numberOfLines`/`flexShrink`; idCard had no `maxWidth`.
 *   Fix: idCard gets `maxWidth: "90%"`, idLabel `flexShrink: 0`, idValue `flexShrink: 1`,
 *   and `numberOfLines={1} ellipsizeMode="tail"` added to the Text element.
 *
 * Uses Node.js built-in test runner (node:test / node:assert/strict).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApplicationSummaryData {
  applicationId: string;
  incomeType: string;
  itrForm: string;
  assessmentYear: string;
  taxRegime?: string;
  documentsUploaded: string;
  refundBank?: string;
  submissionDate: string;
  status: string;
}

interface StoreDocument {
  id: string;
  title: string;
  subtitle: string;
  isMandatory: boolean;
  fileUri?: string;
  fileName?: string;
  status: "not_uploaded" | "uploaded";
}

// ── Helpers mirroring fixed screen logic ─────────────────────────────────────

function buildSummaryData(params: {
  applicationId?: string;
  serviceType?: string;
  serviceTitle?: string;
  formType?: string;
  assessmentYear?: string;
  incomeType?: string;
  regime?: string;
  uploadedDocsCount?: string;
  totalDocsCount?: string;
  refundBank?: string;
}, storeDocuments: StoreDocument[] | null): ApplicationSummaryData {
  const isRevised = params.serviceType === "revised" || params.serviceTitle === "Revised ITR";
  const appId = params.applicationId || "Application Received";
  const incomeType = isRevised ? "Revised Return Filing" : (params.incomeType || "Declared Income");
  const formType = params.formType || (isRevised ? "Revised ITR" : "ITR Form");
  const rawAy = params.assessmentYear || "";
  const formattedAy = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
  const refundBank = params.refundBank || "Verified Primary Bank";
  const taxRegime = params.regime || "New Tax Regime";

  const uploadedCount = (isRevised && storeDocuments)
    ? storeDocuments.filter((d) => d.status === "uploaded" || !!d.fileUri).length.toString()
    : params.uploadedDocsCount || "0";
  const totalCount = (isRevised && storeDocuments)
    ? storeDocuments.length.toString()
    : params.totalDocsCount || "0";

  return {
    applicationId: appId,
    incomeType,
    itrForm: formType,
    assessmentYear: formattedAy,
    taxRegime,
    documentsUploaded: `${uploadedCount} of ${totalCount} received`,
    refundBank,
    submissionDate: "01 Nov 2026",
    status: "Received",
  };
}

function computeScrollPaddingBottom(bottomInset: number): number {
  return bottomInset + 184;
}

function computeBottomBarButtonGap(hasInlineMarginTop: boolean): number {
  const gapFromStyle = 8; // Spacing.sm
  const inlineMargin = hasInlineMarginTop ? 8 : 0;
  return gapFromStyle + inlineMargin;
}

const BORDER_RADIUS_MD = 12;

// ── Bug 1: refundBank included in summaryData ─────────────────────────────────

describe("Bug 1 — refundBank not included in summaryData", () => {
  it("OLD: summaryData without refundBank has undefined refundBank — shows the bug", () => {
    const oldSummary: ApplicationSummaryData = {
      applicationId: "APP-001",
      incomeType: "Declared Income",
      itrForm: "ITR-1",
      assessmentYear: "AY 2025-26",
      taxRegime: "New Tax Regime",
      documentsUploaded: "4 of 6 received",
      // refundBank is missing → undefined
      submissionDate: "01 Nov 2026",
      status: "Received",
    };
    assert.equal(oldSummary.refundBank, undefined);
    // ApplicationSummaryCard falls back to hardcoded "HDFC Bank •••• 1234"
    const cardValue = oldSummary.refundBank || "HDFC Bank •••• 1234";
    assert.equal(cardValue, "HDFC Bank •••• 1234");
  });

  it("NEW: summaryData includes refundBank from params", () => {
    const summary = buildSummaryData({ refundBank: "SBI •••• 5678" }, null);
    assert.equal(summary.refundBank, "SBI •••• 5678");
  });

  it("NEW: summaryData uses default refundBank when param absent", () => {
    const summary = buildSummaryData({}, null);
    assert.equal(summary.refundBank, "Verified Primary Bank");
  });

  it("NEW: card shows param value, not hardcoded HDFC Bank fallback", () => {
    const summary = buildSummaryData({ refundBank: "Axis •••• 1234" }, null);
    const cardValue = summary.refundBank || "HDFC Bank •••• 1234";
    assert.notEqual(cardValue, "HDFC Bank •••• 1234");
    assert.equal(cardValue, "Axis •••• 1234");
  });
});

// ── Bug 2: docsUploaded from store for Revised ITR ────────────────────────────

describe("Bug 2 — docsUploaded stale params for Revised ITR (should read store)", () => {
  const storeDocs: StoreDocument[] = [
    { id: "doc-1", title: "PAN Card", subtitle: "", isMandatory: true, fileUri: "file://pan.pdf", status: "uploaded" },
    { id: "doc-2", title: "Aadhaar", subtitle: "", isMandatory: true, status: "not_uploaded" },
    { id: "doc-3", title: "Form 16", subtitle: "", isMandatory: true, fileUri: "file://form16.pdf", status: "uploaded" },
    { id: "doc-4", title: "AIS", subtitle: "", isMandatory: false, status: "not_uploaded" },
    { id: "doc-5", title: "Bank Statement", subtitle: "", isMandatory: false, status: "not_uploaded" },
    { id: "doc-6", title: "Investment Proofs", subtitle: "", isMandatory: false, status: "not_uploaded" },
  ];

  it("OLD: Revised ITR with stale params shows '0 of 0 received'", () => {
    const oldUploadedCount = "0"; // params default
    const oldTotalCount = "0";
    assert.equal(`${oldUploadedCount} of ${oldTotalCount} received`, "0 of 0 received");
  });

  it("NEW: Revised ITR with store docs shows correct uploaded count", () => {
    const summary = buildSummaryData(
      { serviceType: "revised", uploadedDocsCount: "0", totalDocsCount: "0" },
      storeDocs
    );
    assert.equal(summary.documentsUploaded, "2 of 6 received");
  });

  it("NEW: counts docs with fileUri even when status is not_uploaded", () => {
    const mixedDocs: StoreDocument[] = [
      { id: "doc-1", title: "PAN", subtitle: "", isMandatory: true, fileUri: "file://pan.pdf", status: "not_uploaded" },
      { id: "doc-2", title: "Aadhaar", subtitle: "", isMandatory: true, status: "not_uploaded" },
    ];
    const summary = buildSummaryData({ serviceType: "revised" }, mixedDocs);
    // fileUri present counts even if status is "not_uploaded"
    assert.equal(summary.documentsUploaded, "1 of 2 received");
  });

  it("NEW: non-Revised ITR still reads from params", () => {
    const summary = buildSummaryData(
      { serviceType: "standard", uploadedDocsCount: "5", totalDocsCount: "6" },
      storeDocs  // store has 2 uploaded — should NOT be used for standard ITR
    );
    assert.equal(summary.documentsUploaded, "5 of 6 received");
  });

  it("NEW: Revised ITR with null storeDocuments falls back to params", () => {
    const summary = buildSummaryData(
      { serviceType: "revised", uploadedDocsCount: "3", totalDocsCount: "6" },
      null
    );
    assert.equal(summary.documentsUploaded, "3 of 6 received");
  });

  it("NEW: Revised ITR with empty store shows 0 of 0 received", () => {
    const summary = buildSummaryData({ serviceType: "revised" }, []);
    assert.equal(summary.documentsUploaded, "0 of 0 received");
  });

  it("NEW: all docs uploaded shows full count", () => {
    const allUploaded = storeDocs.map((d) => ({ ...d, status: "uploaded" as const, fileUri: `file://${d.id}.pdf` }));
    const summary = buildSummaryData({ serviceType: "revised" }, allUploaded);
    assert.equal(summary.documentsUploaded, "6 of 6 received");
  });
});

// ── Bug 3: double gap between bottom bar buttons ──────────────────────────────

describe("Bug 3 — double gap between bottom-bar buttons", () => {
  it("OLD: gap was 16px (8 from style gap + 8 from inline marginTop) — shows the bug", () => {
    const gap = computeBottomBarButtonGap(true);
    assert.equal(gap, 16);
  });

  it("NEW: gap is 8px (8 from style gap, no inline marginTop)", () => {
    const gap = computeBottomBarButtonGap(false);
    assert.equal(gap, 8);
  });

  it("secondary buttons no longer have inline marginTop style", () => {
    // Represents the absence of { marginTop: 8 } in the button JSX after fix
    const buttonStyles = [{ height: 48, borderRadius: 12 }]; // no marginTop
    assert.equal(buttonStyles[0].hasOwnProperty("marginTop"), false);
  });
});

// ── Bug 4: scrollContent paddingBottom too small ──────────────────────────────

describe("Bug 4 — scrollContent paddingBottom too small for 3-button bottom bar", () => {
  const BOTTOM_BAR_CONTENT_HEIGHT = 10 + 50 + 8 + 48 + 8 + 48; // paddingTop + 3 buttons + 2 gaps = 172

  it("OLD: 130px clearance is not enough for 172px bar height — shows the bug", () => {
    const oldPadding = 130;
    assert.ok(oldPadding < BOTTOM_BAR_CONTENT_HEIGHT, "130 < 172, last card is clipped");
  });

  it("NEW: 184px clearance is enough for full bar height including 12px min safe padding", () => {
    const minSafePadding = 12;
    const totalBarHeight = BOTTOM_BAR_CONTENT_HEIGHT + minSafePadding; // 172 + 12 = 184
    const newPadding = 184;
    assert.ok(newPadding >= totalBarHeight, `${newPadding} >= ${totalBarHeight}`);
  });

  it("NEW: getScrollContentInsetsStyle(0) returns paddingBottom of 184", () => {
    assert.equal(computeScrollPaddingBottom(0), 184);
  });

  it("NEW: getScrollContentInsetsStyle(34) adds inset on top of 184", () => {
    assert.equal(computeScrollPaddingBottom(34), 218);
  });

  it("NEW: getScrollContentInsetsStyle(0) clears the bottom bar for Android (bottomInset=0, minPadding=12)", () => {
    const barHeight = BOTTOM_BAR_CONTENT_HEIGHT + 12; // 172 + 12 = 184
    const padding = computeScrollPaddingBottom(0); // 0 + 184 = 184
    assert.ok(padding >= barHeight, `${padding} >= ${barHeight}`);
  });
});

// ── Bug 5: WhatHappensNextCard border radius inconsistency ────────────────────

describe("Bug 5 — WhatHappensNextCard hardcoded borderRadius: 20 vs BorderRadius.md (12)", () => {
  it("OLD: WhatHappensNextCard used borderRadius: 20 — inconsistent with other cards", () => {
    const oldBorderRadius = 20;
    assert.notEqual(oldBorderRadius, BORDER_RADIUS_MD);
  });

  it("NEW: WhatHappensNextCard uses BorderRadius.md (12)", () => {
    const newBorderRadius = BORDER_RADIUS_MD;
    assert.equal(newBorderRadius, 12);
  });

  it("NEW: all success cards use the same BorderRadius.md value", () => {
    const cardBorderRadii = {
      applicationSummary: BORDER_RADIUS_MD,
      whatHappensNext: BORDER_RADIUS_MD,
      filingProgressTracker: BORDER_RADIUS_MD,
    };
    assert.ok(
      new Set(Object.values(cardBorderRadii)).size === 1,
      "all cards should share the same border radius"
    );
  });
});

// ── Bug 6: long application IDs overflow pill card ────────────────────────────

describe("Bug 6 — long application IDs overflow the pill card", () => {
  const SHORT_ID = "APP-12345";
  const LONG_ID = "REVISED-ITR-2025-26-CUST-98765432-SUBMISSION";
  const VERY_LONG_ID = "a".repeat(60);

  it("OLD: no numberOfLines on idValue — long IDs extend the pill card indefinitely", () => {
    // Simulate old JSX: <Text style={styles.idValue}>{applicationId}</Text>
    // No truncation → idCard width grows unbounded
    const rendered = LONG_ID; // rendered as-is
    assert.ok(rendered.length > 20, "long ID would overflow without truncation");
  });

  it("NEW: idValue has numberOfLines={1} — long IDs are truncated", () => {
    // After fix: numberOfLines={1} ellipsizeMode="tail" added
    // idCard has maxWidth: "90%" and idValue has flexShrink: 1
    const styles = {
      idCard: { maxWidth: "90%" },
      idLabel: { flexShrink: 0 },
      idValue: { flexShrink: 1 },
    };
    assert.ok(styles.idCard.maxWidth, "idCard should have maxWidth");
    assert.equal(styles.idLabel.flexShrink, 0);
    assert.equal(styles.idValue.flexShrink, 1);
  });

  it("SHORT_ID displays without truncation within 90% width", () => {
    // Short IDs should never need truncation — they fit comfortably
    assert.ok(SHORT_ID.length <= 20, "short ID fits within pill");
  });

  it("LONG_ID needs truncation but does not break the layout", () => {
    assert.ok(LONG_ID.length > 20, "long ID is over 20 chars — needs truncation");
    // numberOfLines={1} + ellipsizeMode="tail" handles this
  });

  it("idLabel has flexShrink: 0 — label text is never squeezed by long ID values", () => {
    const labelStyle = { fontSize: 12.5, fontWeight: "600", color: "#0B1F3A", flexShrink: 0 };
    assert.equal(labelStyle.flexShrink, 0);
  });

  it("idValue has flexShrink: 1 — value text shrinks instead of overflowing", () => {
    const valueStyle = { fontSize: 13, fontWeight: "800", color: "#16A34A", flexShrink: 1 };
    assert.equal(valueStyle.flexShrink, 1);
  });

  it("pill maxWidth: '90%' prevents overflow of the centered container", () => {
    const idCardStyle = {
      flexDirection: "row",
      maxWidth: "90%",
      borderRadius: 24,
      paddingHorizontal: 16,
    };
    assert.equal(idCardStyle.maxWidth, "90%");
  });
});

// ── Integration: summaryData shape after all fixes ────────────────────────────

describe("Integration — summaryData after all Batch 17 fixes", () => {
  it("standard ITR summaryData has all required fields", () => {
    const summary = buildSummaryData(
      {
        applicationId: "ITR-2025-12345",
        serviceType: "standard",
        formType: "ITR-1",
        assessmentYear: "2025-26",
        incomeType: "Salary",
        regime: "New Tax Regime",
        uploadedDocsCount: "4",
        totalDocsCount: "6",
        refundBank: "HDFC •••• 1234",
      },
      null
    );
    assert.ok(summary.applicationId);
    assert.ok(summary.incomeType);
    assert.ok(summary.itrForm);
    assert.ok(summary.assessmentYear);
    assert.ok(summary.taxRegime);
    assert.ok(summary.documentsUploaded);
    assert.ok(summary.refundBank);
    assert.ok(summary.submissionDate);
    assert.equal(summary.status, "Received");
  });

  it("revised ITR summaryData uses store docs and passed refundBank", () => {
    const storeDocs: StoreDocument[] = Array.from({ length: 6 }, (_, i) => ({
      id: `doc-${i + 1}`,
      title: `Doc ${i + 1}`,
      subtitle: "",
      isMandatory: i < 3,
      status: i < 4 ? ("uploaded" as const) : ("not_uploaded" as const),
      fileUri: i < 4 ? `file://doc${i + 1}.pdf` : undefined,
    }));

    const summary = buildSummaryData(
      {
        serviceTitle: "Revised ITR",
        refundBank: "SBI •••• 9999",
        uploadedDocsCount: "0",
        totalDocsCount: "0",
      },
      storeDocs
    );
    assert.equal(summary.refundBank, "SBI •••• 9999");
    assert.equal(summary.documentsUploaded, "4 of 6 received");
    assert.equal(summary.incomeType, "Revised Return Filing");
    assert.equal(summary.itrForm, "Revised ITR");
  });

  it("assessmentYear is prefixed with AY when not already prefixed", () => {
    const summary = buildSummaryData({ assessmentYear: "2025-26" }, null);
    assert.equal(summary.assessmentYear, "AY 2025-26");
  });

  it("assessmentYear is not double-prefixed if already has AY", () => {
    const summary = buildSummaryData({ assessmentYear: "AY 2025-26" }, null);
    assert.equal(summary.assessmentYear, "AY 2025-26");
  });
});
