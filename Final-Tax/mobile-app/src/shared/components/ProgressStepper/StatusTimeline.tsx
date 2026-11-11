import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import type { IconName, TimelineStep } from "@/shared/types/domain";

export interface StatusTimelineProps {
  steps: TimelineStep[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";
        const isLast = index === steps.length - 1;

        let iconName: IconName = "ellipse-outline";
        let iconColor: string = colors.textSecondary;
        if (isCompleted) {
          iconName = "checkmark-circle";
          iconColor = colors.success;
        } else if (isCurrent) {
          iconName = "play-circle";
          iconColor = colors.orange;
        }

        return (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.leftLineCol}>
              <Ionicons
                name={iconName}
                size={22}
                color={iconColor}
                style={styles.icon}
              />
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: isCompleted
                        ? colors.success
                        : colors.border,
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.contentCol}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: isCurrent ? colors.orange : colors.text,
                      fontWeight: isCurrent || isCompleted ? "600" : "500",
                    },
                  ]}
                >
                  {step.title}
                </Text>
                {step.date && (
                  <Text
                    style={[styles.dateText, { color: colors.textSecondary }]}
                  >
                    {step.date}
                  </Text>
                )}
              </View>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>
                {step.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepContainer: {
    flexDirection: "row",
    minHeight: 60,
  },
  leftLineCol: {
    alignItems: "center",
    width: 32,
  },
  icon: {
    zIndex: 1,
    backgroundColor: "transparent",
  },
  line: {
    width: 2.5,
    flex: 1,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    fontSize: 15,
    flex: 1,
    flexShrink: 1,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    flexShrink: 0,
  },
  desc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
});

export default StatusTimeline;
