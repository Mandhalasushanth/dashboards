import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenLayout } from "../../../../shared/components/ScreenLayout/ScreenLayout";
import { useTheme } from "../../../../hooks/use-theme";
import { useAuthStore } from "../../../authentication/store/authStore";
import { biometricService } from "../../../authentication/services/biometricService";
import { apiClient } from "../../../../core/api/apiClient";
import { ServerConfigModal } from "../../../../shared/components";
import {
  styles,
  getCardThemedStyle,
  getLinkRowThemedStyle,
} from "./SettingsScreen.styles";

export function SettingsScreen() {
  const router = useRouter();
  const colors = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometric");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(apiClient.getBaseUrl());

  const isBiometricEnabledStore = useAuthStore((state) => state.isBiometricEnabled);
  const setBiometricEnabledStore = useAuthStore((state) => state.setBiometricEnabled);

  useEffect(() => {
    let isMounted = true;
    async function loadBiometrics() {
      const isEnabled = await biometricService.isBiometricEnabled();
      const label = await biometricService.getBiometricTypeLabel();
      if (isMounted) {
        setBiometricEnabled(isEnabled);
        setBiometricLabel(label);
      }
    }
    loadBiometrics();
    return () => {
      isMounted = false;
    };
  }, [isBiometricEnabledStore]);

  const handleToggleBiometric = async (value: boolean) => {
    // Prevent duplicate taps while authentication is running
    if (isAuthenticating) return;

    if (value) {
      const hasHardware = await biometricService.checkHardwareSupport();
      if (!hasHardware) {
        Alert.alert(
          "Not Supported",
          "Biometric authentication isn't supported on this device."
        );
        return;
      }

      const isEnrolled = await biometricService.checkEnrollment();
      if (!isEnrolled) {
        Alert.alert(
          "Not Configured",
          "No fingerprint or biometric has been configured.\n\nPlease add one in your device settings."
        );
        return;
      }

      try {
        setIsAuthenticating(true);
        const authRes = await biometricService.authenticate(`Confirm ${biometricLabel} to enable`);
        if (authRes && authRes.success === true) {
          const mobile =
            useAuthStore.getState().mobileNumber ||
            useAuthStore.getState().authenticatedUser?.mobileNumber;
          await setBiometricEnabledStore(true);
          await biometricService.setBiometricEnabled(true, mobile);
          setBiometricEnabled(true);
        } else {
          setBiometricEnabled(false);
          if (
            !authRes?.cancelled &&
            authRes?.error &&
            authRes.error !== "Authentication cancelled" &&
            authRes.error !== "Authentication is already in progress"
          ) {
            Alert.alert("Authentication Failed", authRes.error);
          }
        }
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      await biometricService.disableBiometric();
      await setBiometricEnabledStore(false);
      setBiometricEnabled(false);
    }
  };

  const handleChangePasscode = () => {
    const mobile =
      useAuthStore.getState().mobileNumber ||
      useAuthStore.getState().authenticatedUser?.mobileNumber;
    if (mobile) {
      useAuthStore.getState().setMobileNumber(mobile);
      useAuthStore.getState().setAuthFlowState("FORGOT_PASSCODE_OTP");
      useAuthStore.getState().startForgotPasscode();
      router.push("/(auth)/login");
    } else {
      router.push("/(auth)/login");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your Finsolz account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            useAuthStore.getState().logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const cardStyle = getCardThemedStyle(colors);
  const linkRowThemedStyle = getLinkRowThemedStyle(colors.border);

  return (
    <ScreenLayout title="Settings" showBack>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Preferences Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              PREFERENCES
            </Text>
          </View>

          <View style={[styles.card, cardStyle]}>
            <View style={styles.row}>
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Filing alerts and deadline reminders
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#CBD5E1", true: colors.orange }}
              />
            </View>
          </View>
        </View>

        {/* ---------- Security Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SECURITY
            </Text>
          </View>

          <View style={[styles.card, cardStyle]}>
            {/* Security Biometric Toggle */}
            <View style={styles.row}>
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Biometric Authentication</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Use {biometricLabel}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                disabled={isAuthenticating}
                trackColor={{ false: "#CBD5E1", true: colors.orange }}
              />
            </View>

            {/* Change Passcode */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleChangePasscode}
              style={[styles.linkRow, linkRowThemedStyle]}
            >
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Change Passcode</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Update your 6-digit security PIN
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={[styles.linkRow, linkRowThemedStyle]}
            >
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.error }]}>Logout</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Sign out of your active session
                </Text>
              </View>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------- App Information ---------- */}
        {__DEV__ ? (
          <TouchableOpacity
            style={styles.appInfoContainer}
            onPress={() => {
              setCurrentServerUrl(apiClient.getBaseUrl());
              setShowServerModal(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
              Finsolz Finsolz • v1.0.0
            </Text>
            <Text style={[styles.backendStatusText, { color: colors.primary }]}>
              Backend: {currentServerUrl}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.appInfoContainer}>
            <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
              Finsolz Finsolz • v1.0.0
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Server Configuration Modal — dev only */}
      {__DEV__ && (
        <ServerConfigModal
          visible={showServerModal}
          onClose={() => setShowServerModal(false)}
          onSaved={(newUrl) => setCurrentServerUrl(newUrl)}
        />
      )}
    </ScreenLayout>
  );
}

export default SettingsScreen;
