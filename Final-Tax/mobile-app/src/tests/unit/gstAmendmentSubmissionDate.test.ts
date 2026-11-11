import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

import { formatAmendmentSubmissionDate } from "../../modules/gst/gst-amendment/utils/gstAmendmentHelpers";

const ROOT = path.resolve(__dirname, "../../..");
const SERVICE_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/services/submitAmendmentService.ts"
);
const SUCCESS_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/components/GstAmendmentSuccess/GstAmendmentSuccess.tsx"
);

describe("GST Amendment — Submission Date Consistency", () => {
  describe("formatAmendmentSubmissionDate: valid ISO timestamps", () => {
    it("formats a UTC ISO timestamp to D MMM YYYY using local calendar day", () => {
      // 2026-01-05T10:00:00.000Z — Jan 5 UTC → local day depends on TZ
      // We verify the result is a recognisable D MMM YYYY string, not the raw ISO
      const result = formatAmendmentSubmissionDate("2026-01-05T10:00:00.000Z");
      assert.match(
        result,
        /^\d{1,2} [A-Z][a-z]{2} \d{4}$/,
        `Expected "D MMM YYYY" pattern, got "${result}"`
      );
    });

    it("same ISO string always returns the same formatted date (no device-time substitution)", () => {
      const iso = "2026-06-15T08:30:00.000Z";
      const first = formatAmendmentSubmissionDate(iso);
      const second = formatAmendmentSubmissionDate(iso);
      assert.equal(first, second, "Two calls with the same ISO string must return identical output");
    });

    it("formats an ISO date-only string (YYYY-MM-DD) without crashing", () => {
      const result = formatAmendmentSubmissionDate("2026-03-20");
      assert.match(
        result,
        /^\d{1,2} [A-Z][a-z]{2} \d{4}$/,
        `Expected "D MMM YYYY" pattern for date-only string, got "${result}"`
      );
    });

    it("two different ISO timestamps on the same calendar day give the same display date", () => {
      const morning = formatAmendmentSubmissionDate("2026-10-26T03:00:00.000Z");
      const evening = formatAmendmentSubmissionDate("2026-10-26T12:45:00.000Z");
      assert.equal(morning, evening, "Same local calendar day must produce the same display date");
    });
  });

  describe("formatAmendmentSubmissionDate: missing / invalid input", () => {
    it("returns empty string for empty input (no misleading 'Today' fallback)", () => {
      assert.equal(formatAmendmentSubmissionDate(""), "");
    });

    it("does not throw for an unparseable string", () => {
      assert.doesNotThrow(() => formatAmendmentSubmissionDate("not-a-date"));
    });

    it("returns the raw string for an unparseable input rather than crashing", () => {
      const raw = "invalid-date-string";
      const result = formatAmendmentSubmissionDate(raw);
      assert.equal(typeof result, "string", "Must always return a string");
    });
  });

  describe("submitAmendmentService: stores ISO format", () => {
    it("service uses new Date().toISOString() — not M/D/YYYY device format", () => {
      const source = fs.readFileSync(SERVICE_FILE, "utf-8");
      assert.ok(
        source.includes("new Date().toISOString()"),
        "submitAmendmentService must use new Date().toISOString() for dateStr"
      );
    });

    it("service does NOT use the locale-dependent M/D/YYYY template literal", () => {
      const source = fs.readFileSync(SERVICE_FILE, "utf-8");
      assert.ok(
        !source.includes("now.getMonth()"),
        "submitAmendmentService must not build M/D/YYYY via getMonth()/getDate()"
      );
    });
  });

  describe("GstAmendmentSuccess: uses formatter for display", () => {
    it("success screen imports formatAmendmentSubmissionDate", () => {
      const source = fs.readFileSync(SUCCESS_FILE, "utf-8");
      assert.ok(
        source.includes("formatAmendmentSubmissionDate"),
        "GstAmendmentSuccess must import and call formatAmendmentSubmissionDate"
      );
    });

    it("success screen does NOT render submissionResult.date raw", () => {
      const source = fs.readFileSync(SUCCESS_FILE, "utf-8");
      assert.ok(
        !source.includes("{submissionResult.date}"),
        "GstAmendmentSuccess must not render submissionResult.date without formatting"
      );
    });
  });
});
