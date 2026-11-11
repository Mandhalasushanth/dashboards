import React from "react";
import { GstDocumentCard } from "@/modules/gst/components/GstDocumentCard";
import { FilingDocItem } from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";

interface GstDocItemCardProps {
  doc: FilingDocItem;
  filingNature?: "Regular Return" | "Nil Return";
  onUploadSuccess: (
    id: string,
    asset: { uri: string; name: string; size: string }
  ) => void;
  onRemoveDoc: (id: string) => void;
}

export const GstDocItemCard: React.FC<GstDocItemCardProps> = ({
  doc,
  filingNature,
  onUploadSuccess,
  onRemoveDoc,
}) => {
  return (
    <GstDocumentCard
      item={{
        id: doc.id,
        name: doc.name,
        subtitle: doc.subtitle,
        required: Boolean(doc.required && filingNature !== "Nil Return"),
        fileUri: doc.fileUri,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        iconName: doc.iconName as any,
        iconBg: doc.iconBg,
        iconColor: doc.iconColor,
      }}
      onUploadSuccess={(id, asset) => {
        onUploadSuccess(id, {
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
        });
      }}
      onRemove={(id) => onRemoveDoc(id)}
    />
  );
};

export default GstDocItemCard;
