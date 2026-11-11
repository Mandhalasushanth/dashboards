import React from "react";
import { View, Text } from "react-native";
import { PreviousYearSubmissionDetails } from "../../../types/submission.types";
import { styles } from "./PreviousYearStatusInfoCard.styles";

interface PreviousYearStatusInfoCardProps {
  details: PreviousYearSubmissionDetails;
}

export const PreviousYearStatusInfoCard: React.FC<
  PreviousYearStatusInfoCardProps
> = ({ details }) => {
  const rows = [
    {
      id: "status",
      label: "Application Status",
      value: details.applicationStatus,
      isStatusBadge: true,
    },
    {
      id: "ay",
      label: "Assessment Year",
      value: details.assessmentYear,
      isStatusBadge: false,
    },
    {
      id: "assigned",
      label: "Assigned To",
      value: details.assignedTo,
      isStatusBadge: false,
    },
    {
      id: "time",
      label: "Estimated Processing Time",
      value: details.estimatedProcessingTime,
      isStatusBadge: false,
    },
    {
      id: "notification",
      label: "Notification Method",
      value: details.notificationMethod,
      isStatusBadge: false,
    },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;

        return (
          <View
            key={row.id}
            style={[styles.row, !isLast && styles.rowBorder]}
          >
            <Text style={styles.label}>{row.label}</Text>

            {row.isStatusBadge ? (
              <View style={styles.statusPill}>
                <View style={styles.orangeDot} />
                <Text style={styles.statusText}>{row.value}</Text>
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
