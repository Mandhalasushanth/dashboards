import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("GstFilingScreen uses formatSubmissionDate and real appliedDate instead of hardcoded 'Today'", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-filing/screens/GstFilingScreen/GstFilingScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  // 1. Check formatSubmissionDate is imported
  assert.ok(
    content.includes('import { formatSubmissionDate } from "@/shared/formatters/dateFormatter";'),
    "formatSubmissionDate must be imported from dateFormatter"
  );

  // 2. Check appliedDate is resolved from stored application data
  assert.ok(
    content.includes("existingApp?.formData?.submissionDate") ||
      content.includes("existingApp?.submittedAt") ||
      content.includes("existingApp?.createdAt"),
    "appliedDate must look up stored application dates"
  );

  // 3. Check GstApplicationStatusStep receives appliedDate variable
  assert.ok(
    content.includes("appliedDate={appliedDate}"),
    "GstApplicationStatusStep must receive appliedDate prop"
  );

  // 4. Ensure appliedDate='Today' is not hardcoded
  assert.ok(
    !content.includes('appliedDate="Today"'),
    "Hardcoded appliedDate=\"Today\" must be removed"
  );
});

test("gstold GstFilingScreen mirrors formatSubmissionDate and appliedDate implementation (if present)", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gstold/gst-filing/screens/GstFilingScreen/GstFilingScreen.tsx"
  );
  if (!fs.existsSync(filePath)) {
    assert.ok(true);
    return;
  }
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('import { formatSubmissionDate } from "@/shared/formatters/dateFormatter";'),
    "gstold must import formatSubmissionDate"
  );
  assert.ok(
    content.includes("appliedDate={appliedDate}"),
    "gstold GstApplicationStatusStep must receive appliedDate prop"
  );
  assert.ok(
    !content.includes('appliedDate="Today"'),
    "gstold must not have hardcoded appliedDate=\"Today\""
  );
});
