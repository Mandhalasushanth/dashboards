import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("GstViewDocumentModal: displays filename only at top and removes duplicate info card below preview", () => {
  const modalPath = path.join(
    process.cwd(),
    "src/modules/gst/components/GstDocumentCard/GstViewDocumentModal.tsx"
  );
  const modalContent = fs.readFileSync(modalPath, "utf-8");

  const stylesPath = path.join(
    process.cwd(),
    "src/modules/gst/components/GstDocumentCard/GstViewDocumentModal.styles.ts"
  );
  const stylesContent = fs.readFileSync(stylesPath, "utf-8");

  // 1. Filename displayed at top of modal
  assert.ok(
    modalContent.includes("{title}"),
    "Top header must display document title/filename"
  );
  assert.ok(
    modalContent.includes("style={styles.header}"),
    "Top header section must be preserved"
  );
  assert.ok(
    modalContent.includes("style={styles.closeButton}"),
    "Close (X) button must be preserved in header"
  );
  assert.ok(
    modalContent.includes('name="close"'),
    "Close icon must be present"
  );

  // 2. Document preview image area preserved
  assert.ok(
    modalContent.includes("style={styles.previewBox}"),
    "Preview box container must be preserved"
  );
  assert.ok(
    modalContent.includes("{renderPreviewContent()}"),
    "Preview content renderer must be preserved"
  );

  // 3. Lower duplicate info card removed
  assert.ok(
    !modalContent.includes("styles.metaContainer"),
    "metaContainer card must be removed from modal JSX"
  );
  assert.ok(
    !modalContent.includes("styles.fileNameText"),
    "Duplicate fileNameText must not be rendered below preview"
  );
  assert.ok(
    !modalContent.includes("styles.fileMetaText"),
    "Duplicate fileMetaText must not be rendered below preview"
  );
  assert.ok(
    !modalContent.includes("docType.typeLabel} • ${fileSize"),
    "File type and size string must not be rendered below preview"
  );

  // 4. Blue Done button preserved and positioned below preview
  assert.ok(
    modalContent.includes("style={styles.doneButton}"),
    "Done button must be preserved"
  );
  assert.ok(
    modalContent.includes(">Done</Text>"),
    "Done button text must be preserved"
  );
  assert.ok(
    stylesContent.includes("BrandColors.PRIMARY_BLUE"),
    "Done button must use primary blue"
  );

  // 5. Spacing and design preserved
  assert.ok(
    stylesContent.includes("borderRadius: 20"),
    "Modal container must preserve rounded corners"
  );
  assert.ok(
    stylesContent.includes('backgroundColor: "#FFFFFF"'),
    "Modal container must preserve white background"
  );
  assert.ok(
    stylesContent.includes("padding: 20"),
    "Modal container must preserve padding"
  );
  assert.ok(
    stylesContent.includes("marginBottom: 20"),
    "PreviewBox must have balanced marginBottom: 20 before Done button"
  );
});

test("tds ViewDocumentModal: removes duplicate info card below preview", () => {
  const modalPath = path.join(
    process.cwd(),
    "src/modules/itr/tds/components/documents/ViewDocumentModal/ViewDocumentModal.tsx"
  );
  const modalContent = fs.readFileSync(modalPath, "utf-8");

  assert.ok(
    !modalContent.includes("styles.metaContainer"),
    "metaContainer must be removed from tds ViewDocumentModal"
  );
  assert.ok(
    !modalContent.includes("styles.fileNameText"),
    "Duplicate fileNameText must not be rendered in tds ViewDocumentModal"
  );
  assert.ok(
    !modalContent.includes("styles.fileMetaText"),
    "Duplicate fileMetaText must not be rendered in tds ViewDocumentModal"
  );
  assert.ok(
    modalContent.includes("style={styles.doneButton}"),
    "Done button must be preserved in tds ViewDocumentModal"
  );
});

test("Modified files remain strictly below 400 lines", () => {
  const files = [
    "src/modules/gst/components/GstDocumentCard/GstViewDocumentModal.tsx",
    "src/modules/gst/components/GstDocumentCard/GstViewDocumentModal.styles.ts",
    "src/modules/itr/tds/components/documents/ViewDocumentModal/ViewDocumentModal.tsx",
    "src/modules/itr/tds/components/documents/ViewDocumentModal/ViewDocumentModal.styles.ts",
  ];

  for (const relPath of files) {
    const fullPath = path.join(process.cwd(), relPath);
    const lineCount = fs.readFileSync(fullPath, "utf-8").split("\n").length;
    assert.ok(
      lineCount < 400,
      `File ${relPath} must be below 400 lines (found ${lineCount} lines)`
    );
  }
});
