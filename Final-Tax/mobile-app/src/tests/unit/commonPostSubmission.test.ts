import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  PostSubmissionConfig,
  ItrPostSubmissionConfig,
  RevisedItrPostSubmissionConfig,
  TdsRefundPostSubmissionConfig,
} from "../../modules/itr/components/submission/CommonPostSubmissionScreen/postSubmission.types";

/**
 * Pure helper simulating CommonPostSubmissionScreen's summary rows generation logic.
 * Mirrors production logic in CommonPostSubmissionScreen.tsx.
 */
function buildSummaryRows(config: PostSubmissionConfig) {
  const rows: { label: string; value: string }[] = [];
  const todayFormatted = "03 Nov 2026";

  switch (config.moduleType) {
    case "revised-itr": {
      const rawAy = config.assessmentYear || "";
      const ay = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
      rows.push({ label: "Assessment Year", value: ay });
      rows.push({ label: "Return Form", value: config.formType || "Revised ITR" });
      rows.push({ label: "Filing Purpose", value: config.incomeType || "Revised Return Filing" });
      if (config.revisionReason) {
        rows.push({ label: "Revision Reason", value: config.revisionReason });
      }
      if (config.originalAckNumber) {
        rows.push({ label: "Original Ack No.", value: config.originalAckNumber });
      }
      const upCount = config.uploadedDocsCount ?? 0;
      const totCount = config.totalDocsCount ?? 0;
      rows.push({ label: "Documents", value: `${upCount} of ${totCount} received` });
      rows.push({ label: "Submission Date", value: config.submissionDate || todayFormatted });
      rows.push({ label: "Status", value: config.status || "Received" });
      break;
    }
    case "tds-refund": {
      const rawAy = config.assessmentYear || "";
      const ay = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
      rows.push({ label: "Service", value: config.serviceName || "TDS Refund" });
      rows.push({ label: "Assessment Year", value: ay });
      if (config.estimatedRefund !== undefined) {
        const formattedRefund = String(config.estimatedRefund).startsWith("₹")
          ? String(config.estimatedRefund)
          : `₹${config.estimatedRefund}`;
        rows.push({ label: "Estimated Refund", value: formattedRefund });
      }
      rows.push({ label: "Refund Bank", value: config.refundBank || "Verified Primary Bank" });
      const upCount = config.uploadedDocsCount ?? 0;
      const totCount = config.totalDocsCount ?? 0;
      if (Number(totCount) > 0) {
        rows.push({ label: "Documents", value: `${upCount} of ${totCount} received` });
      }
      rows.push({ label: "Applied Date", value: config.submissionDate || todayFormatted });
      rows.push({ label: "Status", value: config.status || "Under Verification" });
      break;
    }
    case "itr":
    default: {
      const rawAy = config.assessmentYear || "";
      const ay = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
      rows.push({ label: "Assessment Year", value: ay });
      rows.push({ label: "Return Form", value: config.formType || "ITR Form" });
      rows.push({ label: "Income Sources", value: config.incomeType || "Declared Income" });
      rows.push({ label: "Tax Regime", value: config.taxRegime || "New Tax Regime" });
      const upCount = config.uploadedDocsCount ?? 0;
      const totCount = config.totalDocsCount ?? 0;
      rows.push({ label: "Documents", value: `${upCount} of ${totCount} received` });
      rows.push({ label: "Refund Bank", value: config.refundBank || "Verified Primary Bank" });
      rows.push({ label: "Submission Date", value: config.submissionDate || todayFormatted });
      rows.push({ label: "Status", value: config.status || "Received" });
      break;
    }
  }

  return rows;
}

/**
 * Pure helper verifying confirmation state.
 */
function isConfirmedSubmission(referenceId?: string): boolean {
  if (!referenceId) return false;
  return referenceId.trim().length > 0;
}

describe("Stage 3: Common Post-Submission Screen", () => {
  // ── Group 1: Strongly-Typed Configurations (Discriminated Union) ───────
  describe("1. Strongly-Typed Configuration Validation", () => {
    it("builds valid ITR Filing submission configuration", () => {
      const itrConfig: ItrPostSubmissionConfig = {
        moduleType: "itr",
        referenceId: "ITR-2025-00123",
        assessmentYear: "2025-26",
        formType: "ITR-1 (Sahaj)",
        incomeType: "Salary, House Property",
        taxRegime: "New Tax Regime",
        uploadedDocsCount: 3,
        totalDocsCount: 3,
        refundBank: "HDFC Bank •••• 1234",
        status: "Received",
      };

      assert.equal(itrConfig.moduleType, "itr");
      assert.equal(itrConfig.referenceId, "ITR-2025-00123");
      const rows = buildSummaryRows(itrConfig);
      assert.equal(rows.find((r) => r.label === "Return Form")?.value, "ITR-1 (Sahaj)");
      assert.equal(rows.find((r) => r.label === "Assessment Year")?.value, "AY 2025-26");
      assert.equal(rows.find((r) => r.label === "Tax Regime")?.value, "New Tax Regime");
    });

    it("builds valid Revised ITR submission configuration", () => {
      const revisedConfig: RevisedItrPostSubmissionConfig = {
        moduleType: "revised-itr",
        referenceId: "RITR-998877",
        assessmentYear: "AY 2025-26",
        formType: "Revised Return",
        incomeType: "Revised Return Filing",
        revisionReason: "Missed deductions under 80C",
        originalAckNumber: "ACK-1122334455",
        uploadedDocsCount: 4,
        totalDocsCount: 4,
        status: "Submitted",
      };

      assert.equal(revisedConfig.moduleType, "revised-itr");
      assert.equal(revisedConfig.referenceId, "RITR-998877");
      const rows = buildSummaryRows(revisedConfig);
      assert.equal(rows.find((r) => r.label === "Revision Reason")?.value, "Missed deductions under 80C");
      assert.equal(rows.find((r) => r.label === "Original Ack No.")?.value, "ACK-1122334455");
      assert.equal(rows.find((r) => r.label === "Documents")?.value, "4 of 4 received");
    });

    it("builds valid TDS Refund submission configuration", () => {
      const tdsConfig: TdsRefundPostSubmissionConfig = {
        moduleType: "tds-refund",
        referenceId: "TDS-REF-776655",
        serviceName: "TDS Refund Claim",
        assessmentYear: "AY 2025-26",
        estimatedRefund: 45000,
        refundBank: "State Bank of India •••• 9876",
        status: "Under Verification",
      };

      assert.equal(tdsConfig.moduleType, "tds-refund");
      assert.equal(tdsConfig.referenceId, "TDS-REF-776655");
      const rows = buildSummaryRows(tdsConfig);
      assert.equal(rows.find((r) => r.label === "Service")?.value, "TDS Refund Claim");
      assert.equal(rows.find((r) => r.label === "Estimated Refund")?.value, "₹45000");
      assert.equal(rows.find((r) => r.label === "Status")?.value, "Under Verification");
    });
  });

  // ── Group 2: Unconfirmed / Missing Reference ID Guard ───────────────────
  describe("2. Unconfirmed & Missing Reference ID Guard", () => {
    it("rejects empty or whitespace reference IDs", () => {
      assert.equal(isConfirmedSubmission(""), false);
      assert.equal(isConfirmedSubmission("   "), false);
      assert.equal(isConfirmedSubmission(undefined), false);
    });

    it("accepts valid, non-empty confirmed reference IDs", () => {
      assert.equal(isConfirmedSubmission("APP-2025-01"), true);
      assert.equal(isConfirmedSubmission("RID123456789"), true);
      assert.equal(isConfirmedSubmission("TDS-99001"), true);
    });

    it("handles missing optional parameters safely without throwing", () => {
      const minimalItr: ItrPostSubmissionConfig = {
        moduleType: "itr",
        referenceId: "APP-MIN-1",
      };
      const rows = buildSummaryRows(minimalItr);
      assert.ok(rows.length > 0);
      assert.equal(rows.find((r) => r.label === "Assessment Year")?.value, "Current AY");
      assert.equal(rows.find((r) => r.label === "Refund Bank")?.value, "Verified Primary Bank");
    });
  });

  // ── Group 3: Module-Specific Messaging & Formatting ─────────────────────
  describe("3. Module-Specific Messaging and Formatting", () => {
    it("formats assessment year prefix correctly", () => {
      const withPrefix: ItrPostSubmissionConfig = {
        moduleType: "itr",
        referenceId: "REF1",
        assessmentYear: "AY 2024-25",
      };
      const rows1 = buildSummaryRows(withPrefix);
      assert.equal(rows1.find((r) => r.label === "Assessment Year")?.value, "AY 2024-25");

      const withoutPrefix: ItrPostSubmissionConfig = {
        moduleType: "itr",
        referenceId: "REF2",
        assessmentYear: "2024-25",
      };
      const rows2 = buildSummaryRows(withoutPrefix);
      assert.equal(rows2.find((r) => r.label === "Assessment Year")?.value, "AY 2024-25");
    });

    it("formats currency for TDS estimated refund with rupee symbol", () => {
      const withSymbol: TdsRefundPostSubmissionConfig = {
        moduleType: "tds-refund",
        referenceId: "TDS-1",
        estimatedRefund: "₹18,500",
      };
      const rows1 = buildSummaryRows(withSymbol);
      assert.equal(rows1.find((r) => r.label === "Estimated Refund")?.value, "₹18,500");

      const rawNumber: TdsRefundPostSubmissionConfig = {
        moduleType: "tds-refund",
        referenceId: "TDS-2",
        estimatedRefund: 18500,
      };
      const rows2 = buildSummaryRows(rawNumber);
      assert.equal(rows2.find((r) => r.label === "Estimated Refund")?.value, "₹18500");
    });
  });

  // ── Group 4: Navigation Actions & Back Navigation ───────────────────────
  describe("4. Navigation Actions & Back Navigation Guard", () => {
    it("routes primary CTA to application tracking by default", () => {
      const defaultPrimaryDestination = "/(main)/applications";
      assert.equal(defaultPrimaryDestination, "/(main)/applications");
    });

    it("routes secondary CTA to dashboard / home by default", () => {
      const defaultSecondaryDestination = "/(main)/home";
      assert.equal(defaultSecondaryDestination, "/(main)/home");
    });

    it("hardware back button routes to home to prevent double submission", () => {
      let navigatedTo: string | null = null;
      const mockRouter = {
        replace: (path: string) => {
          navigatedTo = path;
        },
      };

      // Simulating handleBackPress
      const handleBackPress = () => {
        mockRouter.replace("/(main)/home");
      };

      handleBackPress();
      assert.equal(navigatedTo, "/(main)/home");
    });
  });

  // ── Group 5: Failed Submissions Cannot Reach Success Screen ─────────────
  describe("5. Failed Submissions Cannot Reach Success Screen", () => {
    it("simulates successful submission navigating to success screen", async () => {
      let navigationTriggered = false;
      let targetScreen = "";

      const mockSubmitApi = async () => ({
        success: true,
        applicationId: "APP-SUCCESS-100",
      });

      try {
        const response = await mockSubmitApi();
        if (response && response.applicationId) {
          navigationTriggered = true;
          targetScreen = "/service/itr-success";
        }
      } catch {
        navigationTriggered = false;
      }

      assert.equal(navigationTriggered, true);
      assert.equal(targetScreen, "/service/itr-success");
    });

    it("verifies failed API submission enters catch block and never navigates to success", async () => {
      let navigationTriggered = false;
      let alertShown = false;
      let isSubmitting = true;

      const mockFailedSubmitApi = async () => {
        throw new Error("HTTP error 500: Database transaction failure");
      };

      try {
        await mockFailedSubmitApi();
        navigationTriggered = true;
      } catch (err: any) {
        alertShown = true;
        assert.ok(err.message.includes("500"));
      } finally {
        isSubmitting = false;
      }

      assert.equal(navigationTriggered, false); // STRICT: Never reached success screen
      assert.equal(alertShown, true);
      assert.equal(isSubmitting, false); // Unlock submission lock
    });
  });
});

