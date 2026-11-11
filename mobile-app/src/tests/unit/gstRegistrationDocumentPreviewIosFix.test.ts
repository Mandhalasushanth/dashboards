import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("GstViewDocumentModal: prevents iOS red alert/warning icon flickering and maintains stability", () => {
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

  // 1. Caches valid document details for iOS modal dismissal animation
  assert.ok(
    modalContent.includes("lastValidDocRef"),
    "Must maintain a ref to cache last active valid document for iOS dismissal"
  );
  assert.ok(
    modalContent.includes('Platform.OS === "ios"') || modalContent.includes("isIos"),
    "Must have iOS-specific logic to retain active document during dismissal transition"
  );

  // 2. Synchronously clears error states on prop updates to prevent 1-frame red error flash
  assert.ok(
    modalContent.includes("fileUri !== prevUri || visible !== prevVisible"),
    "Must synchronously reset error state on prop change to eliminate 1-frame error icon flashes"
  );

  // 3. Fallback box avoids flashing error icon during iOS modal dismissal
  assert.ok(
    modalContent.includes("isIos && !visible"),
    "Must avoid displaying the red alert icon during iOS modal dismissal fade"
  );

  // 4. Sets fadeDuration={0} on iOS for Image component to eliminate native image fade flicker
  assert.ok(
    modalContent.includes('fadeDuration={Platform.OS === "android" ? 300 : 0}'),
    "Image must have fadeDuration 0 on iOS to prevent visual transition conflict"
  );

  // 5. FallbackBox on iOS has minHeight 240 for stable warning icon centering
  assert.ok(
    stylesContent.includes('Platform.OS === "ios" ? { minHeight: 240 } : {}'),
    "fallbackBox must enforce minHeight 240 on iOS for stable icon positioning matching previewImage"
  );

  // 6. Existing modal structure preserved
  assert.ok(modalContent.includes("{title}"), "Title must be preserved in header");
  assert.ok(modalContent.includes("style={styles.header}"), "Header style must be preserved");
  assert.ok(modalContent.includes("style={styles.closeButton}"), "Close button must be preserved");
  assert.ok(modalContent.includes("style={styles.previewBox}"), "Preview box must be preserved");
  assert.ok(modalContent.includes("{renderPreviewContent()}"), "renderPreviewContent must be preserved");
  assert.ok(modalContent.includes("style={styles.doneButton}"), "Done button must be preserved");
  assert.ok(modalContent.includes(">Done</Text>"), "Done text must be preserved");
});

test("GstReviewStep: provides dedicated iOS eye icon button while strictly preserving Android behavior", () => {
  const reviewStepPath = path.join(
    process.cwd(),
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );
  const reviewStepContent = fs.readFileSync(reviewStepPath, "utf-8");

  // 1. Platform import present
  assert.ok(
    reviewStepContent.includes('Platform } from "react-native"'),
    "Platform must be imported from react-native"
  );

  // 2. iOS eye icon has dedicated TouchableOpacity with hitSlop and stopPropagation
  assert.ok(
    reviewStepContent.includes('Platform.OS === "ios" ? ('),
    "Must differentiate iOS eye icon touch target"
  );
  assert.ok(
    reviewStepContent.includes('accessibilityRole="button"'),
    "Eye icon on iOS must have accessibilityRole='button'"
  );
  assert.ok(
    reviewStepContent.includes("hitSlop="),
    "Eye icon on iOS must have hitSlop for responsive tapping"
  );
  assert.ok(
    reviewStepContent.includes("e?.stopPropagation?.()"),
    "Eye icon onPress must stop propagation to avoid row touch conflict on iOS"
  );

  // 3. Android retains exact existing <View style={styles.eyeIconBox}>
  assert.ok(
    reviewStepContent.includes('<View style={styles.eyeIconBox}>'),
    "Android must retain exact <View style={styles.eyeIconBox}> behavior"
  );

  // 4. Props passed to GstViewDocumentModal include mimeType and fileTypeLabel
  assert.ok(
    reviewStepContent.includes("mimeType={previewDoc?.mimeType}"),
    "GstViewDocumentModal must receive mimeType"
  );
  assert.ok(
    reviewStepContent.includes("fileTypeLabel="),
    "GstViewDocumentModal must receive fileTypeLabel"
  );
});

test("gstold files also maintain identical iOS fix consistency", () => {
  const oldModalPath = path.join(
    process.cwd(),
    "src/modules/gstold/components/GstDocumentCard/GstViewDocumentModal.tsx"
  );
  const oldReviewStepPath = path.join(
    process.cwd(),
    "src/modules/gstold/gst-registration/components/GstReviewStep/GstReviewStep.tsx"
  );

  const oldModal = fs.readFileSync(oldModalPath, "utf-8");
  const oldReview = fs.readFileSync(oldReviewStepPath, "utf-8");

  assert.ok(oldModal.includes("lastValidDocRef"), "gstold modal must contain lastValidDocRef");
  assert.ok(oldModal.includes("fadeDuration={Platform.OS === \"android\" ? 300 : 0}"), "gstold modal image must have fadeDuration 0 on iOS");
  assert.ok(oldReview.includes('Platform.OS === "ios" ? ('), "gstold review step must have iOS eye icon branch");
});

test("Modified files remain strictly below 400 lines", () => {
  const files = [
    "src/modules/gst/components/GstDocumentCard/GstViewDocumentModal.tsx",
    "src/modules/gst/components/GstDocumentCard/GstViewDocumentModal.styles.ts",
    "src/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep.tsx",
    "src/modules/gstold/components/GstDocumentCard/GstViewDocumentModal.tsx",
    "src/modules/gstold/components/GstDocumentCard/GstViewDocumentModal.styles.ts",
    "src/modules/gstold/gst-registration/components/GstReviewStep/GstReviewStep.tsx",
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
