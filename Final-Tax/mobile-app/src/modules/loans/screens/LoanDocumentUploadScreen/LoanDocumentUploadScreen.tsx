import React, { useCallback, useMemo, useState } from "react";
import { getContinueLabel } from "../../constants/continueLabels";
import { resolveLoanDocumentRequirements } from "../../constants/loanDocumentResolver";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  KeyboardAwareScrollView,
} from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { LoanFlowHeader } from "../../components/LoanFlowHeader";
import { DocumentUploadBottomSheet } from "@/shared/components/DocumentUploadBottomSheet";
import {
  DocumentPreviewModal,
  type PreviewDocumentItem,
} from "@/shared/components/documents";
import { useLoansStore } from "../../store/loansStore";
import { useLoanDocumentUpload } from "../../hooks/useLoanDocumentUpload";
import { getLoanFlowTotalSteps } from "../../constants/loanFlow";
import { getLoanDocumentProgress } from "../../validation/loanDocumentsValidation";
import { formatFileSize } from "../../utils/formatFileSize";
import { DocumentProgressSummary } from "../../components/DocumentProgressSummary";
import { DocumentRequirementCard } from "../../components/DocumentRequirementCard";
import type { LoanDocumentRequirement } from "../../types/loanReview.types";
import { styles } from "./LoanDocumentUploadScreen.styles";

interface LoanDocumentUploadScreenProps {
  onBackToBusinessDetails: () => void;
  /** Called once every required document is uploaded; leads to Review. */
  onContinue: () => void;
  /** Opened from Review → Edit: no back button, "Update & Continue". */
  isEditMode?: boolean;
  /** Reached again with Back after being completed once: "Update & Continue", back stays. */
  isRevisit?: boolean;
}

export const LoanDocumentUploadScreen: React.FC<LoanDocumentUploadScreenProps> = ({
  onBackToBusinessDetails,
  onContinue,
  isEditMode = false,
  isRevisit = false,
}) => {
  const insets = useSafeAreaInsets();
  const selectedCategory = useLoansStore((state) => state.selectedCategory);
  const businessFormData = useLoansStore((state) => state.businessFormData);
  const personalFormData = useLoansStore((state) => state.personalFormData);
  const homeLoanFormData = useLoansStore((state) => state.homeLoanFormData);
  const propertyFormData = useLoansStore((state) => state.propertyFormData);
  const vehicleFormData = useLoansStore((state) => state.vehicleFormData);
  const machineryFormData = useLoansStore((state) => state.machineryFormData);
  const msmeFormData = useLoansStore((state) => state.msmeFormData);
  const isPropertyLoan =
    selectedCategory?.id === "home-loan" ||
    selectedCategory?.id === "property-loan";

  const requirements = useMemo(
    () =>
      resolveLoanDocumentRequirements({
        categoryId: selectedCategory?.id,
        businessFormData,
        personalFormData,
        homeLoanFormData,
        propertyFormData,
        vehicleFormData,
        machineryFormData,
        msmeFormData,
      }),
    [
      selectedCategory?.id,
      businessFormData,
      personalFormData,
      homeLoanFormData,
      propertyFormData,
      vehicleFormData,
      machineryFormData,
      msmeFormData,
    ]
  );
  const upload = useLoanDocumentUpload(requirements);
  const progress = useMemo(
    () => getLoanDocumentProgress(requirements, upload.uploadedDocuments),
    [requirements, upload.uploadedDocuments]
  );

  const [previewDoc, setPreviewDoc] = useState<PreviewDocumentItem | null>(null);

  const handleView = useCallback(
    (requirement: LoanDocumentRequirement) => {
      const stored = upload.uploadedDocuments[requirement.id];
      if (!stored?.fileUri) return;
      setPreviewDoc({
        id: requirement.id,
        name: requirement.name,
        fileName: stored.fileName,
        fileUri: stored.fileUri,
        fileSize: formatFileSize(stored.fileSize),
        mimeType: stored.mimeType,
        required: requirement.isMandatory,
      });
    },
    [upload.uploadedDocuments]
  );

  const handleChangePreviewFile = useCallback(() => {
    const requirement = requirements.find((r) => r.id === previewDoc?.id);
    setPreviewDoc(null);
    if (requirement) upload.openSheet(requirement);
  }, [requirements, previewDoc, upload]);

  const handleContinue = useCallback(() => {
    if (progress.isComplete) onContinue();
  }, [progress.isComplete, onContinue]);

  const required = requirements.filter((req) => req.isMandatory);
  const optional = requirements.filter((req) => !req.isMandatory);

  const renderCard = (requirement: LoanDocumentRequirement) => (
    <DocumentRequirementCard
      key={requirement.id}
      requirement={requirement}
      upload={upload.uploadedDocuments[requirement.id]}
      error={upload.errors[requirement.id]}
      isProcessing={upload.processingId === requirement.id}
      onUpload={upload.openSheet}
      onView={handleView}
      onRemove={(req) => upload.removeDocument(req.id)}
    />
  );

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title={isPropertyLoan ? "Upload your documents" : "Upload Documents"}
        currentStep={3}
        totalSteps={
          selectedCategory ? getLoanFlowTotalSteps(selectedCategory.id) : 5
        }
        subtitle={isPropertyLoan ? "Property Documents" : "Documents"}
        isEditMode={isEditMode}
        onBack={onBackToBusinessDetails}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.introBody}>
          Upload clear PDF, JPG or PNG files, up to 10 MB each.
        </Text>

        <DocumentProgressSummary progress={progress} />

        <Text style={styles.groupTitle}>Required documents</Text>
        {required.map(renderCard)}

        {optional.length > 0 ? (
          <>
            <Text style={styles.groupTitle}>Optional documents</Text>
            {optional.map(renderCard)}
          </>
        ) : null}
      </KeyboardAwareScrollView>

      <KeyboardStickyFooter
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}
      >
        {!progress.isComplete ? (
          <Text style={styles.footerHint}>
            Upload the {progress.missingRequiredIds.length} pending required{" "}
            {progress.missingRequiredIds.length === 1 ? "document" : "documents"} to continue.
          </Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !progress.isComplete && styles.continueButtonDisabled,
          ]}
          disabled={!progress.isComplete}
          onPress={handleContinue}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled: !progress.isComplete }}
          accessibilityLabel={
            isEditMode
              ? "Update and return to review"
              : isRevisit
              ? "Update and continue to review"
              : "Continue to review"
          }
        >
          <Text style={styles.continueText}>
            {getContinueLabel(isEditMode || isRevisit, "Continue")}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={BrandColors.WHITE} />
        </TouchableOpacity>
      </KeyboardStickyFooter>

      <DocumentUploadBottomSheet
        visible={upload.isSheetVisible}
        documentTitle={upload.activeRequirement?.name}
        maxSizeText="10 MB"
        allowGallery={false}
        allowCamera={
          upload.activeRequirement
            ? upload.activeRequirement.uploadSources.includes("camera")
            : true
        }
        onClose={upload.closeSheet}
        onPickFiles={upload.pickFiles}
        onTakePhoto={upload.takePhoto}
      />

      <DocumentPreviewModal
        visible={previewDoc !== null}
        document={previewDoc}
        variant="loans"
        onClose={() => setPreviewDoc(null)}
        onChangeFile={handleChangePreviewFile}
      />
    </View>
  );
};

export default LoanDocumentUploadScreen;
