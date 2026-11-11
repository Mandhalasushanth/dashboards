import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { Application } from "@/types/domain";
import {
  isVerificationCompleted,
  getAssignedPaymentAmount,
  formatPaymentAmount,
  isPaymentPaid,
  isPaymentProcessing,
  isPaymentFailed,
  isPaymentCancelled,
  getPaymentDisplayState,
  canInitiatePayment,
  getGenuineTransactionId,
  getGenuinePaymentMode,
  getGenuinePaymentDate,
  getFeeType,
  getTransactionDetails,
  getPaymentBadgeConfig,
  getPaymentNotice,
} from "@/modules/applications/utils/paymentWorkflowUtils";

function createMockApp(overrides: Partial<Application> = {}): Application {
  return {
    id: "APP-TEST-001",
    serviceId: "gst-registration",
    serviceName: "GST Registration",
    category: "GST",
    status: "Submitted",
    progress: 20,
    assignedExecutive: "CA Rahul Sharma",
    paymentAmount: 0,
    paymentStatus: "Pending",
    createdAt: "2026-10-27",
    formData: {},
    documents: [],
    timeline: [
      { title: "Application Submitted", description: "Submitted", status: "completed" },
      { title: "Document Collection", description: "Collecting docs", status: "completed" },
      { title: "Verification", description: "Under verification", status: "pending" },
      { title: "Payment", description: "CA assigned payment", status: "pending" },
    ],
    chatHistory: [],
    ...overrides,
  };
}

describe("CA-Assigned Payment Workflow Verification Suite", () => {
  test("Scenario 1: Verification pending and no amount assigned (State A)", () => {
    const app = createMockApp({
      status: "Under Verification",
      paymentAmount: 0,
    });

    const isVerified = isVerificationCompleted(app);
    const assignedAmount = getAssignedPaymentAmount(app);
    const displayState = getPaymentDisplayState(app);
    const formattedAmount = formatPaymentAmount(assignedAmount);
    const badge = getPaymentBadgeConfig(displayState);
    const notice = getPaymentNotice(displayState);
    const canPay = canInitiatePayment(displayState, assignedAmount);
    const genuineTxnId = getGenuineTransactionId(app);

    assert.equal(isVerified, false);
    assert.equal(assignedAmount, null);
    assert.equal(displayState, "VERIFICATION_PENDING");
    assert.equal(formattedAmount, "Not Assigned");
    assert.notEqual(formattedAmount, "₹ 0.00");
    assert.equal(badge.label, "Awaiting Verification");
    assert.notEqual(badge.label, "Paid");
    assert.equal(canPay, false);
    assert.equal(genuineTxnId, null);
    assert.equal(
      notice?.message,
      "The CA manager will assign the payment amount after verification is completed."
    );
  });

  test("Scenario 2: Verification completed and amount not assigned (State B)", () => {
    const app = createMockApp({
      status: "Verified",
      paymentAmount: 0,
      timeline: [
        { title: "Application Submitted", description: "Submitted", status: "completed" },
        { title: "Document Collection", description: "Collecting docs", status: "completed" },
        { title: "Verification", description: "Verified", status: "completed" },
        { title: "Payment", description: "CA assigned payment", status: "pending" },
      ],
    });

    const isVerified = isVerificationCompleted(app);
    const assignedAmount = getAssignedPaymentAmount(app);
    const displayState = getPaymentDisplayState(app);
    const formattedAmount = formatPaymentAmount(assignedAmount);
    const badge = getPaymentBadgeConfig(displayState);
    const notice = getPaymentNotice(displayState);
    const canPay = canInitiatePayment(displayState, assignedAmount);

    assert.equal(isVerified, true);
    assert.equal(assignedAmount, null);
    assert.equal(displayState, "AWAITING_CA_ASSIGNMENT");
    assert.equal(formattedAmount, "Not Assigned");
    assert.equal(badge.label, "Awaiting CA Assignment");
    assert.equal(canPay, false);
    assert.equal(
      notice?.message,
      "Your verification is complete. The CA manager will assign your payment amount shortly."
    );
  });

  test("Scenario 3: CA manager assigns the amount (State C - Payment Pending)", () => {
    const app = createMockApp({
      status: "Payment Pending",
      paymentAmount: 1500,
      paymentStatus: "Pending",
      formData: {
        caAssignedAmount: 1500,
        feeType: "GST Filing Fee",
      },
    });

    const assignedAmount = getAssignedPaymentAmount(app);
    const displayState = getPaymentDisplayState(app);
    const formattedAmount = formatPaymentAmount(assignedAmount);
    const badge = getPaymentBadgeConfig(displayState);
    const canPay = canInitiatePayment(displayState, assignedAmount);
    const details = getTransactionDetails(app);

    assert.equal(assignedAmount, 1500);
    assert.equal(displayState, "PAYMENT_PENDING");
    assert.equal(formattedAmount, "₹ 1,500.00");
    assert.equal(badge.label, "Payment Pending");
    assert.equal(canPay, true);
    assert.equal(details.feeType, "GST Filing Fee");
    assert.equal(details.transactionId, null);
    assert.equal(details.paymentMode, null);
    assert.equal(details.paymentDate, null);
  });

  test("Scenario 4: Payment initiated and processing (State D - Processing)", () => {
    const app = createMockApp({
      paymentAmount: 1500,
      paymentStatus: "Pending",
      formData: {
        paymentStatus: "Processing",
      },
    });

    const isProcessing = isPaymentProcessing(app);
    const displayState = getPaymentDisplayState(app);
    const badge = getPaymentBadgeConfig(displayState);
    const canPay = canInitiatePayment(displayState, 1500);

    assert.equal(isProcessing, true);
    assert.equal(displayState, "PAYMENT_PROCESSING");
    assert.equal(badge.label, "Processing");
    assert.equal(canPay, false);
  });

  test("Scenario 5: Payment failed or cancelled (State D - Failed/Cancelled)", () => {
    const failedApp = createMockApp({
      paymentAmount: 1500,
      paymentStatus: "Pending",
      formData: {
        paymentError: "Gateway timeout",
      },
    });

    const isFailed = isPaymentFailed(failedApp);
    const failedState = getPaymentDisplayState(failedApp);
    const failedBadge = getPaymentBadgeConfig(failedState);
    const failedNotice = getPaymentNotice(failedState);
    const canRetry = canInitiatePayment(failedState, 1500);

    assert.equal(isFailed, true);
    assert.equal(failedState, "PAYMENT_FAILED");
    assert.equal(failedBadge.label, "Payment Failed");
    assert.equal(canRetry, true);
    assert.equal(
      failedNotice?.message,
      "Your previous payment attempt was unsuccessful. Please retry to complete your payment."
    );

    const cancelledApp = createMockApp({
      paymentAmount: 1500,
      paymentStatus: "Pending",
      formData: {
        transactionStatus: "CANCELLED",
      },
    });

    assert.equal(isPaymentCancelled(cancelledApp), true);
    assert.equal(getPaymentDisplayState(cancelledApp), "PAYMENT_CANCELLED");
  });

  test("Scenario 6: Payment completed successfully with genuine Transaction ID (State E)", () => {
    const genuineTxn = "TXN_RZP_20261027_094582910471923";
    const app = createMockApp({
      paymentAmount: 2499,
      paymentStatus: "Paid",
      formData: {
        transactionId: genuineTxn,
        paymentMode: "UPI",
        paymentDate: "27 Oct 2026, 03:15 PM",
        feeType: "Filing Fee",
      },
    });

    const isPaid = isPaymentPaid(app);
    const displayState = getPaymentDisplayState(app);
    const badge = getPaymentBadgeConfig(displayState);
    const details = getTransactionDetails(app);

    assert.equal(isPaid, true);
    assert.equal(displayState, "PAID");
    assert.equal(badge.label, "Paid");
    assert.equal(details.feeType, "Filing Fee");
    assert.equal(details.amountFormatted, "₹ 2,499.00");
    assert.equal(details.paymentMode, "UPI");
    assert.equal(details.paymentDate, "27 Oct 2026, 03:15 PM");
    assert.equal(details.transactionId, genuineTxn);
  });

  test("Scenario 7: Payment confirmed while transaction reference is temporarily unavailable", () => {
    const app = createMockApp({
      paymentAmount: 1800,
      paymentStatus: "Paid",
      formData: {
        paymentMode: "Net Banking",
      },
    });

    const isPaid = isPaymentPaid(app);
    const displayState = getPaymentDisplayState(app);
    const details = getTransactionDetails(app);

    assert.equal(isPaid, true);
    assert.equal(displayState, "PAID");
    assert.equal(details.transactionId, null);
    assert.notEqual(details.transactionId, "TXN202510220945");
    assert.notEqual(details.transactionId, app.id);
  });

  test("Scenario 8: Long Transaction ID wrapping support", () => {
    const longTxn = "TXN_VERY_LONG_ENTERPRISE_GATEWAY_REFERENCE_ID_99887766554433221100_SETTLED";
    const app = createMockApp({
      paymentAmount: 3500,
      paymentStatus: "Paid",
      formData: {
        gatewayTransactionId: longTxn,
      },
    });

    const retrievedTxn = getGenuineTransactionId(app);
    assert.equal(retrievedTxn, longTxn);

    const stylesPath = path.resolve(
      __dirname,
      "../../styles/app/application/[id].styles.ts"
    );
    const stylesCode = fs.readFileSync(stylesPath, "utf-8");
    assert.equal(
      stylesCode.includes("paymentTransactionIdValue"),
      true,
      "Must define paymentTransactionIdValue"
    );
    assert.equal(
      stylesCode.includes("flexWrap: \"wrap\""),
      true,
      "Must support multiline flexWrap for long IDs"
    );
  });

  test("Scenario 9: Never infer Paid status without genuine payment confirmation", () => {
    const amendmentUnpaid = createMockApp({
      serviceId: "gst-amendment",
      serviceName: "GST Amendment",
      status: "Submitted",
      paymentStatus: "Pending",
      paymentAmount: 0,
    });
    assert.equal(isPaymentPaid(amendmentUnpaid), false);
    assert.notEqual(getPaymentDisplayState(amendmentUnpaid), "PAID");

    const submittedUnpaid = createMockApp({
      status: "Submitted",
      paymentStatus: "Pending",
      paymentAmount: 0,
    });
    assert.equal(isPaymentPaid(submittedUnpaid), false);

    const zeroAmountWithoutPayment = createMockApp({
      paymentAmount: 0,
      paymentStatus: "Pending",
    });
    assert.equal(isPaymentPaid(zeroAmountWithoutPayment), false);
  });

  test("Scenario 10: Architectural constraints - file line counts strictly below 400 and zero loops", () => {
    const filesToCheck = [
      "src/components/screens/application/PaymentsTab.tsx",
      "src/modules/applications/utils/paymentWorkflowUtils.ts",
      "src/styles/app/application/[id].styles.ts",
      "src/tests/unit/paymentWorkflow.test.ts",
    ];

    const baseDir = path.resolve(__dirname, "../../..");

    const checkFile = (relPath: string) => {
      const fullPath = path.join(baseDir, relPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lineCount = content.split("\n").length;
      assert.ok(
        lineCount < 400,
        `File ${relPath} has ${lineCount} lines, must be strictly below 400 lines`
      );

      if (relPath.includes("paymentWorkflowUtils.ts") || relPath.includes("PaymentsTab.tsx")) {
        assert.equal(
          /\bfor\s*\(/.test(content),
          false,
          `File ${relPath} must not contain for loops`
        );
        assert.equal(
          /\bwhile\s*\(/.test(content),
          false,
          `File ${relPath} must not contain while loops`
        );
        assert.equal(
          /\.forEach\s*\(/.test(content),
          false,
          `File ${relPath} must not contain forEach loops`
        );
      }
    };

    checkFile(filesToCheck[0]);
    checkFile(filesToCheck[1]);
    checkFile(filesToCheck[2]);
    checkFile(filesToCheck[3]);
  });
});
