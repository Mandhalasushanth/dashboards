import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { TdsChecklistItem } from "../../../types/checklist.types";
import { styles } from "./TdsDocumentCard.styles";

export interface TdsDocumentCardProps {
  item: TdsChecklistItem;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  onUploadPress: () => void;
  onView?: () => void;
  onChange: () => void;
  onDelete: () => void;
}

export const TdsDocumentCard: React.FC<TdsDocumentCardProps> = ({
  item,
  isUploading = false,
  uploadProgress = 0,
  error,
  onUploadPress,
  onView,
  onChange,
  onDelete,
}) => {
  const isUploaded = (item.status === "uploaded" || item.status === "verified") && Boolean(item.fileUri);

  const getDocIcon = () => {
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes("pan") || titleLower.includes("aadhaar")) {
      return "card-outline";
    }
    if (titleLower.includes("bank") || titleLower.includes("cheque")) {
      return "business-outline";
    }
    if (titleLower.includes("form 16") || titleLower.includes("26as") || titleLower.includes("statement")) {
      return "document-text-outline";
    }
    if (titleLower.includes("receipt") || titleLower.includes("agreement")) {
      return "receipt-outline";
    }
    return "document-outline";
  };

  const handleDefaultView = () => {
    if (onView) {
      onView();
    } else {
      Alert.alert(
        item.title,
        `File: ${item.fileName || "Uploaded Document"}\nSize: ${item.fileSize || "N/A"}\nStatus: Verified for Tax Return`
      );
    }
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      "Remove Document?",
      `Are you sure you want to remove "${item.fileName || item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <View
      style={[
        styles.cardContainer,
        item.isHighlighted && !isUploaded ? styles.cardContainerHighlighted : null,
        error ? styles.cardContainerError : null,
      ]}
    >
      {/* Top Row: Icon + Title/Subtitle + Required/Optional Badge */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.docIconWrap}>
            <Ionicons name={getDocIcon()} size={20} color={BrandColors.PRIMARY_BLUE} />
          </View>
          <View style={styles.titleTexts}>
            <Text style={styles.docTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.docSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
        </View>

        <View style={item.isMandatory ? styles.badgeRequired : styles.badgeOptional}>
          <Text style={item.isMandatory ? styles.badgeRequiredText : styles.badgeOptionalText}>
            {item.isMandatory ? "Required" : "Optional"}
          </Text>
        </View>
      </View>

      {/* State 1: Uploading Progress Bar */}
      {isUploading ? (
        <View style={styles.uploadingContainer}>
          <View style={styles.uploadingHeader}>
            <Text style={styles.uploadingText}>Uploading document...</Text>
            <Text style={styles.uploadingPercent}>{uploadProgress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
        </View>
      ) : isUploaded ? (
        /* State 2: Uploaded File Info + Action Buttons */
        <View style={styles.uploadedContainer}>
          <View style={styles.uploadedFileInfo}>
            <View style={styles.uploadedFileLeft}>
              <View style={styles.uploadedSuccessBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                <Text style={styles.uploadedSuccessText}>Uploaded</Text>
              </View>
              <Text style={styles.uploadedFileName} numberOfLines={1}>
                {item.fileName || `${item.title}.pdf`}
              </Text>
            </View>
            <Text style={styles.uploadedFileSize}>{item.fileSize || "1.8 MB"}</Text>
          </View>

          {/* Actions: [View] [Change] [Delete] */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDefaultView}
              style={styles.viewBtn}
            >
              <Ionicons name="eye-outline" size={14} color={BrandColors.TEXT_PRIMARY} />
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onChange}
              style={styles.changeBtn}
            >
              <Ionicons name="swap-horizontal" size={14} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDeleteConfirm}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* State 3: Empty / Not Uploaded Trigger */
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onUploadPress}
          style={styles.uploadArea}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={BrandColors.PRIMARY_ORANGE_DARK} />
          <Text style={styles.uploadAreaText}>Upload Document</Text>
        </TouchableOpacity>
      )}

      {/* Inline Error Message */}
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default TdsDocumentCard;
