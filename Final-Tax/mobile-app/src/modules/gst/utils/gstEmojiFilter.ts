/**
 * Unicode-Aware Emoji Filtering Utility
 *
 * Provides high-performance, Unicode-standard filtering of emoji characters,
 * multi-code-point sequences (e.g. ZWJ sequences, skin-tone modifiers, flags,
 * keycaps, variation selectors, and extended pictographs) from user input across
 * all GST forms and input fields.
 *
 * Preserves all legitimate text, Indian scripts (Devanagari, Tamil, Telugu, etc.),
 * numbers, currency symbols (₹, $, etc.), punctuation, and whitespace.
 */

export const EMOJI_FILTER_REGEX =
  /(?:[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}\uFE0E\uFE0F\u200D\u20E3])/gu;

export const EMOJI_DETECTION_REGEX =
  /(?:[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}\uFE0E\uFE0F\u200D\u20E3])/u;

/**
 * Checks whether the provided text contains any emoji character or sequence.
 */
export function containsEmoji(text?: unknown): boolean {
  if (typeof text !== "string" || !text) return false;
  return EMOJI_DETECTION_REGEX.test(text);
}

/**
 * Strips all emoji characters, sequences, and modifiers from input text.
 * If no emoji is present, returns the original text untouched without allocations.
 */
export function removeEmoji(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  if (!EMOJI_DETECTION_REGEX.test(text)) return text;
  return text.replace(EMOJI_FILTER_REGEX, "");
}

/**
 * Higher-order helper for onChangeText handlers to automatically filter emojis
 * before passing the clean text to the destination callback.
 */
export function withEmojiFilter(
  callback?: (text: string) => void
): (text: string) => void {
  return (text: string) => {
    if (!callback) return;
    callback(removeEmoji(text));
  };
}
