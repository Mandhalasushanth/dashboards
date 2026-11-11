import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./TdsDocumentNotices.styles";

export const TdsDocumentNotices: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.noticeBox}>
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color="#059669"
          style={styles.noticeIcon}
        />
        <View style={styles.noticeTextContainer}>
          <Text style={styles.noticeTitle}>256-Bit Bank-Grade Encryption</Text>
          <Text style={styles.noticeBody}>
            Your tax documents are encrypted both in transit and at rest. They are only accessed by certified chartered accountants assigned to your case.
          </Text>
        </View>
      </View>

      <View style={styles.noticeBox}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color="#083B75"
          style={styles.noticeIcon}
        />
        <View style={styles.noticeTextContainer}>
          <Text style={styles.noticeTitle}>Supported File Types</Text>
          <Text style={styles.noticeBody}>
            Upload PDF, JPG, PNG, or Excel files up to 10 MB each. Make sure names and PAN numbers are clearly legible.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TdsDocumentNotices;
