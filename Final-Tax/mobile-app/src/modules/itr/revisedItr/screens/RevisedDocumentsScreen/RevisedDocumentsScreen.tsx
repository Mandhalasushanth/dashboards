import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRevisedProgressStore } from "../../store/revisedProgressStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";
import { RevisedItrApiService } from "../../services/RevisedItrApiService";
import { RevisedItrHeader } from "../../components/common";
import { REVISED_SUPPORTING_DOCUMENTS } from "../../mock/revisedItrData";
import { RevisedDocumentItem } from "../../types/revisedItr.types";
import {
  REVISED_ITR_ALLOWED_EXTENSIONS,
  MAX_REVISED_DOCUMENT_SIZE_BYTES,
  describeUploadError,
} from "../../utils/revisedDocumentUploadHelper";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
} from "./RevisedDocumentsScreen.styles";

export const RevisedDocumentsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    revisionReason?: string;
    revisedDetails?: string;
    isEditing?: string;
  }>();

  const assessmentYear = params.assessmentYear || "AY 2025–26";

  const storeDocuments = useRevisedProgressStore((s) => s.documents);
  const setStoreDocuments = useRevisedProgressStore((s) => s.setDocuments);

  const [documents, setDocumentsState] = useState<RevisedDocumentItem[]>(() =>
    storeDocuments || REVISED_SUPPORTING_DOCUMENTS.map((doc) =>
      doc.id === "doc-3"
        ? {
            ...doc,
            title: `Form 16 / Form 16A (${assessmentYear})`,
          }
        : doc
    )
  );

  const setDocuments = (val: React.SetStateAction<RevisedDocumentItem[]>) => {
    setDocumentsState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      setStoreDocuments(next);
      return next;
    });
  };

  useEffect(() => {
    if (!storeDocuments) {
      setStoreDocuments(documents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDocRequired = (docId: string, reason?: string): boolean => {
    if (docId === "doc-1" || docId === "doc-2") return true;
    if (reason === "missed_income" && (docId === "doc-3" || docId === "doc-4")) return true;
    if (reason === "wrong_deduction" && docId === "doc-6") return true;
    if (reason === "incorrect_bank" && docId === "doc-5") return true;
    return false;
  };

  const uploadedCount = documents.filter(
    (d) => d.status === "uploaded" || !!d.fileUri
  ).length;
  const totalCount = documents.length;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef(false);
  const { revisedItrId, documentId, setBackendIds, setMaxStepReached } = useRevisedProgressStore();

  // POST Method - Normal Flow (Continue)
  const handleContinue = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const checkReq = documents.filter((d) => isDocRequired(d.id, params.revisionReason));
    const missing = checkReq.filter((d) => d.status !== "uploaded");
    if (missing.length > 0) {
      isSubmittingRef.current = false;
      Alert.alert("Missing Documents", "Please upload all required documents before continuing.");
      return;
    }

    if (!revisedItrId) {
      isSubmittingRef.current = false;
      Alert.alert("Error", "Missing revised ITR ID. Please start from Step 1.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await RevisedItrApiService.saveRevisedDocuments(revisedItrId, documents);
      if (response && response.documentId) {
        setBackendIds({ documentId: response.documentId });
      }
      setMaxStepReached(5);

      // Navigate to Screen 5: Review Revised Computation
      router.push({
        pathname: "/service/revised-itr-review" as any,
        params: {
          acknowledgementNumber: params.acknowledgementNumber,
          assessmentYear,
          revisionReason: params.revisionReason,
          revisedDetails: params.revisedDetails,
          uploadedDocsCount: uploadedCount.toString(),
          totalDocsCount: totalCount.toString(),
          revisedItrId,
        },
      });
    } catch (e: any) {
      console.error("Error saving documents:", e);
      Alert.alert("Upload Failed", describeUploadError(e));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // PUT Method - Editing Flow (Update & Continue)
  const handleUpdateAndContinue = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const checkReq = documents.filter((d) => isDocRequired(d.id, params.revisionReason));
    const missing = checkReq.filter((d) => d.status !== "uploaded");
    if (missing.length > 0) {
      isSubmittingRef.current = false;
      Alert.alert("Missing Documents", "Please upload all required documents before continuing.");
      return;
    }

    if (!documentId) {
      isSubmittingRef.current = false;
      Alert.alert("Error", "No document ID found to update.");
      return;
    }

    try {
      setIsSubmitting(true);

      await RevisedItrApiService.updateRevisedDocuments(documentId, documents);

      setMaxStepReached(5);

      // Redirect back to Review screen
      router.push({
        pathname: "/service/revised-itr-review" as any,
        params: {
          acknowledgementNumber: params.acknowledgementNumber,
          assessmentYear,
          revisionReason: params.revisionReason,
          revisedDetails: params.revisedDetails,
          uploadedDocsCount: uploadedCount.toString(),
          totalDocsCount: totalCount.toString(),
          revisedItrId,
        },
      });
    } catch (e: any) {
      console.error("Error updating documents:", e);
      Alert.alert("Update Failed", describeUploadError(e));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const requiredDocs = documents.filter((d) => isDocRequired(d.id, params.revisionReason));
  const additionalDocs = documents.filter((d) => !isDocRequired(d.id, params.revisionReason));

  const renderDocCard = (item: RevisedDocumentItem, isRequired: boolean) => {
    return (
      <SharedItrDocumentCard
        key={item.id}
        allowedExtensions={REVISED_ITR_ALLOWED_EXTENSIONS as any}
        maxSizeBytes={MAX_REVISED_DOCUMENT_SIZE_BYTES}
        item={{
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          isMandatory: isRequired,
          status: item.status,
          fileUri: item.fileUri,
          fileName: item.fileName,
          fileSize: item.fileSize,
          mimeType: item.mimeType,
          iconType: "business_income",
        }}
        onUploadSuccess={(id, fileInfo) => {
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === id
                ? {
                    ...d,
                    status: "uploaded",
                    fileUri: fileInfo.uri,
                    fileName: fileInfo.name,
                    fileSize: fileInfo.size,
                    mimeType: fileInfo.mimeType,
                  }
                : d
            )
          );
        }}
        onRemove={(id) => {
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === id
                ? {
                    ...d,
                    status: "not_uploaded",
                    fileUri: undefined,
                    fileName: undefined,
                    fileSize: undefined,
                    mimeType: undefined,
                  }
                : d
            )
          );
        }}
      />
    );
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <RevisedItrHeader
        subtitle="Upload Documents"
        currentStep={4}
        totalSteps={5}
        hideBackButton={params.isEditing === "true"}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Upload Supporting Documents</Text>
          <Text style={styles.pageSubtitle}>
            Upload proofs for the corrections made in your revised return.
          </Text>
        </View>

        {/* Required Documents Section */}
        {requiredDocs.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Required Documents</Text>
            </View>
            {requiredDocs.map((item) => renderDocCard(item, true))}
          </View>
        )}

        {/* Additional Documents Section */}
        {additionalDocs.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Additional Documents</Text>
            </View>
            {additionalDocs.map((item) => renderDocCard(item, false))}
          </View>
        )}

        {/* Action Button — In Scroll Flow (Matching GST Filing) */}
        <View style={styles.buttonWrapper}>
          {params.isEditing === "true" ? (
            /* Separate Button 1: Update & Continue (PUT Method) */
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdateAndContinue}
              style={styles.continueButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Update & Continue</Text>
              )}
            </TouchableOpacity>
          ) : (
            /* Separate Button 2: Continue (POST Method) */
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={styles.continueButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RevisedDocumentsScreen;
