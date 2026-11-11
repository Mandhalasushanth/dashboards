import React from "react";
import { DocumentUploadBottomSheet } from "@/shared/components/DocumentUploadBottomSheet";

export interface GstUploadSourceModalProps {
  visible: boolean;
  documentTitle: string;
  maxSizeText?: string;
  onChooseFiles: () => void;
  onSelectGallery?: () => void;
  onTakePhoto: () => void;
  onClose: () => void;
}

export const GstUploadSourceModal: React.FC<GstUploadSourceModalProps> = ({
  visible,
  documentTitle,
  maxSizeText = "10 MB",
  onChooseFiles,
  onSelectGallery,
  onTakePhoto,
  onClose,
}) => {
  return (
    <DocumentUploadBottomSheet
      visible={visible}
      documentTitle={documentTitle}
      maxSizeText={maxSizeText}
      onPickFiles={onChooseFiles}
      onPickGallery={onSelectGallery}
      onTakePhoto={onTakePhoto}
      onClose={onClose}
      allowGallery={Boolean(onSelectGallery)}
    />
  );
};

export default GstUploadSourceModal;
