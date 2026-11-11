import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { formatFileSize } from "../../utils/formatFileSize";
import type {
  LoanDocumentRequirement,
  LoanDocumentUpload,
} from "../../types/loanReview.types";
import { styles } from "./DocumentRequirementCard.styles";

interface DocumentRequirementCardProps {
  requirement: LoanDocumentRequirement;
  upload?: LoanDocumentUpload;
  error?: string;
  isProcessing?: boolean;
  onUpload: (requirement: LoanDocumentRequirement) => void;
  onView: (requirement: LoanDocumentRequirement) => void;
  onRemove: (requirement: LoanDocumentRequirement) => void;
}

export const DocumentRequirementCard: React.FC<DocumentRequirementCardProps> = ({
  requirement,
  upload,
  error,
  isProcessing = false,
  onUpload,
  onView,
  onRemove,
}) => {
  const isUploaded = Boolean(upload?.fileUri);
  const badgeLabel = requirement.isMandatory ? "Required" : "Optional";

  return (
    <View
      style={[
        styles.card,
        isUploaded && styles.cardUploaded,
        Boolean(error) && styles.cardError,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, isUploaded && styles.iconBoxUploaded]}>
          <Ionicons
            name={isUploaded ? "checkmark-circle" : requirement.icon}
            size={24}
            color={isUploaded ? "#16A34A" : BrandColors.PRIMARY_BLUE}
          />
        </View>
        <View style={styles.textCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{requirement.name}</Text>
            <View
              style={[
                styles.badge,
                requirement.isMandatory
                  ? styles.badgeRequired
                  : styles.badgeOptional,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  requirement.isMandatory
                    ? styles.badgeRequiredText
                    : styles.badgeOptionalText,
                ]}
              >
                {badgeLabel}
              </Text>
            </View>
          </View>
          {isUploaded && upload ? (
            <>
              <View style={styles.uploadedLine}>
                <Text style={styles.uploadedText}>Uploaded successfully</Text>
              </View>
              <Text style={styles.fileMeta} numberOfLines={1}>
                {upload.fileName} • {formatFileSize(upload.fileSize)}
              </Text>
            </>
          ) : (
            <Text style={styles.description}>{requirement.description}</Text>
          )}
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {isUploaded ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => onView(requirement)}
            accessibilityRole="button"
            accessibilityLabel={`View ${requirement.name}`}
          >
            <Text style={styles.secondaryActionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => onUpload(requirement)}
            disabled={isProcessing}
            accessibilityRole="button"
            accessibilityLabel={`Replace ${requirement.name}`}
          >
            <Text style={styles.secondaryActionText}>Replace</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => onRemove(requirement)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${requirement.name}`}
          >
            <Text style={[styles.secondaryActionText, styles.removeActionText]}>
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => onUpload(requirement)}
            disabled={isProcessing}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${error ? "Try again" : "Upload"} ${requirement.name}`}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={BrandColors.WHITE} />
            ) : (
              <>
                <Text style={styles.primaryActionText}>
                  {error ? "Try Again" : "Upload Document"}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={BrandColors.WHITE} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DocumentRequirementCard;
