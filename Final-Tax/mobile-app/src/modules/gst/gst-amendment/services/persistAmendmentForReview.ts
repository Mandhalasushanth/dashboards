import { gstAmendmentApi } from "@/modules/gst/services/gstAmendmentApi";
import { logger } from "@/core/logging/logger";
import type { AmendmentFormData, SupportingDoc } from "../types/gstAmendmentTypes";

interface PersistAmendmentParams {
  /** True when the user came back from Review to edit an existing amendment. */
  isEditMode: boolean;
  amendmentId: number | string | null;
  sectionId: string;
  targetGstId: string;
  formData: AmendmentFormData;
  supportingDoc: SupportingDoc | null;
}

interface PersistAmendmentCallbacks {
  /** Called right after a new record is saved, before it is re-fetched. */
  onSaved: (amendmentId: number | string | null) => void;
  /** Called with the record to show on the Review step. */
  onReviewData: (data: unknown) => void;
}

const stripBinaryPayload = (data: unknown): unknown => {
  if (!data || typeof data !== "object") return data;
  const { imageData, ...rest } = data as Record<string, unknown>;
  return rest;
};

/**
 * Saves (POST) or updates (PUT) the amendment record, then re-fetches it by id
 * so the Review step shows what the database holds.
 */
export const persistAmendmentForReview = async (
  { isEditMode, amendmentId, sectionId, targetGstId, formData, supportingDoc }: PersistAmendmentParams,
  { onSaved, onReviewData }: PersistAmendmentCallbacks
): Promise<void> => {
  try {
    if (isEditMode) {
      if (amendmentId !== null && amendmentId !== undefined) {
        // Review Updated Changes: PUT fetch to update record by id
        try {
          const updated = await gstAmendmentApi.updateAmendmentRecord(sectionId, amendmentId, formData, supportingDoc);
          logger.debug("[Review] Updated record in DB by ID:", { amendmentId });
          onReviewData(stripBinaryPayload(updated) || { id: amendmentId, ...formData });
          return;
        } catch (updateErr: any) {
          const isNotFound =
            updateErr?.response?.status === 404 ||
            updateErr?.status === 404 ||
            (typeof updateErr?.message === "string" && updateErr.message.includes("404")) ||
            (typeof updateErr?.message === "string" && updateErr.message.toLowerCase().includes("not found"));

          if (isNotFound) {
            logger.warn("[Review] Stale amendment ID not found (404). Auto-recovering by creating fresh record", { amendmentId });
            const saved = await gstAmendmentApi.saveAmendmentRecord(sectionId, targetGstId, formData, supportingDoc);
            const newId: number | string | null = saved?.id ?? null;
            onSaved(newId);
            onReviewData(stripBinaryPayload(saved));
            return;
          }
          throw updateErr;
        }
      }

      const saved = await gstAmendmentApi.saveAmendmentRecord(sectionId, targetGstId, formData, supportingDoc);
      const newId: number | string | null = saved?.id ?? null;
      onSaved(newId);
      logger.debug("[Review] Saved new record in DB, ID:", { newId });
      onReviewData(stripBinaryPayload(saved));
      return;
    }

    // Review Changes: POST fetch to save data in database
    const saved = await gstAmendmentApi.saveAmendmentRecord(sectionId, targetGstId, formData, supportingDoc);
    const newId: number | string | null = saved?.id ?? null;
    onSaved(newId);
    logger.debug("[Review] Saved amendment in DB, ID:", { newId });
    onReviewData(stripBinaryPayload(saved));
  } catch (err) {
    logger.error("[persistAmendmentForReview] Network save call failed:", { error: err });
    throw err;

  }
};
