import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ImageSourcePropType,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors, Spacing, BorderRadius, Shadows } from "@/shared/theme";

interface ServiceHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
  heroImage?: ImageSourcePropType;
  iconName?: string;
  iconColor?: string;
  iconBg?: string;
  backgroundColor?: string;
  gradientColors?: [string, string, ...string[]];
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  title,
  subtitle,
  tag,
  heroImage,
  iconName = "document-text-outline",
  iconColor = "#FFFFFF",
  iconBg = "rgba(255, 255, 255, 0.18)",
  backgroundColor = BrandColors.PRIMARY_BLUE,
  gradientColors = ["#061933", "#083B75", "#0C4A94"],
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 24 : 20;
  const topPadding = Math.max(insets.top, statusBarHeight) + Spacing.xs;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <FocusAwareStatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[styles.innerContainer, { paddingTop: topPadding }]}>
        {/* Top Bar: Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Main Title Row with Icon */}
        <View style={styles.titleSection}>
          {iconName && (
            <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
              <Ionicons name={iconName as any} size={28} color={iconColor} />
            </View>
          )}

          <View style={styles.titleCol}>
            {tag && <Text style={styles.tagText}>{tag}</Text>}
            <Text style={styles.titleText}>{title}</Text>
          </View>
        </View>

        {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}

        {/* Hero Image if provided */}
        {heroImage && (
          <View style={styles.heroImageCard}>
            <Image source={heroImage} style={styles.heroImg} resizeMode="cover" />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Shadows.md,
  },
  innerContainer: {
    paddingHorizontal: Spacing.base + 4,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: Spacing.xs,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleCol: {
    flex: 1,
    justifyContent: "center",
  },
  tagText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
    marginBottom: 3,
  },
  titleText: {
    fontSize: 27,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  subtitleText: {
    fontSize: 15.5,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 22,
    marginTop: 14,
    fontWeight: "400",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  heroImageCard: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    height: 140,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroImg: {
    width: "100%",
    height: "100%",
  },
});

