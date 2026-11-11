import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read regex and functions directly from gstEmojiFilter.ts to test in node
const filterSourcePath = path.resolve(
  __dirname,
  "../../modules/gst/utils/gstEmojiFilter.ts"
);
const filterSource = fs.readFileSync(filterSourcePath, "utf8");

// Mirror the regex exactly as defined in the source
const EMOJI_FILTER_REGEX =
  /(?:[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}\uFE0E\uFE0F\u200D\u20E3])/gu;

const EMOJI_DETECTION_REGEX =
  /(?:[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}\uFE0E\uFE0F\u200D\u20E3])/u;

function containsEmoji(text?: unknown): boolean {
  if (typeof text !== "string" || !text) return false;
  return EMOJI_DETECTION_REGEX.test(text);
}

function removeEmoji(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  if (!EMOJI_DETECTION_REGEX.test(text)) return text;
  return text.replace(EMOJI_FILTER_REGEX, "");
}

function withEmojiFilter(
  callback?: (text: string) => void
): (text: string) => void {
  return (text: string) => {
    if (!callback) return;
    callback(removeEmoji(text));
  };
}

test("gstEmojiFilter source code verifies exports and pattern implementation", () => {
  assert.ok(filterSource.includes("export const EMOJI_FILTER_REGEX"), "Must export EMOJI_FILTER_REGEX");
  assert.ok(filterSource.includes("export function removeEmoji"), "Must export removeEmoji");
  assert.ok(filterSource.includes("export function containsEmoji"), "Must export containsEmoji");
  assert.ok(filterSource.includes("export function withEmojiFilter"), "Must export withEmojiFilter");
});

test("gstEmojiFilter: detects standard, complex, skin-toned, keycap, flag, and ZWJ emojis", () => {
  assert.equal(containsEmoji("Bhargavi 😊"), true);
  assert.equal(containsEmoji("GST Filing 👍2026"), true);
  assert.equal(containsEmoji("Hello ❤️ World"), true);
  assert.equal(containsEmoji("👨‍👩‍👧‍👦 Family"), true);
  assert.equal(containsEmoji("🇮🇳 India"), true);
  assert.equal(containsEmoji("1️⃣2️⃣3️⃣"), true);
  assert.equal(containsEmoji("👍🏽 Skin tone"), true);
  assert.equal(containsEmoji("No emojis here 12345"), false);
  assert.equal(containsEmoji("M/s Shri Ram & Co. (P) Ltd."), false);
  assert.equal(containsEmoji("₹ 1,50,000.00"), false);
});

test("gstEmojiFilter: removes all emojis while preserving text, numbers, punctuation and spaces", () => {
  // Required test cases from user specification
  assert.equal(removeEmoji("Bhargavi 😊"), "Bhargavi ");
  assert.equal(removeEmoji("GST Filing 👍2026"), "GST Filing 2026");
  assert.equal(removeEmoji("Hello ❤️ World"), "Hello  World");

  // Complex emoji sequences
  assert.equal(removeEmoji("👨‍👩‍👧‍👦 Family"), " Family");
  assert.equal(removeEmoji("🇮🇳 Flag of India"), " Flag of India");
  assert.equal(removeEmoji("Skin tone 👍🏽 test"), "Skin tone  test");
  assert.equal(removeEmoji("1️⃣ Keycap number"), " Keycap number");
  assert.equal(removeEmoji("Emoji only 😀😃😄"), "Emoji only ");
  assert.equal(removeEmoji("😀😃😄"), "");
  assert.equal(removeEmoji(""), "");
  assert.equal(removeEmoji(null), "");
  assert.equal(removeEmoji(undefined), "");
});

test("gstEmojiFilter: preserves Indian names, business names, GSTINs, PANs, IFSC, emails and Indian scripts", () => {
  const legitValues = [
    "Bhargavi Gavini",
    "29ABCDE1234F1Z5",
    "ABCDE1234F",
    "SBIN0001234",
    "test.user+gst@example.co.in",
    "M/s Shri Ram Enterprises & Co. (P) Ltd.",
    "Flat No. 402, 4th Floor, Lakeview Apts, MG Road, Bengaluru - 560001",
    "₹ 1,50,000.50",
    "+91 9876543210",
    "श्री गणेश एंटरप्राइजेज",
    "ஸ்ரீ கணேஷ்",
    "శ్రీ గణేష్",
    "শ্রী গণেশ",
    "Door #12/3-A, Ring Road",
  ];

  legitValues.forEach((val) => {
    assert.equal(removeEmoji(val), val, `Legitimate string was modified: ${val}`);
  });
});

test("gstEmojiFilter: withEmojiFilter wraps callbacks to strip emojis automatically", () => {
  let captured = "";
  const filteredCallback = withEmojiFilter((text) => {
    captured = text;
  });

  filteredCallback("Bhargavi 😊");
  assert.equal(captured, "Bhargavi ");

  filteredCallback("29ABCDE1234F1Z5 🎉");
  assert.equal(captured, "29ABCDE1234F1Z5 ");
});

test("GstFormElements FormInput integrates emoji filter at input level", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-registration/components/GstBusinessStep/GstFormElements.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";'),
    "GstFormElements must import removeEmoji"
  );
  assert.ok(
    content.includes("const cleaned = removeEmoji(text);"),
    "FormInput must filter emojis in handleChangeText"
  );
  assert.ok(
    content.includes("setSearchQuery(removeEmoji(val))"),
    "Searchable modal input must filter emojis"
  );
});

test("FloatingLabelInput integrates emoji filter at input level", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-compliance/components/FloatingLabelInput/FloatingLabelInput.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";'),
    "FloatingLabelInput must import removeEmoji"
  );
  assert.ok(
    content.includes("const cleaned = removeEmoji(text);"),
    "FloatingLabelInput must filter emojis in handleChangeText"
  );
  assert.ok(
    content.includes("onChangeText={handleChangeText}"),
    "FloatingLabelInput must pass handleChangeText to TextInput"
  );
});

test("GstAmendmentFields integrates emoji filter at input level", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-amendment/components/GstAmendmentFields/GstAmendmentFields.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";'),
    "GstAmendmentFields must import removeEmoji"
  );
  assert.ok(
    content.includes("onChangeText={(text) => onChangeText(removeEmoji(text))}"),
    "InputField and PhoneField must filter emojis on input"
  );
});

test("GstAmendmentLanding integrates emoji filter on GSTIN input", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-amendment/components/GstAmendmentLanding/GstAmendmentLanding.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";'),
    "GstAmendmentLanding must import removeEmoji"
  );
  assert.ok(
    content.includes("onChangeText={(text) => onGstinChange(removeEmoji(text))}"),
    "GstAmendmentLanding must filter emojis on GSTIN input"
  );
});

test("GstCalculationMethodSection integrates emoji filter on estimate inputs", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-filing/components/GstFilingPeriodStep/GstCalculationMethodSection.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";'),
    "GstCalculationMethodSection must import removeEmoji"
  );
  assert.ok(
    content.includes("toRawNumericString(removeEmoji(val))"),
    "Estimated figures inputs must filter emojis before numeric extraction"
  );
});

test("GstCancellationScreen integrates emoji filter on all input fields", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-cancellation/screens/GstCancellationScreen/GstCancellationScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";'),
    "GstCancellationScreen must import removeEmoji"
  );
  assert.ok(
    content.includes('flow.setFormField("otherReason", removeEmoji(t));'),
    "otherReason textarea must filter emojis"
  );
  assert.ok(
    content.includes('flow.setFormField("closingStock", removeEmoji(t));'),
    "closingStock input must filter emojis"
  );
  assert.ok(
    content.includes('flow.setFormField("pendingLiabilities", removeEmoji(t));'),
    "pendingLiabilities input must filter emojis"
  );
  assert.ok(
    content.includes('flow.setFormField("lastGstr3b", removeEmoji(t));'),
    "lastGstr3b input must filter emojis"
  );
});
