import React from "react";
import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";

interface NoticeUploadCardProps {
  fileName?: string;
  fileSize?: string;
  onUploadSuccess: (fileInfo: {
    uri: string;
    name: string;
    size: string;
  }) => void;
  onRemove?: () => void;
  error?: string;
}

export const NoticeUploadCard: React.FC<NoticeUploadCardProps> = ({
  fileName,
  fileSize,
  onUploadSuccess,
  onRemove,
  error,
}) => {
  return (
    <SharedItrDocumentCard
      item={{
        id: "tax_notice_main",
        title: "Income Tax Notice",
        subtitle: "Upload the notice you received from the Income Tax Dept.",
        isMandatory: true,
        status: fileName ? "uploaded" : "not_uploaded",
        fileName: fileName,
        fileSize: fileSize,
        errorMessage: error,
        iconType: "business_income",
      }}
      onUploadSuccess={(_, payload) => {
        onUploadSuccess({
          uri: payload.uri,
          name: payload.name,
          size: payload.size,
        });
      }}
      onRemove={() => {
        if (onRemove) onRemove();
      }}
    />
  );
};

export default NoticeUploadCard;
