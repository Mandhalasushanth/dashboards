/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  resolveApplicationStatusUI,
  type StatusVisualVariant,
} from "../../components/screens/application/applicationStatusResolver";
import { getServiceSpecificTimeline } from "../../components/screens/application/applicationDetailsUtils";
import type { Application } from "../../types/domain";

function createMockApp(overrides: Partial<Application> = {}): Application {
  return {
    id: "APP-TEST-001",
    serviceId: "gst-registration",
    serviceName: "GST Registration",
    category: "GST",
    status: "Submitted",
    progress: 25,
    assignedExecutive: "Officer Raj",
    paymentAmount: 999,
    paymentStatus: "Paid",
    createdAt: "2026-10-26T10:00:00Z",
    formData: {},
    documents: [],
    timeline: [],
    chatHistory: [],
    ...overrides,
  };
}

test("Status Resolver: Visual treatment for all 7 required states", () => {
  const appliedDate = "26 Oct 2026";

  // 1. Submitted -> Blue
  const submittedRes = resolveApplicationStatusUI(
    createMockApp({ status: "Submitted" }),
    appliedDate
  );
  assert.equal(submittedRes.normalizedStatus, "SUBMITTED");
  assert.equal(submittedRes.summary.variant, "blue" as StatusVisualVariant);
  assert.equal(submittedRes.summary.badgeLabel, "Submitted");
  assert.equal(submittedRes.guidance.heading, "Application received");
  assert.ok(submittedRes.summary.description.includes(appliedDate));
  assert.ok(submittedRes.guidance.description.includes(appliedDate));

  // 2. In Progress -> Orange
  const inProgressRes = resolveApplicationStatusUI(
    createMockApp({ status: "In Progress" }),
    appliedDate
  );
  assert.equal(inProgressRes.normalizedStatus, "IN_PROGRESS");
  assert.equal(inProgressRes.summary.variant, "orange" as StatusVisualVariant);
  assert.equal(inProgressRes.summary.badgeLabel, "In Progress");
  assert.equal(inProgressRes.guidance.heading, "Processing in progress");

  // 3. Under Verification -> Orange
  const underVerifRes = resolveApplicationStatusUI(
    createMockApp({ status: "Under Verification" }),
    appliedDate
  );
  assert.equal(underVerifRes.normalizedStatus, "UNDER_VERIFICATION");
  assert.equal(underVerifRes.summary.variant, "orange" as StatusVisualVariant);
  assert.equal(underVerifRes.summary.badgeLabel, "Under Review");
  assert.equal(underVerifRes.guidance.heading, "Verification in progress");

  // 4. Pending Documents -> Light blue
  const pendingDocsRes = resolveApplicationStatusUI(
    createMockApp({ status: "Pending Documents" }),
    appliedDate
  );
  assert.equal(pendingDocsRes.normalizedStatus, "PENDING_DOCUMENTS");
  assert.equal(pendingDocsRes.summary.variant, "lightBlue" as StatusVisualVariant);
  assert.equal(pendingDocsRes.summary.badgeLabel, "Action Needed");
  assert.equal(pendingDocsRes.guidance.heading, "Action required");
  assert.ok(pendingDocsRes.guidance.action, "Pending docs must provide an action");
  assert.equal(pendingDocsRes.guidance.action?.tab, "DOCUMENTS");

  // 5. Completed / Approved -> Green
  const completedRes = resolveApplicationStatusUI(
    createMockApp({ status: "Completed" }),
    appliedDate
  );
  assert.equal(completedRes.normalizedStatus, "COMPLETED");
  assert.equal(completedRes.summary.variant, "green" as StatusVisualVariant);
  assert.equal(completedRes.summary.badgeLabel, "Completed");
  assert.equal(completedRes.guidance.heading, "Application completed");
  assert.equal(completedRes.guidance.action?.tab, "DOCUMENTS");

  const approvedRes = resolveApplicationStatusUI(
    createMockApp({ status: "Approved" }),
    appliedDate
  );
  assert.equal(approvedRes.normalizedStatus, "COMPLETED");
  assert.equal(approvedRes.summary.variant, "green" as StatusVisualVariant);
  assert.equal(approvedRes.summary.badgeLabel, "Approved");
  assert.equal(approvedRes.guidance.heading, "Application completed");

  // 6. Rejected -> Red
  const rejectedAppWithReason = createMockApp({
    status: "Rejected",
    formData: { rejectionReason: "PAN mismatch in bank proof" },
  });
  const rejectedRes = resolveApplicationStatusUI(
    rejectedAppWithReason,
    appliedDate
  );
  assert.equal(rejectedRes.normalizedStatus, "REJECTED");
  assert.equal(rejectedRes.summary.variant, "red" as StatusVisualVariant);
  assert.equal(rejectedRes.summary.badgeLabel, "Rejected");
  assert.equal(rejectedRes.guidance.heading, "Application rejected");
  assert.ok(
    rejectedRes.summary.description.includes("PAN mismatch in bank proof"),
    "Must show real rejection reason when available"
  );
  assert.ok(
    rejectedRes.guidance.description.includes("PAN mismatch in bank proof"),
    "Guidance must show real rejection reason"
  );
  assert.equal(rejectedRes.guidance.action?.tab, "CHAT");

  // 7. Unknown / Unavailable / Draft -> Neutral gray
  const unknownRes = resolveApplicationStatusUI(
    createMockApp({ status: "" }),
    appliedDate
  );
  assert.equal(unknownRes.normalizedStatus, "UNKNOWN");
  assert.equal(unknownRes.summary.variant, "gray" as StatusVisualVariant);
  assert.equal(unknownRes.guidance.heading, "Status information unavailable");

  const draftRes = resolveApplicationStatusUI(
    createMockApp({ status: "Draft" }),
    appliedDate
  );
  assert.equal(draftRes.normalizedStatus, "UNKNOWN");
  assert.equal(draftRes.summary.variant, "gray" as StatusVisualVariant);
  assert.equal(draftRes.summary.badgeLabel, "Draft");
  assert.equal(draftRes.guidance.heading, "Application in draft");
});

test("Service categories: workflow stages and outcome guidance across diverse services", () => {
  const appliedDate = "26 Oct 2026";

  // 1. GST Registration
  const gstApp = createMockApp({
    serviceId: "gst-registration",
    category: "GST",
    status: "Completed",
  });
  const gstRes = resolveApplicationStatusUI(gstApp, appliedDate);
  assert.ok(gstRes.summary.description.includes("GST"));
  assert.equal(gstRes.timelineSteps.length, 5);
  assert.equal(gstRes.timelineSteps[0].title, "Application Submitted");

  // 2. GST Amendment
  const amendApp = createMockApp({
    serviceId: "gst-amendment",
    category: "GST",
    status: "Completed",
  });
  const amendRes = resolveApplicationStatusUI(amendApp, appliedDate);
  assert.ok(amendRes.summary.description.includes("amendment") || amendRes.summary.description.includes("Amended"));
  assert.equal(amendRes.timelineSteps[0].title, "Amendment Submitted");

  // 3. GST Filing
  const filingApp = createMockApp({
    serviceId: "gst-filing-gstr1",
    category: "GST",
    status: "Completed",
  });
  const filingRes = resolveApplicationStatusUI(filingApp, appliedDate);
  assert.ok(filingRes.summary.description.includes("e-filing") || filingRes.summary.description.includes("ARN"));
  assert.equal(filingRes.timelineSteps[0].title, "Filing Data Submitted");

  // 4. Company Registration
  const compApp = createMockApp({
    serviceId: "company-incorporation",
    category: "BUSINESS",
    status: "Completed",
  });
  const compRes = resolveApplicationStatusUI(compApp, appliedDate);
  assert.ok(compRes.summary.description.includes("Incorporation") || compRes.summary.description.includes("COI"));

  // 5. ITR & TDS
  const itrApp = createMockApp({
    serviceId: "itr-1",
    category: "ITR",
    status: "Completed",
  });
  const itrRes = resolveApplicationStatusUI(itrApp, appliedDate);
  assert.ok(itrRes.summary.description.includes("ITR") || itrRes.summary.description.includes("tax return"));

  // 6. Loans (Business, Personal, MSME, Machinery)
  const loanServices = ["loan-business", "personal-loan", "loan-msme", "machinery-loan"];
  for (const sid of loanServices) {
    const loanApp = createMockApp({
      serviceId: sid,
      category: "LOANS",
      status: "Completed",
    });
    const loanRes = resolveApplicationStatusUI(loanApp, appliedDate);
    assert.ok(loanRes.summary.description.includes("Loan") || loanRes.summary.description.includes("disbursement"));
    assert.equal(loanRes.timelineSteps[0].title, "Loan Application Submitted");
  }
});

test("Timeline stages: No fabricated dates or outcomes on Draft, Unknown, or Submitted", () => {
  const appliedDate = "26 Oct 2026";

  // Draft: no dates, step 0 current, rest pending
  const draftSteps = getServiceSpecificTimeline(
    createMockApp({ status: "Draft" }),
    appliedDate
  );
  assert.equal(draftSteps[0].date, undefined, "Draft must have undefined date");
  assert.equal(draftSteps[0].status, "current");
  assert.equal(draftSteps[1].status, "pending");
  assert.equal(draftSteps[2].status, "pending");
  assert.equal(draftSteps[3].status, "pending");
  assert.equal(draftSteps[4].status, "pending");

  // Unknown: no dates, step 0 current, rest pending
  const unknownSteps = getServiceSpecificTimeline(
    createMockApp({ status: "" }),
    appliedDate
  );
  assert.equal(unknownSteps[0].date, undefined, "Unknown must not fabricate date");
  assert.equal(unknownSteps[0].status, "current");

  // Submitted: step 0 completed on appliedDate, step 1 current, steps 2-4 pending
  const submittedSteps = getServiceSpecificTimeline(
    createMockApp({ status: "Submitted" }),
    appliedDate
  );
  assert.equal(submittedSteps[0].date, appliedDate);
  assert.equal(submittedSteps[0].status, "completed");
  assert.equal(submittedSteps[1].status, "current");
  assert.equal(submittedSteps[2].status, "pending");
  assert.equal(submittedSteps[3].status, "pending");
  assert.equal(submittedSteps[4].status, "pending");
});

test("StatusTab source structure: dynamic cards and removal of duplicate current status", () => {
  const filePath = path.join(
    process.cwd(),
    "src/components/screens/application/StatusTab.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // Verify summary and timeline cards are present:
  assert.ok(content.includes("styles.statusSummaryCard"), "Summary card present");
  assert.ok(content.includes("styles.card"), "Timeline card present");
  assert.ok(!content.includes("styles.statusGuidanceCard"), "Guidance card removed per prompt");

  // Verify duplicate Current Status card is absent
  assert.ok(!content.includes("currentStatusCard"), "Old currentStatusCard is absent");
  assert.ok(!content.includes("Current Status"), "Duplicate Current Status is absent");

  // Verify rejection circle & badge handling
  assert.ok(content.includes("circleRejected"), "Rejection circle style handled");
  assert.ok(content.includes("timelineBadgeRejected"), "Rejection badge handled");
});
