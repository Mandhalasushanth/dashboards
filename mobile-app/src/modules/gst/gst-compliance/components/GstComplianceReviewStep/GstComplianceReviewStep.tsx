import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Image, Platform, ActivityIndicator } from "react-native";
import * as Sharing from "expo-sharing";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/hooks/useTheme";
import { BrandColors } from "@/shared/theme";
import { ComplianceFormData, UploadedDocInfo } from "@/modules/gst/validation/complianceSchema";
import { resolveDocType } from "../../utils/gstPreviewUtils";
import { styles } from "./GstComplianceReviewStep.styles";

export interface GstComplianceReviewStepProps {
  formData: ComplianceFormData;
  dbData?: any;
  complianceId?: string | null;
  onEditStep: (section?: string) => void;
}

interface ReviewRowProps {
  label: string;
  value: string;
  isDark: boolean;
  multiline?: boolean;
  isMissing?: boolean;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ label, value, isDark, multiline = false, isMissing = false }) => (
  <View style={styles.row}>
    <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    <Text
      style={[styles.value, isDark && styles.valueDark, multiline && styles.valueMultiline, isMissing && styles.valueMissing]}
      numberOfLines={multiline ? undefined : 1}
    >
      {value || "-"}
    </Text>
  </View>
);

export const GstComplianceReviewStep: React.FC<GstComplianceReviewStepProps> = ({
  formData,
  dbData,
  complianceId,
  onEditStep,
}) => {
  const { isDark } = useTheme();
  const [previewDoc, setPreviewDoc] = useState<UploadedDocInfo | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isIframeError, setIsIframeError] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && previewDoc?.uri?.startsWith("blob:")) {
      fetch(previewDoc.uri, { method: "HEAD" }).catch(() => {
        setIsIframeError(true);
      });
    }
  }, [previewDoc]);

  const handleClosePreview = useCallback(() => {
    setPreviewDoc(null);
    setShareError(null);
    setIsSharing(false);
    setIsIframeError(false);
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && previewDoc?.uri) {
      if (/^(blob:|https?:|data:)/i.test(previewDoc.uri)) {
        const opened = window.open(previewDoc.uri, "_blank", "noopener,noreferrer");
        if (!opened) {
          setShareError("Pop-up was blocked. Please allow pop-ups for Finsolz to open the document.");
        }
      } else {
        setShareError("Direct browser opening is not supported for this file scheme.");
      }
    }
  }, [previewDoc]);

  const handleOpenOrShareFile = useCallback(async () => {
    if (!previewDoc?.uri) {
      setShareError("Document location is unavailable.");
      return;
    }
    setShareError(null);
    setIsSharing(true);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          if (/^(blob:|https?:|data:)/i.test(previewDoc.uri)) {
            const opened = window.open(previewDoc.uri, "_blank", "noopener,noreferrer");
            if (!opened) {
              setShareError("Pop-up was blocked. Please allow pop-ups for Finsolz to open the document.");
            }
          } else {
            setShareError("Direct browser opening is not supported for this file scheme.");
          }
        }
        return;
      }
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setShareError("Sharing is not supported on this device.");
        return;
      }
      const docTypeInfo = resolveDocType(previewDoc);
      await Sharing.shareAsync(previewDoc.uri, {
        mimeType: docTypeInfo.resolvedMime,
        dialogTitle: previewDoc.name,
        UTI: docTypeInfo.uti,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Unable to open or share document.";
      const isCancelled =
        errorMsg.toLowerCase().includes("cancel") || errorMsg.toLowerCase().includes("dismiss");
      if (!isCancelled) {
        setShareError("Unable to open file in external viewer. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  }, [previewDoc]);

  const isWebRenderableUri = Boolean(
    Platform.OS === "web" &&
      previewDoc?.uri &&
      /^(blob:|https?:|data:)/i.test(previewDoc.uri)
  );

  const previewDocType = resolveDocType(previewDoc);

  const displayRequestType = formData.requestType
    ? formData.requestType
    : dbData?.requestType === "RECONCILIATION_SUPPORT"
    ? "Reconciliation Support"
    : dbData?.requestType === "NOTICE_RESPONSE"
    ? "Notice Response"
    : dbData?.requestType || "";

  const isRecon = displayRequestType === "Reconciliation Support";

  const renderEditButton = (section?: string) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onEditStep(section)}
      style={styles.editBtn}
    >
      <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE} />
      <Text style={styles.editBtnText}>Edit</Text>
    </TouchableOpacity>
  );

  const renderDocRow = (
    title: string,
    doc: UploadedDocInfo | null,
    required: boolean = true
  ) => {
    const isUploaded = Boolean(doc);
    const rowDocType = resolveDocType(doc);
    return (
      <View style={[styles.docRow, isDark && styles.docRowDark]}>
        <View style={styles.docLeft}>
          <View style={[styles.docIconWrap, !isUploaded && styles.docIconWrapEmpty]}>
            <Ionicons
              name={
                isUploaded
                  ? rowDocType.isPdf
                    ? "document-text"
                    : rowDocType.isSpreadsheet
                    ? "grid-outline"
                    : "image"
                  : "alert-circle"
              }
              size={18}
              color={isUploaded ? "#16A34A" : "#EF4444"}
            />
          </View>
          <View style={styles.docTextCol}>
            <Text style={[styles.docTitleText, isDark && styles.docTitleTextDark]}>{title}</Text>
            {isUploaded && doc ? (
              <View style={styles.docMetaRow}>
                <Text
                  style={[styles.docFileName, isDark && styles.docFileNameDark]}
                  numberOfLines={2}
                  ellipsizeMode="middle"
                >
                  {doc.name}
                </Text>
                <Text style={[styles.docFileSizeBadge, isDark && styles.docFileSizeBadgeDark]}>
                  • {doc.sizeFormatted}
                </Text>
              </View>
            ) : (
              <Text style={styles.docStatusMissing}>
                {required ? "Missing (Required)" : "Not Attached (Optional)"}
              </Text>
            )}
          </View>
        </View>

        {isUploaded && doc ? (
          <TouchableOpacity
            style={[styles.docViewBtn, isDark && styles.docViewBtnDark]}
            activeOpacity={0.7}
            onPress={() => {
              setShareError(null);
              setIsIframeError(false);
              setPreviewDoc(doc);
            }}
          >
            <Ionicons name="eye-outline" size={14} color={isDark ? "#93C5FD" : "#1D4ED8"} />
            <Text style={[styles.docViewBtnText, isDark && styles.docViewBtnTextDark]}>View</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. CA Readiness Banner */}
      <View style={[styles.readyCard, isDark && styles.readyCardDark]}>
        <View style={styles.readyIconBox}>
          <Ionicons name="shield-checkmark" size={18} color="#059669" />
        </View>
        <View style={styles.readyTextCol}>
          <Text style={[styles.readyHeading, isDark && styles.readyHeadingDark]}>
            Ready for CA Review & Filing
          </Text>
          <Text style={[styles.readySub, isDark && styles.readySubDark]}>
            Finsolz CA compliance desk will verify your records and prepare the official response.
          </Text>
        </View>
      </View>

      {/* 2. Business & Compliance Summary Card */}
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Request & Filing Details
          </Text>
          {renderEditButton("details")}
        </View>
        <View style={[styles.divider, isDark && styles.dividerDark]} />

        <ReviewRow label="GSTIN" value={formData.gstin || dbData?.gstin} isDark={isDark} />
        <ReviewRow label="Financial Year" value={formData.financialYear || dbData?.financialYear} isDark={isDark} />
        <ReviewRow label="Request Type" value={displayRequestType} isDark={isDark} />
      </View>

      {/* 3. Section Specific Details Card */}
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            {isRecon ? "Reconciliation Parameters" : "Notice Details"}
          </Text>
          {renderEditButton(isRecon ? "recon" : "notice")}
        </View>
        <View style={[styles.divider, isDark && styles.dividerDark]} />

        {isRecon ? (
          <>
            <ReviewRow label="GSTR-2B Ref / Period" value={formData.gstr2bRef || dbData?.gstr2bNumber || "Not specified"} isDark={isDark} />
            <ReviewRow label="Remarks" value={formData.reconciliationRemarks || dbData?.message || "None"} isDark={isDark} multiline />
          </>
        ) : (
          <>
            <ReviewRow label="Notice / Order No." value={formData.noticeNumber || dbData?.noticeNumber} isDark={isDark} />
            <ReviewRow label="Notice Issue Date" value={formData.noticeIssueDate || dbData?.noticeIssueDate} isDark={isDark} />
            <ReviewRow label="Reply Due Date" value={formData.replyDueDate || dbData?.replyDueDate} isDark={isDark} />
            <ReviewRow label="Remarks / Grounds" value={formData.noticeRemarks || dbData?.message || "None"} isDark={isDark} multiline />
          </>
        )}
      </View>

      {/* 4. Uploaded Documents Card */}
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Attached Documents
          </Text>
          {renderEditButton("documents")}
        </View>
        <View style={[styles.divider, isDark && styles.dividerDark]} />

        {isRecon ? (
          <>
            {renderDocRow("Purchase Register", formData.purchaseDoc, true)}
            {renderDocRow("Sales Register", formData.salesDoc, true)}
          </>
        ) : (
          renderDocRow("Notice Copy", formData.noticeDoc, true)
        )}
      </View>

      {/* 5. Document Preview Modal */}
      <Modal
        visible={Boolean(previewDoc)}
        transparent
        animationType="fade"
        onRequestClose={handleClosePreview}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClosePreview}
        >
          <View style={[styles.previewCard, isDark && styles.previewCardDark]}>
            <View style={[styles.previewHeader, isDark && styles.previewHeaderDark]}>
              <Text
                style={[styles.previewTitle, isDark && styles.previewTitleDark]}
                numberOfLines={2}
                ellipsizeMode="middle"
              >
                {previewDoc?.name || "Document Preview"}
              </Text>
              <TouchableOpacity onPress={handleClosePreview}>
                <Ionicons name="close-circle-outline" size={24} color={isDark ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewContent}>
              {previewDoc && previewDocType.isImage ? (
                <Image source={{ uri: previewDoc.uri }} style={styles.previewImage} resizeMode="contain" />
              ) : Platform.OS === "web" && isWebRenderableUri && previewDocType.isPdf ? (
                <View style={styles.pdfWebContainer}>
                  {isIframeError ? (
                    <View style={styles.nativeFallbackBox}>
                      <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
                      <Text style={[styles.nativeNoticeText, isDark && styles.nativeNoticeTextDark]}>
                        Inline browser preview failed or file session expired.
                      </Text>
                      <TouchableOpacity
                        style={[styles.webActionBtn, isDark && styles.webActionBtnDark]}
                        activeOpacity={0.75}
                        onPress={handleOpenInNewTab}
                      >
                        <Ionicons name="open-outline" size={14} color={isDark ? "#93C5FD" : "#1D4ED8"} />
                        <Text style={[styles.webActionBtnText, isDark && styles.webActionBtnTextDark]}>
                          Open in New Tab
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {React.createElement("iframe", {
                        src: previewDoc?.uri,
                        title: previewDoc?.name,
                        onError: () => setIsIframeError(true),
                        style: { width: "100%", height: 380, border: "none", borderRadius: 8 },
                      })}
                      <View style={styles.webActionRow}>
                        <TouchableOpacity
                          style={[styles.webActionBtn, isDark && styles.webActionBtnDark]}
                          activeOpacity={0.75}
                          onPress={handleOpenInNewTab}
                        >
                          <Ionicons name="open-outline" size={14} color={isDark ? "#93C5FD" : "#1D4ED8"} />
                          <Text style={[styles.webActionBtnText, isDark && styles.webActionBtnTextDark]}>
                            Open in New Tab
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.nativeFallbackBox}>
                  <View style={[styles.nativeDocInfoCard, isDark && styles.nativeDocInfoCardDark]}>
                    <Ionicons
                      name={previewDocType.isSpreadsheet ? "grid-outline" : "document-text"}
                      size={28}
                      color={BrandColors.PRIMARY_ORANGE}
                    />
                    <View style={styles.nativeDocDetailsCol}>
                      <Text
                        style={[styles.nativeDocTitle, isDark && styles.nativeDocTitleDark]}
                        numberOfLines={2}
                        ellipsizeMode="middle"
                      >
                        {previewDoc?.name}
                      </Text>
                      <Text style={[styles.nativeDocMeta, isDark && styles.nativeDocMetaDark]}>
                        {previewDoc?.sizeFormatted} • {previewDocType.typeLabel}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.nativeNoticeText, isDark && styles.nativeNoticeTextDark]}>
                    {previewDocType.isSpreadsheet
                      ? "Spreadsheet files cannot be rendered inline. Open or export using your device or browser."
                      : Platform.OS === "web"
                      ? "Inline browser preview is unavailable for this file URI scheme."
                      : "Inline PDF preview is not supported on this device. Open or export the document using the device system handler below."}
                  </Text>

                  <TouchableOpacity
                    style={[styles.externalShareBtn, isSharing && styles.externalShareBtnDisabled]}
                    activeOpacity={0.8}
                    onPress={handleOpenOrShareFile}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.externalShareBtnText}>
                          {Platform.OS === "web" ? "Open Document File" : "Open / Share File..."}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {shareError ? (
                    <View style={[styles.nativeErrorBox, isDark && styles.nativeErrorBoxDark]}>
                      <Ionicons name="alert-circle" size={14} color="#DC2626" />
                      <Text style={[styles.nativeErrorText, isDark && styles.nativeErrorTextDark]}>
                        {shareError}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.previewDoneBtn, isDark && styles.previewDoneBtnDark]}
              activeOpacity={0.8}
              onPress={handleClosePreview}
            >
              <Text style={[styles.previewDoneBtnText, isDark && styles.previewDoneBtnTextDark]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default GstComplianceReviewStep;
