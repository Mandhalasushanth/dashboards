import React from "react";
import { View, Text } from "react-native";
import { NoticeStatusDetails } from "../../../types/taxNotice.types";
import { styles } from "./NoticeFilingDetailsCard.styles";

interface NoticeFilingDetailsCardProps {
  details: NoticeStatusDetails;
}

export const NoticeFilingDetailsCard: React.FC<NoticeFilingDetailsCardProps> = ({
  details,
}) => {
  const rows = [
    { label: "Notice Number", value: details.noticeNumber },
    { label: "Section", value: details.section },
    { label: "Submitted On", value: details.submittedOn },
    { label: "Acknowledgement No", value: details.acknowledgementNo },
    { label: "Assigned Tax Executive", value: details.assignedTaxExecutive },
    {
      label: "Current Status",
      value: details.currentStatus,
      isBadge: true,
    },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;

        return (
          <View key={row.label} style={[styles.row, !isLast && styles.rowBorder]}>
            <Text style={styles.label}>{row.label}</Text>

            {row.isBadge ? (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{row.value}</Text>
              </View>
            ) : (
              <Text style={styles.value}>{row.value}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};
