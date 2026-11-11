import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDocumentUploadHelper } from "@/shared/hooks/useDocumentUploadHelper";
import { useLoansStore } from "../store/loansStore";
import {
  DEFAULT_ALLOWED_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "../constants/loanDocuments";
import {
  toLoanDocumentUpload,
  validateLoanDocumentFile,
} from "../validation/loanDocumentsValidation";
import type { LoanDocumentRequirement } from "../types/loanReview.types";

const UPLOAD_FAILED_MESSAGE =
  "We couldn't upload this document. Please try again.";
const TOO_LARGE_PREFIX = "File size exceeds";

/**
 * Upload behaviour for the loan documents screen. File picking, permissions and the
 * bottom sheet are the shared Finsolz implementation; this hook only maps a picked
 * file to a loan document requirement and keeps customer-friendly per-document errors.
 */
export function useLoanDocumentUpload(requirements: LoanDocumentRequirement[]) {
  const uploadedDocuments = useLoansStore((state) => state.uploadedDocuments);
  const setDocumentAttachment = useLoansStore(
    (state) => state.setDocumentAttachment
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const requirementsRef = useRef(requirements);
  const closeSheetRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    requirementsRef.current = requirements;
  }, [requirements]);

  const setError = useCallback((docId: string, message: string | null) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[docId] = message;
      else delete next[docId];
      return next;
    });
  }, []);

  const helper = useDocumentUploadHelper({
    maxSizeMB: MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024),
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    onProcessingStart: (docId) => {
      if (docId) setProcessingId(docId);
    },
    onCancel: () => setProcessingId(null),
    onSuccess: (file, docId) => {
      setProcessingId(null);
      const requirement = requirementsRef.current.find((r) => r.id === docId);
      if (!requirement) return;
      const problem = validateLoanDocumentFile(file, requirement);
      if (problem) {
        setError(requirement.id, problem);
        return;
      }
      setError(requirement.id, null);
      setDocumentAttachment(
        requirement.id,
        toLoanDocumentUpload(requirement, file)
      );
    },
    onError: (message, docId) => {
      setProcessingId(null);
      closeSheetRef.current();
      if (!docId) return;
      setError(
        docId,
        message.startsWith(TOO_LARGE_PREFIX)
          ? "This file is too large. Please upload a file under 10 MB."
          : UPLOAD_FAILED_MESSAGE
      );
    },
  });

  useEffect(() => {
    closeSheetRef.current = helper.closeUploadSheet;
  }, [helper.closeUploadSheet]);

  const openSheet = useCallback(
    (requirement: LoanDocumentRequirement) => {
      setError(requirement.id, null);
      helper.openUploadSheet(requirement.id, requirement.name);
    },
    [helper, setError]
  );

  const removeDocument = useCallback(
    (docId: string) => {
      setError(docId, null);
      setDocumentAttachment(docId, null);
    },
    [setDocumentAttachment, setError]
  );

  const activeRequirement = useMemo(
    () => requirements.find((r) => r.id === helper.activeDocKey) ?? null,
    [requirements, helper.activeDocKey]
  );

  const takePhoto = useCallback(() => {
    if (activeRequirement && !activeRequirement.uploadSources.includes("camera")) {
      return;
    }
    helper.takePhoto();
  }, [activeRequirement, helper]);

  return {
    uploadedDocuments,
    errors,
    processingId,
    openSheet,
    removeDocument,
    activeRequirement,
    isSheetVisible: helper.isSheetVisible,
    closeSheet: helper.closeUploadSheet,
    pickFiles: helper.pickFiles,
    takePhoto,
  };
}
