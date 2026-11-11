import React from "react";
import { View, Text } from "react-native";
import { CloudUploadHeaderIcon } from "../DocumentUploadIcons";
import { styles } from "./UploadInstructionCard.styles";

export const UploadInstructionCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <CloudUploadHeaderIcon />
      </View>

      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Upload Required Documents</Text>
        <Text style={styles.description}>
          Upload all required business documents to continue with your ITR filing.
        </Text>

        <View style={styles.bulletRow}>
          <View style={styles.orangeDot} />
          <Text style={styles.bulletText}>Supported formats: PDF, JPG, PNG, XLS, XLSX</Text>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.orangeDot} />
          <Text style={styles.bulletText}>Maximum file size: 10 MB</Text>
        </View>
      </View>
    </View>
  );
};
