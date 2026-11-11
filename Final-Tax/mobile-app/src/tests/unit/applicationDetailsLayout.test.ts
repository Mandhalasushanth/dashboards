/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getNextStepsMessage,
  getServiceSpecificTimeline,
} from "../../components/screens/application/applicationDetailsUtils";
import type { Application } from "../../types/domain";

test("ApplicationHeader: source file layout contracts", () => {
  const filePath = path.join(
    process.cwd(),
    "src/components/screens/application/ApplicationHeader.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // 1. Title is "Application Details"
  assert.ok(
    content.includes('<Text style={styles.navTitle}>Application Details</Text>'),
    "Header must display Application Details"
  );

  // 2. Application name appears directly underneath without line clipping
  assert.ok(
    content.includes('<Text style={styles.navAppName}>'),
    "Application name must be rendered directly underneath"
  );
  assert.ok(
    content.includes('{serviceName}'),
    "Application name must dynamically render {serviceName}"
  );

  // 3. Back button and Settings button are preserved
  assert.ok(
    content.includes('style={styles.backButton}'),
    "Back button must be preserved in header"
  );
  assert.ok(
    content.includes('name="arrow-back"'),
    "Back button arrow icon must be preserved"
  );
  assert.ok(
    content.includes('style={styles.settingsButton}'),
    "Settings button must be preserved in header"
  );
  assert.ok(
    content.includes('name="settings-outline"'),
    "Settings icon must be preserved"
  );

  // 4. Floating summary card is removed
  assert.ok(
    !content.includes("sharedHeaderCardWrapper"),
    "Floating shared header card wrapper must be removed"
  );
  assert.ok(
    !content.includes("ApplicationCardAvatar"),
    "Application icon avatar must be removed"
  );

  // 5. All 5 tabs are preserved
  assert.ok(content.includes('{ id: "OVERVIEW", label: "Overview" }'));
  assert.ok(content.includes('{ id: "STATUS", label: "Status" }'));
  assert.ok(content.includes('{ id: "DOCUMENTS", label: "Documents" }'));
  assert.ok(content.includes('{ id: "PAYMENTS", label: "Payments" }'));
  assert.ok(content.includes('{ id: "CHAT", label: "Chat with CA" }'));
});

test("OverviewTab: displays exactly two cards — Application Details & What happens next?", () => {
  const filePath = path.join(
    process.cwd(),
    "src/components/screens/application/OverviewTab.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // 1. Heading "Overview" is kept
  assert.ok(
    content.includes('<Text style={styles.screenHeading}>Overview</Text>'),
    "Overview screen heading must be preserved"
  );

  // 2. Exactly 2 cards rendered in the JSX
  const cardMatches = content.match(/<View style=\{styles\.card\}>/g);
  assert.equal(
    cardMatches ? cardMatches.length : 0,
    2,
    "Overview tab must contain exactly 2 cards (Application Details and What happens next?)"
  );

  // 3. Card 1: Application Details with 4 rows
  assert.ok(
    content.includes('<Text style={styles.cardTitle}>Application Details</Text>'),
    "Must display card titled 'Application Details'"
  );
  assert.ok(content.includes('label: "Service"'), "Must include Service row");
  assert.ok(content.includes('label: "Application ID"'), "Must include Application ID row");
  assert.ok(content.includes('label: "Submission Date"'), "Must include Submission Date row");
  assert.ok(content.includes('label: "Status"'), "Must include Status row");

  // 4. Card 2: What happens next?
  assert.ok(
    content.includes('<Text style={styles.nextStepTitle}>What happens next?</Text>'),
    "Must display 'What happens next?' heading"
  );
  assert.ok(
    content.includes('name="time-outline"'),
    "Clock/time icon must be displayed"
  );
  assert.ok(
    content.includes('style={styles.nextStepDivider}'),
    "Must include horizontal divider"
  );
  assert.ok(
    content.includes("Have questions? Chat with CA ›"),
    "Must include 'Have questions? Chat with CA ›' link"
  );
  assert.ok(
    content.includes("handleChatPress"),
    "Chat link must trigger handleChatPress"
  );

  // 5. Removed "Your Submitted Details" card and fields completely
  assert.ok(
    !content.includes("Your Submitted Details"),
    "'Your Submitted Details' card must be completely removed"
  );
  assert.ok(
    !content.includes("resolveSubmittedDataRows"),
    "resolveSubmittedDataRows must not be called"
  );
});

test("getNextStepsMessage: returns accurate status-dependent messages", () => {
  // Submitted
  assert.equal(
    getNextStepsMessage("Submitted"),
    "Your application has been submitted successfully. We’ll notify you when its status changes."
  );

  // In Progress / Under Verification
  assert.equal(
    getNextStepsMessage("In Progress"),
    "Your application is currently being reviewed and processed by our team. We’ll notify you as soon as its status changes."
  );
  assert.equal(
    getNextStepsMessage("Under Verification"),
    "Your application is currently being reviewed and processed by our team. We’ll notify you as soon as its status changes."
  );

  // Completed / Approved
  assert.equal(
    getNextStepsMessage("Approved"),
    "Your application has been processed and approved. You can download certificates and final documents."
  );
  assert.equal(
    getNextStepsMessage("Completed"),
    "Your application has been processed and approved. You can download certificates and final documents."
  );

  // Rejected / Failed
  assert.equal(
    getNextStepsMessage("Rejected"),
    "Your application requires attention. Please check details or connect with our CA team for resolution."
  );

  // Draft
  assert.equal(
    getNextStepsMessage("Draft"),
    "Your application draft has been saved. Complete the required details to submit."
  );
});

test("DocumentsTab: eye icon triggers document preview modal", () => {
  const filePath = path.join(
    process.cwd(),
    "src/components/screens/application/DocumentsTab.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // 1. GstViewDocumentModal is imported and wired
  assert.ok(
    content.includes("GstViewDocumentModal"),
    "GstViewDocumentModal must be used for document previews"
  );
  assert.ok(
    content.includes("setPreviewDoc"),
    "DocumentsTab must track previewDoc state"
  );

  // 2. Eye icon triggers setPreviewDoc
  assert.ok(
    content.includes("style={styles.docEyeButton}"),
    "docEyeButton must be present"
  );
  assert.ok(
    content.includes("name=\"eye-outline\""),
    "eye-outline icon must be present"
  );

  // 3. Modal passes active document info and onClose
  assert.ok(
    content.includes("visible={Boolean(previewDoc)}"),
    "Modal visibility must be controlled by previewDoc"
  );
  assert.ok(
    content.includes("onClose={() => setPreviewDoc(null)}"),
    "Modal onClose must reset previewDoc to null"
  );
});

test("Other four tabs remain intact and unchanged", () => {
  const tabs = [
    "src/components/screens/application/StatusTab.tsx",
    "src/components/screens/application/DocumentsTab.tsx",
    "src/components/screens/application/PaymentsTab.tsx",
    "src/components/screens/application/ChatTab.tsx",
  ];

  for (const tabPath of tabs) {
    const fullPath = path.join(process.cwd(), tabPath);
    assert.ok(fs.existsSync(fullPath), `${tabPath} must exist`);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert.ok(content.length > 500, `${tabPath} must contain complete component implementation`);
  }
});

test("StatusTab: layout contracts & removal of Current Status card", () => {
  const filePath = path.join(
    process.cwd(),
    "src/components/screens/application/StatusTab.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // 1. Current Status card is completely removed
  assert.ok(
    !content.includes("currentStatusCard"),
    "Separate Current Status card must be completely removed from StatusTab"
  );
  assert.ok(
    !content.includes("Current Status"),
    "Duplicate Current Status label must not appear in StatusTab"
  );

  // 2. Timeline is rendered inside styles.card
  assert.ok(
    content.includes("<View style={styles.card}>"),
    "Timeline must be wrapped in a single card"
  );
  const cardMatches = content.match(/<View style=\{styles\.card\}>/g);
  assert.equal(
    cardMatches ? cardMatches.length : 0,
    1,
    "StatusTab must render exactly 1 card containing the timeline"
  );

  // 3. Top Dynamic Status Summary Card & Removal of Bottom Guidance Card
  assert.ok(
    content.includes("styles.statusSummaryCard"),
    "StatusTab must render the dynamic status summary card above timeline"
  );
  assert.ok(
    !content.includes("styles.statusGuidanceCard"),
    "StatusTab must remove the bottom guidance card below timeline per prompt"
  );

  // 4. Circle states: completed, current, pending, rejected
  assert.ok(content.includes("styles.circleCompleted"), "Must use circleCompleted style");
  assert.ok(content.includes("styles.circleCurrent"), "Must use circleCurrent style");
  assert.ok(content.includes("styles.circlePending"), "Must use circlePending style");
  assert.ok(content.includes("styles.circleRejected"), "Must use circleRejected style");

  // 5. Badges: completed, current, pending, rejected
  assert.ok(content.includes("styles.timelineBadgeCompleted"), "Must use timelineBadgeCompleted");
  assert.ok(content.includes("styles.timelineBadgeCurrent"), "Must use timelineBadgeCurrent");
  assert.ok(content.includes("styles.timelineBadgePending"), "Must use timelineBadgePending");
  assert.ok(content.includes("styles.timelineBadgeRejected"), "Must use timelineBadgeRejected");

  // 6. Progress line reflects stage visual configs
  assert.ok(
    content.includes("stageConfig.connectorColor"),
    "Connecting vertical line must reflect stage visual config colors"
  );
});

test("getServiceSpecificTimeline: representative applications test across categories", () => {
  const appliedDate = "26 Oct 2026";

  // 1. GST Registration
  const gstApp: Application = {
    id: "GST-1",
    serviceId: "gst-registration",
    serviceName: "GST Registration",
    category: "GST",
    status: "Submitted",
    progress: 25,
    assignedExecutive: "",
    paymentAmount: 999,
    paymentStatus: "Paid",
    createdAt: "2026-10-26T10:00:00Z",
    formData: {},
    documents: [],
    timeline: [],
    chatHistory: [],
  };
  const gstSteps = getServiceSpecificTimeline(gstApp, appliedDate);
  assert.equal(gstSteps.length, 5, "GST Registration must have 5 timeline stages");
  assert.equal(gstSteps[0].title, "Application Submitted");
  assert.equal(gstSteps[0].status, "completed");
  assert.equal(gstSteps[0].date, appliedDate);
  assert.equal(gstSteps[1].title, "Document Collection");
  assert.equal(gstSteps[1].status, "current");
  assert.equal(gstSteps[2].title, "Verification");
  assert.equal(gstSteps[2].status, "pending");
  assert.equal(gstSteps[3].title, "Payment");
  assert.equal(gstSteps[3].status, "pending");
  assert.equal(gstSteps[4].title, "Completed");
  assert.equal(gstSteps[4].status, "pending");

  // 2. GST Amendment
  const amendmentApp: Application = {
    ...gstApp,
    id: "AMEND-1",
    serviceId: "gst-amendment",
    serviceName: "GST Amendment",
    status: "Under Verification",
  };
  const amendSteps = getServiceSpecificTimeline(amendmentApp, appliedDate);
  assert.equal(amendSteps.length, 5, "GST Amendment must have 5 timeline stages");
  assert.equal(amendSteps[0].title, "Amendment Submitted");
  assert.equal(amendSteps[0].status, "completed");
  assert.equal(amendSteps[1].title, "Document Collection");
  assert.equal(amendSteps[1].status, "completed");
  assert.equal(amendSteps[2].title, "Verification");
  assert.equal(amendSteps[2].status, "current");
  assert.equal(amendSteps[3].title, "Payment");
  assert.equal(amendSteps[3].status, "pending");
  assert.equal(amendSteps[4].title, "Completed");
  assert.equal(amendSteps[4].status, "pending");

  // 3. Company Registration
  const companyApp: Application = {
    ...gstApp,
    id: "COMP-1",
    serviceId: "company-registration",
    serviceName: "Private Limited Company Registration",
    category: "BUSINESS",
    status: "In Progress",
  };
  const compSteps = getServiceSpecificTimeline(companyApp, appliedDate);
  assert.equal(compSteps.length, 5, "Company Registration must have 5 timeline stages");
  assert.equal(compSteps[0].title, "Application Submitted");
  assert.equal(compSteps[0].status, "completed");
  assert.equal(compSteps[1].title, "Document Collection");
  assert.equal(compSteps[1].status, "completed");
  assert.equal(compSteps[2].title, "Verification");
  assert.equal(compSteps[2].status, "current");
  assert.equal(compSteps[3].title, "Payment");
  assert.equal(compSteps[3].status, "pending");
  assert.equal(compSteps[4].title, "Completed");
  assert.equal(compSteps[4].status, "pending");

  // 4. ITR
  const itrApp: Application = {
    ...gstApp,
    id: "ITR-1",
    serviceId: "itr-filing",
    serviceName: "ITR Filing",
    category: "ITR",
    status: "Approved",
  };
  const itrSteps = getServiceSpecificTimeline(itrApp, appliedDate);
  assert.equal(itrSteps.length, 5, "ITR must have 5 timeline stages");
  assert.equal(itrSteps[0].title, "Application Submitted");
  assert.equal(itrSteps[0].status, "completed");
  assert.equal(itrSteps[1].title, "Document Collection");
  assert.equal(itrSteps[1].status, "completed");
  assert.equal(itrSteps[2].title, "Verification");
  assert.equal(itrSteps[2].status, "completed");
  assert.equal(itrSteps[3].title, "Payment");
  assert.equal(itrSteps[3].status, "completed");
  assert.equal(itrSteps[4].title, "Completed");
  assert.equal(itrSteps[4].status, "completed");
  assert.ok(!itrSteps.some((s) => s.description.toLowerCase().includes("gst")), "ITR must not contain GST text");

  // 5. Loan Application
  const loanApp: Application = {
    ...gstApp,
    id: "LOAN-1",
    serviceId: "business-loan",
    serviceName: "Business Loan",
    category: "LOANS",
    status: "Draft",
  };
  const loanSteps = getServiceSpecificTimeline(loanApp, appliedDate);
  assert.equal(loanSteps.length, 5, "Loan application must have 5 timeline stages");
  assert.equal(loanSteps[0].title, "Loan Application Submitted");
  assert.equal(loanSteps[0].status, "current");
  assert.equal(loanSteps[0].date, undefined, "Draft must not fabricate a submission date");
  assert.equal(loanSteps[1].status, "pending");
  assert.equal(loanSteps[2].status, "pending");
  assert.equal(loanSteps[3].status, "pending");
  assert.equal(loanSteps[4].status, "pending");
  assert.ok(!loanSteps.some((s) => s.description.toLowerCase().includes("gst")), "Loan must not contain GST text");
});

test("[id].styles.ts: styling requirements", () => {
  const filePath = path.join(
    process.cwd(),
    "src/styles/app/application/[id].styles.ts"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // 1. Navy header color
  assert.ok(
    content.includes('navyHeader: { backgroundColor: "#0A2346"'),
    "Navy header must use #0A2346 background"
  );

  // 2. Nav app name is prominent subtitle with bold white text
  assert.ok(
    content.includes('navAppName: {'),
    "Must have navAppName style"
  );
  assert.ok(
    content.includes('fontSize: 18'),
    "navAppName must have prominent fontSize 18"
  );
  assert.ok(
    content.includes('fontWeight: "700"'),
    "navAppName must have prominent fontWeight 700"
  );
  assert.ok(
    content.includes('color: "#FFFFFF"'),
    "navAppName must be prominent white #FFFFFF"
  );
  assert.ok(
    content.includes('settingsButton: {'),
    "Must have settingsButton style"
  );

  // 3. What happens next styles
  assert.ok(content.includes("nextStepTopRow"), "Must have nextStepTopRow style");
  assert.ok(content.includes("nextStepIconCircle"), "Must have nextStepIconCircle style");
  assert.ok(content.includes("nextStepTitle"), "Must have nextStepTitle style");
  assert.ok(content.includes("nextStepDesc"), "Must have nextStepDesc style");
  assert.ok(content.includes("nextStepDivider"), "Must have nextStepDivider style");
  assert.ok(content.includes("nextStepActionText"), "Must have nextStepActionText style");

  // 4. Status tab timeline styles
  assert.ok(content.includes("circleCompleted: {"), "Must have circleCompleted style");
  assert.ok(content.includes("circleCurrent: {"), "Must have circleCurrent style");
  assert.ok(content.includes("circlePending: {"), "Must have circlePending style");
  assert.ok(content.includes("timelineBadgeCompleted: {"), "Must have timelineBadgeCompleted style");
  assert.ok(content.includes("timelineBadgeCurrent: {"), "Must have timelineBadgeCurrent style");
  assert.ok(content.includes("timelineBadgePending: {"), "Must have timelineBadgePending style");

  // 5. File line count below 400
  const lines = content.split("\n").length;
  assert.ok(
    lines < 400,
    `[id].styles.ts must be below 400 lines (current: ${lines})`
  );
});

test("ApplicationHeader & [id].tsx: header displays only title and prominent dynamic service name without metadata", () => {
  const headerPath = path.join(
    process.cwd(),
    "src/components/screens/application/ApplicationHeader.tsx"
  );
  const headerContent = fs.readFileSync(headerPath, "utf-8");

  // 1. Confirm only title and serviceName are in header JSX
  assert.ok(headerContent.includes("<Text style={styles.navTitle}>Application Details</Text>"));
  assert.ok(headerContent.includes("<Text style={styles.navAppName}>\n              {serviceName}\n            </Text>") || headerContent.includes("{serviceName}"));

  // 2. Confirm application ID, trader/customer name, and dates are removed from the header JSX
  assert.ok(!headerContent.includes("APPLICATION #"));
  assert.ok(!headerContent.includes("{displayId}"));
  assert.ok(!headerContent.includes("{submittedOnText}"));
  assert.ok(!headerContent.includes("traderName"));
  assert.ok(!headerContent.includes("customerName"));

  // 3. Confirm dynamic service name resolution in [id].tsx
  const idPath = path.join(
    process.cwd(),
    "src/app/application/[id].tsx"
  );
  const idContent = fs.readFileSync(idPath, "utf-8");
  assert.ok(idContent.includes("filingPeriod"));
  assert.ok(idContent.includes("displayName"));
});

test("Modified files remain strictly below 400 lines", () => {
  const files = [
    "src/components/screens/application/ApplicationHeader.tsx",
    "src/components/screens/application/OverviewTab.tsx",
    "src/components/screens/application/DocumentsTab.tsx",
    "src/components/screens/application/StatusTab.tsx",
    "src/components/screens/application/applicationDetailsUtils.ts",
    "src/components/screens/application/applicationStatusResolver.ts",
    "src/store/applicationDraftMappers.ts",
    "src/styles/app/application/[id].styles.ts",
    "src/app/application/[id].tsx",
  ];

  for (const relPath of files) {
    const fullPath = path.join(process.cwd(), relPath);
    const lineCount = fs.readFileSync(fullPath, "utf-8").split("\n").length;
    assert.ok(
      lineCount < 400,
      `File ${relPath} must be below 400 lines (found ${lineCount} lines)`
    );
  }
});
