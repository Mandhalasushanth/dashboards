/**
 * Component: GstUnifiedDocumentStep
 * Uses the Global GstDocumentCard with Image 4 ITR Checklist styling.
 */

import React, { useState } from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstUnifiedDocumentStep.styles";
import { AddressProofSelectModal } from "./GstDocumentModals";
import { GstDocumentCard } from "@/modules/gst/components/GstDocumentCard";
import {
  DocumentItem,
  isDocumentUploaded,
} from "./GstUnifiedDocumentStep.types";

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "pan",
    name: "PAN Card",
    subtitle: "Front copy with clear name & photo",
    required: true,
    iconName: "card",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    category: "Identity Proof",
  },
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    subtitle: "Front & back copy with QR code",
    required: true,
    iconName: "finger-print",
    iconBg: "#F3E8FF",
    iconColor: "#7E22CE",
    category: "Identity Proof",
  },
  {
    id: "business-proof",
    name: "Business Registration Proof",
    subtitle: "COI / Partnership Deed / Trade License",
    required: true,
    iconName: "document-text",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Business Proof",
  },
  {
    id: "address-proof",
    name: "Principal Place Address Proof",
    subtitle: "Electricity Bill / Rental Agreement",
    required: true,
    iconName: "home",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    category: "Business Proof",
  },
  {
    id: "bank-statement",
    name: "Bank Passbook / Cancelled Cheque",
    subtitle: "Showing account holder name, A/C & IFSC",
    required: true,
    iconName: "business",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    category: "Financial & Signatory",
  },
  {
    id: "photograph",
    name: "Passport Size Photograph",
    subtitle: "Recent colour photo with white background",
    required: true,
    iconName: "image",
    iconBg: "#FEF0E6",
    iconColor: BrandColors.PRIMARY_ORANGE,
    category: "Financial & Signatory",
  },
];


const DOCUMENT_CATEGORIES: readonly (DocumentItem["category"])[] = [
  "Identity Proof",
  "Business Proof",
  "Financial & Signatory",
] as const;

interface Props {
  documents: DocumentItem[];
  onUpdateDocument: (docId: string, patch: Partial<DocumentItem>) => void;
  onRetryUpload?: (docId: string) => void;
  isUploading?: boolean;
}

export const GstUnifiedDocumentStep: React.FC<Props> = ({
  documents,
  onUpdateDocument,
}) => {
  const [showAddressProofModal, setShowAddressProofModal] = useState(false);
  const [addressUploadTrigger, setAddressUploadTrigger] = useState(0);
  const [pendingAddressProofType, setPendingAddressProofType] = useState<string | null>(null);

  const uploadedCount = documents.reduce(
    (c, d) => (isDocumentUploaded(d) ? c + 1 : c),
    0,
  );
  const selectedCount = documents.reduce((c, d) => (d.fileUri ? c + 1 : c), 0);
  const totalCount = documents.length;

  const currentAddressDoc = documents.find((d) => d.id === "address-proof");

  return (
    <View style={styles.container}>
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View style={styles.progressTitleCol}>
            <Text style={styles.progressTitle}>Document Checklist</Text>
            <Text style={styles.progressSubtitle}>
              Upload original clear photos or scanned copies
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {selectedCount}/{totalCount} Added
            </Text>
          </View>
        </View>
        {selectedCount > 0 && (
          <Text style={styles.progressSubtitle}>
            {uploadedCount} of {selectedCount} sent to Finsolz. Remaining
            documents upload when you tap Continue.
          </Text>
        )}
      </View>

      {DOCUMENT_CATEGORIES.map((category) => {
        const categoryDocs = documents.filter(
          (doc) => doc.category === category,
        );
        return categoryDocs.length === 0 ? null : (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.docsList}>
              {categoryDocs.map((doc) => (
                <GstDocumentCard
                  key={doc.id}
                  item={{
                    id: doc.id,
                    name: doc.name,
                    subtitle: doc.subtitle,
                    required: doc.required,
                    fileUri: doc.fileUri,
                    fileName: doc.fileName,
                    fileSize: doc.fileSize,
                    iconName: doc.iconName as any,
                    iconBg: doc.iconBg,
                    iconColor: doc.iconColor,
                    category: doc.category,
                    status: doc.fileUri ? "uploaded" : undefined,
                    errorMessage: doc.uploadError,
                  }}
                  isDropdownSelector={doc.id === "address-proof"}
                  dropdownValue={doc.subtitle}
                  triggerUploadKey={
                    doc.id === "address-proof" ? addressUploadTrigger : undefined
                  }
                  onDropdownPress={() => setShowAddressProofModal(true)}
                  onUploadSuccess={(id, asset) => {
                    const patch: Partial<DocumentItem> = {
                      fileUri: asset.uri,
                      fileName: asset.name,
                      fileSize: asset.size,
                      mimeType: asset.mimeType,
                      uploadedAt: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      uploadStatus: undefined,
                      uploadError: undefined,
                    };
                    if (id === "address-proof") {
                      const proofType = pendingAddressProofType || doc.subtitle || "Principal Place Address Proof";
                      patch.subtitle = proofType;
                      patch.proofType = proofType;
                      setPendingAddressProofType(null);
                    }
                    onUpdateDocument(id, patch);
                  }}
                  onUploadError={(id, msg) => {
                    if (id === "address-proof") {
                      setPendingAddressProofType(null);
                    }
                    onUpdateDocument(id, { uploadError: msg });
                  }}
                  onRemove={(id) => {
                    if (id === "address-proof") {
                      setPendingAddressProofType(null);
                    }
                    onUpdateDocument(id, {
                      fileUri: undefined,
                      fileName: undefined,
                      fileSize: undefined,
                      mimeType: undefined,
                      uploadedAt: undefined,
                      uploadStatus: undefined,
                      uploadError: undefined,
                    });
                  }}
                />
              ))}
            </View>
          </View>
        );
      })}

      <View style={styles.infoCallout}>
        <Ionicons
          name="shield-checkmark"
          size={20}
          color={BrandColors.PRIMARY_BLUE}
        />
        <Text style={styles.infoCalloutText}>
          Your documents are encrypted and safely stored in compliance with GST
          data protection standards.
        </Text>
      </View>

      <AddressProofSelectModal
        visible={showAddressProofModal}
        currentValue={pendingAddressProofType || currentAddressDoc?.subtitle}
        onClose={() => {
          setShowAddressProofModal(false);
          setPendingAddressProofType(null);
        }}
        onSelect={(p) => {
          setPendingAddressProofType(p);
          onUpdateDocument("address-proof", {
            subtitle: p,
            proofType: p,
          });
          setShowAddressProofModal(false);
          setAddressUploadTrigger((prev) => prev + 1);
        }}
      />
    </View>
  );
};
