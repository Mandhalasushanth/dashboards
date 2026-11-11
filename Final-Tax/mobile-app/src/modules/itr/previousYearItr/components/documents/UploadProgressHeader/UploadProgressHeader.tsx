import React from "react";
import { View, Text } from "react-native";
import { styles, getFillWidthStyle } from "./UploadProgressHeader.styles";

interface UploadProgressHeaderProps {
  uploadedCount: number;
  totalCount: number;
}

export const UploadProgressHeader: React.FC<UploadProgressHeaderProps> = ({
  uploadedCount,
  totalCount,
}) => {
  const percent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;
  const isCompleted = uploadedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.counterText}>
          {uploadedCount} of {totalCount} Documents Uploaded
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {isCompleted ? "Completed" : "In Progress"}
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, getFillWidthStyle(percent)]} />
      </View>
    </View>
  );
};
