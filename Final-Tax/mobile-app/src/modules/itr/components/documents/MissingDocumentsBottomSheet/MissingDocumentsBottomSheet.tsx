import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BusinessDocumentItem } from "../../../types/documentUpload.types";
import { DocumentUploadIcon } from "../DocumentUploadIcons";
import { styles } from "./MissingDocumentsBottomSheet.styles";

interface MissingDocumentsBottomSheetProps {
  visible: boolean;
  pendingDocuments: BusinessDocumentItem[];
  onUploadItem: (doc: BusinessDocumentItem) => void;
  onClose: () => void;
}

export const MissingDocumentsBottomSheet: React.FC<MissingDocumentsBottomSheetProps> = ({
  visible,
  pendingDocuments,
  onUploadItem,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Top Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.warningIconContainer}>
                  <Ionicons name="alert-circle" size={24} color="#F97316" />
                </View>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.sheetTitle}>Documents Pending</Text>
                  <Text style={styles.sheetSubtitle}>
                    Please upload all required documents before continuing.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#0B1F3A" />
                </TouchableOpacity>
              </View>

              {/* Pending List */}
              <ScrollView
                style={styles.listScrollView}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {pendingDocuments.map((doc) => (
                  <View key={doc.id} style={styles.pendingItemRow}>
                    <View style={styles.itemLeft}>
                      <DocumentUploadIcon type={doc.iconType} />
                      <View style={styles.itemTextGroup}>
                        <Text style={styles.itemTitle}>{doc.title}</Text>
                        <Text style={styles.itemSub}>Required for verification</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        onUploadItem(doc);
                      }}
                      style={styles.uploadNowBtn}
                    >
                      <Ionicons name="arrow-up-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.uploadNowText}>Upload Now</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Dismiss Action */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={styles.gotItButton}
              >
                <Text style={styles.gotItButtonText}>Close & Continue Uploading</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
