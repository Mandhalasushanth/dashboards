import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import type { LoanDocumentChecklistItem } from "../../validation/loanDocumentsValidation";
import { styles } from "./ReviewDocumentsSummary.styles";

interface ReviewDocumentsSummaryProps {
  items: LoanDocumentChecklistItem[];
  /** Returns the customer to the document upload screen. */
  onEditDocuments: () => void;
  error?: string;
}

/** Read-only upload status. Uploading, replacing and removing happen on the Documents screen only. */
export const ReviewDocumentsSummary: React.FC<ReviewDocumentsSummaryProps> = ({
  items,
  onEditDocuments,
  error,
}) => {
  const required = items.filter((item) => item.isMandatory);
  const requiredUploaded = required.filter((item) => item.isUploaded).length;

  return (
    <View style={[styles.card, error ? styles.cardError : null]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBox}>
            <Ionicons
              name="document-attach-outline"
              size={18}
              color={BrandColors.PRIMARY_BLUE}
            />
          </View>
          <View>
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.count}>
              {requiredUploaded} of {required.length} required documents uploaded
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditDocuments}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Edit documents"
        >
          <Ionicons name="pencil-outline" size={13} color={BrandColors.PRIMARY_BLUE} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={15} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Ionicons
            name={item.isUploaded ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={item.isUploaded ? "#16A34A" : item.isMandatory ? "#DC2626" : "#94A3B8"}
          />
          <Text
            style={[styles.itemName, !item.isUploaded && styles.itemNameMissing]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.itemTag,
              !item.isUploaded && item.isMandatory && styles.itemTagMissing,
            ]}
          >
            {item.isUploaded ? "Uploaded" : item.isMandatory ? "Missing" : "Optional"}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default ReviewDocumentsSummary;
