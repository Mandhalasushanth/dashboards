import type { ChatMessage } from "@/types/domain";

export interface SelectedImageAttachment {
  uri: string;
  fileName: string;
  fileSize?: number;
  mimeType: string;
}

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Formats a byte count into a user-friendly string (e.g. "1.2 MB" or "450 KB").
 */
export function formatFileSize(bytes?: number): string {
  if (typeof bytes !== "number" || bytes <= 0 || !Number.isFinite(bytes)) {
    return "";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * Validates a picked image's size and MIME type according to project rules.
 */
export function validatePickedImage(asset: {
  fileSize?: number;
  mimeType?: string;
}): { valid: boolean; error?: string } {
  if (typeof asset.fileSize === "number" && asset.fileSize > MAX_ATTACHMENT_BYTES) {
    return {
      valid: false,
      error: "Selected image exceeds the 10MB limit. Please choose a smaller file.",
    };
  }

  const mime = (asset.mimeType || "image/jpeg").toLowerCase();
  const isImageMime =
    mime.startsWith("image/") ||
    mime.includes("jpeg") ||
    mime.includes("jpg") ||
    mime.includes("png") ||
    mime.includes("webp");

  if (!isImageMime) {
    return {
      valid: false,
      error: "Unsupported file format. Please select an image (JPEG, PNG, WEBP).",
    };
  }

  return { valid: true };
}

/**
 * Strips raw local file paths (e.g. file://..., /data/..., [Attached: ...]) so
 * raw device filesystem paths never leak into user-facing chat message text.
 */
export function sanitizeMessageText(text?: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("/data/") ||
    trimmed.startsWith("/var/") ||
    trimmed.startsWith("/storage/")
  ) {
    return "";
  }
  if (trimmed.startsWith("[Attached:") && trimmed.endsWith("]")) {
    return "";
  }
  return trimmed;
}

/**
 * Checks whether a given message has an image attachment.
 */
export function isImageAttachment(msg?: ChatMessage | null): boolean {
  if (!msg) return false;
  return Boolean(msg.imageUrl || msg.attachmentUrl);
}

const MONTH_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
] as const;

export function getDynamicDateDivider(): string {
  const d = new Date();
  const day = d.getDate();
  const m = MONTH_SHORT[d.getMonth()];
  return `TODAY · ${day} ${m}`;
}
