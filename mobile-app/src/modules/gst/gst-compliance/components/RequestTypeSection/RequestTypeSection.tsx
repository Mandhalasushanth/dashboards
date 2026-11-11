import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/hooks/useTheme";
import { BrandColors } from "@/shared/theme";
import {
  ComplianceFormData,
  UploadedDocInfo,
  ValidationErrors,
  validateNoticeDates,
  NOTICE_MAX_FILE_SIZE_BYTES,
} from "@/modules/gst/validation/complianceSchema";
import {
  RECONCILIATION_ALLOWED_EXTENSIONS,
  NOTICE_ALLOWED_EXTENSIONS,
} from "@/modules/gst/utils/gstValidation";
import { FileUploadCard } from "@/modules/gst/gst-compliance/components/FileUploadCard/FileUploadCard";
import { NativeDatePickerInput } from "@/modules/gst/gst-compliance/components/NativeDatePickerInput/NativeDatePickerInput";
import { FloatingLabelInput } from "@/modules/gst/gst-compliance/components/FloatingLabelInput/FloatingLabelInput";
import { GstinInfoIcon } from "@/modules/gst/components/common";
import { styles } from "@/modules/gst/gst-compliance/components/RequestTypeSection/RequestTypeSection.styles";

export interface RequestTypeSectionProps {
  formData: ComplianceFormData;
  errors: ValidationErrors;
  onUpdateField: <K extends keyof ComplianceFormData>(
    field: K,
    value: ComplianceFormData[K]
  ) => void;
  onClearError: (field: keyof ValidationErrors) => void;
  onScrollField?: (fieldName: string) => void;
  onSetError?: (field: keyof ValidationErrors, message: string) => void;
  onSectionLayout?: (section: string, relativeY: number) => void;
}

export const RequestTypeSection: React.FC<RequestTypeSectionProps> = ({
  formData,
  errors,
  onUpdateField,
  onClearError,
  onScrollField,
  onSetError,
  onSectionLayout,
}) => {
  const { isDark } = useTheme();

  const getTodayMaxDate = (): Date => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  };

  useEffect(() => {
    if (formData.requestType === "Notice Response" && formData.noticeIssueDate) {
      const { issueDateError } = validateNoticeDates(
        formData.noticeIssueDate,
        formData.replyDueDate
      );
      if (issueDateError) {
        onSetError?.("noticeIssueDate", issueDateError);
      }
    }
  }, [formData.requestType, formData.noticeIssueDate, formData.replyDueDate, onSetError]);

  if (!formData.requestType) return null;

  const cardBg = isDark ? "#0F172A" : "#F8FAFC";

  if (formData.requestType === "Reconciliation Support") {
    return (
      <View style={styles.sectionContainer}>
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBox, isDark && styles.sectionIconBoxDark]}>
              <Ionicons name="git-compare-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
            </View>
            <View style={styles.sectionTitleWrap}>
              <Text style={[styles.sectionMainTitle, isDark && styles.sectionMainTitleDark]}>
                Reconciliation Documents & Details
              </Text>
              <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>
                Purchase & Sales registers against GSTR-2B
              </Text>
            </View>
          </View>

        {/* Reconciliation Documents: Purchase & Sales Registers */}
        <View onLayout={(e) => onSectionLayout?.("documents", e.nativeEvent.layout.y)}>
          <FileUploadCard
            title="Purchase Register"
            description="Upload purchase register or Excel/CSV records"
            required
            allowedExtensions={RECONCILIATION_ALLOWED_EXTENSIONS}
            uploadedDoc={formData.purchaseDoc}
            onDocChange={(doc: UploadedDocInfo | null) => {
              onUpdateField("purchaseDoc", doc);
              if (doc) onClearError("purchaseDoc");
            }}
            error={errors.purchaseDoc}
            onClearError={() => onClearError("purchaseDoc")}
            onError={(msg) => onSetError?.("purchaseDoc", msg)}
          />

          <FileUploadCard
            title="Sales Register"
            description="Upload sales register or outward supplies statement"
            required
            allowedExtensions={RECONCILIATION_ALLOWED_EXTENSIONS}
            uploadedDoc={formData.salesDoc}
            onDocChange={(doc: UploadedDocInfo | null) => {
              onUpdateField("salesDoc", doc);
              if (doc) onClearError("salesDoc");
            }}
            error={errors.salesDoc}
            onClearError={() => onClearError("salesDoc")}
            onError={(msg) => onSetError?.("salesDoc", msg)}
          />
        </View>

        {/* Reconciliation Parameters: GSTR-2B Reference & Remarks */}
        <View onLayout={(e) => onSectionLayout?.("recon", e.nativeEvent.layout.y)}>
          <FloatingLabelInput
            label="GSTR-2B Reference"
            floatingLabel="GSTR-2B Reference"
            placeholder="Enter GSTR-2B reference or ARN"
            value={formData.gstr2bRef}
            onChangeText={(text) => {
              onUpdateField("gstr2bRef", text);
              if (errors.gstr2bRef) onClearError("gstr2bRef");
            }}
            autoCapitalize="characters"
            error={errors.gstr2bRef}
            cardBackground={cardBg}
            onClear={() => {
              onUpdateField("gstr2bRef", "");
              if (errors.gstr2bRef) onClearError("gstr2bRef");
            }}
            onFocusScroll={() => onScrollField?.("gstr2bRef")}
          />
        </View>

        <View onLayout={(e) => onSectionLayout?.("reconciliationRemarks", e.nativeEvent.layout.y)}>
          <FloatingLabelInput
            label="Remarks (Optional)"
            floatingLabel="Remarks (Optional)"
            placeholder="Tell us anything our CA should know..."
            value={formData.reconciliationRemarks}
            onChangeText={(text) => {
              onUpdateField("reconciliationRemarks", text);
              if (errors.reconciliationRemarks) onClearError("reconciliationRemarks");
            }}
            error={errors.reconciliationRemarks}
            maxLength={500}
            showCharCount
            multiline
            numberOfLines={3}
            cardBackground={cardBg}
            onFocusScroll={() => onScrollField?.("reconciliationRemarks")}
          />
        </View>
        </View>
      </View>
    );
  }

  // Notice Response Form
  return (
    <View style={styles.sectionContainer}>
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIconBox, isDark && styles.sectionIconBoxDark]}>
            <Ionicons name="document-text-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <Text style={[styles.sectionMainTitle, isDark && styles.sectionMainTitleDark]}>
              Notice Details & Documents
            </Text>
            <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>
              Notice numbers, critical dates & notice copy
            </Text>
          </View>
        </View>

        {/* Notice Details: Number & Dates */}
        <View onLayout={(e) => onSectionLayout?.("notice", e.nativeEvent.layout.y)}>
          <FloatingLabelInput
            label="Notice Number"
            floatingLabel="Notice Number"
            placeholder="Enter Notice Number"
            required
            labelAbove
            value={formData.noticeNumber}
            onChangeText={(text) => {
              const formatted = text.replace(/[^a-zA-Z0-9\/-]/g, "").toUpperCase();
              onUpdateField("noticeNumber", formatted);
              if (formatted) onClearError("noticeNumber");
            }}
            autoCapitalize="characters"
            maxLength={30}
            error={errors.noticeNumber}
            cardBackground={cardBg}
            labelRightElement={<GstinInfoIcon fieldType="noticeNumber" size={16} />}
            onClear={() => {
              onUpdateField("noticeNumber", "");
              onClearError("noticeNumber");
            }}
            onFocusScroll={() => onScrollField?.("noticeNumber")}
          />

          <NativeDatePickerInput
            label="Notice Issue Date"
            value={formData.noticeIssueDate}
            onChange={(date) => {
              onUpdateField("noticeIssueDate", date);
              const { issueDateError, dueDateError } = validateNoticeDates(
                date,
                formData.replyDueDate
              );
              if (issueDateError) {
                onSetError?.("noticeIssueDate", issueDateError);
              } else {
                onClearError("noticeIssueDate");
              }
              if (dueDateError) {
                onSetError?.("replyDueDate", dueDateError);
              } else if (formData.replyDueDate && formData.replyDueDate.trim()) {
                onClearError("replyDueDate");
              }
            }}
            required
            maximumDate={getTodayMaxDate()}
            error={errors.noticeIssueDate}
            placeholder="Select Notice Issue Date"
          />

          <NativeDatePickerInput
            label="Reply Due Date"
            value={formData.replyDueDate}
            onChange={(date) => {
              onUpdateField("replyDueDate", date);
              const { dueDateError } = validateNoticeDates(formData.noticeIssueDate, date);
              if (dueDateError) {
                onSetError?.("replyDueDate", dueDateError);
              } else {
                onClearError("replyDueDate");
              }
            }}
            required
            error={errors.replyDueDate}
            placeholder="Select Reply Due Date"
            validateMinDate={formData.noticeIssueDate || undefined}
          />
        </View>

        {/* Notice Document */}
        <View onLayout={(e) => onSectionLayout?.("documents", e.nativeEvent.layout.y)}>
          <FileUploadCard
            title="Upload Notice Copy"
            description="Upload official GST notice or assessment order"
            required
            allowedExtensions={NOTICE_ALLOWED_EXTENSIONS}
            maxSizeBytes={NOTICE_MAX_FILE_SIZE_BYTES}
            uploadedDoc={formData.noticeDoc}
            onDocChange={(doc: UploadedDocInfo | null) => {
              onUpdateField("noticeDoc", doc);
              if (doc) onClearError("noticeDoc");
            }}
            error={errors.noticeDoc}
            onClearError={() => onClearError("noticeDoc")}
            onError={(msg) => onSetError?.("noticeDoc", msg)}
          />
        </View>

      {/* 5. Remarks (Optional Floating Label Multiline) */}
      <View onLayout={(e) => onSectionLayout?.("noticeRemarks", e.nativeEvent.layout.y)}>
        <FloatingLabelInput
          label="Remarks (Optional)"
          floatingLabel="Remarks (Optional)"
          placeholder="Add any important information for our CA"
          value={formData.noticeRemarks}
          onChangeText={(text) => {
            onUpdateField("noticeRemarks", text);
            if (errors.noticeRemarks) onClearError("noticeRemarks");
          }}
          error={errors.noticeRemarks}
          maxLength={500}
          showCharCount
          multiline
          numberOfLines={3}
          cardBackground={cardBg}
          onFocusScroll={() => onScrollField?.("noticeRemarks")}
        />
      </View>
      </View>
    </View>
  );
};

export default RequestTypeSection;
