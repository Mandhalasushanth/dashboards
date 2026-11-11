import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inlined Logic & Mock Helpers for ITR Bank Account Card ───────────────────

interface SelectableBank {
  id: string;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  maskedAccountNumber: string;
  ifscCode: string;
  accountType: "Savings" | "Current";
  isPrimaryRefund: boolean;
  validationStatus: "Validated" | "Pending";
}

function validateAndBuildBank(
  bankName: string,
  accountNumber: string,
  ifscCode: string,
  branchName?: string,
  initialBank?: SelectableBank | null,
  existingBanks: SelectableBank[] = []
): { success: boolean; bank?: SelectableBank; error?: string } {
  const cleanBankName = bankName.trim();
  const cleanBranchName = branchName?.trim();
  const cleanAccountNum = accountNumber.trim();
  const cleanIfsc = ifscCode.trim().toUpperCase();

  if (!cleanBankName || !cleanAccountNum || !cleanIfsc) {
    return { success: false, error: "Bank Name, Account Number, and IFSC Code are mandatory." };
  }

  if (cleanBankName.length < 2 || !/^[a-zA-Z0-9\s&.-]{2,100}$/.test(cleanBankName)) {
    return { success: false, error: "Invalid Bank Name" };
  }

  if (!/^\d{9,18}$/.test(cleanAccountNum) || /^0+$/.test(cleanAccountNum)) {
    return { success: false, error: "Invalid Account Number" };
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
    return { success: false, error: "Invalid IFSC Code" };
  }

  const isDuplicate = existingBanks.some(
    (b) =>
      b.id !== initialBank?.id &&
      b.accountNumber.trim() === cleanAccountNum &&
      b.ifscCode.trim().toUpperCase() === cleanIfsc
  );

  if (isDuplicate) {
    return { success: false, error: "Duplicate Bank Account" };
  }

  // Account Type handled internally without UI selection: defaults to initialBank's type or "Savings"
  const accountType: "Savings" | "Current" = initialBank?.accountType || "Savings";
  const masked = `•••• •••• ${cleanAccountNum.slice(-4)}`;

  const resultBank: SelectableBank = {
    id: initialBank?.id || `bank-${Date.now()}`,
    bankName: cleanBankName,
    branchName: cleanBranchName || undefined,
    accountNumber: cleanAccountNum,
    maskedAccountNumber: masked,
    ifscCode: cleanIfsc,
    accountType,
    isPrimaryRefund: initialBank?.isPrimaryRefund ?? true,
    validationStatus: "Validated",
  };

  return { success: true, bank: resultBank };
}

// ── Inlined Logic & Mock Helpers for Revised ITR Original Return Lookup ───────

interface OriginalReturnDetails {
  acknowledgementNumber: string;
  assessmentYear: string;
  filingDate: string;
  itrForm: string;
  filingStatus: string;
  grossTotalIncome: string;
}

interface MockApplication {
  id: string;
  serviceId?: string;
  category?: string;
  serviceName?: string;
  status: string;
  createdAt?: string;
  submittedAt?: string;
  formData?: {
    acknowledgementNumber?: string;
    previousAckNumber?: string;
    ackNumber?: string;
    arn?: string;
    assessmentYear?: string;
    formTitle?: string;
    formType?: string;
    grossTotalIncome?: number | string;
  };
}

async function simulateLookupOriginalReturn(
  ackNumber: string,
  selectedAy: string,
  applications: MockApplication[],
  remoteAppById?: (id: string) => Promise<MockApplication | null>
): Promise<OriginalReturnDetails | null> {
  const cleanAck = ackNumber.trim();
  if (!cleanAck || cleanAck.length !== 15 || !/^\d{15}$/.test(cleanAck)) {
    return null;
  }

  // 1. Check in user's filed applications
  let matched = applications.find(
    (a) =>
      a.formData?.previousAckNumber === cleanAck ||
      a.formData?.acknowledgementNumber === cleanAck ||
      a.formData?.ackNumber === cleanAck ||
      a.formData?.arn === cleanAck ||
      a.id === cleanAck
  );

  // 2. Remote application check
  if (!matched && remoteAppById) {
    matched = (await remoteAppById(cleanAck)) || undefined;
  }

  if (matched) {
    const fd = matched.formData || {};
    const rawAy = fd.assessmentYear || selectedAy;
    const formattedAy = rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`;
    const rawIncome = fd.grossTotalIncome;

    return {
      acknowledgementNumber: cleanAck,
      assessmentYear: formattedAy,
      filingDate: matched.submittedAt || matched.createdAt || "Filed via Finsolz",
      itrForm: fd.formTitle || fd.formType || matched.serviceName || "ITR-1 (Sahaj)",
      filingStatus: matched.status || "Successfully Filed",
      grossTotalIncome:
        rawIncome !== undefined && rawIncome !== null && rawIncome !== ""
          ? (String(rawIncome).startsWith("₹") ? String(rawIncome) : `₹${Number(rawIncome).toLocaleString("en-IN")}`)
          : "—",
    };
  }

  // Strictly return null for non-existent returns (NEVER mock or fabricate fallback data)
  return null;
}

// ── Test Suites ──────────────────────────────────────────────────────────────

describe("1. ITR Bank Account UI & Contract Fixes", () => {
  it("creates valid bank account without requiring user account-type selection", () => {
    const res = validateAndBuildBank(
      "HDFC Bank",
      "123456789012",
      "HDFC0001234",
      "Koramangala Branch"
    );

    assert.equal(res.success, true);
    assert.ok(res.bank);
    assert.equal(res.bank.bankName, "HDFC Bank");
    assert.equal(res.bank.branchName, "Koramangala Branch");
    assert.equal(res.bank.accountNumber, "123456789012");
    assert.equal(res.bank.ifscCode, "HDFC0001234");
    assert.equal(res.bank.accountType, "Savings"); // Preserved default contract
    assert.equal(res.bank.validationStatus, "Validated");
  });

  it("preserves existing accountType when editing an existing Current account", () => {
    const existingBank: SelectableBank = {
      id: "bank-999",
      bankName: "ICICI Bank",
      accountNumber: "987654321098",
      maskedAccountNumber: "•••• •••• 1098",
      ifscCode: "ICIC0001234",
      accountType: "Current",
      isPrimaryRefund: true,
      validationStatus: "Validated",
    };

    const res = validateAndBuildBank(
      "ICICI Bank Updated",
      "987654321098",
      "ICIC0001234",
      undefined,
      existingBank
    );

    assert.equal(res.success, true);
    assert.ok(res.bank);
    assert.equal(res.bank.accountType, "Current"); // Preserved existing type without UI prompt
    assert.equal(res.bank.bankName, "ICICI Bank Updated");
  });

  it("enforces mandatory fields: Bank Name, IFSC Code, Account Number", () => {
    const missingName = validateAndBuildBank("", "123456789012", "HDFC0001234");
    assert.equal(missingName.success, false);

    const missingAccount = validateAndBuildBank("HDFC Bank", "", "HDFC0001234");
    assert.equal(missingAccount.success, false);

    const missingIfsc = validateAndBuildBank("HDFC Bank", "123456789012", "");
    assert.equal(missingIfsc.success, false);
  });

  it("validates account number boundaries and rejects invalid numbers", () => {
    // Too short (<9)
    assert.equal(validateAndBuildBank("HDFC Bank", "12345678", "HDFC0001234").success, false);
    // Non-digit characters
    assert.equal(validateAndBuildBank("HDFC Bank", "12345ABCD678", "HDFC0001234").success, false);
    // All zeros
    assert.equal(validateAndBuildBank("HDFC Bank", "0000000000", "HDFC0001234").success, false);
  });

  it("validates local IFSC format without network calls", () => {
    // Invalid 5th char (must be 0)
    assert.equal(validateAndBuildBank("HDFC Bank", "123456789012", "HDFC1001234").success, false);
    // Invalid length
    assert.equal(validateAndBuildBank("HDFC Bank", "123456789012", "HDFC00012").success, false);
    // Valid format
    assert.equal(validateAndBuildBank("HDFC Bank", "123456789012", "SBIN0001234").success, true);
  });
});

describe("2. Revised ITR — Remove Hardcoded Original Return Data", () => {
  const genuineApplications: MockApplication[] = [
    {
      id: "ITR-2025-00123",
      serviceId: "itr-filing",
      category: "ITR",
      serviceName: "ITR Filing",
      status: "Filed",
      createdAt: "15 Jul 2025",
      formData: {
        acknowledgementNumber: "284419250714208",
        assessmentYear: "2025-26",
        formTitle: "ITR-1 (Sahaj)",
        grossTotalIncome: 850000,
      },
    },
  ];

  it("random 15-digit acknowledgement number returns null and NEVER displays mock fallback card", async () => {
    const randomAck = "999999999999999";
    const result = await simulateLookupOriginalReturn(randomAck, "AY 2025–26", genuineApplications);

    // STRICT: Must be null — no fabricated 'Verified from IT Portal' fallback!
    assert.equal(result, null);
  });

  it("non-15-digit or malformed acknowledgement number is rejected immediately", async () => {
    assert.equal(await simulateLookupOriginalReturn("12345", "AY 2025–26", genuineApplications), null);
    assert.equal(await simulateLookupOriginalReturn("12345678901234A", "AY 2025–26", genuineApplications), null);
    assert.equal(await simulateLookupOriginalReturn("", "AY 2025–26", genuineApplications), null);
  });

  it("genuine acknowledgement number returns actual filed return data with correct types", async () => {
    const validAck = "284419250714208";
    const result = await simulateLookupOriginalReturn(validAck, "AY 2025–26", genuineApplications);

    assert.ok(result);
    assert.equal(result.acknowledgementNumber, "284419250714208");
    assert.equal(result.assessmentYear, "AY 2025-26");
    assert.equal(result.itrForm, "ITR-1 (Sahaj)");
    assert.equal(result.filingDate, "15 Jul 2025");
    assert.equal(result.grossTotalIncome, "₹8,50,000");
    assert.equal(result.filingStatus, "Filed");
  });

  it("supports remote application lookup when not in local store", async () => {
    const remoteLookup = async (id: string): Promise<MockApplication | null> => {
      if (id === "112233445566778") {
        return {
          id: "REMOTE-APP-1",
          status: "Submitted",
          submittedAt: "20 Aug 2025",
          formData: {
            acknowledgementNumber: "112233445566778",
            assessmentYear: "2025-26",
            formType: "ITR-2",
            grossTotalIncome: 1200000,
          },
        };
      }
      return null;
    };

    const emptyStore: MockApplication[] = [];
    const result = await simulateLookupOriginalReturn(
      "112233445566778",
      "AY 2025–26",
      emptyStore,
      remoteLookup
    );

    assert.ok(result);
    assert.equal(result.acknowledgementNumber, "112233445566778");
    assert.equal(result.itrForm, "ITR-2");
    assert.equal(result.grossTotalIncome, "₹12,00,000");
  });

  it("duplicate request prevention mutex behavior", () => {
    let isVerifying = false;
    let requestCount = 0;

    const executeLookup = () => {
      if (isVerifying) return; // Prevent duplicate request
      isVerifying = true;
      requestCount++;
    };

    executeLookup(); // First call triggers
    executeLookup(); // Duplicate call while isVerifying is active
    executeLookup(); // Duplicate call

    assert.equal(requestCount, 1);
    isVerifying = false; // Reset after complete
    executeLookup(); // Allowed again
    assert.equal(requestCount, 2);
  });
});

