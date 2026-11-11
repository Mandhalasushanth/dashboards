/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// ===============================================================================================
// Finsolz GST Registration — Review Screen UI Fix Unit Tests
// Tests the requirement:
// 1. Remove Uploaded Documents horizontal progress bar.
// 2. Preserve Uploaded Documents card, heading, edit button, document list, checkmarks, eye buttons.
// 3. Separate Contact and Email rows in Authorised Signatory details.
// 4. Email label is present and retrieves signatoryEmail dynamically.
// 5. Contact label is present and retrieves signatoryMobile dynamically without newline concatenation.
// 6. Long email address wraps properly (multiline prop passed to ReviewRow).
// 7. Source file remains strictly below 400 lines.
// ===============================================================================================

const readProjectFile = (relPath: string): string => {
  const fullPath = path.join(process.cwd(), relPath);
  return fs.readFileSync(fullPath, "utf-8").replace(/\r\n/g, "\n");
};

test("1. Uploaded Documents Progress Bar: Removed from GstReviewStep JSX", () => {
  const content = readProjectFile(
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );

  // Must not render docProgressBar in the JSX
  assert.equal(
    content.includes("styles.docProgressBar"),
    false,
    "GstReviewStep must not render styles.docProgressBar"
  );
  assert.equal(
    content.includes("styles.docProgressFill"),
    false,
    "GstReviewStep must not render styles.docProgressFill"
  );
  assert.equal(
    content.includes("getDocProgressFillStyle"),
    false,
    "GstReviewStep must not import or invoke getDocProgressFillStyle"
  );
  assert.equal(
    content.includes("progressPercent"),
    false,
    "GstReviewStep must not calculate progressPercent"
  );
});

test("2. Uploaded Documents Card: Heading, Edit button, Document list, and Modal preserved", () => {
  const content = readProjectFile(
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );

  assert.ok(
    content.includes('<Text style={styles.cardTitle}>Uploaded Documents</Text>'),
    "Must preserve Uploaded Documents card heading"
  );
  assert.ok(
    content.includes('style={styles.editDocsButton}'),
    "Must preserve editDocsButton"
  );
  assert.ok(
    content.includes('onPress={() => onEditStep(1, "documents")}'),
    "Must preserve Edit button navigation functionality"
  );
  assert.ok(
    content.includes('uploadedDocs.map((doc) =>'),
    "Must preserve uploaded documents list mapping"
  );
  assert.ok(
    content.includes('name="checkmark-circle"'),
    "Must preserve green checkmark icon"
  );
  assert.ok(
    content.includes('name="eye-outline"'),
    "Must preserve eye preview button"
  );
  assert.ok(
    content.includes('<GstViewDocumentModal'),
    "Must preserve GstViewDocumentModal integration"
  );
});

test("3. Authorised Signatory: Contact and Email are displayed as separate rows", () => {
  const content = readProjectFile(
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );

  // Old combined format with newline concatenation must NOT exist
  assert.equal(
    content.includes("${businessData.signatoryEmail || \"-\"}`}"),
    false,
    "Contact row must not concatenate email with newline"
  );

  // Must have separate ReviewRow for Contact
  assert.ok(
    content.includes('label="Contact"'),
    "Authorised Signatory must display Contact label"
  );

  // Must have separate ReviewRow for Email
  assert.ok(
    content.includes('label="Email"'),
    "Authorised Signatory must display separate Email label"
  );
});

test("4. Authorised Signatory: Dynamic data binding for Contact and Email", () => {
  const content = readProjectFile(
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );

  // Contact retrieves signatoryMobile
  assert.ok(
    content.includes("businessData.signatoryMobile"),
    "Contact row must dynamically reference businessData.signatoryMobile"
  );

  // Email retrieves signatoryEmail
  assert.ok(
    content.includes("businessData.signatoryEmail"),
    "Email row must dynamically reference businessData.signatoryEmail"
  );

  // Email has multiline support for wrapping
  const emailRowIndex = content.indexOf('label="Email"');
  assert.ok(emailRowIndex > -1, "Email label must exist");
  const emailRowSnippet = content.slice(emailRowIndex, emailRowIndex + 120);
  assert.ok(
    emailRowSnippet.includes("multiline"),
    "Email ReviewRow must enable multiline for long email wrapping"
  );
});

test("5. Code Quality: GstReviewStep remains strictly below 400 lines", () => {
  const content = readProjectFile(
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );
  const lineCount = content.split("\n").length;
  assert.ok(
    lineCount < 400,
    `GstReviewStep.tsx must remain below 400 lines (currently ${lineCount})`
  );
});
