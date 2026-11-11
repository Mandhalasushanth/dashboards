import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { styles } from "@/styles/app/(main)/applications.styles";

import type { StatusCategory } from "@/modules/applications/utils/applicationStatusUtils";

export type StatusFilterType = StatusCategory;

export interface OverviewItem {
  key: StatusFilterType;
  count: number;
  label: string;
  color: string;
  isAll?: boolean;
}

interface OverviewCardProps {
  items: OverviewItem[];
  statusFilter: StatusFilterType;
  selectedCategory?: string;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>;
  onSelect: (key: StatusFilterType) => void;
  onOpenCategoryFilter?: () => void;
  cardBg: string;
  cardBorder: string;
}

export function OverviewCard({
  items,
  statusFilter,
  isDark,
  colors,
  onSelect,
  cardBg,
  cardBorder,
}: OverviewCardProps) {
  return (
    <View style={[styles.overviewCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {items.map((item, idx) => {
        const isSelected = statusFilter === item.key;

        return (
          <React.Fragment key={item.key}>
            {idx > 0 && (
              <View
                style={[
                  styles.overviewDivider,
                  { backgroundColor: isDark ? colors.border : "#F1F5F9" },
                ]}
              />
            )}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onSelect(item.key)}
              style={[
                styles.overviewCol,
                isSelected && (isDark ? styles.activeOverviewColDark : styles.activeOverviewCol),
              ]}
            >
              {item.key === "ALL" ? (
                <Text style={styles.overviewTotalNum}>{item.count}</Text>
              ) : item.key === "IN_PROGRESS" ? (
                <View style={styles.circleIconInProgress}>
                  <Text style={[styles.circleNumVerification, { color: "#0284C7" }]}>
                    {item.count}
                  </Text>
                </View>
              ) : item.key === "COMPLETED" ? (
                <View style={styles.circleIconCompleted}>
                  <Text style={[styles.circleNumVerification, { color: "#16A34A" }]}>
                    {item.count}
                  </Text>
                </View>
              ) : (
                <View style={styles.circleIconVerification}>
                  <Text style={styles.circleNumVerification}>{item.count}</Text>
                </View>
              )}

              <Text
                style={[
                  styles.overviewSub,
                  { color: isSelected ? "#0A2346" : "#64748B" },
                  isSelected && { fontWeight: "700" },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}
