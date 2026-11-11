import React from "react";
import { View, Text } from "react-native";
import { TdsApplicationSummary } from "../../../types/tdsStatus.types";
import {
  styles,
  getBadgeBgStyle,
  getBadgeDotStyle,
  getBadgeTextStyle,
  getProgressFillStyle,
} from "./TdsApplicationHeaderCard.styles";

interface TdsApplicationHeaderCardProps {
  data: TdsApplicationSummary;
}

export const TdsApplicationHeaderCard: React.FC<TdsApplicationHeaderCardProps> = ({
  data,
}) => {
  const progressPercent = Math.min(Math.max(data.progressPercent, 0), 100);

  return (
    <View style={styles.card}>
      {/* Top Row: Application ID & Status Pill Badge */}
      <View style={styles.topRow}>
        <View style={styles.idGroup}>
          <Text style={styles.idLabel}>APPLICATION ID</Text>
          <Text style={styles.idValue}>{data.applicationId}</Text>
        </View>

        <View
          style={[
            styles.badgePill,
            getBadgeBgStyle(data.statusBadge.bgColor),
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              getBadgeDotStyle(data.statusBadge.dotColor),
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              getBadgeTextStyle(data.statusBadge.textColor),
            ]}
          >
            {data.statusBadge.label}
          </Text>
        </View>
      </View>

      {/* 3-Column Metadata Row: Service, AY, Applied */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{data.service}</Text>
        </View>

        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>AY</Text>
          <Text style={styles.detailValue}>{data.assessmentYear}</Text>
        </View>

        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Applied</Text>
          <Text style={styles.detailValue}>{data.appliedDate}</Text>
        </View>
      </View>

      {/* Progress Bar & Percentage */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              getProgressFillStyle(progressPercent),
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {`${progressPercent}% complete`}
        </Text>
      </View>
    </View>
  );
};

export default TdsApplicationHeaderCard;
