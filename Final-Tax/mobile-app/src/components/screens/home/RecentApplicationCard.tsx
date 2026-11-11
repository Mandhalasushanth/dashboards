/**
 * RecentApplicationCard
 * Single application card used in the "Recent Applications" section of the
 * Home screen. Tapping it navigates to the application detail page.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { styles } from "@/styles/app/(main)/home.styles";
import { useApplicationStore } from "@/store/applicationStore";
import { useRouter } from "expo-router";
import type { Application } from "@/types/domain";

interface RecentApplicationCardProps {
  app: Application;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>;
  statusTone: (status: string) => { fg: string; bg: string };
}

export function RecentApplicationCard({
  app,
  isDark,
  colors,
  statusTone,
}: RecentApplicationCardProps) {
  const router = useRouter();
  const tone = statusTone(app.status);

  const handlePress = () => {
    useApplicationStore.getState().setSelectedApplicationId(app.id);
    router.push(`/application/${app.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.appCard,
        { backgroundColor: colors.backgroundElement, borderColor: colors.border },
      ]}
    >
      <View style={styles.appCardTop}>
        <Text style={[styles.appId, { color: colors.success }]}>{app.id}</Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: isDark ? colors.backgroundSelected : tone.bg },
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              { color: isDark ? colors.text : tone.fg },
            ]}
          >
            {app.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
        {app.serviceName}
      </Text>

      <View style={styles.appCardBottom}>
        <Text style={[styles.appDate, { color: colors.textSecondary }]}>
          {app.createdAt}
        </Text>
        <View style={styles.linkRow}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View Details
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
