/**
 * HomeHeader
 * Single unified fixed header matching Image 3 reference & Image 4 gradient styling.
 * Contains:
 *  - FINSOLZ FIN SOLUTIONS brand logo
 *  - Notification bell with unread badge
 *  - Greeting row ("Hello, Anu 👋" + "What can we help you with today?")
 *  - Deep navy-blue gradient with ambient amber flare & abstract curved wave lines.
 */

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import {
  styles,
  getFixedHeaderThemedStyle,
} from "@/styles/app/(main)/home.styles";
import { HeaderGradientBackground } from "@/shared/components/HeaderGradientBackground/HeaderGradientBackground";

export interface HomeHeaderProps {
  greetingTitle: string;
  unreadCount: number;
  colors?: ReturnType<typeof useTheme>;
  topInset: number;
  compact?: boolean;
  onNotificationsPress: () => void;
}

export function HomeHeader({
  greetingTitle,
  unreadCount,
  topInset,
  onNotificationsPress,
}: HomeHeaderProps) {
  return (
    <View style={[styles.fixedHeader, getFixedHeaderThemedStyle(topInset + 6)]}>
      {/* Abstract Background Shapes & Ambient Lighting Glow */}
      <HeaderGradientBackground />

      {/* Top row: Logo + Brand | Notification Bell */}
      <View style={styles.topHeaderRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBox}>
            <Image
              source={require("@/../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.brandText}>FINSOLZ</Text>
            <Text style={styles.brandSubText}>FIN SOLUTIONS</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={onNotificationsPress}
            style={styles.iconBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting row */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>{greetingTitle}</Text>
          <Text style={styles.welcomeSubText}>
            What can we help you with today?
          </Text>
        </View>
      </View>
    </View>
  );
}

// Compat exports
export const HomeFixedTopBar = HomeHeader;
export const HomeHeroHeader = HomeHeader;
