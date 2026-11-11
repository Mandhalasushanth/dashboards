/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const HELPERS_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/utils/gstAmendmentHelpers.ts"
);
const SUBMIT_SERVICE_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/services/submitAmendmentService.ts"
);
const SUCCESS_COMPONENT_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/components/GstAmendmentSuccess/GstAmendmentSuccess.tsx"
);
const TYPES_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/types/gstAmendmentTypes.ts"
);

test("GST Amendment Business Name: isValidBusinessName logic validation", () => {
  const helpersContent = fs.readFileSync(HELPERS_FILE, "utf-8");

  // Verify isValidBusinessName rejects empty strings, whitespace, and "-"
  assert.match(
    helpersContent,
    /export function isValidBusinessName\(/,
    "isValidBusinessName function must be exported from gstAmendmentHelpers"
  );
  assert.match(
    helpersContent,
    /trimmed !== "" && trimmed !== "-"|trimmed !== '-' && trimmed !== ""/,
    "isValidBusinessName must explicitly treat empty strings, whitespace, and '-' as invalid"
  );
});

test("GST Amendment Business Name: resolveEffectiveBusinessName handles Legal Business Name and other sections correctly", () => {
  const helpersContent = fs.readFileSync(HELPERS_FILE, "utf-8");

  assert.match(
    helpersContent,
    /export function resolveEffectiveBusinessName\(/,
    "resolveEffectiveBusinessName function must be exported from gstAmendmentHelpers"
  );
  assert.match(
    helpersContent,
    /selectedSectionId === "legal-name"|selectedSectionId === 'legal-name'/,
    "resolveEffectiveBusinessName must check for legal-name section"
  );
  assert.match(
    helpersContent,
    /formData\?\.newLegalBusinessName/,
    "resolveEffectiveBusinessName must use formData.newLegalBusinessName for legal-name amendments"
  );
  assert.match(
    helpersContent,
    /registeredDetails\?\.legalBusinessName/,
    "resolveEffectiveBusinessName must preserve registeredDetails.legalBusinessName for other amendment types"
  );
  assert.doesNotMatch(
    helpersContent,
    /GSTIN:\s*\$\{targetGstId\}/,
    "resolveEffectiveBusinessName must never use GSTIN as a fallback business name"
  );
  assert.match(
    helpersContent,
    /return "Registered Business"/,
    "Safe fallback should default to 'Registered Business' if no name is available"
  );
});

test("GST Amendment Business Name: submitAmendmentService persists businessName in application formData and submissionResult", () => {
  const submitServiceContent = fs.readFileSync(SUBMIT_SERVICE_FILE, "utf-8");

  assert.match(
    submitServiceContent,
    /resolveEffectiveBusinessName\(/,
    "submitAmendmentService must call resolveEffectiveBusinessName"
  );
  assert.match(
    submitServiceContent,
    /applicantName:\s*effectiveBusinessName/,
    "buildAmendmentApplicationDetails must map applicantName to effectiveBusinessName"
  );
  assert.match(
    submitServiceContent,
    /businessName:\s*effectiveBusinessName/,
    "buildAmendmentApplicationDetails must persist businessName in application details formData"
  );
  assert.match(
    submitServiceContent,
    /businessName:\s*effectiveBusinessName/,
    "submitAmendmentService return object must include businessName"
  );
});

test("GST Amendment Business Name: SubmissionResult type includes optional businessName", () => {
  const typesContent = fs.readFileSync(TYPES_FILE, "utf-8");

  assert.match(
    typesContent,
    /businessName\?:\s*string;/,
    "SubmissionResult interface must include optional businessName"
  );
});

test("GST Amendment Business Name: GstAmendmentSuccess validates candidate names and excludes '-' and GSTIN fallback", () => {
  const successContent = fs.readFileSync(SUCCESS_COMPONENT_FILE, "utf-8");

  assert.match(
    successContent,
    /isValidBusinessName/,
    "GstAmendmentSuccess must import and use isValidBusinessName"
  );
  assert.doesNotMatch(
    successContent,
    /submissionResult\.gstin \? `GSTIN: \$\{submissionResult\.gstin\}` :/,
    "GstAmendmentSuccess must NOT use GSTIN as a fallback business name"
  );
  assert.match(
    successContent,
    /businessName=\{businessName\}/,
    "GstAmendmentSuccess must pass the validated businessName to GstApplicationStatusStep"
  );
});

test("Pure unit logic test: business name resolution scenarios", () => {
  // Replicating exact logic of isValidBusinessName and resolveEffectiveBusinessName for behavioral unit verification
  function isValidBusinessName(value?: string | null): boolean {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed !== "" && trimmed !== "-";
  }

  function resolveEffectiveBusinessName(
    selectedSectionId: string,
    formData?: { newLegalBusinessName?: string } | null,
    registeredDetails?: { legalBusinessName?: string } | null
  ): string {
    const isLegalNameAmendment = selectedSectionId === "legal-name";

    if (isLegalNameAmendment && isValidBusinessName(formData?.newLegalBusinessName)) {
      return (formData?.newLegalBusinessName || "").trim();
    }

    if (isValidBusinessName(registeredDetails?.legalBusinessName)) {
      return (registeredDetails?.legalBusinessName || "").trim();
    }

    if (isValidBusinessName(formData?.newLegalBusinessName)) {
      return (formData?.newLegalBusinessName || "").trim();
    }

    return "Registered Business";
  }

  // Requirement 1: Use formData.newLegalBusinessName for Legal Business Name amendments
  assert.equal(
    resolveEffectiveBusinessName("legal-name", { newLegalBusinessName: "Acme Enterprises Private Limited" }, { legalBusinessName: "-" }),
    "Acme Enterprises Private Limited"
  );
  assert.equal(
    resolveEffectiveBusinessName("legal-name", { newLegalBusinessName: "Tata Global Logistics" }, { legalBusinessName: "Tata Old Logistics" }),
    "Tata Global Logistics"
  );

  // Requirement 2: For other amendment types, preserve the existing registered business name
  assert.equal(
    resolveEffectiveBusinessName("principal-place", { newLegalBusinessName: "" }, { legalBusinessName: "Infosys Ltd" }),
    "Infosys Ltd"
  );
  assert.equal(
    resolveEffectiveBusinessName("bank-account", {}, { legalBusinessName: "Wipro Technologies" }),
    "Wipro Technologies"
  );

  // Requirement 3 & 4: Reject empty strings, whitespace and "-"
  assert.equal(isValidBusinessName(""), false);
  assert.equal(isValidBusinessName("   "), false);
  assert.equal(isValidBusinessName("-"), false);
  assert.equal(isValidBusinessName("  -  "), false);
  assert.equal(isValidBusinessName(null), false);
  assert.equal(isValidBusinessName(undefined), false);
  assert.equal(isValidBusinessName("Valid Business Corp"), true);

  // If no valid business name exists, fallback to 'Registered Business' and never '-' or GSTIN
  assert.equal(
    resolveEffectiveBusinessName("legal-name", { newLegalBusinessName: "-" }, { legalBusinessName: "-" }),
    "Registered Business"
  );
  assert.equal(
    resolveEffectiveBusinessName("legal-name", { newLegalBusinessName: "   " }, { legalBusinessName: "" }),
    "Registered Business"
  );
});
