import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TDS_NEXT_STEPS } from "../../../mock/statusData";
import { styles } from "./NextStepsTimeline.styles";

export const NextStepsTimeline: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Next Steps</Text>

      <View style={styles.timelineList}>
        {TDS_NEXT_STEPS.map((step, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isLast = index === TDS_NEXT_STEPS.length - 1;

          return (
            <View key={step.id} style={styles.timelineRow}>
              {/* Left Indicator Column */}
              <View style={styles.indicatorColumn}>
                {isFirst ? (
                  <View style={styles.completedNode}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.numberNode,
                      isSecond ? styles.activeNumberNode : styles.upcomingNumberNode,
                    ]}
                  >
                    <Text
                      style={[
                        styles.numberNodeText,
                        isSecond ? styles.activeNumberText : styles.upcomingNumberText,
                      ]}
                    >
                      {step.id}
                    </Text>
                  </View>
                )}

                {/* Vertical Connector Line */}
                {!isLast && (
                  <View
                    style={[
                      styles.verticalLine,
                      isFirst ? styles.orangeLine : styles.greyLine,
                    ]}
                  />
                )}
              </View>

              {/* Right Content Card */}
              <View style={styles.contentColumn}>
                {isFirst ? (
                  <View style={styles.compactFirstStep}>
                    <View style={styles.firstStepNumberBadge}>
                      <Text style={styles.firstStepNumberText}>1</Text>
                    </View>
                    <View style={styles.firstStepTextGroup}>
                      <Text style={styles.firstStepTitle}>{step.title}</Text>
                      <Text style={styles.completedStatusText}>Completed</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.bubbleCard}>
                    <Text style={styles.cardTitle}>{step.title}</Text>
                    <Text style={styles.cardStatus}>Upcoming</Text>
                    {step.description ? (
                      <Text style={styles.cardDescription}>
                        {step.description}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
