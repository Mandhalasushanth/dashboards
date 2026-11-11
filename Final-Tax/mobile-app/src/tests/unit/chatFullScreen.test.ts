import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Professional CA Connect UI Suite", () => {
  const baseDir = path.resolve(__dirname, "../../..");
  const chatTabPath = path.join(
    baseDir,
    "src/components/screens/application/ChatTab.tsx"
  );
  const chatStylesPath = path.join(
    baseDir,
    "src/components/screens/application/ChatTab.styles.ts"
  );
  const idScreenPath = path.join(
    baseDir,
    "src/app/application/[id].tsx"
  );

  const chatTabContent = fs.readFileSync(chatTabPath, "utf-8");
  const chatStylesContent = fs.readFileSync(chatStylesPath, "utf-8");
  const idScreenContent = fs.readFileSync(idScreenPath, "utf-8");

  test("1. Existing Top Bars Unchanged: Header, back button, title, and tabs preserved", () => {
    assert.ok(
      idScreenContent.includes("<ApplicationHeader"),
      "[id].tsx must preserve ApplicationHeader unchanged"
    );
    assert.ok(
      idScreenContent.includes('onBack={() => router.back()}'),
      "[id].tsx must preserve back navigation handler"
    );
    assert.ok(
      idScreenContent.includes("activeTab={activeTab}"),
      "[id].tsx must keep tab navigation state"
    );
    assert.ok(
      idScreenContent.includes("OverviewTab") &&
        idScreenContent.includes("StatusTab") &&
        idScreenContent.includes("DocumentsTab") &&
        idScreenContent.includes("PaymentsTab"),
      "Other tabs must remain intact in [id].tsx"
    );
  });

  test("2. Application Context Card: Service name, status badge, progress indicator, and action", () => {
    assert.ok(
      chatTabContent.includes("chatStyles.contextCard"),
      "ChatTab must render the contextCard container"
    );
    assert.ok(
      chatTabContent.includes("chatStyles.contextCardTitle"),
      "ChatTab must render contextCardTitle"
    );
    assert.ok(
      chatTabContent.includes("chatStyles.contextCardBadge"),
      "ChatTab must render dynamic contextCardBadge"
    );
    assert.ok(
      chatTabContent.includes("chatStyles.contextProgressBarFill"),
      "ChatTab must render contextProgressBarFill"
    );
    assert.ok(
      chatTabContent.includes("View application"),
      "ChatTab must render View application action"
    );
    assert.ok(
      chatStylesContent.includes("contextCard: {") &&
        chatStylesContent.includes("contextProgressBarWrap: {"),
      "ChatTab.styles.ts must define context card styling"
    );
  });

  test("3. Conversation Timeline: Dynamic date divider, sender labels, and delivery indicator", () => {
    assert.ok(
      chatTabContent.includes("getDynamicDateDivider"),
      "ChatTab must dynamically compute date divider (e.g. TODAY · 27 OCT)"
    );
    assert.ok(
      chatTabContent.includes("chatStyles.dateDividerWrap") &&
        chatTabContent.includes("chatStyles.dateDividerText"),
      "ChatTab must render date divider"
    );
    assert.ok(
      chatTabContent.includes("chatStyles.senderLabelCA") &&
        chatTabContent.includes("chatStyles.senderLabelUser"),
      "ChatTab must render clear sender labels for CA and User"
    );
    assert.ok(
      chatTabContent.includes("chatAvatarCA"),
      "ChatTab must render CA avatar with initials"
    );
    assert.ok(
      chatTabContent.includes("checkmark-done"),
      "ChatTab must render delivery checkmarks for user messages"
    );
  });

  test("4. Quick Question Chips: Populates composer without manual loop", () => {
    assert.ok(
      chatTabContent.includes("chatStyles.quickQuestionsSection"),
      "ChatTab must render quickQuestionsSection"
    );
    assert.ok(
      chatTabContent.includes("Quick questions"),
      "ChatTab must render Quick questions title"
    );
    assert.ok(
      chatTabContent.includes("Application status") &&
        chatTabContent.includes("Required documents") &&
        chatTabContent.includes("Payment query"),
      "ChatTab must render the 3 required quick question chips"
    );
    assert.ok(
      chatTabContent.includes("setChatInput"),
      "Tapping a chip must populate the composer input via setChatInput"
    );
  });

  test("5. Message Composer: Attachment action, placeholder, and security caption", () => {
    assert.ok(
      chatTabContent.includes("chatStyles.chatAttachBtn"),
      "ChatTab must include an attachment action button"
    );
    assert.ok(
      chatTabContent.includes("handleAttachment"),
      "ChatTab must have handleAttachment flow"
    );
    assert.ok(
      chatTabContent.includes("chatStyles.chatTextInput"),
      "ChatTab must include chatTextInput"
    );
    assert.ok(
      chatTabContent.includes("placeholder={placeholderText}"),
      "ChatTab must provide role-aware placeholder text"
    );
    assert.ok(
      chatTabContent.includes("Secure professional support"),
      "ChatTab must display subtle security caption"
    );
    assert.ok(
      chatTabContent.includes("disabled={!canSend}"),
      "Send button must be disabled when !canSend"
    );
  });

  test("6. No Inline Styles: Dynamic styling delegated to helper functions in style file", () => {
    assert.ok(
      chatTabContent.includes("getComposerInsetStyle"),
      "ChatTab must use getComposerInsetStyle from styles"
    );
    assert.ok(
      chatTabContent.includes("getProgressFillStyle"),
      "ChatTab must use getProgressFillStyle from styles"
    );
    assert.ok(
      chatTabContent.includes("getBadgeBgStyle"),
      "ChatTab must use getBadgeBgStyle from styles"
    );
    assert.ok(
      chatTabContent.includes("getBadgeTextColorStyle"),
      "ChatTab must use getBadgeTextColorStyle from styles"
    );
  });

  test("7. Full-Screen Integration: [id].tsx renders ChatTab outside outer card ScrollView", () => {
    assert.ok(
      idScreenContent.includes('activeTab === "CHAT" ? ('),
      "[id].tsx must branch to render ChatTab full-screen outside outer ScrollView"
    );
    assert.ok(
      idScreenContent.includes("bottomInset={insets.bottom}"),
      "[id].tsx must pass safe-area bottomInset to ChatTab"
    );
    assert.ok(
      idScreenContent.includes('onViewApplication={() => setActiveTab("OVERVIEW")}'),
      "[id].tsx must pass onViewApplication callback to switch to OVERVIEW"
    );
  });

  test("8. Clean Empty State: No hardcoded sample messages or fake bubbles", () => {
    assert.equal(
      chatTabContent.includes("Hello! Your application has been submitted successfully"),
      false,
      "Must not contain hardcoded fake CA greeting message"
    );
    assert.ok(
      chatTabContent.includes("chatEmptyContainer"),
      "Must display a clean empty state when no messages exist"
    );
    assert.ok(
      chatTabContent.includes("chatEmptyTitle"),
      "Must display clean empty state title"
    );
  });

  test("9. Architectural rules: Zero loops and strict line limits (< 400 lines)", () => {
    const files = [
      "src/components/screens/application/ChatTab.tsx",
      "src/components/screens/application/ChatTab.styles.ts",
      "src/app/application/[id].tsx",
      "src/tests/unit/chatFullScreen.test.ts",
    ];

    const checkFile = (relPath: string) => {
      const fullPath = path.join(baseDir, relPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n").length;
      assert.ok(
        lines < 400,
        `File ${relPath} has ${lines} lines, must be strictly below 400 lines`
      );

      if (relPath.endsWith(".tsx") || relPath.endsWith("ChatTab.styles.ts")) {
        assert.equal(
          /\bfor\s*\(/.test(content),
          false,
          `File ${relPath} must not contain for loops`
        );
        assert.equal(
          /\bwhile\s*\(/.test(content),
          false,
          `File ${relPath} must not contain while loops`
        );
        assert.equal(
          /\.forEach\s*\(/.test(content),
          false,
          `File ${relPath} must not contain forEach loops`
        );
      }
    };

    checkFile(files[0]);
    checkFile(files[1]);
    checkFile(files[2]);
    checkFile(files[3]);
  });
});
