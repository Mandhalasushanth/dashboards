import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useApplicationStore } from "@/store/applicationStore";
import { TaxNoticeHeader } from "../../components/common";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./NoticePreviewScreen.styles";

export interface NoticeDocument {
  title?: string;
  fileName?: string;
  fileUri?: string;
  status?: string;
}

const NoticePreviewScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const taxNoticeDraft = useApplicationStore((state) => state.taxNoticeDraft);

  const formData = taxNoticeDraft?.formData || {};
  const documents: NoticeDocument[] = taxNoticeDraft?.documents || [];
  const uploadedDocs = documents.filter(
    (d) => d.status === "uploaded" || d.fileUri,
  );

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    saveDestination: "/service/itr",
    discardDestination: "/service/itr",
    isDirty: () => true,
    onSaveDraft: () => {
      // already saved in draft state during progression
    },
    onDiscardDraft: () => {
      useApplicationStore.getState().clearTaxNoticeDraft();
    },
    isSubmitted: () => false,
  });

  const handleEditDetails = () => {
    try {
      router.push("/service/tax-notice-assistance");
    } catch (error) {
      console.error("Navigation Error:", error);
    }
  };

  const handleEditDocuments = () => {
    try {
      router.push("/service/tax-notice-documents");
    } catch (error) {
      console.error("Navigation Error:", error);
    }
  };

  const handleContinueToMail = () => {
    try {
      router.push({
        pathname: "/service/tax-notice-review",
        params: {
          noticeId: formData.noticeId,
          pan: formData.pan,
          noticeNumber: formData.noticeNumber,
          noticeDate: formData.noticeDate,
          responseDueDate: formData.responseDueDate,
          noticeType: formData.noticeType,
          assessmentYear: formData.assessmentYear,
        },
      });
    } catch (error) {
      console.error("Navigation Error:", error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TaxNoticeHeader subtitle="Review Submission" hideBackButton onSaveDraft={openDraftModal} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <View style={styles.headerArea}>
          <Text style={styles.title}>Review Your Details</Text>
          <Text style={styles.subtitle}>
            Please verify the information before we draft the response.
          </Text>
        </View>

        {/* Step 1 Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="document-text" size={20} color="#0B1F3A" />
              <Text style={styles.cardTitle}>Notice Details</Text>
            </View>
            <TouchableOpacity
              onPress={handleEditDetails}
              style={styles.editBtn}
            >
              <Ionicons name="pencil-outline" size={16} color="#F97316" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <Text style={styles.label}>PAN Number</Text>
              <Text style={styles.value}>{formData.pan || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Assessment Year</Text>
              <Text style={styles.value}>{formData.assessmentYear || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Notice Type</Text>
              <Text style={styles.value}>{formData.noticeType || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Notice Date</Text>
              <Text style={styles.value}>{formData.noticeDate || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>DIN / Notice Number</Text>
              <Text style={styles.value}>{formData.noticeNumber || "-"}</Text>
            </View>
          </View>
        </View>

        {/* Step 2 Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="folder-open" size={20} color="#0B1F3A" />
              <Text style={styles.cardTitle}>Uploaded Documents</Text>
            </View>
            <TouchableOpacity
              onPress={handleEditDocuments}
              style={styles.editBtn}
            >
              <Ionicons name="pencil-outline" size={16} color="#F97316" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            {uploadedDocs.length === 0 ? (
              <Text style={[styles.value, { color: "#64748B" }]}>
                No documents uploaded.
              </Text>
            ) : (
              uploadedDocs.map((doc, i) => (
                <View key={i} style={styles.docRow}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      paddingRight: 8,
                    }}
                  >
                    <Ionicons name="image-outline" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docTitle} numberOfLines={1}>
                        {doc.title}
                      </Text>
                      {doc.fileName && (
                        <Text style={styles.docSubtitle} numberOfLines={1}>
                          {doc.fileName}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => {
                      if (doc.fileUri) {
                        setPreviewImage(doc.fileUri);
                      }
                    }}
                  >
                    <Ionicons name="eye-outline" size={20} color="#0B1F3A" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueToMail}
        >
          <Text style={styles.continueButtonText}>
            Continue to Final Review
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Notice Draft?"
        message="You have a pending tax notice submission. Save as draft to continue later."
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default NoticePreviewScreen;


