import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { useNotificationStore } from "@/store/notificationStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";

export interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  unreadCount?: number;
  onBack?: () => void;
  onNotificationPress?: () => void;
}

export function AppHeader({
  title,
  showBack = false,
  showNotification = true,
  unreadCount,
  onBack,
  onNotificationPress,
}: AppHeaderProps) {
  const colors = useTheme();
  const router = useRouter();
  const storeUnreadCount = useNotificationStore((state) => state.unreadCount);
  const effectiveUnreadCount = unreadCount !== undefined ? unreadCount : storeUnreadCount;
  const insets = useSafeAreaInsets();

  const handleNotification = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push("/notifications");
    }
  };

  return (
    <View style={{ backgroundColor: colors.primaryDark, paddingTop: insets.top }}>
      <FocusAwareStatusBar barStyle="light-content" />
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: colors.primaryDark },
        ]}
      >
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => (onBack ? onBack() : router.back())}
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <Image
              source={require("../../../../assets/images/icon.png")}
              style={styles.miniLogo}
              resizeMode="contain"
            />
          )}
        </View>

        <Text style={styles.titleText}>{title}</Text>

        <View style={styles.rightContainer}>
          {showNotification && (
            <TouchableOpacity
              onPress={handleNotification}
              style={styles.iconButton}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#FFFFFF"
              />
              {effectiveUnreadCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.orange }]}
                >
                  <Text style={styles.badgeText}>
                    {effectiveUnreadCount > 9 ? "9+" : effectiveUnreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: Platform.OS === "ios" ? 44 : 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  miniLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  iconButton: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});

export default AppHeader;
