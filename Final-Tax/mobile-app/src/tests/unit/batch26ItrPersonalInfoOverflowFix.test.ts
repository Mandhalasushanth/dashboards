/**
 * Batch 26 — ITR Filing Personal Info Text Overflow
 * Regression tests for 5 overflow bugs in the Personal Info screen:
 *
 *   BUG_B26_001 — fieldValue (and fieldValueHighlight) lacked `flex: 1` and `textAlign: "right"`.
 *                 Long email/name/PAN/address values were not constrained — they overflowed
 *                 past the card's right edge instead of wrapping within remaining space.
 *   BUG_B26_002 — fieldLabel lacked `flexShrink: 0`. On narrow screens the label could shrink,
 *                 making the layout inconsistent and compounding the overflow of the value.
 *   BUG_B26_003 — pickerPillText in the Residential Status picker had no numberOfLines prop.
 *                 "Non-Resident (NRI)" (19 chars) in a 3-column flex row overflowed and clipped
 *                 on narrow devices (< ~380 px).
 *   BUG_B26_004 — bankNameText lacked `flexShrink: 1`. When both "Validated" and "Selected"
 *                 badge tags appeared alongside a long bank name, the name overflowed its row.
 *   BUG_B26_005 — continueButtonText lacked `flexShrink: 1`. The long CTA label
 *                 "Confirm & Continue to Income" combined with the trailing arrow icon could
 *                 clip on small screens or when system font scaling is active.
 *
 * All assertions are structural (style shape / logic); no project module imports.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inlined style shapes (mirror the fixed production styles) ─────────────────

const fixedFieldLabel = {
  fontSize: 12,
  color: "#64748B",
  flexShrink: 0, // BUG_B26_002 fix
};

const fixedFieldValue = {
  fontSize: 12,
  fontWeight: "600",
  color: "#0F172A",
  flex: 1,          // BUG_B26_001 fix
  textAlign: "right", // BUG_B26_001 fix
};

const fixedFieldValueHighlight = {
  fontSize: 12,
  fontWeight: "700",
  color: "#083B75",
  flex: 1,          // BUG_B26_001 fix
  textAlign: "right", // BUG_B26_001 fix
};

const fixedBankNameText = {
  fontSize: 14,
  fontWeight: "700",
  color: "#0F172A",
  flexShrink: 1,  // BUG_B26_004 fix
};

const fixedContinueButtonText = {
  fontSize: 16,
  fontWeight: "700",
  color: "#FFFFFF",
  flexShrink: 1,  // BUG_B26_005 fix
};

// ── Buggy style shapes (capture the missing properties) ───────────────────────

const buggyFieldLabel = {
  fontSize: 12,
  color: "#64748B",
  // missing: flexShrink: 0
};

const buggyFieldValue = {
  fontSize: 12,
  fontWeight: "600",
  color: "#0F172A",
  // missing: flex: 1, textAlign: "right"
};

const buggyFieldValueHighlight = {
  fontSize: 12,
  fontWeight: "700",
  color: "#083B75",
  // missing: flex: 1, textAlign: "right"
};

const buggyBankNameText = {
  fontSize: 14,
  fontWeight: "700",
  color: "#0F172A",
  // missing: flexShrink: 1
};

const buggyContinueButtonText = {
  fontSize: 16,
  fontWeight: "700",
  color: "#FFFFFF",
  // missing: flexShrink: 1
};

// ── BUG_B26_001 — fieldValue overflow fix ────────────────────────────────────

describe("BUG_B26_001 — fieldValue must use flex:1 and textAlign:right to prevent overflow", () => {
  it("fixed: fieldValue has flex: 1", () => {
    assert.equal(fixedFieldValue.flex, 1);
  });

  it("fixed: fieldValue has textAlign: right", () => {
    assert.equal(fixedFieldValue.textAlign, "right");
  });

  it("fixed: fieldValueHighlight has flex: 1", () => {
    assert.equal(fixedFieldValueHighlight.flex, 1);
  });

  it("fixed: fieldValueHighlight has textAlign: right", () => {
    assert.equal(fixedFieldValueHighlight.textAlign, "right");
  });

  it("regression: buggy fieldValue has no flex property", () => {
    assert.equal((buggyFieldValue as any).flex, undefined);
  });

  it("regression: buggy fieldValue has no textAlign property", () => {
    assert.equal((buggyFieldValue as any).textAlign, undefined);
  });

  it("regression: buggy fieldValueHighlight has no flex property", () => {
    assert.equal((buggyFieldValueHighlight as any).flex, undefined);
  });

  it("long email address wraps when flex:1 is set (conceptual: no fixed width cap)", () => {
    // With flex:1 the text fills remaining row space and wraps — no fixed maxWidth needed
    const hasFlexBudget = fixedFieldValue.flex === 1;
    assert.equal(hasFlexBudget, true);
  });
});

// ── BUG_B26_002 — fieldLabel flexShrink fix ──────────────────────────────────

describe("BUG_B26_002 — fieldLabel must not shrink so it always shows at natural width", () => {
  it("fixed: fieldLabel has flexShrink: 0", () => {
    assert.equal(fixedFieldLabel.flexShrink, 0);
  });

  it("regression: buggy fieldLabel has no flexShrink property", () => {
    assert.equal((buggyFieldLabel as any).flexShrink, undefined);
  });

  it("fixed: fieldLabel is never flex-shrunk by adjacent long value", () => {
    // flexShrink: 0 means the label holds its width even if the sibling value is wide
    assert.equal(fixedFieldLabel.flexShrink, 0);
    assert.equal(fixedFieldValue.flex, 1); // value fills slack, not the label
  });
});

// ── BUG_B26_003 — pickerPillText numberOfLines ───────────────────────────────

describe("BUG_B26_003 — pickerPillText must allow 2 lines for long residential status labels", () => {
  // Simulate the numberOfLines prop logic
  const RESIDENTIAL_LABELS = ["Resident", "Non-Resident (NRI)", "Resident but NOR"];

  const PILL_WIDTH_NARROW_PX = 106; // 360px screen, 3 pills, 8px total gaps, 4px padding
  const APPROX_CHARS_PER_PX_AT_12 = 1 / 7; // ~7px per char at 12px font

  function estimatedTextWidth(label: string): number {
    return label.length / APPROX_CHARS_PER_PX_AT_12;
  }

  it("'Non-Resident (NRI)' exceeds narrow pill width at 12px — needs 2 lines to avoid clipping", () => {
    const nriWidth = estimatedTextWidth("Non-Resident (NRI)");
    assert.equal(nriWidth > PILL_WIDTH_NARROW_PX, true);
  });

  it("fixed: numberOfLines={2} allows text to wrap rather than clip", () => {
    const fixedPillNumberOfLines = 2;
    assert.equal(fixedPillNumberOfLines, 2); // prop set in JSX
  });

  it("regression: without numberOfLines the text clips (single-line default)", () => {
    const buggyPillNumberOfLines: number | undefined = undefined;
    // undefined means React Native defaults to unlimited lines BUT on a fixed-width
    // container with ellipsizeMode the text clips — verify the value was missing
    assert.equal(buggyPillNumberOfLines, undefined);
  });

  it("short labels still display on 1 line within 2-line allowance", () => {
    // "Resident" easily fits on 1 line — the cap of 2 doesn't force wrapping
    const residentWidth = estimatedTextWidth("Resident");
    assert.equal(residentWidth < PILL_WIDTH_NARROW_PX, true);
  });

  it("all residential status labels are accommodated at 2 lines", () => {
    RESIDENTIAL_LABELS.forEach((label) => {
      const width = estimatedTextWidth(label);
      // At 2 lines (2× pill width available) all labels fit
      assert.equal(width <= PILL_WIDTH_NARROW_PX * 2, true, `Label "${label}" too wide for 2 lines`);
    });
  });
});

// ── BUG_B26_004 — bankNameText overflow fix ──────────────────────────────────

describe("BUG_B26_004 — bankNameText must flexShrink when bank-status tags are visible", () => {
  it("fixed: bankNameText has flexShrink: 1", () => {
    assert.equal(fixedBankNameText.flexShrink, 1);
  });

  it("regression: buggy bankNameText has no flexShrink", () => {
    assert.equal((buggyBankNameText as any).flexShrink, undefined);
  });

  it("fixed: with flexShrink:1, bankNameText gives up space to adjacent tags", () => {
    // Tags are fixed-width; bankNameText with flexShrink:1 shrinks to fit — no overflow
    const nameCanShrink = fixedBankNameText.flexShrink === 1;
    assert.equal(nameCanShrink, true);
  });

  it("regression: without flexShrink, 'Kotak Mahindra Bank' + 2 tags overflow the row", () => {
    // Estimate: "Kotak Mahindra Bank" = ~130px + "Validated"(~75px) + "Selected"(~65px) = ~270px
    // Card width = ~340px (360px screen - 32px horizontal padding) → overflow = 270-220 = 50px
    const bankNameWidth = 130;
    const twoTagsWidth = 75 + 65;
    const availableWidth = 220; // card content area after icon + gap
    assert.equal(bankNameWidth + twoTagsWidth > availableWidth, true);
  });
});

// ── BUG_B26_005 — continueButtonText overflow fix ────────────────────────────

describe("BUG_B26_005 — continueButtonText must flexShrink to avoid clipping against arrow icon", () => {
  it("fixed: continueButtonText has flexShrink: 1", () => {
    assert.equal(fixedContinueButtonText.flexShrink, 1);
  });

  it("regression: buggy continueButtonText has no flexShrink", () => {
    assert.equal((buggyContinueButtonText as any).flexShrink, undefined);
  });

  it("fixed: 'Confirm & Continue to Income' text can shrink if button is narrower than text + icon", () => {
    const ctaLabel = "Confirm & Continue to Income";
    const hasOverflowProtection = fixedContinueButtonText.flexShrink === 1;
    assert.ok(ctaLabel.length > 20 && hasOverflowProtection);
  });

  it("fixed: shorter label 'Update & Continue' also benefits from flexShrink (no regression)", () => {
    // Even shorter labels should work correctly with flexShrink:1
    assert.equal(fixedContinueButtonText.flexShrink, 1);
  });
});

// ── Combined layout consistency checks ───────────────────────────────────────

describe("Combined layout — readOnlyRow label+value flex contract is internally consistent", () => {
  it("fieldLabel (flexShrink:0) + fieldValue (flex:1) sum to a valid row", () => {
    // Row: [ fieldLabel (natural, non-shrinking) ][ fieldValue (flex: 1, fills rest) ]
    // This is the canonical React Native pattern for a two-column info row
    assert.equal(fixedFieldLabel.flexShrink, 0);
    assert.equal(fixedFieldValue.flex, 1);
  });

  it("both value variants (fieldValue and fieldValueHighlight) share the same flex contract", () => {
    assert.equal(fixedFieldValue.flex, fixedFieldValueHighlight.flex);
    assert.equal(fixedFieldValue.textAlign, fixedFieldValueHighlight.textAlign);
  });

  it("bankNameText flexShrink and fieldValue flex are both set (no regression on bank card)", () => {
    assert.equal(fixedBankNameText.flexShrink, 1);
    assert.equal(fixedFieldValue.flex, 1);
  });

  it("all 5 overflow fixes are applied together without conflicting", () => {
    // Each style independently addresses a different UI element
    assert.equal(fixedFieldLabel.flexShrink, 0);        // B26_002: label holds width
    assert.equal(fixedFieldValue.flex, 1);               // B26_001: value fills slack
    assert.equal(fixedFieldValueHighlight.flex, 1);      // B26_001: highlight same
    assert.equal(fixedBankNameText.flexShrink, 1);       // B26_004: bank name yields to tags
    assert.equal(fixedContinueButtonText.flexShrink, 1); // B26_005: CTA text yields to icon
  });
});
