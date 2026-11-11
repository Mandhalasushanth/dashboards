import React from "react";
import { View, Text } from "react-native";
import { styles, getProgressFillWidthStyle } from "./ChecklistProgressHeader.styles";

interface ChecklistProgressHeaderProps {
  uploadedCount: number;
  totalCount: number;
}

export const ChecklistProgressHeader: React.FC<ChecklistProgressHeaderProps> = ({
  uploadedCount,
  totalCount,
}) => {
  const percentage = Math.round((uploadedCount / totalCount) * 100);
  const fillWidthStyle = getProgressFillWidthStyle(percentage);

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <Text style={styles.counterText}>
          <Text style={styles.counterHighlight}>{uploadedCount}</Text> of {totalCount} uploaded
        </Text>

        <View style={styles.statusBadge}>
          <View style={styles.bulletDot} />
          <Text style={styles.statusBadgeText}>
            {uploadedCount === totalCount ? "Completed" : "In progress"}
          </Text>
        </View>
      </View>

      {/* Progress Bar Track */}
      <View style={styles.track}>
        <View style={[styles.fill, fillWidthStyle]} />
      </View>
    </View>
  );
};
