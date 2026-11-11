import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppUpdates } from "./useAppUpdates";
import { Colors } from "@/design-system/colors";

export function AppUpdateBanner() {
  const insets = useSafeAreaInsets();
  const { shouldShowBanner, reloadApp, dismissBanner } = useAppUpdates();

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom + 12, 20),
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <View style={styles.contentRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={20} color={Colors.orange || "#FF7A00"} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Update Ready</Text>
            <Text style={styles.message}>
              A new version of Finsolz is ready. Restart now or it will apply on your next launch.
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={dismissBanner}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dismiss update notification"
          >
            <Text style={styles.dismissButtonText}>Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.restartButton}
            onPress={reloadApp}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Restart app to apply update"
          >
            <Ionicons name="reload-outline" size={16} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.restartButtonText}>Restart Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    backgroundColor: "#0F1D36", // Finsolz Deep Navy
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 122, 0, 0.4)", // Finsolz Orange accent
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 122, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  restartButton: {
    backgroundColor: "#FF7A00", // Finsolz Orange
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 6,
  },
  restartButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

