import React from "react";
import { TaxNoticeSupportingDoc } from "../../../types/taxNotice.types";
import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";

interface NoticeDocUploadCardProps {
  item: TaxNoticeSupportingDoc;
  iconName: any;
  onUploadSuccess: (id: string, fileInfo: { uri: string; name: string; size: string; mimeType?: string }) => void;
  onRemove?: (id: string) => void;
  hasError?: boolean;
}

export const NoticeDocUploadCard: React.FC<NoticeDocUploadCardProps> = ({ 
  item, 
  iconName, 
  onUploadSuccess, 
  onRemove, 
  hasError 
}) => {
  return (
    <SharedItrDocumentCard
      item={{
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        isMandatory: item.isMandatory,
        status: item.status,
        fileUri: item.fileUri,
        fileName: item.fileName,
        fileSize: item.fileSize,
        errorMessage: hasError ? "Please upload this document." : undefined,
        iconType: "business_income", // Reusing a default since TaxNotice used raw Ionicons before
      }}
      onUploadSuccess={(id, payload) => {
        onUploadSuccess(id, {
          uri: payload.uri,
          name: payload.name,
          size: payload.size,
          mimeType: payload.mimeType,
        });
      }}
      onRemove={(id) => {
        if (onRemove) onRemove(id);
      }}
    />
  );
};

export default NoticeDocUploadCard;
