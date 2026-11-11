import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TDS_PROCESS_STEPS } from "../../mock/tdsData";
import { styles } from "./TdsProcessTimeline.styles";

export const TdsProcessTimeline: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>How it works</Text>

      <View style={styles.timelineRow}>
        {TDS_PROCESS_STEPS.map((step, index) => {
          const isLast = index === TDS_PROCESS_STEPS.length - 1;

          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepNode}>
                {/* Number Badge */}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{step.id}</Text>
                </View>

                {/* Circle Icon Container */}
                <View style={styles.circle}>
                  <Ionicons name={step.iconName} size={20} color="#0B1F3A" />
                </View>

                {/* Label */}
                <Text style={styles.stepLabel}>{step.label}</Text>
              </View>

              {/* Orange Dashed Connector */}
              {!isLast && <View style={styles.connector} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};
