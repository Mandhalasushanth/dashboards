import React from "react";
import { BusinessDocumentItem } from "../../../types/documentUpload.types";
import { SharedItrDocumentCard } from "../SharedItrDocumentCard/SharedItrDocumentCard";

interface DocumentUploadCardProps {
  item: BusinessDocumentItem;
  onUploadSuccess: (
    id: string,
    payload: { uri: string; name: string; size: string; mimeType?: string; fileTypeLabel?: string }
  ) => void;
  onRemove: (id: string) => void;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  item,
  onUploadSuccess,
  onRemove,
}) => {
  return (
    <SharedItrDocumentCard
      item={{
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        // Business documents don't explicitly have an isMandatory flag in the type, but we map status
        status: item.status,
        fileUri: item.fileUri,
        fileName: item.fileName,
        fileSize: item.fileSize,
        mimeType: item.mimeType,
        iconType: item.iconType,
        errorMessage: item.status === "rejected" ? "Document was rejected. Please re-upload." : undefined,
      }}
      onUploadSuccess={onUploadSuccess}
      onRemove={onRemove}
    />
  );
};

export default DocumentUploadCard;
