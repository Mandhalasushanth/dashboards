import type { CancellationFormData } from "../types/gstCancellationTypes";

/** Metadata stored on the tracked "GST Cancellation (REG-16)" application. */
export const buildCancellationApplicationDetails = (
  form: CancellationFormData,
  createdArn: string,
  submissionDate: string
) => ({
  gstin: form.gstin,
  reason: form.reason === "Other Valid Reason" ? form.otherReason : form.reason,
  cancellationDate: form.cancellationDate,
  closingStock: form.closingStock,
  pendingLiabilities: form.pendingLiabilities,
  lastGstr3b: form.lastGstr3b,
  arn: createdArn,
  appliedDate: submissionDate,
});
