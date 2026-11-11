import React from "react";
import { View, Text } from "react-native";
import { styles, getProgressFillStyle } from "./TdsUploadProgressBar.styles";

interface TdsUploadProgressBarProps {
  uploadedCount: number;
  totalCount: number;
}

export const TdsUploadProgressBar: React.FC<TdsUploadProgressBarProps> = ({
  uploadedCount,
  totalCount,
}) => {
  const percentage = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0;
  const progressFillStyle = getProgressFillStyle(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.countText}>
          {`${uploadedCount} of ${totalCount} uploaded`}
        </Text>
        <Text style={styles.percentageText}>{`${percentage}%`}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, progressFillStyle]} />
      </View>
    </View>
  );
};

export default TdsUploadProgressBar;
