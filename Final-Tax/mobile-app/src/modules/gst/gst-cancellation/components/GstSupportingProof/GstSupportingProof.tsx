import React from "react";
import { Text } from "react-native";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstSupportingProof.styles";
import { CancellationDoc } from "../../types/gstCancellationTypes";
import { GstDocumentCard } from "@/modules/gst/components/GstDocumentCard";

interface GstSupportingProofProps {
  supportingDoc: CancellationDoc | null;
  setSupportingDoc: (doc: CancellationDoc | null) => void;
  handleBrowseFiles?: () => void;
  handleScanFile?: () => void;
}

export function GstSupportingProof({
  supportingDoc,
  setSupportingDoc,
}: GstSupportingProofProps) {
  return (
    <>
      <Text style={styles.formSectionTitle}>Supporting proof</Text>

      <GstDocumentCard
        item={{
          id: "cancellation-proof",
          name: "Cancellation Proof Document",
          subtitle: "Attach official document evidencing cancellation reason (max 10 MB)",
          required: true,
          fileUri: supportingDoc?.uri,
          fileName: supportingDoc?.name,
          fileSize: supportingDoc?.size,
          iconName: "document-text",
          iconBg: "#EFF6FF",
          iconColor: BrandColors.PRIMARY_BLUE,
        }}
        onUploadSuccess={(_id, asset) => {
          setSupportingDoc({
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            mimeType: asset.mimeType,
          });
        }}
        onRemove={() => setSupportingDoc(null)}
      />
    </>
  );
}

export default GstSupportingProof;
