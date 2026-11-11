/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const BUSINESS_STEP_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx"
);

test("GST Registration Business PAN Placeholder: verified updated to ABCPE1234F", () => {
  const content = fs.readFileSync(BUSINESS_STEP_FILE, "utf-8");

  // Verify the new placeholder is present
  assert.match(
    content,
    /renderInput\(\s*"businessPan",\s*"Business PAN \*",\s*"Enter PAN \(e\.g\., ABCPE1234F\)"/,
    "GstBusinessStep must display placeholder 'Enter PAN (e.g., ABCPE1234F)' for businessPan"
  );

  // Verify the old placeholder is completely gone
  assert.doesNotMatch(
    content,
    /ABCDP1234F/,
    "Old incorrect placeholder ABCDP1234F must not exist in GstBusinessStep"
  );
});

test("GST Registration: Signatory PAN placeholder consistency", () => {
  const content = fs.readFileSync(BUSINESS_STEP_FILE, "utf-8");

  // Signatory PAN should also use valid individual format ABCPE1234F
  assert.match(
    content,
    /renderInput\(\s*"signatoryPan",\s*"Signatory PAN \*",\s*"ABCPE1234F"/,
    "signatoryPan must maintain ABCPE1234F placeholder"
  );
});
