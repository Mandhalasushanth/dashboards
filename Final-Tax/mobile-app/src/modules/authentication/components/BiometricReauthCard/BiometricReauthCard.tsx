import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../shared/theme";
import { styles } from "./BiometricReauthCard.styles";

interface BiometricReauthCardProps {
  /** e.g. "Fingerprint" or "Face ID"; picks the icon and label. */
  biometricType: string;
  /** Theme text colours from the screen. */
  textColor: string;
  secondaryTextColor: string;
  onRetry: () => void;
  onUsePasscode: () => void;
}

/** "Authenticate with …" card shown in the BIOMETRIC_REAUTH screen state. */
export function BiometricReauthCard({
  biometricType,
  textColor,
  secondaryTextColor,
  onRetry,
  onUsePasscode,
}: BiometricReauthCardProps) {
  return (
    <View style={styles.biometricCard}>
      <View style={styles.biometricIconRing}>
        <Ionicons
          name={
            biometricType.toLowerCase().includes("face")
              ? "scan-outline"
              : "finger-print-outline"
          }
          size={44}
          color={BrandColors.PRIMARY_ORANGE}
        />
      </View>
      <Text style={[styles.biometricLabel, { color: textColor }]}>
        {`Authenticate with ${biometricType}`}
      </Text>
      <Text style={[styles.biometricSub, { color: secondaryTextColor }]}>
        Use biometrics to securely access your account
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.75}
        style={[styles.retryBtn, { borderColor: BrandColors.PRIMARY_ORANGE }]}
      >
        <Ionicons name="refresh-outline" size={15} color={BrandColors.PRIMARY_ORANGE} />
        <Text style={[styles.retryBtnText, { color: BrandColors.PRIMARY_ORANGE }]}>
          Try Again
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onUsePasscode}
        activeOpacity={0.7}
        style={styles.switchToPasscodeBtn}
      >
        <Text style={[styles.switchToPasscodeText, { color: secondaryTextColor }]}>
          Use Passcode Instead
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default BiometricReauthCard;
