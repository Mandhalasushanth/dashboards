import React from "react";
import { TdsDocumentItem, DocumentUploadPayload } from "../../../types/tdsDocuments.types";
import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";

interface TdsDocumentCardProps {
  item: TdsDocumentItem;
  onUploadSuccess: (id: string, payload: DocumentUploadPayload) => void;
  onUploadError: (id: string, errorMessage: string) => void;
  onRemove: (id: string) => void;
}

export const TdsDocumentCard: React.FC<TdsDocumentCardProps & { variant?: "default" | "inline" }> = ({
  item,
  variant = "default",
  onUploadSuccess,
  onUploadError, // Note: SharedItrDocumentCard handles its own internal upload error via Alert, but we map the rest
  onRemove,
}) => {
  return (
    <SharedItrDocumentCard
      variant={variant}
      item={{
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        isMandatory: item.isMandatory,
        status: item.status,
        fileUri: item.fileUri,
        fileName: item.fileName,
        fileSize: item.fileSize,
        errorMessage: item.errorMessage,
        iconType: item.iconType,
      }}
      onUploadSuccess={(id, payload) => {
        // Map the shared payload back to the TDS specific DocumentUploadPayload
        onUploadSuccess(id, {
          uri: payload.uri,
          name: payload.name,
          size: payload.size,
          mimeType: payload.mimeType,
          fileTypeLabel: payload.fileTypeLabel,
        });
      }}
      onRemove={onRemove}
    />
  );
};

export default TdsDocumentCard;
