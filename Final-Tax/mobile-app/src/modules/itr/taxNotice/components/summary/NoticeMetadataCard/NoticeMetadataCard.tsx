import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TaxNoticeSummaryData } from "../../../types/taxNotice.types";
import { styles } from "./NoticeMetadataCard.styles";

interface NoticeMetadataCardProps {
  summary: TaxNoticeSummaryData;
}

export const NoticeMetadataCard: React.FC<NoticeMetadataCardProps> = ({ summary }) => {
  return (
    <View style={styles.card}>
      {/* Row 1: Notice Type */}
      <View style={styles.row}>
        <View style={styles.labelCol}>
          <Ionicons name="document-text-outline" size={18} color="#64748B" />
          <Text style={styles.labelText}>Notice Type</Text>
        </View>
        <Text style={styles.valueText}>{summary.noticeType}</Text>
      </View>

      <View style={styles.divider} />

      {/* Row 2: Section */}
      <View style={styles.row}>
        <View style={styles.labelCol}>
          <Ionicons name="time-outline" size={18} color="#64748B" />
          <Text style={styles.labelText}>Section</Text>
        </View>
        <Text style={styles.valueText}>{summary.section}</Text>
      </View>

      <View style={styles.divider} />

      {/* Row 3: Issued Date */}
      <View style={styles.row}>
        <View style={styles.labelCol}>
          <Ionicons name="calendar-outline" size={18} color="#64748B" />
          <Text style={styles.labelText}>Issued Date</Text>
        </View>
        <Text style={styles.valueText}>{summary.issuedDate}</Text>
      </View>

      <View style={styles.divider} />

      {/* Row 4: Response Due Date */}
      <View style={styles.row}>
        <View style={styles.labelCol}>
          <Ionicons name="calendar-outline" size={18} color="#64748B" />
          <Text style={styles.labelText}>Response{"\n"}Due Date</Text>
        </View>
        <View style={styles.rightAlignedGroup}>
          <Text style={styles.valueText}>{summary.responseDueDate}</Text>
          <Text style={styles.daysLeftText}>{summary.daysLeft} days left</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 5: Risk Level */}
      <View style={styles.row}>
        <View style={styles.labelCol}>
          <Ionicons name="warning-outline" size={18} color="#EA580C" />
          <Text style={styles.labelText}>Risk Level</Text>
        </View>
        <View style={styles.riskBadge}>
          <Text style={styles.riskBadgeText}>{summary.riskLevel}</Text>
        </View>
      </View>
    </View>
  );
};
