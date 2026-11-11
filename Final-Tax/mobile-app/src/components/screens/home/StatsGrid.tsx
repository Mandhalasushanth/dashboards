/**
 * StatsGrid
 * 2×2 grid of "Your Financial Overview" stat cards on the Home screen.
 * Each card shows a label, icon, and a number/value, and navigates
 * to a related screen when tapped.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { styles } from "@/styles/app/(main)/home.styles";
import type { StatTile } from "@/types/home.types";

export type { StatTile };

interface StatsGridProps {
  stats: StatTile[];
  isDark: boolean;
  colors: ReturnType<typeof useTheme>;
}

export function StatsGrid({ stats, isDark, colors }: StatsGridProps) {
  const router = useRouter();

  return (
    <View style={styles.statsGrid}>
      {stats.map((stat) => (
        <TouchableOpacity
          key={stat.id}
          activeOpacity={0.85}
          onPress={() => router.push(stat.route)}
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statsTop}>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
              {stat.label}
            </Text>
            <View
              style={[
                styles.statsIcon,
                {
                  backgroundColor: isDark
                    ? colors.backgroundSelected
                    : stat.tintBg,
                },
              ]}
            >
              <Ionicons
                name={stat.icon}
                size={17}
                color={isDark ? colors.text : stat.tint}
              />
            </View>
          </View>
          <Text style={[styles.statsNumber, { color: stat.tint }]}>
            {stat.value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
