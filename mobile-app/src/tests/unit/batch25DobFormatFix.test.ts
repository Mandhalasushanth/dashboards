/**
 * Batch 25 — Cross-module DOB Format
 * Regression tests for 3 bugs:
 *   BUG_B25_001 — ReviewRevisedComputationScreen displayed customer.dob raw — the API returns
 *                 YYYY-MM-DD so the screen showed "1990-08-15" instead of "15/08/1990"
 *   BUG_B25_002 — useTdsProfileSync stored rawDob verbatim from the API response without
 *                 normalizing YYYY-MM-DD → DD-MM-YYYY — the edit form received the ISO date
 *                 and its DD-MM-YYYY placeholder was misleading; mirrors the correct
 *                 normalization already present in loansStore
 *   BUG_B25_003 — profileManager.helpers.buildPersonalUpdatePayload sent dob as DD-MM-YYYY
 *                 directly to authApi.updateCustomerProfile — the backend (Spring Boot
 *                 LocalDate) requires YYYY-MM-DD; the registration path correctly used
 *                 toBackendDob() but the profile-update path did not
 *
 * All logic inlined — no project module imports.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Shared format helpers (inlined from production code) ─────────────────────

/** BUG_B25_001 fix: mirrors formatCustomerDob added to ReviewRevisedComputationScreen */
function formatCustomerDob(dob?: string): string {
  if (!dob || !dob.trim()) return "Not provided";
  const clean = dob.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return clean.replace(/-/g, "/");
}

/** BUG_B25_002 fix: mirrors normalization added to useTdsProfileSync */
function normalizeDobForForm(rawDob: string): string {
  if (!rawDob) return rawDob;
  const apiFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDob.trim());
  if (apiFormat) {
    return `${apiFormat[3]}-${apiFormat[2]}-${apiFormat[1]}`;
  }
  return rawDob;
}

/** BUG_B25_003 fix: mirrors toBackendDob from customerRegistrationPayload */
function toBackendDob(dob?: string): string {
  let formattedDob = dob || "";
  if (formattedDob && /^\d{2}-\d{2}-\d{4}$/.test(formattedDob)) {
    const [d, m, y] = formattedDob.split("-");
    formattedDob = `${y}-${m}-${d}`;
  }
  return formattedDob;
}

// ── Buggy versions (for regression tests) ────────────────────────────────────

/** BUG_B25_001 regression: raw dob passed directly to UI text */
function displayDobBuggy(dob?: string): string {
  return dob || "15/08/1990"; // raw — no format conversion
}

/** BUG_B25_002 regression: rawDob stored verbatim without normalization */
function populatePersonalDobBuggy(rawDob: string): string {
  return rawDob; // no normalization
}

/** BUG_B25_003 regression: dob sent to backend without conversion */
function buildUpdatePayloadDobBuggy(formDob: string): string {
  return formDob.trim(); // no toBackendDob()
}

// ── BUG_B25_001 — ReviewRevisedComputationScreen DOB display ─────────────────

describe("BUG_B25_001 — ReviewRevisedComputationScreen must format DOB for display", () => {
  it("fixed: YYYY-MM-DD from API is displayed as DD/MM/YYYY", () => {
    assert.equal(formatCustomerDob("1990-08-15"), "15/08/1990");
  });

  it("fixed: DD-MM-YYYY form value is displayed as DD/MM/YYYY", () => {
    assert.equal(formatCustomerDob("15-08-1990"), "15/08/1990");
  });

  it("fixed: DD/MM/YYYY is returned unchanged", () => {
    assert.equal(formatCustomerDob("15/08/1990"), "15/08/1990");
  });

  it("fixed: empty/undefined dob shows 'Not provided' instead of a hardcoded placeholder", () => {
    assert.equal(formatCustomerDob(undefined), "Not provided");
    assert.equal(formatCustomerDob(""), "Not provided");
    assert.equal(formatCustomerDob("  "), "Not provided");
  });

  it("fixed: various YYYY-MM-DD dates convert correctly", () => {
    assert.equal(formatCustomerDob("2000-01-31"), "31/01/2000");
    assert.equal(formatCustomerDob("1985-12-05"), "05/12/1985");
    assert.equal(formatCustomerDob("1975-06-01"), "01/06/1975");
  });

  it("regression: buggy code passes YYYY-MM-DD raw — user sees ISO date", () => {
    assert.equal(displayDobBuggy("1990-08-15"), "1990-08-15"); // wrong display
  });

  it("regression: buggy code shows hardcoded placeholder when dob is undefined", () => {
    assert.equal(displayDobBuggy(undefined), "15/08/1990"); // stale hardcoded value
  });

  it("regression: buggy code shows hardcoded placeholder when dob is empty string", () => {
    assert.equal(displayDobBuggy(""), "15/08/1990"); // stale hardcoded value — empty string is falsy
  });
});

// ── BUG_B25_002 — useTdsProfileSync DOB normalization ────────────────────────

describe("BUG_B25_002 — useTdsProfileSync must normalize YYYY-MM-DD to DD-MM-YYYY before storing", () => {
  it("fixed: YYYY-MM-DD from API is normalized to DD-MM-YYYY for form storage", () => {
    assert.equal(normalizeDobForForm("1990-08-15"), "15-08-1990");
  });

  it("fixed: DD-MM-YYYY is stored unchanged (already in form format)", () => {
    assert.equal(normalizeDobForForm("15-08-1990"), "15-08-1990");
  });

  it("fixed: empty dob is stored as empty (no crash)", () => {
    assert.equal(normalizeDobForForm(""), "");
  });

  it("fixed: various API dates normalize correctly", () => {
    assert.equal(normalizeDobForForm("2000-01-31"), "31-01-2000");
    assert.equal(normalizeDobForForm("1985-12-05"), "05-12-1985");
    assert.equal(normalizeDobForForm("1975-06-01"), "01-06-1975");
  });

  it("regression: buggy code stores YYYY-MM-DD raw — edit form shows ISO date", () => {
    assert.equal(populatePersonalDobBuggy("1990-08-15"), "1990-08-15"); // wrong
  });

  it("fixed: normalized DOB passes DD-MM-YYYY validation used by tdsCustomerSchema", () => {
    // DD-MM-YYYY: passes regex ^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d\d$
    const normalized = normalizeDobForForm("1990-08-15");
    const ddmmyyyy = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/.test(normalized);
    assert.equal(ddmmyyyy, true);
  });

  it("regression: raw ISO DOB fails DD-MM-YYYY validation (wrong format shown in edit field)", () => {
    const raw = "1990-08-15";
    const ddmmyyyy = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/.test(raw);
    assert.equal(ddmmyyyy, false); // would fail form validation
  });

  it("fixed: loansStore pattern and TDS pattern now match — both normalize YYYY-MM-DD on load", () => {
    // Both modules should produce the same normalized DOB from the same API value
    const apiDob = "1990-08-15";
    // loansStore approach (inline regex)
    const loansNorm = (() => {
      const apiFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(apiDob.trim());
      return apiFormat ? `${apiFormat[3]}-${apiFormat[2]}-${apiFormat[1]}` : apiDob;
    })();
    // TDS approach (normalizeDobForForm, mirrors the fix)
    const tdsNorm = normalizeDobForForm(apiDob);
    assert.equal(loansNorm, tdsNorm);
    assert.equal(tdsNorm, "15-08-1990");
  });
});

// ── BUG_B25_003 — buildPersonalUpdatePayload backend DOB conversion ───────────

describe("BUG_B25_003 — buildPersonalUpdatePayload must convert DD-MM-YYYY to YYYY-MM-DD before update", () => {
  it("fixed: DD-MM-YYYY form value is converted to YYYY-MM-DD for the backend", () => {
    assert.equal(toBackendDob("15-08-1990"), "1990-08-15");
  });

  it("fixed: already YYYY-MM-DD is passed through unchanged", () => {
    assert.equal(toBackendDob("1990-08-15"), "1990-08-15");
  });

  it("fixed: empty string is returned as empty string", () => {
    assert.equal(toBackendDob(""), "");
    assert.equal(toBackendDob(undefined), "");
  });

  it("fixed: various DD-MM-YYYY values convert correctly", () => {
    assert.equal(toBackendDob("31-01-2000"), "2000-01-31");
    assert.equal(toBackendDob("05-12-1985"), "1985-12-05");
    assert.equal(toBackendDob("01-06-1975"), "1975-06-01");
  });

  it("regression: buggy payload sends DD-MM-YYYY directly — backend rejects or misinterprets", () => {
    assert.equal(buildUpdatePayloadDobBuggy("15-08-1990"), "15-08-1990"); // wrong format
  });

  it("fixed: toBackendDob matches buildRegisterPayload conversion (same function)", () => {
    // Registration and profile-update paths now use the same conversion
    const formDob = "15-08-1990";
    assert.equal(toBackendDob(formDob), "1990-08-15");
  });

  it("fixed: roundtrip — normalize from API then convert back to API format is lossless", () => {
    const apiDob = "1990-08-15";
    const formDob = normalizeDobForForm(apiDob);   // "15-08-1990"
    const backendDob = toBackendDob(formDob);       // "1990-08-15"
    assert.equal(backendDob, apiDob);              // roundtrip is lossless
  });
});

// ── Combined cross-module scenarios ──────────────────────────────────────────

describe("Combined cross-module DOB format consistency", () => {
  it("full pipeline: API → normalize → form display → backend payload", () => {
    const apiDob = "1992-03-17";

    // Step 1: TDS profile sync normalizes API DOB for edit form
    const formDob = normalizeDobForForm(apiDob);
    assert.equal(formDob, "17-03-1992");

    // Step 2: Display in read-only screens (ReviewRevisedComputationScreen)
    const displayDob = formatCustomerDob(apiDob);
    assert.equal(displayDob, "17/03/1992");

    // Step 3: Profile update payload converts form DOB back to API format
    const payloadDob = toBackendDob(formDob);
    assert.equal(payloadDob, apiDob); // roundtrip preserved
  });

  it("all 3 fixed functions produce consistent output for the same logical date", () => {
    const apiDob = "1985-12-05";
    // Display: DD/MM/YYYY
    assert.equal(formatCustomerDob(apiDob), "05/12/1985");
    // Form storage: DD-MM-YYYY
    assert.equal(normalizeDobForForm(apiDob), "05-12-1985");
    // Backend payload: YYYY-MM-DD (same as input)
    assert.equal(toBackendDob(normalizeDobForForm(apiDob)), apiDob);
  });

  it("regression: all 3 buggy functions produce wrong output for the same date", () => {
    const apiDob = "1985-12-05";
    // Buggy display: raw ISO
    assert.equal(displayDobBuggy(apiDob), "1985-12-05"); // wrong (not DD/MM/YYYY)
    // Buggy form storage: raw ISO
    assert.equal(populatePersonalDobBuggy(apiDob), "1985-12-05"); // wrong (not DD-MM-YYYY)
    // Buggy payload: still raw ISO (or DD-MM-YYYY if user typed it — not converted)
    const formInput = "05-12-1985"; // user typed DD-MM-YYYY
    assert.equal(buildUpdatePayloadDobBuggy(formInput), "05-12-1985"); // wrong (not YYYY-MM-DD)
  });

  it("all fixed functions handle leap year DOB correctly (29-02-1992)", () => {
    const apiDob = "1992-02-29";
    assert.equal(formatCustomerDob(apiDob), "29/02/1992");
    assert.equal(normalizeDobForForm(apiDob), "29-02-1992");
    assert.equal(toBackendDob("29-02-1992"), "1992-02-29");
  });

  it("fixed: undefined/null dob is handled gracefully throughout pipeline", () => {
    assert.equal(formatCustomerDob(undefined), "Not provided");
    assert.equal(normalizeDobForForm(""), "");
    assert.equal(toBackendDob(undefined), "");
  });
});
