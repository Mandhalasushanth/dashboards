/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { useGstFieldLookups } from "../../modules/gst/gst-registration/hooks/useGstFieldLookups";
import { ifscService, IfscLookupError } from "@/shared/services/lookup/ifscService";
import type { GstBusinessFormData } from "../../modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";

// ===============================================================================================
// Finsolz GST Registration — IFSC Branch Auto-Refresh Regression Tests
// ===============================================================================================

const createInitialFormData = (overrides: Partial<GstBusinessFormData> = {}): GstBusinessFormData => ({
  legalName: "Acme Corp",
  businessName: "Acme Trades",
  businessType: "Private Limited",
  natureOfBusiness: "Retail",
  placeOfBusiness: "Principal",
  businessStartDate: "01-01-2024",
  reasonForRegistration: "Crossing Threshold",
  compositionScheme: "No",
  businessAddress: "123 Market Road",
  city: "Mumbai",
  district: "Mumbai City",
  state: "Maharashtra",
  pinCode: "400001",
  hsnCode: "998311",
  accountHolderName: "Acme Corp",
  bankAccountNumber: "12345678901234",
  confirmBankAccountNumber: "12345678901234",
  ifscCode: "",
  bankName: "",
  branchName: "",
  accountType: "Current",
  signatoryName: "Jane Doe",
  signatoryPan: "ABCDE1234F",
  signatoryDob: "15-08-1985",
  signatoryDesignation: "Director",
  signatoryMobile: "9876543210",
  signatoryEmail: "jane@acmecorp.com",
  addressProofType: "Electricity Bill",
  aadhaarConsent: true,
  businessPan: "ABCPE1234F",
  ...overrides,
});

interface HookHarness {
  hook: ReturnType<typeof useGstFieldLookups>;
  getCurrentData: () => GstBusinessFormData;
  updateData: (fields: Partial<GstBusinessFormData>) => void;
  changes: Partial<GstBusinessFormData>[];
}

function renderHookHarness(initialData: GstBusinessFormData): HookHarness {
  let currentData = { ...initialData };
  const changes: Partial<GstBusinessFormData>[] = [];
  let capturedHook!: ReturnType<typeof useGstFieldLookups>;

  const HarnessComponent = () => {
    capturedHook = useGstFieldLookups({
      data: currentData,
      onChange: (fields) => {
        changes.push(fields);
        currentData = { ...currentData, ...fields };
      },
    });
    return React.createElement("div", null);
  };

  renderToStaticMarkup(React.createElement(HarnessComponent));

  return {
    get hook() {
      return {
        ...capturedHook,
        get ifscError() {
          return capturedHook.getIfscError ? capturedHook.getIfscError() : capturedHook.ifscError;
        },
      };
    },
    getCurrentData: () => currentData,
    updateData: (fields: Partial<GstBusinessFormData>) => {
      currentData = { ...currentData, ...fields };
    },
    changes,
  };
}

test("valid 11-digit IFSC code fetches and replaces bank and branch details", async () => {
  const originalLookup = ifscService.lookup;
  ifscService.lookup = async (code: string) => ({
    bank: "HDFC Bank",
    branch: "Bandra West",
    ifsc: code,
  });

  try {
    const harness = renderHookHarness(createInitialFormData());

    await harness.hook.handleIfscLookup("HDFC0000001");

    const data = harness.getCurrentData();
    assert.equal(data.ifscCode, "HDFC0000001");
    assert.equal(data.bankName, "HDFC Bank");
    assert.equal(data.branchName, "Bandra West");
    assert.equal(harness.hook.ifscError, null);
  } finally {
    ifscService.lookup = originalLookup;
  }
});

test("changing IFSC code to a different valid 11-digit code replaces previous bank and branch values", async () => {
  const originalLookup = ifscService.lookup;
  ifscService.lookup = async (code: string) => {
    if (code === "HDFC0000001") {
      return { bank: "HDFC Bank", branch: "Bandra West", ifsc: code };
    }
    if (code === "SBIN0000001") {
      return { bank: "State Bank of India", branch: "Nariman Point", ifsc: code };
    }
    throw new IfscLookupError("NOT_FOUND", "IFSC code not found");
  };

  try {
    const harness = renderHookHarness(
      createInitialFormData({
        ifscCode: "HDFC0000001",
        bankName: "HDFC Bank",
        branchName: "Bandra West",
      })
    );

    // Initial state holds previous bank details
    assert.equal(harness.getCurrentData().branchName, "Bandra West");

    // User changes IFSC to SBIN0000001
    await harness.hook.handleIfscLookup("SBIN0000001");

    const data = harness.getCurrentData();
    assert.equal(data.ifscCode, "SBIN0000001");
    assert.equal(data.bankName, "State Bank of India");
    assert.equal(data.branchName, "Nariman Point");
    assert.notEqual(data.branchName, "Bandra West", "Old branch name must be replaced");
  } finally {
    ifscService.lookup = originalLookup;
  }
});

test("editing IFSC code to an incomplete value (< 11 chars) immediately clears bank and branch", () => {
  const harness = renderHookHarness(
    createInitialFormData({
      ifscCode: "HDFC0000001",
      bankName: "HDFC Bank",
      branchName: "Bandra West",
    })
  );

  assert.equal(harness.getCurrentData().bankName, "HDFC Bank");
  assert.equal(harness.getCurrentData().branchName, "Bandra West");

  // User edits IFSC to 8 chars
  harness.hook.handleIfscChange("HDFC0000");

  const data = harness.getCurrentData();
  assert.equal(data.ifscCode, "HDFC0000");
  assert.equal(data.bankName, "", "Bank name must be cleared immediately");
  assert.equal(data.branchName, "", "Branch name must be cleared immediately");
  assert.equal(harness.hook.ifscError, null);
});

test("entering an invalid-format 11-digit code clears bank/branch and sets inline error", async () => {
  const harness = renderHookHarness(
    createInitialFormData({
      ifscCode: "HDFC0000001",
      bankName: "HDFC Bank",
      branchName: "Bandra West",
    })
  );

  // 11 characters but invalid format (5th character is '1' instead of '0')
  await harness.hook.handleIfscLookup("HDFC1000001");

  const data = harness.getCurrentData();
  assert.equal(data.bankName, "");
  assert.equal(data.branchName, "");
  assert.equal(harness.hook.ifscError, "Enter a valid 11-digit IFSC code");
});

test("failed IFSC lookup clears bank/branch and sets appropriate error message", async () => {
  const originalLookup = ifscService.lookup;
  ifscService.lookup = async () => {
    throw new IfscLookupError("NOT_FOUND", "IFSC code not found");
  };

  try {
    const harness = renderHookHarness(
      createInitialFormData({
        ifscCode: "HDFC0000001",
        bankName: "HDFC Bank",
        branchName: "Bandra West",
      })
    );

    await harness.hook.handleIfscLookup("HDFC0999999");

    const data = harness.getCurrentData();
    assert.equal(data.bankName, "");
    assert.equal(data.branchName, "");
    assert.equal(harness.hook.ifscError, "IFSC code not found");
  } finally {
    ifscService.lookup = originalLookup;
  }
});

test("outdated asynchronous response from earlier IFSC cannot overwrite newer lookup results", async () => {
  const originalLookup = ifscService.lookup;

  // Simulate slow response for request 1 and fast response for request 2
  ifscService.lookup = async (code: string) => {
    if (code === "HDFC0000001") {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return { bank: "HDFC Bank", branch: "Bandra West", ifsc: code };
    }
    if (code === "SBIN0000001") {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { bank: "State Bank of India", branch: "Nariman Point", ifsc: code };
    }
    throw new IfscLookupError("NOT_FOUND", "IFSC code not found");
  };

  try {
    const harness = renderHookHarness(createInitialFormData());

    // Start request 1 (slow)
    const p1 = harness.hook.handleIfscLookup("HDFC0000001");

    // Immediately start request 2 (fast)
    const p2 = harness.hook.handleIfscLookup("SBIN0000001");

    await Promise.all([p1, p2]);

    const data = harness.getCurrentData();
    assert.equal(data.ifscCode, "SBIN0000001");
    assert.equal(data.bankName, "State Bank of India");
    assert.equal(data.branchName, "Nariman Point");
  } finally {
    ifscService.lookup = originalLookup;
  }
});

test("clearing IFSC code when incomplete cancels in-flight lookup", async () => {
  const originalLookup = ifscService.lookup;

  ifscService.lookup = async (code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { bank: "HDFC Bank", branch: "Bandra West", ifsc: code };
  };

  try {
    const harness = renderHookHarness(createInitialFormData());

    // User entered 11 chars
    const p1 = harness.hook.handleIfscLookup("HDFC0000001");

    // While lookup is pending, user deletes characters
    harness.hook.handleIfscChange("HDFC");

    await p1;

    const data = harness.getCurrentData();
    assert.equal(data.ifscCode, "HDFC");
    assert.equal(data.bankName, "");
    assert.equal(data.branchName, "");
  } finally {
    ifscService.lookup = originalLookup;
  }
});

test("source verification: GstBusinessStep wires handleIfscChange and errorOverride", () => {
  const stepSrc = fs.readFileSync(
    path.join(process.cwd(), "src/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx"),
    "utf8"
  );
  const hookSrc = fs.readFileSync(
    path.join(process.cwd(), "src/modules/gst/gst-registration/hooks/useGstFieldLookups.ts"),
    "utf8"
  );

  // Hook exports
  assert.ok(hookSrc.includes("handleIfscChange"), "useGstFieldLookups must export handleIfscChange");
  assert.ok(hookSrc.includes("ifscError"), "useGstFieldLookups must export ifscError");
  assert.ok(!hookSrc.includes("current.bankName || res.bank"), "Stale bank fallback must not exist");
  assert.ok(!hookSrc.includes("current.branchName || res.branch"), "Stale branch fallback must not exist");

  // Step wiring
  assert.ok(stepSrc.includes("handleIfscChange"), "GstBusinessStep must import handleIfscChange");
  assert.ok(stepSrc.includes("onChangeOverride: handleIfscChange"), "onChangeOverride must use handleIfscChange");
  assert.ok(stepSrc.includes("errorOverride: ifscError || undefined"), "errorOverride must wire ifscError");
});
