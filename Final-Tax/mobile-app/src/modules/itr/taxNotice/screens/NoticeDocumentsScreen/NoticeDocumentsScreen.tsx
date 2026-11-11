import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TaxNoticeHeader } from "../../components/common";
import { NoticeDocUploadCard } from "../../components/documents";
import { INITIAL_TAX_NOTICE_DOCUMENTS } from "../../mock/taxNoticeData";
import { TaxNoticeSupportingDoc } from "../../types/taxNotice.types";
import { useApplicationStore } from "@/store/applicationStore";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { taxNoticeApi } from "../../../services/taxNoticeApi";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
  getProgressFillWidthStyle,
} from "./NoticeDocumentsScreen.styles";

export const NoticeDocumentsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    pan?: string;
    noticeNumber?: string;
    noticeDate?: string;
    responseDueDate?: string;
    noticeType?: string;
    noticeId?: string;
    assessmentYear?: string;
  }>();

  const taxNoticeDraft = useApplicationStore((state) => state.taxNoticeDraft);
  const saveTaxNoticeDraft = useApplicationStore((state) => state.saveTaxNoticeDraft);
  const clearTaxNoticeDraft = useApplicationStore((state) => state.clearTaxNoticeDraft);

  const assessmentYear =
    params.assessmentYear ||
    taxNoticeDraft?.formData?.assessmentYear ||
    "AY 2025–26";

  // Pure functional initial state: restore from draft or start clean
  const [docs, setDocs] = useState<TaxNoticeSupportingDoc[]>(() => {
    const savedDocs = taxNoticeDraft?.documents;
    const noticeFile = taxNoticeDraft?.formData?.noticeFileName;
    const noticeUri = taxNoticeDraft?.formData?.noticeFileUri;
    const noticeSize = taxNoticeDraft?.formData?.noticeFileSize;

    const savedMap = new Map((savedDocs || []).map((d) => [d.id, d]));

    return INITIAL_TAX_NOTICE_DOCUMENTS.map((doc) => {
      // Auto-link primary tax notice if uploaded in step 2
      if (doc.id === "doc-notice" && noticeFile && !savedMap.has("doc-notice")) {
        return {
          ...doc,
          status: "uploaded" as const,
          fileName: noticeFile,
          fileUri: noticeUri,
          fileSize: noticeSize || "PDF",
        };
      }

      const saved = savedMap.get(doc.id);
      if (saved) {
        return {
          ...doc,
          status: saved.status,
          fileName: saved.fileName,
          fileUri: saved.fileUri,
          fileSize: saved.fileSize,
          mimeType: saved.mimeType,
        };
      }

      if (doc.id === "doc-ais") {
        return {
          ...doc,
          title: `AIS (${assessmentYear})`,
        };
      }
      return doc;
    });
  });

  const [remarks, setRemarks] = useState(taxNoticeDraft?.remarks || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadedCount = docs.filter(
    (d) => d.status === "uploaded" || !!d.fileUri
  ).length;
  const totalCount = docs.length;
  const percent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  // Universal Draft Guard Hook for exit interception
  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    saveDestination: "/service/itr",
    discardDestination: "/service/itr",
    isDirty: () =>
      docs.some((d) => Boolean(d.fileUri || d.status === "uploaded")) ||
      Boolean(remarks.trim()),
    onSaveDraft: () => {
      saveTaxNoticeDraft({
        formData: {
          ...(taxNoticeDraft?.formData || {}),
          ...params,
        },
        documents: docs,
        remarks,
        step: "DOCUMENTS",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onDiscardDraft: () => {
      clearTaxNoticeDraft();
    },
  });

  const handleUploadSuccess = (
    id: string,
    fileInfo: { uri: string; name: string; size: string }
  ) => {
    const updated = docs.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "uploaded" as const,
            fileUri: fileInfo.uri,
            fileName: fileInfo.name,
            fileSize: fileInfo.size,
          }
        : d
    );
    setDocs(updated);

    // Persist immediately in draft store
    saveTaxNoticeDraft({
      formData: {
        ...(taxNoticeDraft?.formData || {}),
        ...params,
      },
      documents: updated,
      remarks,
      step: "DOCUMENTS",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  };

  const handleRemoveDocument = (id: string) => {
    const updated = docs.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "not_uploaded" as const,
            fileUri: undefined,
            fileName: undefined,
            fileSize: undefined,
          }
        : d
    );
    setDocs(updated);
    saveTaxNoticeDraft({
      formData: { ...(taxNoticeDraft?.formData || {}), ...params },
      documents: updated,
      remarks,
      step: "DOCUMENTS",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  };

  const handleSubmitDocuments = async () => {
    const missingRequiredDocs = docs.filter((d) => d.isMandatory && d.status !== "uploaded" && !d.fileUri);
    if (missingRequiredDocs.length > 0) {
      Alert.alert(
        "Missing Required Documents",
        "Please upload all mandatory documents (marked with *) before continuing."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const noticeId = params.noticeId as string;
      if (!noticeId) {
        Alert.alert("Error", "Missing Notice ID. Please restart the process.");
        return;
      }

      // Map frontend doc IDs to Backend API request parts
      const docKeyMap: Record<string, string> = {
        "doc-notice": "taxNotice",
        "doc-prev-itr": "previousItr",
        "doc-itr-ack": "itrAcknowledgement",
        "doc-form-16": "form1616a",
        "doc-ais": "aisAy",
        "doc-tis": "tis",
        "doc-bank": "bankStatement",
        "doc-income": "supportingIncomeDocuments",
        "doc-expense": "supportingExpenseDocuments",
        "doc-prev-responses": "previousTaxResponses",
        "doc-other": "otherNoticeSpecificDocuments",
      };

      const mappedDocs: Record<string, any> = {};
      docs.forEach((doc: any) => {
        if (doc.status === "uploaded" && doc.fileUri) {
          const backendKey = docKeyMap[doc.id];
          if (backendKey) {
            mappedDocs[backendKey] = {
              uri: doc.fileUri,
              name: doc.fileName || doc.id + ".pdf",
              mimeType: doc.mimeType || "application/pdf"
            };
          }
        }
      });

      if (Object.keys(mappedDocs).length > 0) {
        await taxNoticeApi.registerDocuments(noticeId, mappedDocs);
      }

      // Save to draft for UI flow
      saveTaxNoticeDraft({
        formData: {
          ...(taxNoticeDraft?.formData || {}),
          ...params,
        },
        documents: docs,
        remarks,
        step: "REVIEW",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      router.push({
        pathname: "/service/tax-notice-preview" as any,
        params: {
          noticeId,
          pan: params.pan || taxNoticeDraft?.formData?.pan,
          noticeNumber: params.noticeNumber || taxNoticeDraft?.formData?.noticeNumber,
          noticeDate: params.noticeDate || taxNoticeDraft?.formData?.noticeDate,
          assessmentYear: assessmentYear,
          noticeType: params.noticeType || taxNoticeDraft?.formData?.noticeType,
        },
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert("Upload Failed", err.message || "Failed to upload documents.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocIcon = (id: string): keyof typeof Ionicons.glyphMap => {
    switch (id) {
      case "doc-notice":
        return "document-text-outline";
      case "doc-prev-itr":
        return "receipt-outline";
      case "doc-itr-ack":
        return "checkmark-done-circle-outline";
      case "doc-form-16":
        return "newspaper-outline";
      case "doc-ais":
        return "analytics-outline";
      case "doc-tis":
        return "calculator-outline";
      case "doc-bank":
        return "business-outline";
      case "doc-income":
        return "trending-up-outline";
      case "doc-expense":
        return "wallet-outline";
      case "doc-prev-responses":
        return "chatbubbles-outline";
      case "doc-other":
        return "folder-open-outline";
      default:
        return "document-outline";
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <TaxNoticeHeader
        subtitle="Supporting Documents"
        onBack={openDraftModal}
        
      />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Upload Supporting Documents</Text>
          <Text style={styles.pageSubtitle}>
            Upload the documents relevant to this notice. This enables our Tax Executive to verify figures and formulate your legal response.
          </Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <Text style={styles.counterText}>
            {uploadedCount} of {totalCount} documents uploaded
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, getProgressFillWidthStyle(percent)]} />
          </View>
        </View>

        {/* 11 Document Cards */}
        {docs.map((doc) => (
          <NoticeDocUploadCard
            key={doc.id}
            item={doc}
            iconName={getDocIcon(doc.id)}
            onUploadSuccess={handleUploadSuccess}
              onRemove={handleRemoveDocument}
          />
        ))}

        {/* Remarks Input */}
        <View style={styles.remarksSection}>
          <Text style={styles.remarksLabel}>Remarks / Special Instructions (Optional)</Text>
          <TextInput maxLength={500}
            style={styles.remarksInput}
            placeholder="Add any additional context, transaction details, or explanation for our Tax Executive..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={remarks}
                  onChangeText={setRemarks}
          />
          <Text style={styles.charCounter}>{remarks.length}/500</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmitDocuments}
          style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>{taxNoticeDraft?.step === "REVIEW" ? "Update & Continue" : "Submit Documents & Review Response"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Universal Draft Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Uploaded Documents?"
        message="Your uploaded files will be saved in your draft so you can resume anytime without re-uploading."
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default NoticeDocumentsScreen;

