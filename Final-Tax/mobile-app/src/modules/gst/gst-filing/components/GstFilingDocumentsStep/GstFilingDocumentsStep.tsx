import React, { useState } from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  DocumentBadgeType,
  FilingDocItem,
  INITIAL_FILING_DOCS,
} from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";
import { styles, getProgressFillStyle } from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/GstFilingDocumentsStep.styles";
import {
  FILING_DOC_CATEGORIES,
  countUploadedDocuments,
  updateDocumentInList,
} from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/gstDocStepUtils";
import { RecursiveCategorySections } from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/RecursiveDocSections";

interface GstFilingDocumentsStepProps {
  documents?: FilingDocItem[];
  onUpdateDocuments?: (updatedDocs: FilingDocItem[]) => void;
  filingPeriodText?: string;
  filingNature?: "Regular Return" | "Nil Return";
}

export const GstFilingDocumentsStep: React.FC<GstFilingDocumentsStepProps> = ({
  documents: externalDocuments,
  onUpdateDocuments,
  filingPeriodText = "GSTR-3B — July 2026",
  filingNature = "Regular Return",
}) => {
  const [internalDocs, setInternalDocs] = useState<FilingDocItem[]>(INITIAL_FILING_DOCS);

  const documents = externalDocuments || internalDocs;

  const setDocs = (newDocs: FilingDocItem[]) => {
    if (onUpdateDocuments) {
      onUpdateDocuments(newDocs);
    } else {
      setInternalDocs(newDocs);
    }
  };

  const uploadedCount = countUploadedDocuments(documents);
  const totalCount = documents.length;
  const progressPercent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  const handleUploadSuccess = (
    docId: string,
    asset: { uri: string; name: string; size: string }
  ) => {
    const updatedList = updateDocumentInList(documents, docId, (doc) => ({
      ...doc,
      fileUri: asset.uri,
      fileName: asset.name,
      fileSize: asset.size,
      uploadedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    setDocs(updatedList);
  };

  const handleRemoveDoc = (docId: string) => {
    const updated = updateDocumentInList(documents, docId, (doc) => ({
      ...doc,
      fileUri: undefined,
      fileName: undefined,
      fileSize: undefined,
      uploadedAt: undefined,
    }));
    setDocs(updated);
  };

  return (
    <View style={styles.container}>
      {/* Top Guidance Advisory */}
      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={18} color="#083B75" />
        <Text style={styles.bannerText}>
          Upload documents for{" "}
          <Text style={styles.boldText}>{filingPeriodText}</Text>. Clear invoices
          help facilitate accurate Input Tax Credit (ITC) reconciliation.
        </Text>
      </View>

      {/* Nil Return Informative Banner */}
      {filingNature === "Nil Return" ? (
        <View style={styles.nilBanner}>
          <Ionicons name="checkmark-done-circle" size={22} color="#15803D" />
          <View style={styles.nilBannerTextCol}>
            <Text style={styles.nilBannerTitle}>Nil Return Selected</Text>
            <Text style={styles.nilBannerSub}>
              Since you have zero sales & purchases for this period, invoice
              uploads are not required. You can optionally upload a bank
              statement or proceed directly to review.
            </Text>
          </View>
        </View>
      ) : null}

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressTitle}>Filing Document Checklist</Text>
            <Text style={styles.progressSubtitle}>
              Required for monthly CA reconciliation
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {uploadedCount}/{totalCount} Completed
            </Text>
          </View>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              getProgressFillStyle(progressPercent),
            ]}
          />
        </View>
      </View>

      {/* Document Category Sections (Loop-free recursion) */}
      <RecursiveCategorySections
        categories={FILING_DOC_CATEGORIES}
        documents={documents}
        filingNature={filingNature}
        onUploadSuccess={handleUploadSuccess}
        onRemoveDoc={handleRemoveDoc}
      />

      {/* Info Callout */}
      <View style={styles.infoCallout}>
        <Ionicons
          name="shield-checkmark"
          size={20}
          color={BrandColors.PRIMARY_BLUE}
        />
        <Text style={styles.infoCalloutText}>
          Finsolz uses end-to-end 256-bit encryption for filing proofs. Only
          certified Chartered Accountants review your books.
        </Text>
      </View>
    </View>
  );
};
