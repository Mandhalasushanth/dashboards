import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ApplicationSuccessCard.styles";

interface ApplicationSuccessCardProps {
  applicationId: string;
}

export const ApplicationSuccessCard: React.FC<ApplicationSuccessCardProps> = ({
  applicationId,
}) => {
  return (
    <View style={styles.card}>
      {/* Celebration & Confetti */}
      <View style={styles.celebrationWrapper}>
        <Svg width={120} height={70} viewBox="0 0 120 70" style={styles.confettiSvg}>
          <Rect x={15} y={10} width={4} height={4} rx={1} fill="#F97316" transform="rotate(25, 15, 10)" />
          <Circle cx={28} cy={22} r={2} fill="#0B1F3A" />
          <Rect x={10} y={40} width={5} height={3} rx={1} fill="#16A34A" transform="rotate(-15, 10, 40)" />
          <Circle cx={24} cy={55} r={2} fill="#F97316" />

          <Rect x={100} y={10} width={4} height={4} rx={1} fill="#0B1F3A" transform="rotate(-30, 100, 10)" />
          <Circle cx={92} cy={24} r={2} fill="#16A34A" />
          <Rect x={105} y={40} width={5} height={3} rx={1} fill="#F97316" transform="rotate(20, 105, 40)" />
          <Circle cx={96} cy={55} r={2} fill="#0B1F3A" />
        </Svg>

        <View style={styles.outerCircle}>
          <Ionicons name="checkmark" size={28} color="#FFFFFF" />
        </View>
      </View>

      {/* Headings */}
      <Text style={styles.title}>Your application has been received!</Text>
      <Text style={styles.subtitle}>
        Your claim has entered the TDS queue for a Tax Executive to verify and file.
      </Text>

      {/* Application ID Pill */}
      <View style={styles.idCard}>
        <Text style={styles.idLabel}>Application ID </Text>
        <Text style={styles.idValue}>{applicationId}</Text>
      </View>
    </View>
  );
};
