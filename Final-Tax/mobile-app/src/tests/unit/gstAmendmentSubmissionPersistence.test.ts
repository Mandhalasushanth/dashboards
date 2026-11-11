/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");
const WORKFLOW_HOOK_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/hooks/useGstAmendmentWorkflow.ts"
);
const SUBMIT_SERVICE_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/services/submitAmendmentService.ts"
);
const REVIEW_SERVICE_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-amendment/services/persistAmendmentForReview.ts"
);
const TRANSPORT_FILE = path.join(
  ROOT,
  "src/modules/gst/services/gstAmendment/gstAmendmentTransport.ts"
);
const CONTROLLER_FILE = path.join(
  ROOT,
  "../finsolz-backend/src/main/java/com/finsolz/gst/amendment/controller/GstAmendmentController.java"
);
const BACKEND_SERVICE_DIR = path.join(
  ROOT,
  "../finsolz-backend/src/main/java/com/finsolz/gst/amendment/service"
);

test("Test 1: useGstAmendmentWorkflow fixes Expo SDK 54 FileSystem runtime crash and document persistence", () => {
  const content = fs.readFileSync(WORKFLOW_HOOK_FILE, "utf-8");

  assert.match(
    content,
    /verifyFileAccessible/,
    "Workflow must verify file accessibility safely using verifyFileAccessible"
  );
  assert.match(
    content,
    /persistSupportingDocument/,
    "Workflow must persist supporting documents immediately"
  );
  assert.doesNotMatch(
    content,
    /FileSystem\.getInfoAsync\(/,
    "Raw FileSystem.getInfoAsync from non-legacy expo-file-system must not be called"
  );
  assert.doesNotMatch(
    content,
    /setSectionDocs\(\(?prev\)?\s*=>\s*\(\{\s*\.\.\.prev,\s*\[selectedSectionId\]:\s*null\s*\}\)\);/,
    "Must NOT destructively nullify sectionDocs when submission check encounters an issue"
  );
});

test("Test 2: gstAmendmentTransport constructs canonical singular /api/v1/gst/amendment/ endpoint", () => {
  const content = fs.readFileSync(TRANSPORT_FILE, "utf-8");

  assert.match(
    content,
    /\/api\/v1\/gst\/amendment\/\$\{endpoint\}/,
    "Transport must use canonical singular /api/v1/gst/amendment/"
  );
  assert.doesNotMatch(
    content,
    /\/api\/v1\/gst\/amendments\/\$\{endpoint\}/,
    "Transport must not use /api/v1/gst/amendments/"
  );
  assert.match(
    content,
    /authState\.customer\?\.mobile/,
    "Customer ID resolution in transport must include customer mobile fallback"
  );
});

test("Test 3: All 6 GST amendment section API files call singular /api/v1/gst/amendment/", () => {
  const apiDir = path.join(ROOT, "src/modules/gst/services/gstAmendment");
  const apiFiles = [
    "legalNameAmendmentApi.ts",
    "principalPlaceAmendmentApi.ts",
    "additionalPlaceAmendmentApi.ts",
    "bankAccountAmendmentApi.ts",
    "contactAmendmentApi.ts",
    "signatoryAmendmentApi.ts",
  ];

  for (const file of apiFiles) {
    const fullPath = path.join(apiDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert.doesNotMatch(
      content,
      /\/api\/v1\/gst\/amendments\//,
      `${file} must not contain plural /api/v1/gst/amendments/`
    );
    assert.match(
      content,
      /\/api\/v1\/gst\/amendment\//,
      `${file} must contain singular /api/v1/gst/amendment/`
    );
  }
});

test("Test 4: Backend GstAmendmentController supports both singular and plural paths", () => {
  const content = fs.readFileSync(CONTROLLER_FILE, "utf-8");

  assert.match(
    content,
    /@RequestMapping\(\{\s*"\/api\/v1\/gst\/amendment"\s*,\s*"\/api\/v1\/gst\/amendments"\s*\}\)/,
    "GstAmendmentController must map both singular and plural paths"
  );
});

test("Test 5: All 6 backend amendment services resolve customer by ID, mobile, and GST business ownership", () => {
  const serviceFiles = [
    "LegalNameAmendmentServiceImpl.java",
    "PrincipalPlaceAmendmentServiceImpl.java",
    "AdditionalPlaceAmendmentServiceImpl.java",
    "BankAccountAmendmentServiceImpl.java",
    "ContactAmendmentServiceImpl.java",
    "SignatoryAmendmentServiceImpl.java",
  ];

  for (const file of serviceFiles) {
    const fullPath = path.join(BACKEND_SERVICE_DIR, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert.match(
      content,
      /\.or\(\(\)\s*->\s*customerRepository\.findByMobileNumber\(finalCustId\)\)/,
      `${file} must fallback to findByMobileNumber for customer resolution`
    );
    assert.match(
      content,
      /businessRepository\.findById\(gstId\.trim\(\)\)/,
      `${file} must resolve customer from GST business details ownership if custId missing`
    );
  }
});

test("Test 6: submitAmendmentService enforces backend persistence without fake success fallbacks", () => {
  const content = fs.readFileSync(SUBMIT_SERVICE_FILE, "utf-8");

  // Step 1: Must throw if save fails
  assert.match(
    content,
    /if\s*\(!savedRecord\?\.id\)\s*\{\s*throw new Error\(/,
    "Must throw error if initial saveAmendmentRecord returns no record ID"
  );

  // Step 3: Must rethrow submit errors
  assert.match(
    content,
    /throw subErr;/,
    "Must rethrow backend submission failure error rather than swallowing it"
  );

  // Persistence tracking: ID mapped directly
  assert.match(
    content,
    /const finalAppId = String\(activeAmendmentId\);/,
    "Must use actual database entity ID as finalAppId"
  );
  assert.match(
    content,
    /createApplication\([\s\S]*?finalAppId\s*\);/,
    "createApplication must receive finalAppId matching database record"
  );

  // markSubmitted only after backend call
  const submitIndex = content.indexOf("submitFinalAmendmentRecord");
  const markSubmittedIndex = content.indexOf("markSubmitted()");
  assert.ok(
    submitIndex !== -1 && markSubmittedIndex !== -1 && submitIndex < markSubmittedIndex,
    "markSubmitted must execute after successful submitFinalAmendmentRecord call"
  );
});

test("Test 7: persistAmendmentForReview rethrows errors and prevents advancing with unpersisted draft", () => {
  const content = fs.readFileSync(REVIEW_SERVICE_FILE, "utf-8");

  assert.match(
    content,
    /throw err;/,
    "persistAmendmentForReview must rethrow network save errors to prevent silent data loss"
  );
  assert.doesNotMatch(
    content,
    /onReviewData\(\{\s*id:\s*amendmentId,\s*\.\.\.formData\s*\}\);/,
    "persistAmendmentForReview must not fall back to local draft review when server save fails"
  );
});

test("Test 8: useGstAmendmentWorkflow protects against duplicate submissions and preserves form data on error", () => {
  const content = fs.readFileSync(WORKFLOW_HOOK_FILE, "utf-8");

  // Duplicate submission guard
  assert.match(
    content,
    /if\s*\(isSubmitting\)\s*return;/,
    "handleSubmitAmendment must return early if isSubmitting is true"
  );

  // Form data preservation: clearGstAmendmentDraft and setCurrentStep("SUCCESS") are inside try block
  const tryIndex = content.indexOf("const result = await submitAmendmentService");
  const clearDraftIndex = content.indexOf("clearGstAmendmentDraft()", tryIndex);
  const successStepIndex = content.indexOf('setCurrentStep("SUCCESS")', tryIndex);
  const catchIndex = content.indexOf("} catch (error) {", tryIndex);
  const alertErrorIndex = content.indexOf('"Submission Failed"', catchIndex);

  assert.ok(tryIndex < clearDraftIndex, "Draft clearing must happen only after submit succeeds");
  assert.ok(clearDraftIndex < successStepIndex, "Success step transition must happen after submit succeeds");
  assert.ok(successStepIndex < catchIndex, "Catch block must be placed after try block");
  assert.ok(catchIndex < alertErrorIndex, "Submission Failed alert must be displayed in catch block");
});
