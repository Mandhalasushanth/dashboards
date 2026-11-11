import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { Spacing } from "@/shared/theme";
import { styles } from "./LoansHeader.styles";

interface LoansHeaderProps {
  onBack: () => void;
  onNotifications?: () => void;
  hasUnreadNotifications?: boolean;
}

export const LoansHeader: React.FC<LoansHeaderProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === "android" ? 24 : 20) + Spacing.xs;

  return (
    <LinearGradient
      colors={["#061933", "#083B75", "#0C4A94"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <FocusAwareStatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[styles.innerContainer, { paddingTop: topPadding }]}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.iconBox}>
            <Image
              source={require("../../../../../assets/images/services/loans/header_loans.png")}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.tagText}>Loans Services</Text>
            <Text style={styles.titleText} accessibilityRole="header">
              Loans
            </Text>
          </View>
        </View>

        <Text style={styles.subtitleText}>
          Get the right loan for your goals with minimal documents and expert support.
        </Text>
      </View>
    </LinearGradient>
  );
};

export default LoansHeader;
