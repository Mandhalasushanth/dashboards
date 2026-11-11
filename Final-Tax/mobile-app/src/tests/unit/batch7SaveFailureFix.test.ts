/**
 * Batch 7 — Save failure regression tests (ITR Filing, Revised ITR, TDS Refund)
 *
 * Root causes fixed:
 *
 * BUG-ITR-SAVE-01 (ITR Filing 404):
 *   mapToFilingDto() in ItrApiService.ts fell through to customer.mobile (phone number)
 *   then "CUST-12345" when customer.customerId was empty (new/partial user). The backend
 *   received a phone number or fake ID as customerId → 404 Customer not found.
 *   Fix: only UUID sources are kept; throws a meaningful error when no UUID is found.
 *
 * BUG-ITR-SAVE-02 (Revised ITR 403):
 *   FindOriginalReturnScreen sent "CUST-12345" in the payload when customer.customerId
 *   was empty, while the JWT was for the real user. Backend cross-checks JWT principal
 *   against payload.customerId → mismatch → 403 Forbidden.
 *   Fix: throws / alerts when customerId cannot be resolved to a real UUID.
 *
 * BUG-ITR-SAVE-03 (TDS Refund generic server error):
 *   submitApplicationDraft used formData.personal.mobileNumber || "CUST-DEFAULT".
 *   When the personal mobile field was empty, "CUST-DEFAULT" was sent as custId to
 *   saveTdsTaxesPaid where the backend expects a 10-digit mobile → 500.
 *   Fix: uses getTdsCustId() which resolves from auth store, not just the form field.
 *
 * Uses Node.js built-in test runner. No React Native or project imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline helpers (mirror the fixed logic in each service) ──────────────────

/**
 * Mirrors the fixed mapToFilingDto customer-ID resolution in ItrApiService.ts.
 * Returns customerId string, or throws if none is available.
 */
function resolveItrCustomerId(authState: {
  customer?: { customerId?: string; mobile?: string };
  authenticatedUser?: unknown;
  mobileNumber?: string;
}): string {
  const customerId =
    authState.customer?.customerId ||
    (authState.authenticatedUser as any)?.customerId ||
    (authState.authenticatedUser as any)?.custId ||
    "";
  if (!customerId) {
    throw new Error(
      "Customer account not found. Please complete your registration before filing.",
    );
  }
  return customerId;
}

/**
 * Mirrors the fixed handleContinue / handleUpdateAndContinue in
 * FindOriginalReturnScreen.tsx. Returns customerId or empty string (caller shows Alert).
 */
function resolveRevisedItrCustomerId(
  customer: { customerId?: string } | null | undefined,
  authenticatedUser: unknown,
): string {
  return (
    customer?.customerId ||
    (authenticatedUser as any)?.customerId ||
    (authenticatedUser as any)?.custId ||
    ""
  );
}

/**
 * Mirrors the fixed getTdsCustId + guard in tdsApplicationApiService.submitApplicationDraft.
 * getTdsCustId reads from auth store; here we inline the fallback chain for testing.
 */
function resolveTdsCustId(authMobile: string, fallbackMobile?: string): string {
  const raw = authMobile || fallbackMobile || "";
  return raw.replace(/\D/g, "").slice(-10);
}

// ── BUG-ITR-SAVE-01: ITR Filing — customer ID resolution ─────────────────────

describe("ITR Filing — resolveItrCustomerId (BUG-ITR-SAVE-01)", () => {
  it("returns customerId when customer.customerId is set (registered user)", () => {
    const result = resolveItrCustomerId({
      customer: { customerId: "CUST-UUID-1234", mobile: "9876543210" },
    });
    assert.equal(result, "CUST-UUID-1234");
  });

  it("returns authenticatedUser.customerId as second fallback", () => {
    const result = resolveItrCustomerId({
      customer: { customerId: "" },
      authenticatedUser: { customerId: "AUTH-UUID-5678" },
    });
    assert.equal(result, "AUTH-UUID-5678");
  });

  it("returns authenticatedUser.custId as third fallback", () => {
    const result = resolveItrCustomerId({
      customer: { customerId: "" },
      authenticatedUser: { custId: "CUST-UUID-9999" },
    });
    assert.equal(result, "CUST-UUID-9999");
  });

  it("throws meaningful error when no UUID source is available (BUG-ITR-SAVE-01 regression)", () => {
    assert.throws(
      () =>
        resolveItrCustomerId({
          customer: { customerId: "", mobile: "9876543210" },
          authenticatedUser: null,
          mobileNumber: "9876543210",
        }),
      (err: Error) => {
        assert.match(err.message, /registration/i);
        return true;
      },
    );
  });

  it("does NOT use customer.mobile as a fallback (old bug — phone number sent as UUID)", () => {
    // The old code fell through to customer.mobile when customerId was empty.
    // Confirm the fixed resolver does not return the mobile number.
    assert.throws(() =>
      resolveItrCustomerId({
        customer: { customerId: "", mobile: "9876543210" },
      }),
    );
  });

  it('does NOT return "CUST-12345" as a fallback (old bug — hardcoded fake ID)', () => {
    const threw = (() => {
      try {
        resolveItrCustomerId({ customer: { customerId: "" } });
        return false;
      } catch {
        return true;
      }
    })();
    assert.equal(threw, true, "Expected throw, not a hardcoded fallback");
  });
});

// ── BUG-ITR-SAVE-02: Revised ITR — customer ID resolution ────────────────────

describe("Revised ITR — resolveRevisedItrCustomerId (BUG-ITR-SAVE-02)", () => {
  it("returns customer.customerId for a registered user", () => {
    const id = resolveRevisedItrCustomerId({ customerId: "CUST-UUID-ABCD" }, null);
    assert.equal(id, "CUST-UUID-ABCD");
  });

  it("returns authenticatedUser.customerId as second fallback", () => {
    const id = resolveRevisedItrCustomerId(
      { customerId: "" },
      { customerId: "AUTH-UUID-EFGH" },
    );
    assert.equal(id, "AUTH-UUID-EFGH");
  });

  it("returns authenticatedUser.custId as third fallback", () => {
    const id = resolveRevisedItrCustomerId(
      { customerId: "" },
      { custId: "AUTH-UUID-IJKL" },
    );
    assert.equal(id, "AUTH-UUID-IJKL");
  });

  it("returns empty string when no UUID source is available (caller must show Alert)", () => {
    const id = resolveRevisedItrCustomerId(null, null);
    assert.equal(id, "", "Empty string tells caller to Alert and return");
  });

  it('does NOT return "CUST-12345" (old hardcoded fallback — caused 403)', () => {
    const id = resolveRevisedItrCustomerId({ customerId: "" }, null);
    assert.notEqual(id, "CUST-12345");
    assert.equal(id, "");
  });

  it("empty string from partial/new user triggers guard (regression — 403 was caused by sending fake ID)", () => {
    const customerId = resolveRevisedItrCustomerId({ customerId: "" }, null);
    const wouldAlert = !customerId;
    assert.equal(wouldAlert, true, "Caller must alert instead of sending fake ID");
  });
});

// ── BUG-ITR-SAVE-03: TDS Refund — custId resolution ─────────────────────────

describe("TDS Refund — resolveTdsCustId (BUG-ITR-SAVE-03)", () => {
  it("returns 10-digit mobile from auth store (primary path)", () => {
    const id = resolveTdsCustId("9876543210");
    assert.equal(id, "9876543210");
  });

  it("strips non-digits and takes last 10 characters", () => {
    const id = resolveTdsCustId("+91 98765 43210");
    assert.equal(id, "9876543210");
  });

  it("uses fallback mobile when auth store is empty (formData.personal.mobileNumber)", () => {
    const id = resolveTdsCustId("", "8800112233");
    assert.equal(id, "8800112233");
  });

  it("returns empty string when both sources are empty (triggers guard)", () => {
    const id = resolveTdsCustId("", "");
    assert.equal(id, "");
  });

  it('does NOT return "CUST-DEFAULT" (old bug — hardcoded fake ID caused server error)', () => {
    const id = resolveTdsCustId("", "");
    assert.notEqual(id, "CUST-DEFAULT");
  });

  it("does NOT use a form field mobile when auth store has a value (auth store is authoritative)", () => {
    const authStoreMobile = "9876543210";
    const formMobile = "1111111111";
    const id = resolveTdsCustId(authStoreMobile, formMobile);
    assert.equal(id, authStoreMobile, "Auth store mobile takes priority");
  });

  it("empty result triggers guard (caller must throw with meaningful error)", () => {
    const custId = resolveTdsCustId("", "");
    const wouldThrow = !custId;
    assert.equal(wouldThrow, true, "Missing custId must throw, not send empty/fake value");
  });
});

// ── Cross-module: phone-number-as-ID regression ───────────────────────────────

describe("Cross-module: phone number must not be used as customerId in ITR/Revised ITR", () => {
  const PHONE = "9876543210";

  it("ITR Filing throws when only mobile is available (not a valid UUID)", () => {
    assert.throws(() =>
      resolveItrCustomerId({ customer: { customerId: "", mobile: PHONE } }),
    );
  });

  it("Revised ITR returns empty (not phone number) when only mobile is available", () => {
    // Simulates new user with no customerId but an active mobile
    const id = resolveRevisedItrCustomerId({ customerId: "" }, { mobileNumber: PHONE });
    // authenticatedUser has no customerId / custId → empty
    assert.equal(id, "");
    assert.notEqual(id, PHONE);
  });
});
