import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Rect } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles, getContainerInsetsStyle } from "./VerifiedSplashScreen.styles";

interface VerifiedSplashScreenProps {
  acknowledgementNumber?: string;
  onDone?: () => void;
}

export const VerifiedSplashScreen: React.FC<VerifiedSplashScreenProps> = ({
  acknowledgementNumber = "284419260902411",
  onDone,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleFinish = () => {
    if (onDone) {
      onDone();
    } else {
      router.replace("/(main)/home" as any);
    }
  };

  const handleTaxServices = () => {
    router.replace("/service/itr" as any);
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top, insets.bottom)]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0B1F3A" />

      {/* Confetti & Glowing Animated Checkmark */}
      <View style={styles.centerSection}>
        <View style={styles.celebrationContainer}>
          <Svg width={220} height={160} viewBox="0 0 220 160" style={styles.confettiSvg}>
            <Rect x={30} y={20} width={6} height={6} rx={1.5} fill="#F97316" transform="rotate(35, 30, 20)" />
            <Circle cx={60} cy={45} r={3} fill="#FED7AA" />
            <Rect x={20} y={90} width={7} height={4} rx={1.5} fill="#F97316" transform="rotate(-25, 20, 90)" />
            <Circle cx={50} cy={130} r={3.5} fill="#FFFFFF" />

            <Rect x={180} y={20} width={6} height={6} rx={1.5} fill="#FED7AA" transform="rotate(-35, 180, 20)" />
            <Circle cx={160} cy={45} r={3} fill="#F97316" />
            <Rect x={190} y={90} width={7} height={4} rx={1.5} fill="#FFFFFF" transform="rotate(25, 190, 90)" />
            <Circle cx={170} cy={130} r={3.5} fill="#F97316" />
          </Svg>

          {/* Glowing Orange Outer Circles */}
          <View style={styles.pulseOuterCircle}>
            <View style={styles.pulseMiddleCircle}>
              <View style={styles.orangeCoreCircle}>
                <Ionicons name="checkmark-done" size={44} color="#0B1F3A" />
              </View>
            </View>
          </View>
        </View>

        {/* Orange Heading */}
        <Text style={styles.verifiedHeading}>E-VERIFIED SUCCESSFULLY</Text>

        {/* Subtitle */}
        <Text style={styles.verifiedSub}>
          Your Income Tax Return for AY 2026-27 is 100% verified & acknowledged by the Income Tax Department.
        </Text>

        {/* Verification Metadata Card */}
        <View style={styles.metadataCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Acknowledgement No</Text>
            <Text style={styles.metaValue}>{acknowledgementNumber}</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Verification Mode</Text>
            <Text style={styles.metaValue}>Aadhaar OTP (EVC)</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.statusText}>Successfully E-Verified</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom CTA Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleFinish}
          style={styles.primaryOrangeButton}
        >
          <Text style={styles.primaryButtonText}>Go to Home Dashboard</Text>
          <Ionicons name="arrow-forward" size={18} color="#0B1F3A" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTaxServices}
          style={styles.secondaryNavyButton}
        >
          <Text style={styles.secondaryButtonText}>Back to Tax Services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
