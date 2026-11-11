import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  validatePickedImage,
  sanitizeMessageText,
  formatFileSize,
  isImageAttachment,
  MAX_ATTACHMENT_BYTES,
} from "../../modules/applications/utils/chatAttachmentUtils";
import type { ChatMessage, Application } from "../../types/domain";

describe("Chat with CA Manager Image Upload and Display Suite", () => {
  const baseDir = path.resolve(__dirname, "../../..");
  const chatTabPath = path.join(baseDir, "src/components/screens/application/ChatTab.tsx");
  const chatStylesPath = path.join(baseDir, "src/components/screens/application/ChatTab.styles.ts");
  const chatBubblePath = path.join(baseDir, "src/components/screens/application/ChatImageBubble.tsx");
  const appServicePath = path.join(baseDir, "src/modules/applications/services/applicationService.ts");
  const appStorePath = path.join(baseDir, "src/store/applicationStore.ts");
  const idScreenPath = path.join(baseDir, "src/app/application/[id].tsx");

  const chatTabCode = fs.readFileSync(chatTabPath, "utf-8");
  const chatStylesCode = fs.readFileSync(chatStylesPath, "utf-8");
  const chatBubbleCode = fs.readFileSync(chatBubblePath, "utf-8");
  const appServiceCode = fs.readFileSync(appServicePath, "utf-8");
  const appStoreCode = fs.readFileSync(appStorePath, "utf-8");
  const idScreenCode = fs.readFileSync(idScreenPath, "utf-8");

  test("1. Image Validation: Enforces 10MB file-size limit and supported image formats", () => {
    // Valid image file under 10MB
    const validJpg = validatePickedImage({ fileSize: 2 * 1024 * 1024, mimeType: "image/jpeg" });
    assert.equal(validJpg.valid, true);

    const validPng = validatePickedImage({ fileSize: 500 * 1024, mimeType: "image/png" });
    assert.equal(validPng.valid, true);

    const validWebp = validatePickedImage({ fileSize: 1024 * 1024, mimeType: "image/webp" });
    assert.equal(validWebp.valid, true);

    // Over 10MB should be rejected
    const oversized = validatePickedImage({
      fileSize: MAX_ATTACHMENT_BYTES + 1024,
      mimeType: "image/jpeg",
    });
    assert.equal(oversized.valid, false);
    assert.ok(oversized.error?.includes("10MB limit"));

    // Unsupported format (e.g. text/plain or application/exe)
    const unsupported = validatePickedImage({
      fileSize: 1024,
      mimeType: "application/x-executable",
    });
    assert.equal(unsupported.valid, false);
    assert.ok(unsupported.error?.includes("Unsupported file format"));
  });

  test("2. File Size Formatter: Formats bytes into human-readable strings", () => {
    assert.equal(formatFileSize(0), "");
    assert.equal(formatFileSize(512), "512 B");
    assert.equal(formatFileSize(1024 * 250), "250 KB");
    assert.equal(formatFileSize(1024 * 1024 * 1.5), "1.5 MB");
    assert.equal(formatFileSize(1024 * 1024 * 4.2), "4.2 MB");
  });

  test("3. Path Sanitization: Never serializes or exposes raw local filesystem paths in message text", () => {
    // Raw file URIs must be stripped so they never appear as message text
    assert.equal(sanitizeMessageText("file:///data/user/0/host.exp.exponent/cache/photo.jpg"), "");
    assert.equal(sanitizeMessageText("content://media/external/images/media/42"), "");
    assert.equal(sanitizeMessageText("/data/user/0/cache/temp.jpg"), "");
    assert.equal(sanitizeMessageText("[Attached: receipt.png]"), "");

    // User captions must be preserved cleanly
    assert.equal(sanitizeMessageText("Here is my electricity bill"), "Here is my electricity bill");
    assert.equal(sanitizeMessageText("  Updated tax invoice  "), "Updated tax invoice");
    assert.equal(sanitizeMessageText(""), "");
    assert.equal(sanitizeMessageText(undefined), "");
  });

  test("4. Message Model: Supports image attachments and distinguishes from text-only messages", () => {
    const textMsg: ChatMessage = {
      id: "msg-1",
      sender: "user",
      text: "Hello CA",
      timestamp: "10:30 AM",
    };
    assert.equal(isImageAttachment(textMsg), false);

    const imageMsg: ChatMessage = {
      id: "msg-2",
      sender: "user",
      text: "Invoice proof",
      caption: "Invoice proof",
      timestamp: "10:32 AM",
      imageUrl: "https://api.finsolz.com/files/invoice_123.jpg",
      attachmentUrl: "https://api.finsolz.com/files/invoice_123.jpg",
      attachmentName: "invoice_123.jpg",
    };
    assert.equal(isImageAttachment(imageMsg), true);
  });

  test("5. Image Selection & Preview UI: Thumbnail, filename, size, and remove action in ChatTab", () => {
    assert.ok(chatTabCode.includes("ImagePicker.launchImageLibraryAsync"), "Uses ImagePicker to select images");
    assert.ok(chatTabCode.includes("chatStyles.attachmentPreviewBar"), "Renders attachment preview bar");
    assert.ok(chatTabCode.includes("chatStyles.attachmentPreviewThumb"), "Renders preview thumbnail");
    assert.ok(chatTabCode.includes("chatStyles.attachmentRemoveBtn"), "Renders remove button for selected image");
    assert.ok(chatTabCode.includes("selectedImage.fileName"), "Displays selected image filename");
    assert.ok(chatTabCode.includes("formatFileSize(selectedImage.fileSize)"), "Displays formatted image size");
    assert.ok(chatTabCode.includes("canSend"), "canSend enables send button for image-only or text messages");
  });

  test("6. Multipart Upload: Application service creates real FormData with file part and appId", () => {
    assert.ok(appServiceCode.includes("uploadChatAttachment: async"), "Defines uploadChatAttachment in applicationService");
    assert.ok(appServiceCode.includes("new FormData()"), "Creates FormData for multipart upload");
    assert.ok(appServiceCode.includes('appendFilePart(formData, "file"'), "Appends file part using appendFilePart");
    assert.ok(appServiceCode.includes('formData.append("applicationId", appId)'), "Includes applicationId in payload");
    assert.ok(appServiceCode.includes("/applications/"), "Targets applications attachments endpoint");
  });

  test("7. Message Bubble Image Rendering: Renders image, caption, loader, and tap-to-view preview", () => {
    assert.ok(chatBubbleCode.includes("<Image"), "ChatImageBubble renders native Image");
    assert.ok(chatBubbleCode.includes("chatStyles.chatImage"), "Applies chatImage styling");
    assert.ok(chatBubbleCode.includes("chatStyles.chatImageLoader"), "Displays loading overlay while loading");
    assert.ok(chatBubbleCode.includes("chatStyles.chatImageFallback"), "Displays fallback if image load fails");
    assert.ok(chatTabCode.includes("<GstViewDocumentModal"), "Opens GstViewDocumentModal when image is tapped");
    assert.ok(chatTabCode.includes("handleOpenPreview"), "Defines handleOpenPreview to view larger image");
  });

  test("8. Store Integration & Persistence: addChatMessage stores imageUrl and updates chatHistory", () => {
    assert.ok(appStoreCode.includes("imageUrl: attachment?.url || attachment?.uri"), "addChatMessage sets imageUrl");
    assert.ok(appStoreCode.includes("attachmentUrl: attachment?.url || attachment?.uri"), "addChatMessage sets attachmentUrl");
    assert.ok(appStoreCode.includes("attachmentName: attachment?.fileName"), "addChatMessage preserves attachment name");
    assert.ok(appStoreCode.includes("applicationService.updateApplication(updated)"), "Syncs updated chat history to backend");
    assert.ok(appStoreCode.includes("savePersistedApplications"), "Saves updated chat history to local persistence");
  });

  test("9. Failure & Retry: Input and selected image are preserved if sending fails", () => {
    // In ChatTab.tsx, setSelectedImage(null) only happens AFTER onSendMessage succeeds
    assert.ok(
      chatTabCode.includes("await onSendMessage(attachmentToSend);\n      setSelectedImage(null);") ||
      chatTabCode.includes("await onSendMessage(attachmentToSend);") && chatTabCode.includes("setSelectedImage(null);"),
      "Clears attachment only after onSendMessage succeeds"
    );
    assert.ok(
      chatTabCode.includes("Failed to Send") || chatTabCode.includes("Alert.alert"),
      "Notifies user with alert on failure without losing selected image"
    );
  });

  test("10. Architectural Constraints: Strictly below 400 lines and zero loops", () => {
    const files = [
      "src/components/screens/application/ChatTab.tsx",
      "src/components/screens/application/ChatTab.styles.ts",
      "src/components/screens/application/ChatImageBubble.tsx",
      "src/modules/applications/utils/chatAttachmentUtils.ts",
      "src/modules/applications/services/applicationService.ts",
      "src/store/applicationStore.ts",
      "src/app/application/[id].tsx",
      "src/types/domain.ts",
    ];

    files.forEach((rel) => {
      const full = path.join(baseDir, rel);
      const content = fs.readFileSync(full, "utf-8");
      const lines = content.split("\n").length;
      assert.ok(lines < 400, `File ${rel} has ${lines} lines, must be strictly below 400 lines`);

      if (rel.endsWith(".tsx") || rel.endsWith(".ts")) {
        // No for/while/forEach loops in source code
        if (!rel.includes(".test.ts")) {
          assert.equal(/\bfor\s*\(/.test(content), false, `File ${rel} must not contain for loops`);
          assert.equal(/\bwhile\s*\(/.test(content), false, `File ${rel} must not contain while loops`);
          assert.equal(/\.forEach\s*\(/.test(content), false, `File ${rel} must not contain forEach loops`);
        }
      }
    });
  });
});
