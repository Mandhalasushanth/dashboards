import React from "react";
import { DocumentUploadBottomSheet } from "@/modules/itr/tds/components/upload/DocumentUploadBottomSheet/DocumentUploadBottomSheet";

export interface UploadSourceModalProps {
  visible: boolean;
  documentTitle: string;
  maxSizeText?: string;
  onChooseFiles: () => void;
  onSelectGallery: () => void;
  onTakePhoto: () => void;
  onClose: () => void;
}

export const UploadSourceModal: React.FC<UploadSourceModalProps> = ({
  visible,
  documentTitle,
  maxSizeText,
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
      allowGallery={Boolean(onSelectGallery)}
      onTakePhoto={onTakePhoto}
      onClose={onClose}
    />
  );
};

export default UploadSourceModal;
