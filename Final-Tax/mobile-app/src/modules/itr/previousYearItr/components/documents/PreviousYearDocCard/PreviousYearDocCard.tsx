import React from "react";
import { PreviousYearDocItem } from "../../../types/document.types";
import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";

interface PreviousYearDocCardProps {
  item: PreviousYearDocItem;
  onUploadSuccess: (
    id: string,
    fileInfo: { uri: string; name: string; size: string }
  ) => void;
  onRemove?: (id: string) => void;
}

export const PreviousYearDocCard: React.FC<PreviousYearDocCardProps> = ({
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
        status: item.status,
        fileUri: item.fileUri,
        fileName: item.fileName,
        fileSize: item.fileSize,
        iconType: item.iconType, // Maps perfectly or defaults in SharedItrDocumentCard
      }}
      onUploadSuccess={(id, payload) => {
        onUploadSuccess(id, {
          uri: payload.uri,
          name: payload.name,
          size: payload.size,
        });
      }}
      onRemove={(id) => {
        if (onRemove) onRemove(id);
      }}
    />
  );
};

export default PreviousYearDocCard;
