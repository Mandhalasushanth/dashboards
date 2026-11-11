/**
 * Component: GstReviewStep
 * Refactored: Extracted repetitive rows to ReviewRow and reused DocumentPreviewModal.
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors, Colors } from "@/shared/theme";
import { GstBusinessFormData } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import { DocumentItem } from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep.types";
import { GstViewDocumentModal } from "@/modules/gst/components/GstDocumentCard";
import { styles } from "./GstReviewStep.styles";

interface GstReviewStepProps {
  businessData: GstBusinessFormData;
  documents: DocumentItem[];
  onEditStep: (stepIndex: number, sectionName?: string) => void;
  declared: boolean;
  onToggleDeclaration: () => void;
  isFetching?: boolean;
  reviewFetchError?: string | null;
  onRetry?: () => void;
}

const ReviewRow = ({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text
      style={[styles.value, multiline && styles.valueMultiline]}
      numberOfLines={multiline ? undefined : 1}
    >
      {value || "-"}
    </Text>
  </View>
);

const maskBankAccountNumber = (accountNumber?: string): string => {
  if (!accountNumber) return "-";
  const clean = accountNumber.trim();
  if (clean.length <= 4) return clean;
  return `XXXX${clean.slice(-4)}`;
};

export const GstReviewStep: React.FC<GstReviewStepProps> = ({
  businessData,
  documents,
  onEditStep,
  declared,
  onToggleDeclaration,
  isFetching = false,
  reviewFetchError = null,
  onRetry,
}) => {
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const uploadedDocs = documents.filter((d) => Boolean(d.fileUri));

  if (isFetching && !businessData.legalName) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>
          Retrieving Application Data
        </Text>
        <Text style={styles.loadingSubtitle}>
          Fetching saved details from database...
        </Text>
      </View>
    );
  }

  if (reviewFetchError && !businessData.legalName) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={[styles.loadingTitle, { marginTop: 12 }]}>Unable to Load Application</Text>
        <Text style={[styles.loadingSubtitle, { textAlign: "center", marginHorizontal: 24 }]}>{reviewFetchError}</Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={[styles.modalFooterBtn, { width: 180, marginTop: 16 }]}
            activeOpacity={0.8}
          >
            <Text style={styles.modalFooterBtnText}>Retry Loading</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Business Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Business Details</Text>
          <TouchableOpacity onPress={() => onEditStep(0, "business")} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <ReviewRow label="Legal Name" value={businessData.legalName} />
        <ReviewRow label="Trade Name" value={businessData.businessName} />
        <ReviewRow label="Constitution" value={businessData.businessType} />
        <ReviewRow
          label="Nature of Business"
          value={businessData.natureOfBusiness}
        />
        <ReviewRow
          label="Date of Commencement"
          value={businessData.businessStartDate}
        />
        <ReviewRow label="Business PAN" value={businessData.businessPan} />
        <ReviewRow
          label="Reason for Reg."
          value={businessData.reasonForRegistration}
        />
        <ReviewRow
          label="Composition Scheme"
          value={businessData.compositionScheme}
        />
        <ReviewRow
          label="Place of Business"
          value={businessData.placeOfBusiness}
        />
        <ReviewRow
          label="Address"
          value={businessData.businessAddress}
          multiline
        />
        <ReviewRow
          label="Location"
          value={`${businessData.city ? businessData.city + ", " : ""}${businessData.district ? businessData.district + ", " : ""}${businessData.state || ""} - ${businessData.pinCode || ""}`}
          multiline
        />
        <ReviewRow label="HSN / SAC Code" value={businessData.hsnCode} />
      </View>

      {/* 2. Bank Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Bank Details</Text>
          <TouchableOpacity onPress={() => onEditStep(0, "bank")} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <ReviewRow
          label="Account Holder"
          value={businessData.accountHolderName}
        />
        <ReviewRow
          label="Account Number"
          value={maskBankAccountNumber(businessData.bankAccountNumber)}
        />
        <ReviewRow label="IFSC Code" value={businessData.ifscCode} />
        <ReviewRow
          label="Bank & Branch"
          value={`${businessData.bankName || "-"} (${businessData.branchName || "-"})`}
          multiline
        />
        <ReviewRow label="Account Type" value={businessData.accountType} />
      </View>

      {/* 3. Authorised Signatory Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Authorised Signatory</Text>
          <TouchableOpacity onPress={() => onEditStep(0, "signatory")} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <ReviewRow label="Name" value={businessData.signatoryName} />
        <ReviewRow label="PAN" value={businessData.signatoryPan} />
        <ReviewRow label="DOB" value={businessData.signatoryDob} />
        <ReviewRow
          label="Designation"
          value={businessData.signatoryDesignation}
        />
        <ReviewRow
          label="Contact"
          value={
            businessData.signatoryMobile
              ? businessData.signatoryMobile.startsWith("+91")
                ? businessData.signatoryMobile
                : `+91 ${businessData.signatoryMobile}`
              : "-"
          }
        />
        <ReviewRow
          label="Email"
          value={businessData.signatoryEmail || "-"}
          multiline
        />
      </View>

      {/* 4. Documents Summary Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Uploaded Documents</Text>
          <TouchableOpacity
            style={styles.editDocsButton}
            onPress={() => onEditStep(1, "documents")}
            accessibilityLabel="Edit Uploaded Documents"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color={BrandColors.PRIMARY_ORANGE} />
            <Text style={styles.editDocsButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {uploadedDocs.length > 0 && (
          <View style={styles.uploadedDocList}>
            {uploadedDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.uploadedDocItem}
                activeOpacity={0.7}
                onPress={() => setPreviewDoc(doc)}
              >
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <View style={styles.uploadedDocTextCol}>
                  <Text style={styles.uploadedDocName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  {doc.id === "address-proof" && (
                    <Text style={styles.uploadedDocSubtitle}>
                      {doc.subtitle}
                    </Text>
                  )}
                </View>
                {Platform.OS === "ios" ? (
                  <TouchableOpacity
                    style={styles.eyeIconBox}
                    activeOpacity={0.7}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      setPreviewDoc(doc);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Preview ${doc.name}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={18}
                      color={BrandColors.PRIMARY_BLUE}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.eyeIconBox}>
                    <Ionicons
                      name="eye-outline"
                      size={18}
                      color={BrandColors.PRIMARY_BLUE}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 5. Declaration Checkbox Card */}
      <TouchableOpacity
        style={styles.declarationCard}
        activeOpacity={0.8}
        onPress={onToggleDeclaration}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: declared }}
        accessibilityLabel="Declaration: I hereby declare that the information provided is true and accurate"
        testID="gst-declaration-checkbox"
      >
        <View style={[styles.checkbox, declared && styles.checkboxActive]}>
          {declared && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.declarationText}>
          I hereby declare that the information provided is true and accurate to
          the best of my knowledge. I authorise Finsolz Finsolz to file
          this application on my behalf.
        </Text>
      </TouchableOpacity>

      {/* Full-Screen Document Preview Modal */}
      <GstViewDocumentModal
        visible={Boolean(previewDoc)}
        title={previewDoc?.name || "Document Preview"}
        fileUri={previewDoc?.fileUri}
        fileName={previewDoc?.fileName}
        fileSize={previewDoc?.fileSize}
        fileTypeLabel={
          (previewDoc as unknown as Record<string, unknown>)?.fileTypeLabel as string | undefined ||
          previewDoc?.fileName?.split(".").pop()?.toUpperCase()
        }
        mimeType={previewDoc?.mimeType}
        onClose={() => setPreviewDoc(null)}
      />
    </View>
  );
};
