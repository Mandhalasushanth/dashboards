import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./SuccessCelebrationHeader.styles";

interface SuccessCelebrationHeaderProps {
  applicationId: string;
  isRevised?: boolean;
}

export const SuccessCelebrationHeader: React.FC<SuccessCelebrationHeaderProps> = ({
  applicationId,
  isRevised = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Confetti & Success Circle */}
      <View style={styles.badgeWrapper}>
        {/* Confetti Elements */}
        <Svg width={140} height={90} viewBox="0 0 140 90" style={styles.confettiSvg}>
          <Rect x={20} y={15} width={4} height={4} rx={1} fill="#F97316" transform="rotate(25, 20, 15)" />
          <Circle cx={35} cy={30} r={2} fill="#0B1F3A" />
          <Rect x={15} y={45} width={5} height={3} rx={1} fill="#16A34A" transform="rotate(-15, 15, 45)" />
          <Circle cx={30} cy={65} r={2.5} fill="#F97316" />

          <Rect x={115} y={15} width={4} height={4} rx={1} fill="#0B1F3A" transform="rotate(-30, 115, 15)" />
          <Circle cx={105} cy={32} r={2} fill="#16A34A" />
          <Rect x={120} y={45} width={5} height={3} rx={1} fill="#F97316" transform="rotate(20, 120, 45)" />
          <Circle cx={110} cy={65} r={2.5} fill="#0B1F3A" />
        </Svg>

        {/* Green Success Circle */}
        <View style={styles.successOuterCircle}>
          <View style={styles.successInnerCircle}>
            <Ionicons name="checkmark" size={32} color="#16A34A" />
          </View>
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.title}>
        {isRevised
          ? "Your Revised ITR application has been received."
          : "Your application has been received!"}
      </Text>

      {/* Subtitle distinguishing application received from government filing */}
      <Text style={styles.subtitle}>
        {isRevised
          ? "Your documents and revised tax information have been received. A Tax Executive will review them before preparing your return."
          : "Your documents and tax information have been received. A Tax Executive will review them before preparing your return."}
      </Text>

      {/* Application ID Pill Card */}
      <View style={styles.idCard}>
        <Text style={styles.idLabel}>Application ID </Text>
        <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="tail">{applicationId}</Text>
      </View>
    </View>
  );
};
