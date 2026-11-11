import type {
  LoanDocumentRequirement,
  LoanDocumentUpload,
} from "../types/loanReview.types";

export interface PickedLoanFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface LoanDocumentProgress {
  requiredTotal: number;
  requiredUploaded: number;
  optionalTotal: number;
  optionalUploaded: number;
  missingRequiredIds: string[];
  isComplete: boolean;
}

const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "heic",
  "svg",
  "tiff",
]);

/** The file's MIME type, falling back to its extension when the picker reports none. */
export function resolveMimeType(file: PickedLoanFile): string | null {
  if (file.mimeType) return file.mimeType.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[ext] ?? null;
}

const PDF_MIME = "application/pdf";
/** Some file providers report PDFs with a generic type; the extension then decides. */
const GENERIC_MIME_TYPES = new Set(["", "application/octet-stream", "binary/octet-stream"]);
const PDF_ONLY_MESSAGE = "Please upload your bank statement as a PDF.";

/** True when the file is a PDF by its type, or by its .pdf name when the type is generic. */
function isPdfFile(file: PickedLoanFile): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = (file.mimeType ?? "").toLowerCase();
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) return false;
  return mime === PDF_MIME || (ext === "pdf" && GENERIC_MIME_TYPES.has(mime));
}

/** Customer-facing message when the file cannot be accepted, otherwise null. */
export function validateLoanDocumentFile(
  file: PickedLoanFile,
  requirement: LoanDocumentRequirement
): string | null {
  if (!file.uri?.trim() || !file.name?.trim()) {
    return "Choose a valid file to upload.";
  }

  if (file.size === 0) {
    return "This file appears to be empty. Please choose another file.";
  }
  if (file.size === undefined || !Number.isFinite(file.size) || file.size < 0) {
    return "The file size could not be verified. Please choose another file.";
  }

  const isPdfOnly =
    requirement.allowedMimeTypes.length === 1 &&
    requirement.allowedMimeTypes[0] === PDF_MIME;

  if (isPdfOnly) {
    if (!isPdfFile(file)) return PDF_ONLY_MESSAGE;
  } else {
    const resolvedMime = resolveMimeType(file);
    if (!resolvedMime || !requirement.allowedMimeTypes.includes(resolvedMime)) {
      return "This file type isn't supported. Please upload a PDF, JPG or PNG.";
    }
  }

  if (file.size > requirement.maxSizeBytes) {
    const mb = Math.round(requirement.maxSizeBytes / (1024 * 1024));
    return `This file is too large. Please upload a file under ${mb} MB.`;
  }
  return null;
}

/** Builds the stored upload record for an accepted file. */
export function toLoanDocumentUpload(
  requirement: LoanDocumentRequirement,
  file: PickedLoanFile
): LoanDocumentUpload {
  return {
    id: `${requirement.id}_${Date.now()}`,
    documentId: requirement.id,
    fileName: file.name,
    fileUri: file.uri,
    fileSize: file.size ?? 0,
    mimeType: resolveMimeType(file) ?? "application/octet-stream",
    status: "selected",
  };
}

/** Required/optional upload counts for the documents that apply to this application. */
export function getLoanDocumentProgress(
  requirements: LoanDocumentRequirement[],
  uploads: Record<string, LoanDocumentUpload>
): LoanDocumentProgress {
  const isUploaded = (req: LoanDocumentRequirement): boolean =>
    Boolean(
      uploads[req.id] &&
        !validateLoanDocumentFile(
          {
            uri: uploads[req.id].fileUri,
            name: uploads[req.id].fileName,
            size: uploads[req.id].fileSize,
            mimeType: uploads[req.id].mimeType,
          },
          req
        )
    );
  const required = requirements.filter((req) => req.isMandatory);
  const optional = requirements.filter((req) => !req.isMandatory);
  const missingRequiredIds = required
    .filter((req) => !isUploaded(req))
    .map((req) => req.id);

  return {
    requiredTotal: required.length,
    requiredUploaded: required.length - missingRequiredIds.length,
    optionalTotal: optional.length,
    optionalUploaded: optional.filter(isUploaded).length,
    missingRequiredIds,
    isComplete: missingRequiredIds.length === 0,
  };
}

export interface LoanDocumentChecklistItem {
  id: string;
  name: string;
  isMandatory: boolean;
  isUploaded: boolean;
  fileName?: string;
}

/** Read-only upload status of every document that applies to this application. */
export function getLoanDocumentChecklist(
  requirements: LoanDocumentRequirement[],
  uploads: Record<string, LoanDocumentUpload>
): LoanDocumentChecklistItem[] {
  return requirements.map((req) => {
    const stored = uploads[req.id];
    return {
      id: req.id,
      name: req.name,
      isMandatory: req.isMandatory,
      isUploaded: Boolean(
        stored &&
          !validateLoanDocumentFile(
            {
              uri: stored.fileUri,
              name: stored.fileName,
              size: stored.fileSize,
              mimeType: stored.mimeType,
            },
            req
          )
      ),
      fileName: stored?.fileName,
    };
  });
}
