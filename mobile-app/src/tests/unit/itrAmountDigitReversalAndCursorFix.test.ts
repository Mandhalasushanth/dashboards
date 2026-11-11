import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  formatIndianAmount,
  parseIndianAmount,
  calculateIndianAmountCursor,
  computeCursorInCleanText,
} from "../../shared/formatters/currencyFormatter";

declare const __dirname: string;

/**
 * Simulates AmountTextInput handleChangeText input lifecycle
 */
function simulateAmountInputKeystroke(
  previousFormatted: string,
  previousCursor: number,
  incomingText: string,
  allowDecimals = false,
  allowNegative = false,
  maxLength?: number
) {
  let cleanText = incomingText;

  // Decimal rejection in integer-only mode
  if (!allowDecimals && incomingText.includes(".")) {
    const rawWithoutDots = incomingText.replace(/\./g, "");
    const digitsOnly = rawWithoutDots.replace(/[^0-9]/g, "");
    const oldDigits = parseIndianAmount(previousFormatted, allowDecimals, allowNegative).replace(/[^0-9]/g, "");
    if (digitsOnly === oldDigits) {
      cleanText = rawWithoutDots;
      return {
        raw: parseIndianAmount(previousFormatted, allowDecimals, allowNegative),
        formatted: previousFormatted,
        cursor: previousCursor,
        rejectedDot: true,
      };
    }
  }

  let cursorInCleanText = computeCursorInCleanText(
    previousFormatted,
    cleanText,
    previousCursor
  );

  // Comma backspace
  if (
    previousFormatted.length === cleanText.length + 1 &&
    cursorInCleanText >= 0 &&
    previousFormatted[cursorInCleanText] === ","
  ) {
    if (cursorInCleanText > 0) {
      cleanText =
        cleanText.slice(0, cursorInCleanText - 1) +
        cleanText.slice(cursorInCleanText);
      cursorInCleanText = cursorInCleanText - 1;
    }
  }

  const raw = parseIndianAmount(cleanText, allowDecimals, allowNegative);
  const constrainedRaw = maxLength ? raw.slice(0, maxLength) : raw;
  const newFormatted = formatIndianAmount(constrainedRaw, allowDecimals);

  const newCursor = calculateIndianAmountCursor(
    previousFormatted,
    cleanText,
    newFormatted,
    cursorInCleanText
  );

  return {
    raw: constrainedRaw,
    formatted: newFormatted,
    cursor: newCursor,
    rejectedDot: false,
  };
}

describe("CRITICAL BUG FIX — Numeric Input Digit Reversal and Cursor Jumping Across ITR Filing", () => {
  describe("1. Typing '3' followed by '6' produces '36', never '63'", () => {
    it("typing '3' into an empty field puts cursor at end (1), not at 0", () => {
      const step1 = simulateAmountInputKeystroke("", 0, "3");
      assert.strictEqual(step1.raw, "3");
      assert.strictEqual(step1.formatted, "3");
      assert.strictEqual(step1.cursor, 1);
    });

    it("typing '6' after '3' produces '36' with cursor at 2, never reversing to '63'", () => {
      const step1 = simulateAmountInputKeystroke("", 0, "3");
      assert.strictEqual(step1.formatted, "3");
      assert.strictEqual(step1.cursor, 1);

      // Native inserts '6' after '3' because cursor is at 1
      const step2 = simulateAmountInputKeystroke(step1.formatted, step1.cursor, "36");
      assert.strictEqual(step2.raw, "36");
      assert.strictEqual(step2.formatted, "36");
      assert.strictEqual(step2.cursor, 2);
      assert.notStrictEqual(step2.formatted, "63");
    });

    it("sequential typing '3', '6', '5' produces '365' with cursor at 3", () => {
      let state = { formatted: "", cursor: 0, raw: "" };
      const inputs = ["3", "36", "365"];
      for (const text of inputs) {
        const next = simulateAmountInputKeystroke(state.formatted, state.cursor, text);
        state = { formatted: next.formatted, cursor: next.cursor, raw: next.raw };
      }
      assert.strictEqual(state.raw, "365");
      assert.strictEqual(state.formatted, "365");
      assert.strictEqual(state.cursor, 3);
    });
  });

  describe("2. Sequential Typing: 1234 -> 1,234", () => {
    it("typing '1', '2', '3', '4' produces '1,234' with cursor at position 5", () => {
      let state = { formatted: "", cursor: 0, raw: "" };
      const sequence = [
        { text: "1", expectedFormatted: "1", expectedCursor: 1 },
        { text: "12", expectedFormatted: "12", expectedCursor: 2 },
        { text: "123", expectedFormatted: "123", expectedCursor: 3 },
        { text: "1234", expectedFormatted: "1,234", expectedCursor: 5 },
      ];

      for (const step of sequence) {
        const next = simulateAmountInputKeystroke(state.formatted, state.cursor, step.text);
        assert.strictEqual(next.formatted, step.expectedFormatted);
        assert.strictEqual(next.cursor, step.expectedCursor);
        state = { formatted: next.formatted, cursor: next.cursor, raw: next.raw };
      }
      assert.strictEqual(state.raw, "1234");
    });
  });

  describe("3. Large Number Typing and Pasting: 100000 -> 1,00,000", () => {
    it("typing '100000' progressively creates '1,00,000' with cursor always at the end", () => {
      let state = { formatted: "", cursor: 0, raw: "" };
      const sequence = [
        { text: "1", expectedFormatted: "1", expectedCursor: 1 },
        { text: "10", expectedFormatted: "10", expectedCursor: 2 },
        { text: "100", expectedFormatted: "100", expectedCursor: 3 },
        { text: "1000", expectedFormatted: "1,000", expectedCursor: 5 },
        { text: "1,0000", expectedFormatted: "10,000", expectedCursor: 6 },
        { text: "10,0000", expectedFormatted: "1,00,000", expectedCursor: 8 },
      ];

      for (const step of sequence) {
        const next = simulateAmountInputKeystroke(state.formatted, state.cursor, step.text);
        assert.strictEqual(next.formatted, step.expectedFormatted);
        assert.strictEqual(next.cursor, step.expectedCursor);
        state = { formatted: next.formatted, cursor: next.cursor, raw: next.raw };
      }
      assert.strictEqual(state.raw, "100000");
    });

    it("pasting '100000' into an empty input produces '1,00,000' with cursor at the end", () => {
      const result = simulateAmountInputKeystroke("", 0, "100000");
      assert.strictEqual(result.raw, "100000");
      assert.strictEqual(result.formatted, "1,00,000");
      assert.strictEqual(result.cursor, 8);
    });

    it("pasting '1,00,000' preserves exact amount and places cursor at end", () => {
      const result = simulateAmountInputKeystroke("", 0, "1,00,000");
      assert.strictEqual(result.raw, "100000");
      assert.strictEqual(result.formatted, "1,00,000");
      assert.strictEqual(result.cursor, 8);
    });
  });

  describe("4. Middle Insertion and Deletion Around Commas", () => {
    it("inserting '5' after '1' in '10,000' preserves insertion point across comma repositioning", () => {
      // old: "10,000", cursor is at index 1 ("1|0,000"), user types '5' -> "150,000"
      const result = simulateAmountInputKeystroke("10,000", 1, "150,000");
      assert.strictEqual(result.raw, "150000");
      assert.strictEqual(result.formatted, "1,50,000");
      assert.strictEqual(result.cursor, 3); // right after '5' in "1,50,|000"
    });

    it("inserting '9' after comma in '1,234' places cursor after '9'", () => {
      // old: "1,234", cursor is at index 2 ("1,|234"), user types '9' -> "1,9234"
      const result = simulateAmountInputKeystroke("1,234", 2, "1,9234");
      assert.strictEqual(result.raw, "19234");
      assert.strictEqual(result.formatted, "19,234");
      assert.strictEqual(result.cursor, 3); // right after '9' and comma in "19,|234"
    });

    it("backspacing digit '2' in '1,234' (cursor at 3) leaves '134' with cursor at 1", () => {
      // old: "1,234", cursor at 3 ("1,2|34"), backspace '2' -> "1,34"
      const result = simulateAmountInputKeystroke("1,234", 3, "1,34");
      assert.strictEqual(result.raw, "134");
      assert.strictEqual(result.formatted, "134");
      assert.strictEqual(result.cursor, 1);
    });

    it("backspacing comma directly in '1,000' removes preceding digit and avoids lock", () => {
      // old: "1,000", cursor after comma at 2 ("1,|000"), backspacing comma -> native sends "1000"
      const result = simulateAmountInputKeystroke("1,000", 2, "1000");
      assert.strictEqual(result.raw, "0");
      assert.strictEqual(result.formatted, "0");
      assert.strictEqual(result.cursor, 0);
    });

    it("backspacing comma directly in '12,000' removes '2' and leaves '1,000'", () => {
      // old: "12,000", cursor after comma at 3 ("12,|000"), backspacing comma -> native sends "12000"
      const result = simulateAmountInputKeystroke("12,000", 3, "12000");
      assert.strictEqual(result.raw, "1000");
      assert.strictEqual(result.formatted, "1,000");
      assert.strictEqual(result.cursor, 2); // after '1,'
    });
  });

  describe("5. Rapid Typing Without Stale-State Overwrites", () => {
    it("handles rapid burst input where multiple characters are typed in quick succession", () => {
      // Simulate rapid keystrokes "5", "0", "0", "0", "0"
      let currentFormatted = "";
      let currentCursor = 0;
      const keystrokes = ["5", "50", "500", "5000", "50000"];

      for (const text of keystrokes) {
        const res = simulateAmountInputKeystroke(currentFormatted, currentCursor, text);
        currentFormatted = res.formatted;
        currentCursor = res.cursor;
      }

      assert.strictEqual(currentFormatted, "50,000");
      assert.strictEqual(currentCursor, 6);
    });

    it("synchronizes correctly when starting from a default '0' value", () => {
      // User types '3' on a field showing '0' with cursor at 1 ("0|")
      const step1 = simulateAmountInputKeystroke("0", 1, "03");
      // "03" parsed Indian amount normalizes to "3"
      assert.strictEqual(step1.raw, "3");
      assert.strictEqual(step1.formatted, "3");
      assert.strictEqual(step1.cursor, 1);

      // User then types '6' -> "36"
      const step2 = simulateAmountInputKeystroke(step1.formatted, step1.cursor, "36");
      assert.strictEqual(step2.raw, "36");
      assert.strictEqual(step2.formatted, "36");
      assert.strictEqual(step2.cursor, 2);
    });
  });

  describe("6. Decimal Rejection and Negative-Value Handling (Bug 4 Integrity)", () => {
    it("typing '.' on an integer field immediately rejects without moving cursor or corrupting digits", () => {
      const result = simulateAmountInputKeystroke("1,000", 5, "1,000.", false);
      assert.strictEqual(result.rejectedDot, true);
      assert.strictEqual(result.raw, "1000");
      assert.strictEqual(result.formatted, "1,000");
      assert.strictEqual(result.cursor, 5);
    });

    it("typing '.' in the middle of a number is rejected and cursor preserved", () => {
      const result = simulateAmountInputKeystroke("12,345", 3, "12.,345", false);
      assert.strictEqual(result.rejectedDot, true);
      assert.strictEqual(result.raw, "12345");
      assert.strictEqual(result.formatted, "12,345");
      assert.strictEqual(result.cursor, 3);
    });

    it("pasting '1000.50' into an integer field drops decimal and fraction cleanly", () => {
      const result = simulateAmountInputKeystroke("", 0, "1000.50", false);
      assert.strictEqual(result.raw, "1000");
      assert.strictEqual(result.formatted, "1,000");
      assert.strictEqual(result.cursor, 5);
    });

    it("supports negative values when allowNegative is true", () => {
      const result = simulateAmountInputKeystroke("", 0, "-50000", false, true);
      assert.strictEqual(result.raw, "-50000");
      assert.strictEqual(result.formatted, "-50,000");
      assert.strictEqual(result.cursor, 7);
    });
  });

  describe("7. Component Architecture & Source Code Verification", () => {
    const baseDir = path.resolve(__dirname, "../../");

    it("AmountTextInput does NOT contain any setTimeout or arbitrary delay hacks", () => {
      const file = path.join(baseDir, "shared/components/AmountTextInput/AmountTextInput.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(!content.includes("setTimeout"), "Must avoid arbitrary setTimeout");
      assert.ok(!content.includes("clearTimeout"), "Must avoid arbitrary clearTimeout");
    });

    it("AmountTextInput controls selection only when focused and maintains lastFormattedRef", () => {
      const file = path.join(baseDir, "shared/components/AmountTextInput/AmountTextInput.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("isFocused ? selection : undefined"), "Selection must be undefined when blurred");
      assert.ok(content.includes("lastFormattedRef"), "Must maintain lastFormattedRef to prevent stale renders");
      assert.ok(content.includes("computeCursorInCleanText"), "Must use computeCursorInCleanText to calculate cursor");
    });

    it("currencyFormatter exports computeCursorInCleanText and calculateIndianAmountCursor", () => {
      const file = path.join(baseDir, "shared/formatters/currencyFormatter.ts");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("export function computeCursorInCleanText"), "Must export computeCursorInCleanText");
      assert.ok(content.includes("export function calculateIndianAmountCursor"), "Must export calculateIndianAmountCursor");
    });
  });
});
